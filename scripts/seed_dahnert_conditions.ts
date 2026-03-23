#!/usr/bin/env npx tsx
/**
 * Seed dahnertConditions table from Bob's UK MLA structured data.
 * Source: "Bob's UK MLA/structured/all_conditions.json" (1,296 entries)
 *
 * Usage:
 *   npx tsx scripts/seed_dahnert_conditions.ts
 *   npx tsx scripts/seed_dahnert_conditions.ts --clear   # wipe and re-seed
 *   npx tsx scripts/seed_dahnert_conditions.ts --dry-run
 *   npx tsx scripts/seed_dahnert_conditions.ts --link    # link to discriminators after seeding
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load .env ──────────────────────────────────────────────────────────────
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

const CONVEX_URL =
  process.env.CONVEX_URL ||
  process.env.VITE_CONVEX_URL ||
  "https://reminiscent-seal-853.convex.cloud";

const BATCH_SIZE = 80;
const DRY_RUN = process.argv.includes("--dry-run");
const CLEAR = process.argv.includes("--clear");
const LINK = process.argv.includes("--link");

// ── Modality key normalisation ──────────────────────────────────────────────
// Maps Dahnert source keys → schema keys
const MODALITY_MAP: Record<string, string> = {
  general: "general",
  MR: "mri",
  CT: "ct",
  US: "us",
  ANGIO: "angio",
  NUC: "nuc",
  CXR: "cxr",
  CECT: "cect",
  PET: "pet",
  HRCT: "hrct",
  NECT: "nect",
  XRAY: "xray",
  RADIOGRAPHY: "xray",
  // Anatomical subkeys — fold into general (they're site-specific sub-lists)
  Chest: "general",
  Spine: "general",
  Lung: "general",
  Pelvis: "general",
  Extremities: "general",
  Skull: "general",
  CNS: "general",
  "GI tract": "general",
  "Axial skeleton": "general",
  Liver: "general",
  Bone: "general",
  Kidney: "general",
  Spleen: "general",
  Hand: "general",
  Knee: "general",
  "Long bones": "general",
  Ribs: "general",
};

type ModalityFindings = {
  general?: string[];
  xray?: string[];
  cxr?: string[];
  ct?: string[];
  cect?: string[];
  nect?: string[];
  hrct?: string[];
  mri?: string[];
  us?: string[];
  angio?: string[];
  nuc?: string[];
  pet?: string[];
};

// ── Transform source entry → Convex record ────────────────────────────────
function transform(raw: Record<string, unknown>) {
  // Demographics: dict → ["Key: value"] array
  const demographics: string[] = [];
  const rawDemo = (raw.demographics as Record<string, string>) || {};
  for (const [k, v] of Object.entries(rawDemo)) {
    if (v && String(v).trim()) {
      demographics.push(`${k}: ${String(v).trim()}`);
    }
  }

  // Clinical: dict → ["Key: value"] array
  const clinical: string[] = [];
  const rawClinical = (raw.clinical as Record<string, string>) || {};
  for (const [k, v] of Object.entries(rawClinical)) {
    if (v && String(v).trim()) {
      clinical.push(`${k}: ${String(v).trim()}`);
    }
  }

  // Modality findings: merge source keys into schema keys
  const modalityFindings: ModalityFindings = {};
  const rawFeatures = (raw.other_features as Record<string, string[]>) || {};
  for (const [srcKey, items] of Object.entries(rawFeatures)) {
    if (!items || items.length === 0) continue;
    const schemaKey = MODALITY_MAP[srcKey] || "general";
    const existing = modalityFindings[schemaKey as keyof ModalityFindings] || [];
    modalityFindings[schemaKey as keyof ModalityFindings] = [
      ...existing,
      ...items.map(String),
    ];
  }

  return {
    name: String(raw.name || "").trim(),
    slug: String(raw.slug || "").trim(),
    chapter: String(raw.chapter || "").trim(),
    definition: raw.definition ? String(raw.definition).trim() : undefined,
    demographics: demographics.length > 0 ? demographics : undefined,
    dominantFinding: raw.dominant_finding
      ? String(raw.dominant_finding).trim()
      : undefined,
    distribution: raw.distribution
      ? String(raw.distribution).trim()
      : undefined,
    discriminatingFeatures: Array.isArray(raw.discriminating_features)
      ? (raw.discriminating_features as string[]).map(String)
      : [],
    modalityFindings,
    clinical: clinical.length > 0 ? clinical : undefined,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const sourcePath = path.join(
    __dirname,
    "..",
    "Bob's UK MLA",
    "structured",
    "all_conditions.json"
  );
  const suppPath = path.join(
    __dirname,
    "..",
    "Bob's UK MLA",
    "structured",
    "supplementary_conditions.json"
  );

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const raw: unknown[] = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));
  const supp: unknown[] = fs.existsSync(suppPath)
    ? JSON.parse(fs.readFileSync(suppPath, "utf-8"))
    : [];
  const combined = [...raw, ...supp];
  console.log(`Loaded ${raw.length} primary + ${supp.length} supplementary = ${combined.length} total conditions`);
  const rawForTransform = combined;

  // Filter out entries with no useful data
  const transformed = rawForTransform
    .map((r) => transform(r as Record<string, unknown>))
    .filter(
      (c) =>
        c.name &&
        c.slug &&
        (c.discriminatingFeatures.length > 0 ||
          c.dominantFinding ||
          Object.values(c.modalityFindings).some((v) => v && v.length > 0))
    );

  console.log(
    `After filtering empty entries: ${transformed.length} conditions to seed`
  );

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Sample of first 3 transformed entries:");
    console.log(JSON.stringify(transformed.slice(0, 3), null, 2));
    return;
  }

  const client = new ConvexHttpClient(CONVEX_URL);

  if (CLEAR) {
    console.log("Clearing existing dahnertConditions...");
    const result = await client.mutation(api.dahnertConditions.clear, {});
    console.log(`Deleted ${result.deleted} existing records`);
  }

  // Batch seed
  let totalInserted = 0;
  const batches = Math.ceil(transformed.length / BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const batch = transformed.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    process.stdout.write(
      `Seeding batch ${i + 1}/${batches} (${batch.length} items)... `
    );
    const result = await client.mutation(api.dahnertConditions.batchSeed, {
      conditions: batch,
    });
    totalInserted += result.inserted;
    console.log(`inserted: ${result.inserted}`);
  }

  console.log(`\nTotal inserted: ${totalInserted}/${transformed.length}`);

  if (LINK) {
    console.log("\nLinking to discriminators...");
    const linkResult = await client.mutation(
      api.dahnertConditions.linkToDiscriminators,
      {}
    );
    console.log(
      `Linked: ${linkResult.linked} | Already linked: ${linkResult.skipped} | Discriminators: ${linkResult.total}`
    );
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
