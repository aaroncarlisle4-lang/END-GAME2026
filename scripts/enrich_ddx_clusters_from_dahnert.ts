#!/usr/bin/env npx tsx
/**
 * Enrich dahnertDDxClusters differentials with per-condition Dahnert data.
 *
 * For each differential in every cluster, name-match to all_conditions.json
 * and embed: conditionSlug, definition, dominantFinding, distribution,
 * demographics, discriminatingFeatures.
 *
 * Usage:
 *   npx tsx scripts/enrich_ddx_clusters_from_dahnert.ts
 *   npx tsx scripts/enrich_ddx_clusters_from_dahnert.ts --dry-run
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

// ─── .env ────────────────────────────────────────────────────────────────────
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
const CONVEX_URL = process.env.VITE_CONVEX_URL ?? "https://reminiscent-seal-853.convex.cloud";

// ─── load conditions (original + supplementary) ───────────────────────────────
const conditionsPath = path.join(__dirname, "..", "Bob's UK MLA", "structured", "all_conditions.json");
const suppPath = path.join(__dirname, "..", "Bob's UK MLA", "structured", "supplementary_conditions.json");
const allConditions: any[] = [
  ...JSON.parse(fs.readFileSync(conditionsPath, "utf-8")),
  ...(fs.existsSync(suppPath) ? JSON.parse(fs.readFileSync(suppPath, "utf-8")) : []),
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

// Build lookup maps
const byExact = new Map<string, any>();
const byWordSet = new Map<string, any>();

for (const c of allConditions) {
  byExact.set(normalize(c.name), c);
  // word-set key: sorted significant words (>3 chars)
  const wk = normalize(c.name).split(" ").filter((w: string) => w.length > 3).sort().join("|");
  if (wk && !byWordSet.has(wk)) byWordSet.set(wk, c);
}

function lookupCondition(name: string): any | null {
  const norm = normalize(name);

  // 1. Exact
  if (byExact.has(norm)) return byExact.get(norm)!;

  // 2. Strip parenthetical / qualifier
  const stripped = normalize(
    name.replace(/\s*[\(\[].*/, "").replace(/\s*\/.*/, "").replace(/\s*:.*/, "")
  );
  if (stripped && byExact.has(stripped)) return byExact.get(stripped)!;

  // 3. Word-set match
  const wk = norm.split(" ").filter((w: string) => w.length > 3).sort().join("|");
  if (wk && byWordSet.has(wk)) return byWordSet.get(wk)!;

  // 4. Partial: all significant condition words appear in the diagnosis
  for (const [key, cond] of byExact) {
    const condWords = key.split(" ").filter((w: string) => w.length > 4);
    if (condWords.length >= 2 && condWords.every((w: string) => norm.includes(w))) return cond;
  }

  return null;
}

function buildEnrichment(cond: any, idx: number): any {
  const e: any = { differentialIndex: idx, conditionSlug: cond.slug };

  if (cond.definition) e.definition = String(cond.definition).slice(0, 400);
  if (cond.dominant_finding) e.dominantFinding = String(cond.dominant_finding).slice(0, 400);
  if (cond.distribution) e.distribution = String(cond.distribution).slice(0, 400);

  if (cond.demographics) {
    const demo = cond.demographics;
    if (Array.isArray(demo)) {
      const s = demo.slice(0, 5).join("; ");
      if (s) e.demographics = s.slice(0, 400);
    } else if (typeof demo === "object") {
      const s = Object.entries(demo).map(([k, v]) => `${k}: ${v}`).slice(0, 5).join("; ");
      if (s) e.demographics = s.slice(0, 400);
    }
  }

  if (cond.discriminating_features?.length) {
    e.discriminatingFeatures = (cond.discriminating_features as string[]).slice(0, 5);
  }

  return e;
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Fetching all DDx clusters...");
  const allClusters: any[] = await client.query(api.dahnertDDxClusters.list, {});
  console.log(`Clusters: ${allClusters.length}`);

  let totalDiffs = 0;
  let matchedDiffs = 0;
  const unmatchedNames = new Set<string>();
  const BATCH_SIZE = 40;
  let patchBatch: any[] = [];
  let totalEnriched = 0;

  for (const cluster of allClusters) {
    const enrichments: any[] = [];

    for (let i = 0; i < cluster.differentials.length; i++) {
      const diff = cluster.differentials[i];
      totalDiffs++;

      if (diff.conditionSlug) continue; // already linked

      const cond = lookupCondition(diff.name);
      if (!cond) {
        unmatchedNames.add(diff.name);
        continue;
      }
      matchedDiffs++;
      enrichments.push(buildEnrichment(cond, i));
    }

    if (enrichments.length > 0) {
      patchBatch.push({ slug: cluster.slug, enrichments });
    }

    if (patchBatch.length >= BATCH_SIZE) {
      if (!DRY_RUN) {
        const r = await client.mutation(api.dahnertDDxClusters.batchEnrichDifferentials, { patches: patchBatch });
        totalEnriched += r.enriched;
      }
      process.stdout.write(`\r  Enriched: ${totalEnriched} clusters | ${matchedDiffs}/${totalDiffs} diffs matched`);
      patchBatch = [];
    }
  }

  if (patchBatch.length > 0 && !DRY_RUN) {
    const r = await client.mutation(api.dahnertDDxClusters.batchEnrichDifferentials, { patches: patchBatch });
    totalEnriched += r.enriched;
  }

  const matchPct = Math.round(matchedDiffs / totalDiffs * 100);
  console.log(`\n\n=== Results ===`);
  console.log(`Clusters:         ${allClusters.length}`);
  console.log(`Total diffs:      ${totalDiffs}`);
  console.log(`Matched:          ${matchedDiffs} (${matchPct}%)`);
  console.log(`Unmatched:        ${unmatchedNames.size} unique names`);
  console.log(`Clusters enriched: ${DRY_RUN ? "(dry run)" : totalEnriched}`);

  if (unmatchedNames.size > 0) {
    console.log(`\nSample unmatched (${Math.min(40, unmatchedNames.size)} of ${unmatchedNames.size}):`);
    [...unmatchedNames].slice(0, 40).forEach(u => console.log(`  - ${u}`));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
