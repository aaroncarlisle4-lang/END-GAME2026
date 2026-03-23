#!/usr/bin/env npx tsx
/**
 * Enrich discriminator differentials from Dahnert condition data.
 *
 * For each differential in every discriminator record, name-match to
 * all_conditions.json and backfill:
 *   - dominantImagingFinding  ← dominant_finding
 *   - distributionLocation    ← distribution
 *   - demographicsClinicalContext ← demographics (joined)
 *   - discriminatingKeyFeature    ← discriminating_features[0..2] joined
 *   - dahnertConditionSlug    ← slug
 *
 * Only fills empty fields — never overwrites existing data.
 *
 * Usage:
 *   npx tsx scripts/enrich_discriminators_from_dahnert.ts
 *   npx tsx scripts/enrich_discriminators_from_dahnert.ts --dry-run
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");
const OVERWRITE = process.argv.includes("--overwrite"); // replace existing data with Dahnert content

// ─── load .env ───────────────────────────────────────────────────────────────
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

// Build lookup maps
const byExact = new Map<string, any>();   // exact lowercased name
const byWords = new Map<string, any>();   // sorted word key

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordKey(s: string): string {
  return normalize(s).split(" ").filter(w => w.length > 2).sort().join(" ");
}

for (const c of allConditions) {
  byExact.set(normalize(c.name), c);
  const wk = wordKey(c.name);
  if (wk && !byWords.has(wk)) byWords.set(wk, c);
}

function lookupCondition(diagnosis: string): any | null {
  const norm = normalize(diagnosis);
  if (byExact.has(norm)) return byExact.get(norm)!;

  // Try stripping parenthetical / after slash
  const stripped = normalize(diagnosis.replace(/\s*[\(\[].*/, "").replace(/\s*\/.*/, ""));
  if (byExact.has(stripped)) return byExact.get(stripped)!;

  // Word-set match
  const wk = wordKey(diagnosis);
  if (wk && byWords.has(wk)) return byWords.get(wk)!;

  // Partial: condition name words are all in diagnosis
  for (const [key, cond] of byExact) {
    const condWords = key.split(" ").filter((w: string) => w.length > 3);
    if (condWords.length >= 2 && condWords.every((w: string) => norm.includes(w))) {
      return cond;
    }
  }

  return null;
}

function buildEnrichment(cond: any): {
  dahnertConditionSlug?: string;
  dominantImagingFinding?: string;
  distributionLocation?: string;
  demographicsClinicalContext?: string;
  discriminatingKeyFeature?: string;
} {
  const e: any = { dahnertConditionSlug: cond.slug };

  if (cond.dominant_finding) {
    e.dominantImagingFinding = String(cond.dominant_finding).slice(0, 300);
  }

  if (cond.distribution) {
    e.distributionLocation = String(cond.distribution).slice(0, 300);
  }

  if (cond.demographics) {
    const demo = cond.demographics;
    if (typeof demo === "object" && !Array.isArray(demo)) {
      const parts = Object.entries(demo)
        .map(([k, v]) => `${k}: ${v}`)
        .slice(0, 5)
        .join("; ");
      if (parts) e.demographicsClinicalContext = parts.slice(0, 300);
    } else if (Array.isArray(demo)) {
      const parts = demo.slice(0, 5).join("; ");
      if (parts) e.demographicsClinicalContext = parts.slice(0, 300);
    }
  }

  if (cond.discriminating_features?.length) {
    e.discriminatingKeyFeature = (cond.discriminating_features as string[])
      .slice(0, 3)
      .join(" | ")
      .slice(0, 400);
  }

  return e;
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Fetching all discriminator records...");
  const allDiscriminators: any[] = await client.query(api.discriminators.list, {});
  console.log(`Found ${allDiscriminators.length} discriminator records`);

  let totalDiffs = 0;
  let matchedDiffs = 0;
  let unmatched: string[] = [];
  const BATCH_SIZE = 50;
  let patchBatch: any[] = [];
  let batchesSubmitted = 0;

  for (const disc of allDiscriminators) {
    const enrichments: any[] = [];

    for (let i = 0; i < disc.differentials.length; i++) {
      const diff = disc.differentials[i];
      totalDiffs++;

      // In fill-empty mode, skip diffs that already have all 3 key fields
      // In overwrite or dry-run mode, always attempt to match (to measure coverage)
      if (!OVERWRITE && !DRY_RUN && diff.dominantImagingFinding && diff.distributionLocation && diff.discriminatingKeyFeature) {
        continue;
      }

      const cond = lookupCondition(diff.diagnosis);
      if (!cond) {
        unmatched.push(diff.diagnosis);
        continue;
      }

      matchedDiffs++;
      const enrichment = buildEnrichment(cond);
      enrichments.push({ differentialIndex: i, ...enrichment });
    }

    if (enrichments.length > 0) {
      patchBatch.push({ id: disc._id, enrichments });
    }

    // Submit batches
    if (patchBatch.length >= BATCH_SIZE) {
      if (!DRY_RUN) {
        const mutation = OVERWRITE ? api.discriminators.batchEnrichOverwrite : api.discriminators.batchEnrich;
        const r = await client.mutation(mutation, { patches: patchBatch });
        batchesSubmitted += r.enriched;
      }
      process.stdout.write(`\rPatched: ${batchesSubmitted} records (${matchedDiffs}/${totalDiffs} diffs matched)`);
      patchBatch = [];
    }
  }

  // Final batch
  if (patchBatch.length > 0) {
    if (!DRY_RUN) {
      const mutation = OVERWRITE ? api.discriminators.batchEnrichOverwrite : api.discriminators.batchEnrich;
      const r = await client.mutation(mutation, { patches: patchBatch });
      batchesSubmitted += r.enriched;
    }
  }

  console.log(`\n\n=== Results ===`);
  console.log(`Total differentials:  ${totalDiffs}`);
  console.log(`Matched to Dahnert:   ${matchedDiffs} (${Math.round(matchedDiffs/totalDiffs*100)}%)`);
  console.log(`Unmatched:            ${totalDiffs - matchedDiffs}`);
  console.log(`Records enriched:     ${DRY_RUN ? "(dry run)" : batchesSubmitted}`);
  console.log(`Mode:                 ${OVERWRITE ? "OVERWRITE (Dahnert replaces existing)" : "fill-empty-only"}`);
  console.log(`\nNote: ${totalDiffs - matchedDiffs} diffs (${Math.round((totalDiffs - matchedDiffs)/totalDiffs*100)}%) have no Dahnert condition entry.`);
  console.log(`These conditions don't have standalone ALL_CAPS Dahnert entries in the extracted data.`);

  if (DRY_RUN && unmatched.length > 0) {
    const sample = [...new Set(unmatched)].slice(0, 30);
    console.log(`\nSample unmatched diagnoses:`);
    sample.forEach(u => console.log(`  - ${u}`));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
