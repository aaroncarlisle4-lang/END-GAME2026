#!/usr/bin/env npx tsx
/**
 * Apply dahnert_patches.json to discriminators in Convex.
 *
 * Reads the patch file produced by extract_dahnert_for_placeholders.py,
 * finds discriminator differentials with placeholder text, and fills in
 * the fields from the extracted Dahnert content.
 *
 * Only fills fields that are currently placeholder ("See Dahnert reference.")
 * or empty. Does NOT overwrite real content.
 *
 * Usage:
 *   npx tsx scripts/apply_dahnert_patches.ts [--dry-run]
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

// ── Load .env ────────────────────────────────────────────────────────────────
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

// ── Load patches ──────────────────────────────────────────────────────────────
const patchesPath = path.join(__dirname, "dahnert_patches.json");
const patches: Record<string, { matchedHeading: string; startLine: number; fields: Record<string, string | null> }> =
  JSON.parse(fs.readFileSync(patchesPath, "utf-8"));
console.log(`Loaded ${Object.keys(patches).length} patch entries`);

const PLACEHOLDERS = new Set([
  "see dahnert reference.", "see dahnert reference", "n/a", "not available", "",
]);

function isPlaceholder(val: string | undefined | null): boolean {
  if (val === undefined || val === null) return true;
  return PLACEHOLDERS.has(val.toLowerCase().trim());
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Fetching discriminators...");
  const discs: any[] = await client.query(api.discriminators.list, {});
  console.log(`Found ${discs.length} discriminators`);

  let totalPatched = 0;
  let totalFields = 0;
  const patchBatch: any[] = [];
  const BATCH_SIZE = 50;
  let submitted = 0;

  const flush = async () => {
    if (patchBatch.length === 0) return;
    if (!DRY_RUN) {
      await client.mutation(api.discriminators.batchEnrichOverwrite, { patches: patchBatch });
      submitted += patchBatch.length;
    }
    patchBatch.length = 0;
  };

  for (const disc of discs) {
    const enrichments: any[] = [];

    for (let i = 0; i < disc.differentials.length; i++) {
      const diff = disc.differentials[i];

      // Check if this differential has placeholder content
      const hasPlaceholder =
        isPlaceholder(diff.dominantImagingFinding) ||
        isPlaceholder(diff.associatedFindings) ||
        isPlaceholder(diff.discriminatingKeyFeature);

      if (!hasPlaceholder) continue;

      const diagName = diff.diagnosis;
      const patch = patches[diagName];
      if (!patch) continue;

      const fields = patch.fields;
      const update: any = { differentialIndex: i };
      let changed = false;

      const fieldMap: Array<[string, string]> = [
        ["dominantImagingFinding", "dominantImagingFinding"],
        ["distributionLocation", "distributionLocation"],
        ["demographicsClinicalContext", "demographicsClinicalContext"],
        ["discriminatingKeyFeature", "discriminatingKeyFeature"],
        ["associatedFindings", "associatedFindings"],
        ["complicationsSeriousAlternatives", "complicationsSeriousAlternatives"],
      ];

      for (const [convexField, patchField] of fieldMap) {
        if (isPlaceholder(diff[convexField]) && fields[patchField]) {
          update[convexField] = fields[patchField];
          changed = true;
          totalFields++;
        }
      }

      if (changed) {
        enrichments.push(update);
        totalPatched++;
      }
    }

    if (enrichments.length > 0) {
      patchBatch.push({ id: disc._id, enrichments });
    }

    if (patchBatch.length >= BATCH_SIZE) {
      await flush();
      process.stdout.write(`\rSubmitted: ${submitted} discs | Fields patched: ${totalPatched}`);
    }
  }

  await flush();

  console.log(`\n\n=== Done ===`);
  console.log(`Discriminators patched: ${patchBatch.length + submitted}`);
  console.log(`Total field values set: ${totalFields}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
}

main().catch(e => { console.error(e); process.exit(1); });
