#!/usr/bin/env npx tsx
/**
 * Full Dahnert revamp — comprehensive enrichment of all discriminator differentials.
 *
 * For every differential (not just slug-matched ones), this script:
 *   1. Tries to find a Dahnert condition match using progressive fallbacks:
 *      exact → abbreviation expansion → prefix stripping → plural→singular
 *      → parenthetical variants → organ-qualifier stripping → word-set
 *   2. Overwrites ALL fields from matched Dahnert condition, including
 *      "See Dahnert reference." placeholders
 *   3. Populates all six fields:
 *      - dominantImagingFinding     ← dominant_finding
 *      - distributionLocation       ← distribution
 *      - demographicsClinicalContext← demographics
 *      - discriminatingKeyFeature   ← discriminating_features (bullet list)
 *      - associatedFindings         ← other_features (modality sections + bullets)
 *      - complicationsSeriousAlts   ← clinical (Cx + Prognosis)
 *
 * Modes:
 *   default    — overwrites "See Dahnert reference." + null fields; preserves real content
 *   --overwrite — replaces all fields for every matched diff (full revamp)
 *   --dry-run  — show stats + samples without writing
 *
 * Usage:
 *   npx tsx scripts/full_dahnert_revamp.ts --dry-run
 *   npx tsx scripts/full_dahnert_revamp.ts
 *   npx tsx scripts/full_dahnert_revamp.ts --overwrite
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");
const OVERWRITE = process.argv.includes("--overwrite"); // replace even existing real content

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

// ─── Load conditions ──────────────────────────────────────────────────────────
const conditionsPath = path.join(__dirname, "..", "Bob's UK MLA", "structured", "all_conditions.json");
const suppPath = path.join(__dirname, "..", "Bob's UK MLA", "structured", "supplementary_conditions.json");
const allConditions: any[] = [
  ...JSON.parse(fs.readFileSync(conditionsPath, "utf-8")),
  ...(fs.existsSync(suppPath) ? JSON.parse(fs.readFileSync(suppPath, "utf-8")) : []),
];
console.log(`Loaded ${allConditions.length} Dahnert conditions`);

// ─── Abbreviation expansion map ───────────────────────────────────────────────
const ABBREV: Record<string, string> = {
  "hcc": "hepatocellular carcinoma",
  "rcc": "renal cell carcinoma",
  "gpa": "wegener granulomatosis",
  "wegener": "wegener granulomatosis",
  "wegeners": "wegener granulomatosis",
  "mpa": "microscopic polyangiitis",
  "egpa": "eosinophilic granulomatosis with polyangiitis",
  "tb": "tuberculosis",
  "avm": "arteriovenous malformation",
  "avf": "arteriovenous fistula",
  "avn": "avascular necrosis",
  "gist": "gastrointestinal stromal tumor",
  "nsclc": "non small cell lung carcinoma",
  "sclc": "small cell lung carcinoma",
  "dcis": "ductal carcinoma in situ",
  "lcis": "lobular carcinoma in situ",
  "nf1": "neurofibromatosis type 1",
  "nf2": "neurofibromatosis type 2",
  "adpkd": "autosomal dominant polycystic kidney disease",
  "arpkd": "autosomal recessive polycystic kidney disease",
  "psc": "primary sclerosing cholangitis",
  "pbc": "primary biliary cirrhosis",
  "ibd": "inflammatory bowel disease",
  "dvt": "deep vein thrombosis",
  "pe": "pulmonary embolism",
  "pte": "pulmonary thromboembolism",
  "ms": "multiple sclerosis",
  "als": "amyotrophic lateral sclerosis",
  "sle": "systemic lupus erythematosus",
  "anca": "antineutrophil cytoplasmic antibody",
  "dish": "diffuse idiopathic skeletal hyperostosis",
  "cppd": "calcium pyrophosphate deposition",
  "pvns": "pigmented villonodular synovitis",
  "crohn": "crohn disease",
  "crohns": "crohn disease",
  "hodgkin": "hodgkin disease",
};

// Common adjective prefixes to strip (try without these when exact match fails)
const STRIP_PREFIXES = [
  "multifocal", "multiple", "bilateral", "diffuse", "focal",
  "solitary", "primary", "secondary", "acute", "chronic",
  "congenital", "giant", "ruptured", "infected", "complicated",
  "uncomplicated", "recurrent", "metastatic",
];

// Organ adjectives — try stripping first word if it's one of these
const ORGAN_ADJECTIVES = [
  "hepatic", "hepatocellular", "pulmonary", "renal", "splenic",
  "pancreatic", "thyroid", "adrenal", "ovarian", "uterine",
  "cervical", "gastric", "colonic", "duodenal", "ileal",
  "jejunal", "rectal", "prostatic", "testicular", "vesical",
  "cardiac", "aortic", "mesenteric", "retroperitoneal",
];

// ─── Build lookup maps ────────────────────────────────────────────────────────
function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordKey(s: string): string {
  return normalize(s).split(" ").filter(w => w.length > 2).sort().join("|");
}

// Singular form: strip trailing s/es if result is > 4 chars
function toSingular(s: string): string {
  if (s.endsWith("ses") && s.length > 6) return s.slice(0, -2); // abscesses→abscess
  if (s.endsWith("ies") && s.length > 5) return s.slice(0, -3) + "y"; // hamartomies? unlikely
  if (s.endsWith("mata") && s.length > 6) return s.slice(0, -4) + "ma"; // adenomata→adenoma
  if (s.endsWith("es") && s.length > 5) return s.slice(0, -2);
  if (s.endsWith("s") && s.length > 4) return s.slice(0, -1);
  return s;
}

const byExact = new Map<string, any>();
const byWordKey = new Map<string, any>();
const bySlug = new Map<string, any>();

for (const c of allConditions) {
  const norm = normalize(c.name);
  byExact.set(norm, c);
  if (c.slug) bySlug.set(c.slug, c);
  const wk = wordKey(c.name);
  if (wk && !byWordKey.has(wk)) byWordKey.set(wk, c);
}

function lookupByName(diagnosis: string): any | null {
  const norm = normalize(diagnosis);

  // 1. Exact
  if (byExact.has(norm)) return byExact.get(norm)!;

  // 2. Abbreviation expansion — check whole name, first word, or last word
  const words = norm.split(" ");
  // Whole string is an abbreviation
  if (ABBREV[norm]) {
    const expanded = normalize(ABBREV[norm]);
    if (byExact.has(expanded)) return byExact.get(expanded)!;
    const wkExp = wordKey(ABBREV[norm]);
    if (wkExp && byWordKey.has(wkExp)) return byWordKey.get(wkExp)!;
  }
  // First word is an abbreviation (e.g. "HCC variant" → "hepatocellular carcinoma variant")
  const firstWord = words[0];
  if (ABBREV[firstWord]) {
    const expanded = normalize([ABBREV[firstWord], ...words.slice(1)].join(" "));
    if (byExact.has(expanded)) return byExact.get(expanded)!;
  }
  // Last word is an abbreviation
  const lastWord = words[words.length - 1];
  if (words.length > 1 && ABBREV[lastWord]) {
    const tryExpanded = normalize([...words.slice(0, -1), ABBREV[lastWord]].join(" "));
    if (byExact.has(tryExpanded)) return byExact.get(tryExpanded)!;
  }

  // 3. Strip parenthetical / after slash / after colon / after em-dash
  const stripped = normalize(
    diagnosis.replace(/\s*[\(\[].*/, "").replace(/\s*[—–-]{1,2}.*/, "").replace(/\s*\/.*/, "").replace(/\s*:.*/, "")
  );
  if (stripped && stripped !== norm) {
    const r = lookupByName(stripped); // recurse
    if (r) return r;
  }
  // Also try the parenthetical content alone
  const parenMatch = diagnosis.match(/[\(\[](.*?)[\)\]]/);
  if (parenMatch) {
    const inner = parenMatch[1].trim();
    if (inner.length > 3) {
      const r = lookupByName(inner);
      if (r) return r;
    }
  }

  // 4. Try abbreviation for the whole normalized string
  if (ABBREV[norm]) {
    const expanded = normalize(ABBREV[norm]);
    if (byExact.has(expanded)) return byExact.get(expanded)!;
    // also try word-key of expanded
    const wkExp = wordKey(ABBREV[norm]);
    if (wkExp && byWordKey.has(wkExp)) return byWordKey.get(wkExp)!;
  }

  // 5. Strip common adjective prefixes, recurse
  for (const prefix of STRIP_PREFIXES) {
    if (norm.startsWith(prefix + " ")) {
      const rest = norm.slice(prefix.length + 1).trim();
      if (rest.length > 3) {
        const r = lookupByName(rest);
        if (r) return r;
      }
    }
  }

  // 6. Singular form
  const singular = toSingular(norm);
  if (singular !== norm) {
    if (byExact.has(singular)) return byExact.get(singular)!;
    // Recurse for further matching
    const r = lookupByName(singular);
    if (r) return r;
  }

  // 7. Strip organ adjective from first word
  if (words.length >= 2 && ORGAN_ADJECTIVES.includes(words[0])) {
    const withoutOrgan = words.slice(1).join(" ");
    if (withoutOrgan.length > 3) {
      const r = lookupByName(withoutOrgan);
      if (r) return r;
    }
  }

  // 8. Word-key match (sorted significant words)
  const wk = wordKey(diagnosis);
  if (wk && byWordKey.has(wk)) return byWordKey.get(wk)!;

  // 9. Partial: all significant condition name words appear in diagnosis
  for (const [key, cond] of byExact) {
    const condWords = key.split(" ").filter((w: string) => w.length > 4);
    if (condWords.length >= 2 && condWords.every((w: string) => norm.includes(w))) {
      return cond;
    }
  }

  return null;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
const MODALITY_MAP: [string[], string][] = [
  [["general"], "GENERAL"],
  [["RADIOGRAPH", "RADIOGRAPHY", "XRAY", "X-RAY", "CXR"], "RADIOGRAPH"],
  [["CT", "NECT", "CECT", "HRCT"], "CT"],
  [["US", "ULTRASOUND"], "US"],
  [["MR", "MRI"], "MRI"],
  [["NUC", "SCINTIGRAPHY", "PET"], "NUC MED"],
  [["ANGIO", "ANGIOGRAPHY"], "ANGIO"],
  [["FLUOROSCOPY"], "FLUORO"],
];

function formatBullets(items: string[], maxItems = 99): string {
  const seen = new Set<string>();
  return items
    .map((s: string) => String(s).trim())
    .filter((s: string) => {
      if (!s || s.length < 4) return false;
      const norm = s.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    })
    .slice(0, maxItems)
    .map(s => `• ${s}`)
    .join("\n");
}

function formatOtherFeatures(otherFeatures: Record<string, any>): string {
  if (!otherFeatures || typeof otherFeatures !== "object") return "";
  const sections: string[] = [];
  for (const [keys, label] of MODALITY_MAP) {
    let items: string[] | null = null;
    for (const k of keys) {
      if (otherFeatures[k]) {
        const val = otherFeatures[k];
        items = Array.isArray(val) ? val : [String(val)];
        break;
      }
    }
    if (!items || items.length === 0) continue;
    const bullets = formatBullets(items);
    if (bullets) sections.push(`${label}:\n${bullets}`);
  }
  return sections.join("\n\n").slice(0, 1200);
}

function formatDemographics(demographics: any): string {
  if (!demographics) return "";
  let parts: string[] = [];
  if (typeof demographics === "object" && !Array.isArray(demographics)) {
    parts = Object.entries(demographics)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`);
  } else if (Array.isArray(demographics)) {
    parts = demographics.map(String);
  }
  return parts.join("\n").slice(0, 600);
}

function formatClinical(clinical: any): string {
  if (!clinical || typeof clinical !== "object") return "";
  const parts: string[] = [];
  // Try various key casings for Cx, Prognosis, Rx
  const cx = clinical["Cx"] || clinical["cx"] || clinical["CX"] || clinical["Complications"];
  const prog = clinical["Prognosis"] || clinical["prognosis"] || clinical["PROGNOSIS"];
  const rx = clinical["Rx"] || clinical["rx"] || clinical["Treatment"];
  if (cx) parts.push(`Complications: ${cx}`);
  if (prog) parts.push(`Prognosis: ${prog}`);
  if (rx) parts.push(`Treatment: ${rx}`);
  return parts.join("\n").slice(0, 600);
}

function buildAllFields(cond: any): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {
    dahnertConditionSlug: cond.slug,
  };

  if (cond.dominant_finding) {
    result.dominantImagingFinding = String(cond.dominant_finding).trim().slice(0, 400);
  }
  if (cond.distribution) {
    result.distributionLocation = String(cond.distribution).trim().slice(0, 400);
  }

  const demo = formatDemographics(cond.demographics);
  if (demo) result.demographicsClinicalContext = demo;

  if (cond.discriminating_features?.length) {
    const bullets = formatBullets(cond.discriminating_features);
    if (bullets) result.discriminatingKeyFeature = bullets.slice(0, 600);
  }

  const assoc = formatOtherFeatures(cond.other_features ?? {});
  if (assoc) result.associatedFindings = assoc;

  const clinical = formatClinical(cond.clinical);
  if (clinical) result.complicationsSeriousAlternatives = clinical;

  return result;
}

// ─── Is a field a placeholder or genuinely empty? ────────────────────────────
const PLACEHOLDERS = new Set([
  "see dahnert reference.",
  "see dahnert reference",
  "n/a",
  "not available",
  "no data",
  "no data provided",
  "",
]);

function isPlaceholder(val: string | undefined): boolean {
  if (val === undefined || val === null) return true;
  return PLACEHOLDERS.has(val.toLowerCase().trim());
}

function needsEnrichment(diff: any): boolean {
  return (
    !diff.dahnertConditionSlug ||
    isPlaceholder(diff.dominantImagingFinding) ||
    isPlaceholder(diff.discriminatingKeyFeature) ||
    isPlaceholder(diff.associatedFindings)
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("Fetching all discriminator records...");
  const allDiscs: any[] = await client.query(api.discriminators.list, {});
  console.log(`Found ${allDiscs.length} discriminator records`);

  let totalDiffs = 0;
  let needEnrich = 0;
  let matched = 0;
  let unmatched = 0;
  const unmatchedNames = new Set<string>();

  const BATCH_SIZE = 50;
  let patchBatch: any[] = [];
  let totalSubmitted = 0;

  for (const disc of allDiscs) {
    const enrichments: any[] = [];

    for (let i = 0; i < disc.differentials.length; i++) {
      const diff = disc.differentials[i];
      totalDiffs++;

      // Skip if fully populated and not in overwrite mode
      if (!OVERWRITE && !needsEnrichment(diff)) continue;
      needEnrich++;

      // Try slug lookup first (fastest), then name lookup
      let cond: any = null;
      if (diff.dahnertConditionSlug) {
        cond = bySlug.get(diff.dahnertConditionSlug) ?? null;
      }
      if (!cond) {
        cond = lookupByName(diff.diagnosis);
      }

      if (!cond) {
        unmatchedNames.add(diff.diagnosis);
        unmatched++;
        continue;
      }

      matched++;
      const fields = buildAllFields(cond);

      if (OVERWRITE) {
        // Full overwrite: send all fields
        enrichments.push({ differentialIndex: i, ...fields });
      } else {
        // Smart fill: only send fields that need enrichment
        const patch: any = { differentialIndex: i };
        if (!diff.dahnertConditionSlug && fields.dahnertConditionSlug) {
          patch.dahnertConditionSlug = fields.dahnertConditionSlug;
        }
        const fieldMap: Record<string, string> = {
          dominantImagingFinding: "dominantImagingFinding",
          distributionLocation: "distributionLocation",
          demographicsClinicalContext: "demographicsClinicalContext",
          discriminatingKeyFeature: "discriminatingKeyFeature",
          associatedFindings: "associatedFindings",
          complicationsSeriousAlternatives: "complicationsSeriousAlternatives",
        };
        for (const [convexField, dahnertKey] of Object.entries(fieldMap)) {
          const existing = diff[convexField];
          if (isPlaceholder(existing) && fields[dahnertKey]) {
            patch[convexField] = fields[dahnertKey];
          }
        }
        if (Object.keys(patch).length > 1) enrichments.push(patch);
      }
    }

    if (enrichments.length > 0) {
      patchBatch.push({ id: disc._id, enrichments });
    }

    if (patchBatch.length >= BATCH_SIZE) {
      if (!DRY_RUN) {
        const mutation = OVERWRITE
          ? api.discriminators.batchEnrichOverwrite
          : api.discriminators.batchEnrich;
        await client.mutation(mutation, { patches: patchBatch });
        totalSubmitted += patchBatch.length;
      }
      process.stdout.write(
        `\rMatched: ${matched} | Unmatched: ${unmatched} | Submitted: ${totalSubmitted} records`
      );
      patchBatch = [];
    }
  }

  // Final batch
  if (patchBatch.length > 0 && !DRY_RUN) {
    const mutation = OVERWRITE
      ? api.discriminators.batchEnrichOverwrite
      : api.discriminators.batchEnrich;
    await client.mutation(mutation, { patches: patchBatch });
    totalSubmitted += patchBatch.length;
  }

  const matchPct = Math.round((matched / (matched + unmatched || 1)) * 100);
  console.log(`\n\n=== Results ===`);
  console.log(`Total differentials:    ${totalDiffs}`);
  console.log(`Needed enrichment:      ${needEnrich}`);
  console.log(`Matched to Dahnert:     ${matched} (${matchPct}% of those attempted)`);
  console.log(`Unmatched:              ${unmatched} unique diagnoses: ${unmatchedNames.size}`);
  console.log(`Records patched:        ${DRY_RUN ? "(dry run)" : totalSubmitted}`);
  console.log(`Mode:                   ${DRY_RUN ? "DRY RUN" : OVERWRITE ? "FULL OVERWRITE" : "SMART FILL"}`);

  if (DRY_RUN) {
    console.log(`\nSample unmatched (up to 30):`);
    [...unmatchedNames].slice(0, 30).forEach(n => console.log(`  - ${n}`));

    // Show 2 sample enrichments
    let shown = 0;
    outer: for (const disc of allDiscs) {
      for (let i = 0; i < disc.differentials.length; i++) {
        const diff = disc.differentials[i];
        if (!needsEnrichment(diff)) continue;
        const cond = diff.dahnertConditionSlug
          ? (bySlug.get(diff.dahnertConditionSlug) ?? lookupByName(diff.diagnosis))
          : lookupByName(diff.diagnosis);
        if (!cond) continue;
        const fields = buildAllFields(cond);
        console.log(`\n--- ${disc.pattern} / ${diff.diagnosis} → ${cond.name} ---`);
        if (fields.dominantImagingFinding) console.log("DOMINANT:", fields.dominantImagingFinding.slice(0, 100));
        if (fields.discriminatingKeyFeature) console.log("DISC FEATS:", fields.discriminatingKeyFeature.slice(0, 200));
        if (fields.associatedFindings) console.log("ASSOC:", fields.associatedFindings.slice(0, 300));
        if (fields.complicationsSeriousAlternatives) console.log("CX:", fields.complicationsSeriousAlternatives.slice(0, 150));
        shown++;
        if (shown >= 3) break outer;
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
