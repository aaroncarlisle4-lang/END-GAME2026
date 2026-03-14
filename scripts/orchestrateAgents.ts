#!/usr/bin/env npx tsx
/**
 * Orchestrate 10 parallel AI agents to populate 740 non-MSK long cases.
 * Modelled on the proven MLA question generator pattern.
 *
 * Usage:
 *   npx tsx scripts/orchestrateAgents.ts
 *   npx tsx scripts/orchestrateAgents.ts --batch-size 3 --delay 6
 *   npx tsx scripts/orchestrateAgents.ts --dry-run
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Id } from "../convex/_generated/dataModel.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
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

// ─── Config ───────────────────────────────────────────────────────────────────

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "https://lovable-goat-91.eu-west-1.convex.cloud";
const API_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").filter(Boolean);
const MODEL = process.env.MODEL || "stepfun/step-3.5-flash"; // PAID model (not :free)
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = parseInt(process.argv.find((_: string, i: number, a: string[]) => a[i - 1] === "--batch-size") || "3", 10);
const DELAY = parseInt(process.argv.find((_: string, i: number, a: string[]) => a[i - 1] === "--delay") || "6", 10);
const MAX_RETRIES = 5;
const BACKOFF_BASE = 30;
const REQUEST_TIMEOUT = 180000; // 180s like MLA script
const MANIFEST_PATH = path.join(__dirname, "manifest.json");
const _FAILURES_PATH = path.join(__dirname, "failures.json");

if (!API_KEYS.length && !DRY_RUN) {
  console.error("ERROR: Set OPENROUTER_KEYS in .env");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManifestEntry {
  _id: string;
  caseNumber: number;
  title: string;
  section?: string;
  modality: string;
  clinicalHistory: string;
  diagnosis: string;
  difficulty: string;
  categoryAbbreviation: string;
  status: "pending" | "processing" | "done" | "failed";
  attempts: number;
  lastError?: string;
}

// ─── System Prompt (compact, proven format) ───────────────────────────────────

const SYSTEM_PROMPT = `You are an expert FRCR 2B exam question writer. You produce gold-standard long case content.

## Output JSON Schema — FOLLOW EXACTLY
Return a JSON array. Each element has these EXACT fields:
- "caseNumber": number
- "clinicalHistory": string (2-3 sentences, age, sex, complaint, inflection point)
- "findings": string (MUST use \\n newlines between each finding. 5-15 separate findings, one per line. Use: density for XR, attenuation for CT, signal for MRI, reflectivity for US, uptake for NM. Example: "finding one\\nfinding two\\nfinding three")
- "interpretation": string (2-3 sentences)
- "diagnosis": string (specific with location)
- "differentials": array of EXACTLY 3 strings, each format "Diagnosis (discriminating feature)"
- "nextSteps": string (3-4 sentences, UK MDT pathways)
- "keyBullets": array of EXACTLY 8 strings
- "importantNegatives": array of EXACTLY 5 strings
- "examPearl": string (2-3 sentences with [n] textbook ref)
- "scoringGuide": object with keys "score4","score5","score6","score7","score8" (each string ≥80 chars, case-specific, must name the diagnosis)
- "vivaPresentation": object with keys "opening","anchorStatement","systemicApproach","synthesis","differentialReasoning","clinicalUrgency","examinerTip" (each string ≥30 chars)
- "problemCategory": one of "emergency","staging","characterisation","incidental","chronic","congenital"
- "negativesContext": object with keys "emergencyExclusions","stagingNegatives","complicationNegatives","incidentalNegatives" (each array of strings, total ≥4 items)

## EXAMPLE (gold standard — match this quality):
{"caseNumber":1,"clinicalHistory":"22-year-old male presents with radial-sided wrist pain following a fall onto an outstretched hand (FOOSH) 10 days ago. Initial radiographs at the time of injury were reported as normal.","findings":"Scaphoid view radiographs of the right wrist demonstrate a transverse lucent line through the waist of the scaphoid with subtle cortical irregularity along the radial aspect. There is mild adjacent soft tissue swelling over the anatomical snuffbox. No sclerosis or cystic change to suggest established non-union. The distal radius and ulna are intact. No perilunate dislocation or carpal malalignment. The scapholunate and lunotriquetral intervals are preserved. No DISI or VISI pattern on the lateral view.","interpretation":"The findings demonstrate an acute/subacute fracture through the scaphoid waist, now visible on repeat imaging 10 days post-injury. The initial radiographs were likely falsely negative as early scaphoid fractures can be occult on plain film in up to 20% of cases [2].","diagnosis":"Acute scaphoid waist fracture","differentials":["Scaphoid contusion without fracture (if MRI were performed)","Distal radius fracture (cortical disruption at radial styloid)","Scapholunate ligament injury (Terry Thomas sign >3mm)"],"nextSteps":"Immobilisation in a scaphoid cast (thumb spica). Orthopaedic referral for consideration of percutaneous screw fixation given waist-level fracture and risk of AVN. If clinical uncertainty remains, MRI is the gold standard for occult scaphoid fractures [4]. Follow-up radiograph at 6 weeks to assess union.","keyBullets":["Lucent fracture line through the scaphoid waist","Soft tissue swelling over anatomical snuffbox","No sclerosis or cystic change (acute injury)","Carpal alignment preserved — no DISI/VISI","Scapholunate interval normal","No perilunate dislocation","Comment on blood supply — proximal pole at risk of AVN","Recommendation for orthopaedic referral/MRI if doubt"],"importantNegatives":["No sclerosis or cystic change (excludes established non-union)","No avascular necrosis of the proximal pole","No perilunate dislocation","Normal scapholunate interval","No DISI or VISI deformity"],"examPearl":"The scaphoid blood supply enters distally — waist and proximal pole fractures are at highest risk of AVN. Always request scaphoid views (not just standard wrist AP/lateral) and consider MRI if clinical suspicion remains despite normal radiographs [4].","scoringGuide":{"score4":"Identifies a fracture but cannot localise to the scaphoid or misses it entirely. No mention of AVN risk or blood supply significance.","score5":"Identifies scaphoid fracture. Limited description — misses waist location or blood supply significance. No mention of occult fractures.","score6":"Correctly identifies scaphoid waist fracture with adequate description of findings. Mentions AVN risk. Basic differential provided.","score7":"Systematic description with waist localisation, discusses blood supply implications, appropriate management with immobilisation and follow-up. Mentions MRI for occult fractures.","score8":"Comprehensive: scaphoid views vs standard wrist films, Herbert classification, proximal pole blood supply anatomy, clear management pathway including MRI indications, percutaneous screw consideration."},"vivaPresentation":{"opening":"This is a scaphoid-view radiograph of the right wrist in a 22-year-old male presenting with radial-sided wrist pain 10 days after a FOOSH injury with initially normal radiographs.","anchorStatement":"The anchor finding is a transverse lucent line through the scaphoid waist — this was initially occult and has now become visible due to resorption at the fracture margins.","systemicApproach":"Systematically: the fracture is through the waist — the most common location. There is no sclerosis or cystic change to suggest non-union.","synthesis":"A scaphoid waist fracture in a young male after FOOSH, initially occult, now visible at 10 days due to fracture-line resorption.","differentialReasoning":"If this were simply a contusion, there would be no visible fracture line on plain film — MRI would show marrow oedema only.","clinicalUrgency":"This is urgent — requires immobilisation in a thumb spica cast and orthopaedic referral for possible screw fixation.","examinerTip":"The examiner is listening for knowledge of scaphoid blood supply, occult fracture rates, and MRI as gold standard."},"problemCategory":"emergency","negativesContext":{"emergencyExclusions":["No perilunate dislocation","No trans-scaphoid perilunate fracture-dislocation"],"stagingNegatives":["No established non-union","No AVN of the proximal pole"],"complicationNegatives":["No DISI deformity suggesting ligamentous instability"],"incidentalNegatives":["No other carpal fracture","No distal radius fracture"]}}

CRITICAL: Return ONLY valid JSON array. No markdown fences. No explanations.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Manifest Builder ─────────────────────────────────────────────────────────

async function buildManifest(): Promise<ManifestEntry[]> {
  if (fs.existsSync(MANIFEST_PATH)) {
    const existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as ManifestEntry[];
    const remaining = existing.filter(m => m.status !== "done").length;
    if (remaining > 0) {
      console.log(`📂 Resuming: ${existing.length - remaining}/${existing.length} done, ${remaining} remaining`);
      return existing;
    }
  }

  console.log("🔍 Querying Convex for all categories and long cases...");
  const categories = await client.query(api.categories.list, {});
  const mskCat = categories.find((c: any) => c.abbreviation === "MSK");
  if (!mskCat) throw new Error("MSK category not found");

  const allCases = await client.query(api.longCases.list, {});
  const nonMsk = allCases.filter((c: any) => c.categoryId !== mskCat._id);
  const catMap = new Map(categories.map((c: any) => [c._id, c.abbreviation]));

  const manifest: ManifestEntry[] = nonMsk.map((c: any) => ({
    _id: c._id,
    caseNumber: c.caseNumber,
    title: c.title,
    section: c.section,
    modality: c.modality,
    clinicalHistory: c.clinicalHistory,
    diagnosis: c.diagnosis,
    difficulty: c.difficulty,
    categoryAbbreviation: catMap.get(c.categoryId) || "Unknown",
    status: "pending" as const,
    attempts: 0,
  }));

  manifest.sort((a, b) => a.categoryAbbreviation.localeCompare(b.categoryAbbreviation) || a.caseNumber - b.caseNumber);
  saveManifest(manifest);
  console.log(`📋 Manifest: ${manifest.length} non-MSK cases`);
  return manifest;
}

// ─── OpenRouter API (matches MLA pattern) ─────────────────────────────────────

async function callOpenRouter(apiKey: string, systemPrompt: string, userPrompt: string, workerId: number): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://radquiz.app",
          "X-Title": "RadQuiz Case Population",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 16000,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const status = response.status;
        if ([429, 500, 502, 503, 504].includes(status)) {
          const backoff = BACKOFF_BASE * Math.pow(2, attempt) + Math.random() * 2;
          log(workerId, `⚠ HTTP ${status}, retrying in ${backoff.toFixed(0)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(backoff * 1000);
          continue;
        }
        const errText = await response.text();
        log(workerId, `✗ HTTP ${status}: ${errText.substring(0, 200)}`);
        return "";
      }

      const data = await response.json() as any;
      if (data.error) {
        log(workerId, `✗ API error: ${JSON.stringify(data.error).substring(0, 200)}`);
        return "";
      }

      const msg = data.choices?.[0]?.message;
      let content = msg?.content || "";

      // Step-3.5-Flash is a reasoning model: content may be null
      // Extract JSON from reasoning field if needed (matches MLA pattern)
      if (!content && msg?.reasoning) {
        const jsonMatch = msg.reasoning.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          content = jsonMatch[0];
          log(workerId, `  ℹ Extracted JSON from reasoning field`);
        } else {
          log(workerId, `  ⚠ Reasoning-only response, retrying...`);
          if (attempt < MAX_RETRIES - 1) {
            await sleep(BACKOFF_BASE + Math.random() * 2000);
            continue;
          }
        }
      }

      const usage = data.usage;
      const cost = usage?.cost || 0;
      log(workerId, `  📡 ${content.length} chars, cost=$${cost.toFixed(4)}, tokens=${usage?.completion_tokens || '?'}`);
      return content;

    } catch (err: any) {
      if (err.name === "AbortError") {
        const backoff = BACKOFF_BASE * Math.pow(2, attempt) + Math.random() * 2;
        log(workerId, `  ⚠ Timeout, retrying in ${backoff.toFixed(0)}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(backoff * 1000);
      } else {
        log(workerId, `  ✗ Error: ${err.message}`);
        return "";
      }
    }
  }

  log(workerId, `  ✗ All ${MAX_RETRIES} retries exhausted`);
  return "";
}

// ─── JSON Parser ──────────────────────────────────────────────────────────────

function parseResponse(raw: string): any[] | null {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  try {
    const p = JSON.parse(cleaned);
    return Array.isArray(p) ? p : p?.caseNumber ? [p] : null;
  } catch {
    const m = cleaned.match(/\[[\s\S]*\]/);
    if (m) try { return JSON.parse(m[0]); } catch { }
    return null;
  }
}

// ─── QA Validator ─────────────────────────────────────────────────────────────

function validateCase(c: any, expectedCaseNum: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (c.caseNumber !== expectedCaseNum) errors.push(`caseNumber mismatch: ${c.caseNumber} vs ${expectedCaseNum}`);
  if (!c.clinicalHistory || c.clinicalHistory.length < 80) errors.push("clinicalHistory too short");
  if (c.clinicalHistory && !/\d/.test(c.clinicalHistory)) errors.push("clinicalHistory missing age");
  // Count findings: newline-separated lines OR period-separated sentences (model sometimes writes prose)
  if (!c.findings || c.findings.length < 150) {
    errors.push("findings too short");
  } else {
    const lines = c.findings.split("\n").filter((l: string) => l.trim()).length;
    const sentences = c.findings.split(/[.]\s/).filter((s: string) => s.trim().length > 10).length;
    if (lines < 5 && sentences < 5) errors.push(`findings: ${lines} lines, ${sentences} sentences (need ≥5)`);
  }
  if (!c.interpretation || c.interpretation.length < 50) errors.push("interpretation too short");
  if (!c.diagnosis || c.diagnosis.length < 20) errors.push("diagnosis too short");
  if (!Array.isArray(c.differentials) || c.differentials.length !== 3) errors.push(`differentials: ${c.differentials?.length} (need 3)`);
  else for (const d of c.differentials) if (!d.includes("(") || !d.includes(")")) errors.push(`differential missing parens`);
  if (!Array.isArray(c.keyBullets) || c.keyBullets.length !== 8) errors.push(`keyBullets: ${c.keyBullets?.length} (need 8)`);
  if (!Array.isArray(c.importantNegatives) || c.importantNegatives.length !== 5) errors.push(`importantNegatives: ${c.importantNegatives?.length} (need 5)`);
  if (!c.examPearl || !/\[\d+\]/.test(c.examPearl)) errors.push("examPearl missing [n] ref");
  if (!c.nextSteps || c.nextSteps.length < 80) errors.push("nextSteps too short");

  const sg = c.scoringGuide;
  if (!sg || typeof sg !== "object") errors.push("scoringGuide missing");
  else for (const k of ["score4", "score5", "score6", "score7", "score8"])
    if (!sg[k] || sg[k].length < 80) errors.push(`scoringGuide.${k} short`);

  const vp = c.vivaPresentation;
  if (!vp || typeof vp !== "object") errors.push("vivaPresentation missing");
  else for (const k of ["opening", "anchorStatement", "systemicApproach", "synthesis", "differentialReasoning", "clinicalUrgency", "examinerTip"])
    if (!vp[k] || vp[k].length < 30) errors.push(`vivaPresentation.${k} short`);

  if (!["emergency", "staging", "characterisation", "incidental", "chronic", "congenital"].includes(c.problemCategory))
    errors.push(`problemCategory invalid: ${c.problemCategory}`);

  const nc = c.negativesContext;
  if (!nc || typeof nc !== "object") errors.push("negativesContext missing");
  else {
    let total = 0;
    for (const k of ["emergencyExclusions", "stagingNegatives", "complicationNegatives", "incidentalNegatives"]) {
      if (!Array.isArray(nc[k])) errors.push(`negativesContext.${k} missing`);
      else total += nc[k].length;
    }
    if (total < 4) errors.push("negativesContext total <4 items");
  }

  return { valid: errors.length === 0, errors };
}

// ─── Convex Seeder ────────────────────────────────────────────────────────────

async function seedCases(cases: Array<{ _id: string; data: any }>): Promise<number> {
  const CHUNK = 10;
  let seeded = 0;
  for (let i = 0; i < cases.length; i += CHUNK) {
    const chunk = cases.slice(i, i + CHUNK);
    const updates = chunk.map(c => ({
      id: c._id as Id<"longCases">,
      fields: {
        clinicalHistory: c.data.clinicalHistory,
        findings: c.data.findings,
        interpretation: c.data.interpretation,
        diagnosis: c.data.diagnosis,
        differentials: c.data.differentials,
        nextSteps: c.data.nextSteps,
        keyBullets: c.data.keyBullets,
        importantNegatives: c.data.importantNegatives,
        examPearl: c.data.examPearl,
        scoringGuide: c.data.scoringGuide,
        vivaPresentation: c.data.vivaPresentation,
        problemCategory: c.data.problemCategory,
        negativesContext: c.data.negativesContext,
      },
    }));
    const result = await client.mutation(api.longCases.updateBatch, { updates });
    seeded += (result as any).count || chunk.length;
  }
  return seeded;
}

// ─── Worker Loop (matches MLA threading pattern) ──────────────────────────────

function getNextBatch(manifest: ManifestEntry[], batchSize: number): ManifestEntry[] | null {
  const pending = manifest.filter(m => m.status === "pending");
  if (pending.length === 0) return null;
  const batch = pending.slice(0, batchSize);
  for (const entry of batch) {
    entry.status = "processing";
    entry.attempts++;
  }
  return batch;
}

function buildUserPrompt(batch: ManifestEntry[]): string {
  const cases = batch.map(c => ({
    caseNumber: c.caseNumber,
    title: c.title,
    section: c.section || "General",
    modality: c.modality,
    clinicalHistory: c.clinicalHistory,
    diagnosis: c.diagnosis,
    categoryAbbreviation: c.categoryAbbreviation,
  }));
  return `Populate ${cases.length} radiology long cases to gold standard. Use the title/modality/diagnosis as foundation. Enhance clinicalHistory (add age, sex, inflection point). Return JSON array of ${cases.length} objects with ALL fields from schema.

CASES:
${JSON.stringify(cases, null, 2)}

Return ONLY the JSON array. No markdown fences.`;
}

async function workerLoop(
  workerId: number,
  apiKey: string,
  manifest: ManifestEntry[],
  stats: { calls: number; accepted: number; rejected: number; seeded: number },
) {
  while (true) {
    const batch = getNextBatch(manifest, BATCH_SIZE);
    if (!batch) {
      log(workerId, "✓ No more work — done!");
      break;
    }

    const remaining = manifest.filter(m => m.status === "pending").length;
    const done = manifest.filter(m => m.status === "done").length;
    const cats = [...new Set(batch.map(b => b.categoryAbbreviation))].join(",");
    log(workerId, `[${done}/${manifest.length}] ${cats} — generating ${batch.length} cases (${remaining} remaining)`);

    saveManifest(manifest);

    if (DRY_RUN) {
      log(workerId, `  [DRY RUN] Would send ${batch.length} cases`);
      for (const e of batch) e.status = "pending";
      break;
    }

    const userPrompt = buildUserPrompt(batch);
    const raw = await callOpenRouter(apiKey, SYSTEM_PROMPT, userPrompt, workerId);
    stats.calls++;

    if (!raw) {
      log(workerId, "  ✗ Empty response, re-queuing");
      for (const e of batch) e.status = e.attempts >= MAX_RETRIES * 2 ? "failed" : "pending";
      await sleep((DELAY + Math.random() * 2) * 1000);
      continue;
    }

    const parsed = parseResponse(raw);
    if (!parsed) {
      log(workerId, "  ✗ JSON parse failed, re-queuing");
      for (const e of batch) e.status = e.attempts >= MAX_RETRIES * 2 ? "failed" : "pending";
      await sleep((DELAY + Math.random() * 2) * 1000);
      continue;
    }

    // Match and validate
    const populatedMap = new Map(parsed.map((p: any) => [p.caseNumber, p]));
    const toSeed: Array<{ _id: string; data: any }> = [];

    for (const entry of batch) {
      const pop = populatedMap.get(entry.caseNumber);
      if (!pop) {
        log(workerId, `  ⚠ Case ${entry.caseNumber} missing from output`);
        entry.status = entry.attempts >= MAX_RETRIES * 2 ? "failed" : "pending";
        entry.lastError = "Missing from output";
        stats.rejected++;
        continue;
      }

      const { valid, errors } = validateCase(pop, entry.caseNumber);
      if (!valid) {
        log(workerId, `  ⚠ Case ${entry.caseNumber} (${entry.title}): ${errors[0]}`);
        entry.status = entry.attempts >= MAX_RETRIES * 2 ? "failed" : "pending";
        entry.lastError = errors.join("; ");
        stats.rejected++;
        continue;
      }

      toSeed.push({ _id: entry._id, data: pop });
      entry.status = "done";
      stats.accepted++;
    }

    if (toSeed.length > 0) {
      try {
        const n = await seedCases(toSeed);
        stats.seeded += n;
        log(workerId, `  ✅ Seeded ${n} cases to Convex`);
      } catch (err: any) {
        log(workerId, `  ❌ Seed error: ${err.message}`);
        for (const item of toSeed) {
          const entry = manifest.find(m => m._id === item._id);
          if (entry) { entry.status = "failed"; entry.lastError = err.message; stats.accepted--; stats.rejected++; }
        }
      }
    }

    saveManifest(manifest);
    await sleep((DELAY + Math.random() * 2) * 1000);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const numWorkers = Math.min(API_KEYS.length, 10);

  console.log("═══════════════════════════════════════════════════════");
  console.log("  RadQuiz Agent Orchestrator — Gold Standard Population");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Model: ${MODEL}`);
  console.log(`  Workers: ${numWorkers}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log(`  Delay: ${DELAY}s between calls per worker`);
  console.log(`  Dry run: ${DRY_RUN}`);
  console.log("");

  const manifest = await buildManifest();
  const totalRemaining = manifest.filter(m => m.status !== "done").length;

  if (totalRemaining === 0) {
    console.log("✓ All cases populated! Nothing to do.");
    return;
  }

  // Reset failed cases for retry
  for (const e of manifest) {
    if (e.status === "failed" && e.attempts < MAX_RETRIES * 2) {
      e.status = "pending";
    }
  }

  const stats = { calls: 0, accepted: 0, rejected: 0, seeded: 0 };

  // Launch workers with staggered start (0.5s apart, like MLA script)
  const workers: Promise<void>[] = [];
  for (let i = 0; i < numWorkers; i++) {
    await sleep(500); // stagger
    workers.push(workerLoop(i, API_KEYS[i], manifest, stats));
  }

  await Promise.all(workers);

  // Post-processing: generate model answers
  const doneEntries = manifest.filter(m => m.status === "done");
  if (doneEntries.length > 0 && !DRY_RUN) {
    console.log("\n📝 Generating model answers...");
    const categories = [...new Set(doneEntries.map(e => e.categoryAbbreviation))];
    for (const cat of categories) {
      const catCases = doneEntries.filter(e => e.categoryAbbreviation === cat);
      const minCase = Math.min(...catCases.map(c => c.caseNumber));
      const maxCase = Math.max(...catCases.map(c => c.caseNumber));
      try {
        await client.mutation(api.longCases.generateModelAnswersBatch, {
          categoryAbbreviation: cat, startCaseNumber: minCase, endCaseNumber: maxCase,
        });
        console.log(`  ✅ ${cat}: model answers generated`);
      } catch (err: any) {
        console.log(`  ❌ ${cat}: ${err.message}`);
      }
    }
  }

  // Summary
  const done = manifest.filter(m => m.status === "done").length;
  const failed = manifest.filter(m => m.status === "failed").length;
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  FINAL SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  API calls: ${stats.calls}`);
  console.log(`  Accepted:  ${stats.accepted}`);
  console.log(`  Rejected:  ${stats.rejected}`);
  console.log(`  Seeded:    ${stats.seeded}`);
  console.log(`  Done:      ${done}/${manifest.length}`);
  console.log(`  Failed:    ${failed}`);
  console.log("═══════════════════════════════════════════════════════");

  saveManifest(manifest);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
