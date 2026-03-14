#!/usr/bin/env npx tsx
/**
 * Index existing structured data into the textbookKnowledge vector DB table.
 * Sources: longCases (544), differentialPatterns (325), chapmanACE, mnemonics (50).
 *
 * Uses the proven 10-agent parallel pattern from orchestrateAgents.ts:
 *   - .env loading, ConvexHttpClient, manifest, worker loops, API key rotation
 *   - Embeddings via OpenRouter → openai/text-embedding-3-large (1536 dims)
 *   - Ingest via `npx convex run rag:ingestTextbookKnowledge` (internalMutation)
 *
 * Usage:
 *   npx tsx scripts/index_structured_data.ts
 *   npx tsx scripts/index_structured_data.ts --dry-run
 *   npx tsx scripts/index_structured_data.ts --source longCases
 *   npx tsx scripts/index_structured_data.ts --source discriminators --source mnemonics
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Load .env ───────────────────────────────────────────────────────────────

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq), v = t.slice(eq + 1);
    if (!process.env[k]) process.env[k] = v;
  }
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "https://lovable-goat-91.eu-west-1.convex.cloud";
const API_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").filter(Boolean);
const DRY_RUN = process.argv.includes("--dry-run");
const MAX_RETRIES = 5;
const BACKOFF_BASE = 5; // seconds — embedding calls are fast, shorter backoff
const REQUEST_TIMEOUT = 60000; // 60s for embedding calls
const MANIFEST_PATH = path.join(__dirname, "index_manifest.json");
const PROJECT_ROOT = path.join(__dirname, "..");

// Parse --source flags to restrict which data sources to index
const SOURCE_FLAGS: string[] = [];
process.argv.forEach((arg, i, arr) => {
  if (arr[i - 1] === "--source") SOURCE_FLAGS.push(arg);
});
const ALL_SOURCES = ["longCases", "discriminators", "chapman", "mnemonics"] as const;
type SourceType = typeof ALL_SOURCES[number];
const ACTIVE_SOURCES: Set<SourceType> = SOURCE_FLAGS.length > 0
  ? new Set(SOURCE_FLAGS.filter((s): s is SourceType => ALL_SOURCES.includes(s as SourceType)))
  : new Set(ALL_SOURCES);

if (!API_KEYS.length && !DRY_RUN) {
  console.error("ERROR: Set OPENROUTER_KEYS in .env (comma-separated)");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// ─── Types ───────────────────────────────────────────────────────────────────

interface ManifestEntry {
  id: string;            // unique key: "source:identifier"
  source: SourceType;
  entityName: string;
  category: string;
  sourceBook: string;
  rawTextChunk: string;
  radiographicFeatures: Record<string, string[] | undefined>;
  clinicalData: Record<string, string[] | undefined>;
  qualityScore: number;
  status: "pending" | "processing" | "done" | "failed";
  attempts: number;
  lastError?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(workerId: number, msg: string) {
  const prefix = workerId >= 0 ? `[W${workerId}]` : "     ";
  console.log(`${prefix} ${msg}`);
}

function saveManifest(manifest: ManifestEntry[]) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function qualityFromLength(text: string): number {
  const len = text.length;
  if (len > 500) return 8;
  if (len >= 200) return 6;
  return 4;
}

// ─── Data Extraction — Build rawTextChunk per source ─────────────────────────

async function buildManifest(): Promise<ManifestEntry[]> {
  // Resume from existing manifest if present
  if (fs.existsSync(MANIFEST_PATH)) {
    const existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as ManifestEntry[];
    const remaining = existing.filter(m => m.status !== "done").length;
    if (remaining > 0) {
      console.log(`Resuming: ${existing.length - remaining}/${existing.length} done, ${remaining} remaining`);
      return existing;
    }
  }

  console.log("Querying Convex for structured data...");

  // Fetch categories for ID → abbreviation mapping
  const categories = await client.query(api.categories.list, {});
  const catMap = new Map(categories.map((c: any) => [c._id, c.abbreviation as string]));

  const manifest: ManifestEntry[] = [];

  // ── 1. Long Cases ──
  if (ACTIVE_SOURCES.has("longCases")) {
    console.log("  Fetching longCases...");
    const allCases = await client.query(api.longCases.list, {});
    let skipped = 0;
    for (const c of allCases as any[]) {
      if (!c.title || c.title.trim().length === 0) { skipped++; continue; }

      const catAbbrev = catMap.get(c.categoryId) || "Unknown";
      const differentials = Array.isArray(c.differentials) ? c.differentials.join(", ") : "";
      const keyBullets = Array.isArray(c.keyBullets) ? c.keyBullets.join("; ") : "";

      const rawTextChunk = [
        `${c.title}: ${c.findings || ""}`,
        c.interpretation ? `Interpretation: ${c.interpretation}` : "",
        c.diagnosis ? `Diagnosis: ${c.diagnosis}` : "",
        differentials ? `Differentials: ${differentials}` : "",
        c.examPearl ? `Pearl: ${c.examPearl}` : "",
        keyBullets ? `Key Bullets: ${keyBullets}` : "",
      ].filter(Boolean).join("\n");

      manifest.push({
        id: `longCases:${c._id}`,
        source: "longCases",
        entityName: c.title,
        category: catAbbrev,
        sourceBook: "radquiz-cases",
        rawTextChunk,
        radiographicFeatures: {},
        clinicalData: c.clinicalHistory
          ? { demographics: [c.clinicalHistory.split(".")[0]] }
          : {},
        qualityScore: qualityFromLength(rawTextChunk),
        status: "pending",
        attempts: 0,
      });
    }
    console.log(`  longCases: ${manifest.filter(m => m.source === "longCases").length} entries (${skipped} skipped)`);
  }

  // ── 2. Differential Patterns (O'Brien) ──
  if (ACTIVE_SOURCES.has("discriminators")) {
    console.log("  Fetching differentialPatterns...");
    const patterns = await client.query(api.differentialPatterns.list, {});
    let skipped = 0;
    for (const p of patterns as any[]) {
      if (!p.pattern || p.pattern.trim().length === 0) { skipped++; continue; }

      const top3 = Array.isArray(p.top3) ? p.top3.join(", ") : "";
      const additional = Array.isArray(p.additional) ? p.additional.join(", ") : "";

      const rawTextChunk = [
        `Pattern: ${p.pattern}`,
        `Diagnosis: ${p.diagnosis || ""}`,
        p.clinicalPresentation ? `Presentation: ${p.clinicalPresentation}` : "",
        top3 ? `Top 3: ${top3}` : "",
        additional ? `Additional: ${additional}` : "",
      ].filter(Boolean).join("\n");

      manifest.push({
        id: `discriminators:${p._id}`,
        source: "discriminators",
        entityName: `${p.diagnosis || p.pattern} (${p.pattern})`,
        category: p.categoryAbbreviation || "Unknown",
        sourceBook: "obrien",
        rawTextChunk,
        radiographicFeatures: {},
        clinicalData: p.clinicalPresentation
          ? { cardinalSigns: [p.clinicalPresentation] }
          : {},
        qualityScore: qualityFromLength(rawTextChunk),
        status: "pending",
        attempts: 0,
      });
    }
    console.log(`  differentialPatterns: ${manifest.filter(m => m.source === "discriminators").length} entries (${skipped} skipped)`);
  }

  // ── 3. Chapman ACE Families ──
  if (ACTIVE_SOURCES.has("chapman")) {
    console.log("  Fetching chapmanACE...");
    const chapmanItems = await client.query(api.chapman.list, {});
    let skipped = 0;
    for (const ch of chapmanItems as any[]) {
      if (!ch.pattern || ch.pattern.trim().length === 0) { skipped++; continue; }

      const familyLines = Array.isArray(ch.families)
        ? ch.families.map((f: any) =>
            `${f.familyName}: ${Array.isArray(f.diagnoses) ? f.diagnoses.join(", ") : ""}`
          ).join("\n")
        : "";

      const rawTextChunk = [
        `Pattern: ${ch.pattern}`,
        familyLines ? `Families:\n${familyLines}` : "",
        ch.additionalNotes ? `Notes: ${ch.additionalNotes}` : "",
      ].filter(Boolean).join("\n");

      manifest.push({
        id: `chapman:${ch._id}`,
        source: "chapman",
        entityName: ch.pattern,
        category: ch.categoryAbbreviation || "Unknown",
        sourceBook: "chapman",
        rawTextChunk,
        radiographicFeatures: {},
        clinicalData: {},
        qualityScore: qualityFromLength(rawTextChunk),
        status: "pending",
        attempts: 0,
      });
    }
    console.log(`  chapmanACE: ${manifest.filter(m => m.source === "chapman").length} entries (${skipped} skipped)`);
  }

  // ── 4. Mnemonics ──
  if (ACTIVE_SOURCES.has("mnemonics")) {
    console.log("  Fetching mnemonics...");
    const mnemonics = await client.query(api.mnemonics.list, {});
    let skipped = 0;
    for (const m of mnemonics as any[]) {
      if (!m.mnemonic || m.mnemonic.trim().length === 0) { skipped++; continue; }

      const diffLines = Array.isArray(m.differentials)
        ? m.differentials.map((d: any) =>
            `${d.letter} = ${d.condition}: ${d.associatedFeatures || ""}`
          ).join("\n")
        : "";

      const rawTextChunk = [
        `Mnemonic: ${m.mnemonic} -- ${m.pattern || ""}`,
        diffLines,
      ].filter(Boolean).join("\n");

      manifest.push({
        id: `mnemonics:${m._id}`,
        source: "mnemonics",
        entityName: `${m.mnemonic} (${m.pattern || ""})`,
        category: m.categoryAbbreviation || "Unknown",
        sourceBook: "mnemonics",
        rawTextChunk,
        radiographicFeatures: {},
        clinicalData: {},
        qualityScore: qualityFromLength(rawTextChunk),
        status: "pending",
        attempts: 0,
      });
    }
    console.log(`  mnemonics: ${manifest.filter(m => m.source === "mnemonics").length} entries (${skipped} skipped)`);
  }

  saveManifest(manifest);
  console.log(`Manifest built: ${manifest.length} total entries`);
  return manifest;
}

// ─── Embedding via OpenRouter ────────────────────────────────────────────────

async function getEmbedding(text: string, apiKey: string, workerId: number): Promise<number[] | null> {
  // Truncate to ~8000 tokens worth of chars (~32k chars safe limit for embedding models)
  const truncated = text.length > 30000 ? text.slice(0, 30000) : text;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://radquiz.app",
          "X-Title": "RadQuiz Vector Indexing",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-large",
          input: truncated,
          dimensions: 1536,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const status = response.status;
        if ([429, 500, 502, 503, 504].includes(status)) {
          const backoff = BACKOFF_BASE * Math.pow(2, attempt) + Math.random() * 2;
          log(workerId, `HTTP ${status} from embedding API, retrying in ${backoff.toFixed(0)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(backoff * 1000);
          continue;
        }
        const errText = await response.text();
        log(workerId, `Embedding HTTP ${status}: ${errText.substring(0, 200)}`);
        return null;
      }

      const data = await response.json() as any;
      if (data.error) {
        log(workerId, `Embedding API error: ${JSON.stringify(data.error).substring(0, 200)}`);
        return null;
      }

      const embedding = data.data?.[0]?.embedding;
      if (!Array.isArray(embedding) || embedding.length !== 1536) {
        log(workerId, `Invalid embedding dimensions: ${embedding?.length}`);
        return null;
      }

      return embedding;
    } catch (err: any) {
      if (err.name === "AbortError") {
        const backoff = BACKOFF_BASE * Math.pow(2, attempt) + Math.random() * 2;
        log(workerId, `Embedding timeout, retrying in ${backoff.toFixed(0)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(backoff * 1000);
      } else {
        log(workerId, `Embedding error: ${err.message}`);
        return null;
      }
    }
  }

  log(workerId, `All ${MAX_RETRIES} embedding retries exhausted`);
  return null;
}

// ─── Ingest via Convex CLI (internalMutation) ────────────────────────────────

function ingestViaConvexCLI(entry: ManifestEntry, embedding: number[], workerId: number): boolean {
  const payload = {
    entityName: entry.entityName,
    category: entry.category,
    radiographicFeatures: {
      xray: entry.radiographicFeatures.xray || undefined,
      us: entry.radiographicFeatures.us || undefined,
      ct: entry.radiographicFeatures.ct || undefined,
      mri: entry.radiographicFeatures.mri || undefined,
      fluoroscopy: entry.radiographicFeatures.fluoroscopy || undefined,
      nuclearMedicine: entry.radiographicFeatures.nuclearMedicine || undefined,
    },
    clinicalData: {
      demographics: entry.clinicalData.demographics || undefined,
      associations: entry.clinicalData.associations || undefined,
      cardinalSigns: entry.clinicalData.cardinalSigns || undefined,
    },
    rawTextChunk: entry.rawTextChunk,
    embedding,
    sourceBook: entry.sourceBook,
    qualityScore: entry.qualityScore,
  };

  // Pass JSON as a subprocess arg (list form avoids shell limits with large embeddings)
  const { execFileSync } = require("child_process");
  try {
    execFileSync(
      "npx",
      ["convex", "run", "rag:ingestTextbookKnowledge", JSON.stringify(payload), "--typecheck", "disable"],
      {
        cwd: PROJECT_ROOT,
        timeout: 30000,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
      }
    );
    return true;
  } catch (err: any) {
    const stderr = err.stderr ? err.stderr.toString().substring(0, 300) : err.message;
    log(workerId, `Convex CLI error: ${stderr}`);
    return false;
  }
}

// ─── Batch Ingest — groups records for efficiency ────────────────────────────

const INGEST_BATCH_SIZE = 5; // records per CLI call batch (sequential within worker)
const INTER_EMBED_DELAY = 200; // ms between embedding calls to avoid rate limits

// ─── Worker Loop ─────────────────────────────────────────────────────────────

function getNextPending(manifest: ManifestEntry[]): ManifestEntry | null {
  return manifest.find(m => m.status === "pending") || null;
}

async function workerLoop(
  workerId: number,
  apiKey: string,
  manifest: ManifestEntry[],
  stats: { embedded: number; ingested: number; failed: number },
) {
  while (true) {
    const entry = getNextPending(manifest);
    if (!entry) {
      log(workerId, "No more work -- done!");
      break;
    }

    entry.status = "processing";
    entry.attempts++;

    const done = manifest.filter(m => m.status === "done").length;
    const remaining = manifest.filter(m => m.status === "pending").length;
    log(workerId, `[${done}/${manifest.length}] ${entry.source}/${entry.category} "${entry.entityName.substring(0, 50)}..." (${remaining} remaining)`);

    if (DRY_RUN) {
      log(workerId, `  [DRY RUN] rawTextChunk=${entry.rawTextChunk.length} chars, quality=${entry.qualityScore}`);
      entry.status = "done";
      stats.embedded++;
      stats.ingested++;
      saveManifest(manifest);
      continue;
    }

    // Step 1: Get embedding
    const embedding = await getEmbedding(entry.rawTextChunk, apiKey, workerId);
    if (!embedding) {
      log(workerId, `  Failed to embed "${entry.entityName.substring(0, 40)}"`);
      entry.status = entry.attempts >= MAX_RETRIES ? "failed" : "pending";
      entry.lastError = "Embedding failed";
      stats.failed++;
      saveManifest(manifest);
      await sleep(BACKOFF_BASE * 1000);
      continue;
    }
    stats.embedded++;

    // Step 2: Ingest to Convex via CLI
    const success = ingestViaConvexCLI(entry, embedding, workerId);
    if (!success) {
      log(workerId, `  Failed to ingest "${entry.entityName.substring(0, 40)}"`);
      entry.status = entry.attempts >= MAX_RETRIES ? "failed" : "pending";
      entry.lastError = "Ingest failed";
      stats.failed++;
      saveManifest(manifest);
      await sleep(2000);
      continue;
    }

    entry.status = "done";
    stats.ingested++;
    log(workerId, `  Indexed: ${entry.entityName.substring(0, 60)} (${entry.rawTextChunk.length} chars, q=${entry.qualityScore})`);

    // Save manifest every record for resumability
    if (stats.ingested % 10 === 0) {
      saveManifest(manifest);
    }

    // Small delay between records to be kind to APIs
    await sleep(INTER_EMBED_DELAY);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const numWorkers = Math.min(API_KEYS.length || 1, 10);

  console.log("=========================================================");
  console.log("  RadQuiz Structured Data Indexer — Vector DB Population");
  console.log("=========================================================");
  console.log(`  Convex:    ${CONVEX_URL}`);
  console.log(`  Workers:   ${numWorkers}`);
  console.log(`  Sources:   ${[...ACTIVE_SOURCES].join(", ")}`);
  console.log(`  Dry run:   ${DRY_RUN}`);
  console.log(`  Manifest:  ${MANIFEST_PATH}`);
  console.log("");

  const manifest = await buildManifest();

  // Reset failed entries with remaining attempts for retry
  for (const e of manifest) {
    if (e.status === "failed" && e.attempts < MAX_RETRIES) {
      e.status = "pending";
    }
  }

  const totalPending = manifest.filter(m => m.status === "pending").length;
  const totalDone = manifest.filter(m => m.status === "done").length;

  if (totalPending === 0) {
    console.log(`All ${manifest.length} entries already indexed. Nothing to do.`);
    return;
  }

  console.log(`${totalDone} already done, ${totalPending} to index.\n`);

  // Summary by source
  for (const src of ALL_SOURCES) {
    if (!ACTIVE_SOURCES.has(src)) continue;
    const srcEntries = manifest.filter(m => m.source === src);
    const srcPending = srcEntries.filter(m => m.status === "pending").length;
    const srcDone = srcEntries.filter(m => m.status === "done").length;
    console.log(`  ${src}: ${srcDone} done, ${srcPending} pending (${srcEntries.length} total)`);
  }
  console.log("");

  const stats = { embedded: 0, ingested: 0, failed: 0 };

  // Launch workers with staggered start (0.5s apart)
  const workers: Promise<void>[] = [];
  for (let i = 0; i < numWorkers; i++) {
    await sleep(500); // stagger
    const apiKey = API_KEYS[i % API_KEYS.length]; // rotate keys
    workers.push(workerLoop(i, apiKey, manifest, stats));
  }

  await Promise.all(workers);

  // Final save
  saveManifest(manifest);

  // Summary
  const done = manifest.filter(m => m.status === "done").length;
  const failed = manifest.filter(m => m.status === "failed").length;

  console.log("\n=========================================================");
  console.log("  FINAL SUMMARY");
  console.log("=========================================================");
  console.log(`  Embedded:  ${stats.embedded}`);
  console.log(`  Ingested:  ${stats.ingested}`);
  console.log(`  Failed:    ${stats.failed}`);
  console.log(`  Done:      ${done}/${manifest.length}`);
  console.log(`  Remaining: ${manifest.length - done - failed} pending, ${failed} failed`);
  console.log("=========================================================");

  // Report failed entries
  const failedEntries = manifest.filter(m => m.status === "failed");
  if (failedEntries.length > 0) {
    console.log("\nFailed entries:");
    for (const f of failedEntries.slice(0, 20)) {
      console.log(`  ${f.source}/${f.category}: ${f.entityName.substring(0, 60)} -- ${f.lastError || "unknown"}`);
    }
    if (failedEntries.length > 20) {
      console.log(`  ... and ${failedEntries.length - 20} more`);
    }
  }
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
