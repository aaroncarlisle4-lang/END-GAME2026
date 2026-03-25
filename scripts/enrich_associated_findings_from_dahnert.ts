#!/usr/bin/env npx tsx
/**
 * Enrich discriminator differentials with Dahnert other_features → associatedFindings.
 *
 * For each differential that already has a dahnertConditionSlug, look up the
 * condition in all_conditions.json and format other_features (general + modality-
 * specific sections) into associatedFindings.
 *
 * Modality sections extracted (in priority order):
 *   general, RADIOGRAPH/XRAY/CXR, CT/NECT/CECT/HRCT, US, MR, NUC/SCINTIGRAPHY/PET, ANGIO/ANGIOGRAPHY, FLUOROSCOPY
 *
 * Default mode: overwrite (Dahnert > LLM-generated content).
 * Use --fill-empty to skip diffs that already have associatedFindings.
 *
 * Usage:
 *   npx tsx scripts/enrich_associated_findings_from_dahnert.ts
 *   npx tsx scripts/enrich_associated_findings_from_dahnert.ts --dry-run
 *   npx tsx scripts/enrich_associated_findings_from_dahnert.ts --fill-empty
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");
const FILL_EMPTY = process.argv.includes("--fill-empty"); // skip if already has associatedFindings

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

// ─── load conditions by slug ──────────────────────────────────────────────────
const conditionsPath = path.join(__dirname, "..", "Bob's UK MLA", "structured", "all_conditions.json");
const suppPath = path.join(__dirname, "..", "Bob's UK MLA", "structured", "supplementary_conditions.json");
const allConditions: any[] = [
  ...JSON.parse(fs.readFileSync(conditionsPath, "utf-8")),
  ...(fs.existsSync(suppPath) ? JSON.parse(fs.readFileSync(suppPath, "utf-8")) : []),
];

const bySlug = new Map<string, any>();
for (const c of allConditions) {
  if (c.slug) bySlug.set(c.slug, c);
}
console.log(`Loaded ${bySlug.size} conditions by slug`);

// ─── modality key normalisation ───────────────────────────────────────────────
// Map raw other_features keys → display labels (in output order)
const MODALITY_MAP: [string[], string][] = [
  [["general"], "General"],
  [["RADIOGRAPH", "RADIOGRAPHY", "XRAY", "X-RAY", "CXR"], "Radiograph"],
  [["CT", "NECT", "CECT", "HRCT"], "CT"],
  [["US", "ULTRASOUND"], "US"],
  [["MR", "MRI"], "MRI"],
  [["NUC", "SCINTIGRAPHY", "PET"], "Nuc"],
  [["ANGIO", "ANGIOGRAPHY"], "Angio"],
  [["FLUOROSCOPY"], "Fluoro"],
];

function formatOtherFeatures(otherFeatures: Record<string, any>): string {
  if (!otherFeatures || typeof otherFeatures !== "object") return "";

  const sections: string[] = [];

  for (const [keys, label] of MODALITY_MAP) {
    // Find the first matching key in other_features (case-sensitive as stored)
    let items: string[] | null = null;
    for (const k of keys) {
      if (otherFeatures[k]) {
        const val = otherFeatures[k];
        items = Array.isArray(val) ? val : [String(val)];
        break;
      }
    }
    if (!items || items.length === 0) continue;

    // Dedupe and clean
    const seen = new Set<string>();
    const cleaned = items
      .map((s: string) => String(s).trim())
      .filter((s: string) => {
        if (!s || s.length < 5) return false;
        const norm = s.toLowerCase().replace(/\s+/g, " ");
        if (seen.has(norm)) return false;
        seen.add(norm);
        return true;
      });

    if (cleaned.length === 0) continue;

    // Format as labelled section with bullet points
    const bullets = cleaned.map(s => `• ${s}`).join("\n");
    sections.push(`${label.toUpperCase()}:\n${bullets}`);
  }

  return sections.join("\n\n").slice(0, 1200);
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Fetching all discriminator records...");
  const allDiscriminators: any[] = await client.query(api.discriminators.list, {});
  console.log(`Found ${allDiscriminators.length} discriminator records`);

  let totalDiffs = 0;
  let hasSlug = 0;
  let skippedAlreadyHas = 0;
  let noOtherFeatures = 0;
  let enriched = 0;

  const BATCH_SIZE = 50;
  let patchBatch: any[] = [];
  let batchesSubmitted = 0;

  for (const disc of allDiscriminators) {
    const enrichments: any[] = [];

    for (let i = 0; i < disc.differentials.length; i++) {
      const diff = disc.differentials[i];
      totalDiffs++;

      if (!diff.dahnertConditionSlug) continue;
      hasSlug++;

      if (FILL_EMPTY && diff.associatedFindings) {
        skippedAlreadyHas++;
        continue;
      }

      const cond = bySlug.get(diff.dahnertConditionSlug);
      if (!cond) continue;

      const formatted = formatOtherFeatures(cond.other_features ?? {});
      if (!formatted) {
        noOtherFeatures++;
        continue;
      }

      enrichments.push({ differentialIndex: i, associatedFindings: formatted });
      enriched++;
    }

    if (enrichments.length > 0) {
      patchBatch.push({ id: disc._id, enrichments });
    }

    if (patchBatch.length >= BATCH_SIZE) {
      if (!DRY_RUN) {
        await client.mutation(api.discriminators.batchEnrichOverwrite, { patches: patchBatch });
        batchesSubmitted += patchBatch.length;
      }
      process.stdout.write(`\rQueued: ${enriched} diffs | Submitted: ${batchesSubmitted} records`);
      patchBatch = [];
    }
  }

  // Final batch
  if (patchBatch.length > 0 && !DRY_RUN) {
    await client.mutation(api.discriminators.batchEnrichOverwrite, { patches: patchBatch });
    batchesSubmitted += patchBatch.length;
  }

  console.log(`\n\n=== Results ===`);
  console.log(`Total differentials:      ${totalDiffs}`);
  console.log(`Has dahnertConditionSlug: ${hasSlug}`);
  console.log(`Skipped (already filled): ${skippedAlreadyHas}`);
  console.log(`No other_features:        ${noOtherFeatures}`);
  console.log(`Enriched with findings:   ${enriched}`);
  console.log(`Records patched:          ${DRY_RUN ? "(dry run)" : batchesSubmitted}`);
  console.log(`Mode:                     ${DRY_RUN ? "DRY RUN" : FILL_EMPTY ? "fill-empty" : "OVERWRITE"}`);

  if (DRY_RUN) {
    // Show a sample of what would be written
    let shown = 0;
    outer: for (const disc of allDiscriminators) {
      for (const diff of disc.differentials) {
        if (!diff.dahnertConditionSlug) continue;
        const cond = bySlug.get(diff.dahnertConditionSlug);
        if (!cond) continue;
        const formatted = formatOtherFeatures(cond.other_features ?? {});
        if (!formatted) continue;
        console.log(`\n--- ${disc.pattern} / ${diff.diagnosis} ---`);
        console.log(formatted.slice(0, 400));
        shown++;
        if (shown >= 3) break outer;
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
