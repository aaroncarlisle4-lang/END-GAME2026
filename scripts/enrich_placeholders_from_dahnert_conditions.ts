#!/usr/bin/env npx tsx
/**
 * Enrich the remaining 266 discriminator differentials that still have
 * dominantImagingFinding: "See Dahnert reference." by:
 *
 * Phase 1 — Set dahnertConditionSlug where we have a mapping, and clear the
 *            placeholder so enrichDiscriminatorsFromDahnert can fill the fields.
 * Phase 2 — Call enrichDiscriminatorsFromDahnert({ overwrite: false }) which
 *            pulls all imaging fields from the dahnertConditions table for any
 *            differential that now has a slug set.
 *
 * Usage:
 *   npx tsx scripts/enrich_placeholders_from_dahnert_conditions.ts [--dry-run]
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

// ── Mapping tables ────────────────────────────────────────────────────────────

/**
 * Context-specific mappings: discriminatorId → { differentialIndex → slug }
 * Determined by inspecting the longCase pattern for each placeholder entry.
 */
const CONTEXT_MAP: Record<string, Record<number, string>> = {
  // Hemorrhage
  "j975kzy3ayfne17rh7ay9y7dxn82vndc": { 7: "pulmonary_hemorrhage" },        // ground-glass → chest

  // Metastases (organ-specific, by longCase pattern)
  "j977dh6nb8mfwn7x7ffxjr7zq582tj2r": { 5: "metastasis_to_kidney" },        // bilateral renal lesions
  "j97728fene1m68denbq76649td82v77q":  { 4: "metastasis_to_liver" },         // hypervascular liver mass
  "j97272hfp6c46zwbpc6575q9rx82t9xk": { 5: "metastasis_to_kidney" },        // ureteral filling defects
  "j973bks9xptseq8vn02rknnskh82v704": { 4: "metastasis_to_vertebra" },      // vertebra plana in child
  "j97dt9a1mnytj4pekk998av9vx82vg38": { 6: "metastases_to_bone" },          // expansile rib in child
  "j97f74py7j13e64tsbtqj9r73582vsqz": { 4: "metastasis_to_vertebra" },      // posterior element lytic
  "j9702vxjns7j5g8x7gft041bw982v51p": { 4: "metastasis_to_orbit" },         // enhancing orbital mass
  "j979d5rkyapd6wmf6q1rg1dbqd82vymb": { 4: "metastasis_to_brain" },         // jugular foramen mass
  "j97425wc89bz1n0kh8y1ttdg4d82vm6s": { 4: "metastasis_to_liver",           // liver mass in infant
                                          5: "hepatic_liver_abscess" },       // abscess, liver mass
  "j97ae10asarwwcrmbghmprwexh82tj8k": { 5: "metastases_to_bone" },          // long bone aggressive
  "j97892v3jsptvqjk9j7vnb0mr582vhk2": { 4: "metastasis_to_liver" },         // hyperechoic liver mass
  "j974bytdy4e9hmsrj1gvagry2d82vd1a": { 5: "abscess_of_breast",             // breast lesion in man
                                          6: "metastasis_to_breast" },        // metastases, breast man
  "j979mvd7cwj0821wpdszz3r2q582tkcw": { 6: "metastasis_to_breast" },        // axillary lymphadenopathy
  "j97b0ckbghr27a4nf8k8nfx6gs82t4t4": { 2: "metastasis_to_spinal_cord" },  // drop metastases intradural
  "j97dhd3739dpfmak1859d2zc5h82v78a": { 4: "papilloma_of_breast",            // papilloma, breast context
                                          6: "metastasis_to_breast" },        // well-circumscribed breast

  // Abscess (by location context)
  "j976azwyqw3dz2n20v5y14tyxx82tg3b": { 5: "hepatic_liver_abscess" },       // coarse calcifications
  "j977q5bg1zawxvnz48383ahr7n82t14f": { 5: "abscess_of_breast" },           // cystic breast mass
  "j97bp3qwmy3qv82emxp9csyz4n82vktk": { 5: "abscess_of_breast" },           // large breast mass

  // Infection (by clinical context)
  "j973cyspvbqajhvks550ke363182vg8j": { 3: "musculoskeletal_infection" },   // erosive arthropathy foot
  "j97bz2qesneabcht7mbv3j1g1d82tnmf": { 4: "infection_in_immunocompromised" }, // lytic skull child

  // Metastatic disease (12 entries, context from longCase pattern)
  "j972vd2syvxt8btp0rwa544fjx82thzr": { 4: "metastasis_to_lung" },          // mediastinal/hilar LAD
  "j9721s3axv4tc7v5dbyssbvb2h82vq84": { 3: "metastasis_to_lung" },          // calcified pleural disease
  "j971dmzktvbabytrv8zjr1vs1h82vbq5": { 5: "metastasis_to_gastrointestinal_tract" }, // terminal ileal wall
  "j974yv10jc3hs56exnpf0m269982tyea": { 4: "metastasis_to_gastrointestinal_tract" }, // gastric ulcer
  "j975vw3wty2hnm92pkhr8vqe9s82tn1x": { 4: "metastasis_to_gastrointestinal_tract" }, // gastric fold thickening
  "j9755jy9cctgggg1ff0c70wx9182v31z": { 4: "metastases_to_bone" },          // rugger jersey spine
  "j9708175m5y0qrvpnsaxj7mjs582t86d": { 4: "metastasis_to_spinal_cord" },   // enhancing intramedullary
  "j971ab1vv09eafrm61rv6mya8x82vcwk": { 5: "metastasis_to_kidney" },        // hypoechoic renal mass
  "j97495kjgxrs634ryrefj0bxf982vpvy": { 4: "peritoneal_metastases" },       // multiple splenic foci
  "j97cd2v6ecbnnezsjb2a3ht38n833xn4": { 7: "metastasis_to_lung" },          // apical lung (Pancoast)
  "j971qymq293rafd2t9xb655rmh82td98": { 5: "metastasis_to_pancreas" },      // metastatic disease (Renal → pancreas)
  "j979175bwvvr1nsejnjh65yfq982tgsx": { 4: "metastasis_to_brain" },         // neuro section context
  "j97dqdbthva94j4tzg7m5fz2t182vyv4": { 4: "metastasis_to_vertebra" },      // spine/epidural context
};

/**
 * Generic mappings: diagnosis name (exact) → slug.
 * Applied ONLY when a context-specific mapping doesn't exist for that entry.
 */
const GENERIC_MAP: Record<string, string> = {
  "Fungal infection":                    "aspergillosis",
  "Fungal infection (Aspergilloma)":     "aspergillosis",
  "Invasive aspergillosis":              "aspergillosis",
  "ABPA":                                "aspergillosis",
  "Fungus ball":                         "aspergillosis",
  "Amyloid arthropathy":                 "amyloidosis",
  "Atypical infection (PML)":            "infection_in_immunocompromised",
  "Central nervous system (CNS) infection": "infection_in_immunocompromised",
  "Subarachnoid hemorrhage":             "subarachnoid_hemorrhage",
  "Calfic pericarditis":                 "pericarditis",
  "Calci\uFB01 c pericarditis":          "pericarditis",  // ligature ﬁ variant
  "Morgagni hernia":                     "diaphragmatic_hernia",
  "Hiatal hernia":                       "hernia",
  "Pulmonary contusion":                 "blunt_chest_trauma",
  "Healed varicella":                    "varicella_zoster_pneumonia",
  "Pneumocystis pneumonia":              "pneumocystosis",
  "Pneumocystis (PJP)":                  "pneumocystosis",
  "Drug-induced lung disease":           "drug_induced_pulmonary_damage",
  "Chronic HP (basilar)":               "extrinsic_allergic_alveolitis",
  "Venolymphatic malformation":          "vascular_malformation",
  "Malignant primary cardiac neoplasm":  "cardiac_sarcoma",
  "Drop metastases":                     "metastasis_to_spinal_cord",
  "Hypervascular metastases (Renal, Carcinoid, Thyroid, Melanoma)": "metastasis_to_liver",
  "Metastases from a remote primary cancer": "metastasis_to_breast",
  "Metastasis":                          "metastasis_to_breast",  // breast context from context map
};

const PLACEHOLDER_RE = /^see dahnert reference\.?$/i;

function isPlaceholder(val: string | undefined | null): boolean {
  if (!val) return true;
  return PLACEHOLDER_RE.test(val.trim());
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Fetching all discriminators...");
  const discs: any[] = await client.query(api.discriminators.list, {});
  console.log(`Found ${discs.length} discriminators`);

  let totalPlaceholders = 0;
  let totalMapped = 0;
  const patchBatch: any[] = [];

  for (const disc of discs) {
    const enrichments: any[] = [];

    for (let i = 0; i < disc.differentials.length; i++) {
      const diff = disc.differentials[i];
      if (!isPlaceholder(diff.dominantImagingFinding)) continue;
      totalPlaceholders++;

      // Resolve slug: context-specific takes priority, then generic by diagnosis name
      const contextSlug = CONTEXT_MAP[disc._id]?.[i];
      const genericSlug = diff.diagnosis ? GENERIC_MAP[diff.diagnosis] : undefined;
      const slug = contextSlug ?? genericSlug;

      if (!slug) continue; // no mapping — leave for next pass or accept as-is

      totalMapped++;
      enrichments.push({
        differentialIndex: i,
        dahnertConditionSlug: slug,
        dominantImagingFinding: "",  // clear placeholder so enrichDiscriminatorsFromDahnert fills it
      });
    }

    if (enrichments.length > 0) {
      patchBatch.push({ id: disc._id, enrichments });
    }
  }

  console.log(`\nPlaceholders found: ${totalPlaceholders}`);
  console.log(`Mapped to Dahnert slug: ${totalMapped}`);
  console.log(`Discriminator docs to patch: ${patchBatch.length}`);

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Patches that would be applied:");
    for (const p of patchBatch) {
      for (const e of p.enrichments) {
        const disc = discs.find((d: any) => d._id === p.id);
        const diagName = disc?.differentials[e.differentialIndex]?.diagnosis ?? "?";
        console.log(`  ${p.id}[${e.differentialIndex}] "${diagName}" → ${e.dahnertConditionSlug}`);
      }
    }
    return;
  }

  // Phase 1: Set slugs + clear placeholders in batches of 50
  const BATCH = 50;
  let submitted = 0;
  for (let i = 0; i < patchBatch.length; i += BATCH) {
    const slice = patchBatch.slice(i, i + BATCH);
    await client.mutation(api.discriminators.batchEnrichOverwrite, { patches: slice });
    submitted += slice.length;
    process.stdout.write(`\rPhase 1: ${submitted}/${patchBatch.length} docs patched...`);
  }
  console.log(`\nPhase 1 complete — ${totalMapped} slugs set, placeholders cleared.`);

  // Phase 2: Fill imaging content from dahnertConditions for all newly-slugged diffs
  console.log("Phase 2: Enriching from dahnertConditions...");
  const result = await client.mutation(api.dahnertConditions.enrichDiscriminatorsFromDahnert, {
    overwrite: false,
  });
  console.log(`Phase 2 complete — ${result.enriched} discriminators enriched, ${result.fieldsSet} fields set.`);

  console.log(`\nDone. Remaining placeholders: ${totalPlaceholders - totalMapped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
