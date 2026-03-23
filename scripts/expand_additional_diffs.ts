#!/usr/bin/env npx tsx
/**
 * Expand discriminator tables using Dahnert JSON data (no AI API).
 *
 * For each discriminator with an obrienRef, finds missing additional[]
 * differentials, looks them up in all_conditions.json + supplementary_conditions.json,
 * maps the Dahnert fields to discriminator fields, then appends them.
 *
 * Usage:
 *   npx tsx scripts/expand_additional_diffs.ts           # run
 *   npx tsx scripts/expand_additional_diffs.ts --dry-run # preview only
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://reminiscent-seal-853.convex.cloud";
const DRY_RUN = process.argv.includes("--dry-run");
const client = new ConvexHttpClient(CONVEX_URL);

// ── Load Dahnert conditions ─────────────────────────────────────────────────

function loadDahnertConditions() {
  const paths = [
    path.join(__dirname, "..", "Bob's UK MLA", "structured", "all_conditions.json"),
    path.join(__dirname, "..", "Bob's UK MLA", "structured", "supplementary_conditions.json"),
  ];
  const all: any[] = [];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      const items = JSON.parse(fs.readFileSync(p, "utf-8"));
      all.push(...items);
    }
  }
  return all;
}

// Normalise a name for fuzzy matching
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")          // remove parentheticals
    .replace(/[^a-z0-9 ]/g, " ")      // strip punctuation
    .replace(/\b(disease|syndrome|disorder|type|the|of|with|and|or)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Build lookup: normalised name → condition record
function buildLookup(conditions: any[]): Map<string, any> {
  const map = new Map<string, any>();
  for (const c of conditions) {
    if (c.name) map.set(norm(c.name), c);
    if (c.slug) map.set(c.slug.replace(/_/g, " "), c);
  }
  return map;
}

// Find best matching condition for a diagnosis name
function findCondition(diagnosis: string, lookup: Map<string, any>): any | null {
  const key = norm(diagnosis);
  if (lookup.has(key)) return lookup.get(key);

  // Partial match — check if any lookup key contains the query key or vice versa
  const words = key.split(" ").filter(w => w.length > 3);
  if (words.length === 0) return null;

  let bestMatch: any = null;
  let bestScore = 0;

  for (const [mapKey, cond] of lookup.entries()) {
    const matchingWords = words.filter(w => mapKey.includes(w));
    const score = matchingWords.length / Math.max(words.length, mapKey.split(" ").length);
    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = cond;
    }
  }
  return bestMatch;
}

// Map Dahnert condition → discriminator differential fields
function mapToDiscriminator(condition: any, diagnosis: string): Record<string, string | undefined> {
  // dominantImagingFinding: dominant_finding + first general/xray finding
  const generalFindings: string[] = condition.other_features?.general || condition.other_features?.xray || [];
  const dominant = [
    condition.dominant_finding,
    ...generalFindings.slice(0, 2),
  ].filter(Boolean).join(". ").trim();

  // distributionLocation: distribution field
  const distribution = [
    condition.distribution,
  ].filter(Boolean).join(". ").trim();

  // demographicsClinicalContext: demographics dict + clinical dict
  const demoLines: string[] = [];
  const rawDemo = condition.demographics || {};
  for (const [k, v] of Object.entries(rawDemo)) {
    if (v && String(v).trim()) demoLines.push(`${k}: ${String(v).trim()}`);
  }
  const clinicalLines: string[] = [];
  const rawClinical = condition.clinical || {};
  for (const [k, v] of Object.entries(rawClinical)) {
    if (v && String(v).trim()) clinicalLines.push(`${k}: ${String(v).trim()}`);
  }
  const demographics = [...demoLines, ...clinicalLines].slice(0, 4).join(". ").trim();

  // discriminatingKeyFeature: first 2 discriminating_features
  const discFeatures: string[] = condition.discriminating_features || [];
  const discriminating = discFeatures.slice(0, 2).join(". ").trim();

  // associatedFindings: CT or MRI findings
  const ctFindings: string[] = condition.other_features?.ct || condition.other_features?.cect || [];
  const mriFindings: string[] = condition.other_features?.mri || [];
  const modality = [...ctFindings.slice(0, 2), ...mriFindings.slice(0, 1)].join(". ").trim();

  return {
    dominantImagingFinding: dominant || undefined,
    distributionLocation: distribution || undefined,
    demographicsClinicalContext: demographics || undefined,
    discriminatingKeyFeature: discriminating || undefined,
    associatedFindings: modality || undefined,
    complicationsSeriousAlternatives: undefined, // not reliably in Dahnert format
  };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔍 Loading Dahnert conditions...`);
  const conditions = loadDahnertConditions();
  const lookup = buildLookup(conditions);
  console.log(`  → ${conditions.length} conditions loaded, ${lookup.size} lookup entries`);

  console.log(`🔍 Fetching discriminators and patterns from Convex...`);
  const [patterns, discs] = await Promise.all([
    client.query(api.differentialPatterns.list, { categoryAbbreviation: undefined }),
    client.query(api.discriminators.list, {}),
  ]);

  const discMap = new Map<number, any>();
  for (const d of discs) {
    if (d.obrienRef?.obrienCaseNumber) discMap.set(d.obrienRef.obrienCaseNumber, d);
  }

  // Build work list
  const workItems: Array<{
    disc: any;
    pattern: any;
    missing: string[];
  }> = [];

  for (const p of patterns) {
    if (!p.additional?.length) continue;
    const disc = discMap.get(p.obrienCaseNumber);
    if (!disc) continue;
    const existing = new Set(disc.differentials.map((d: any) => d.diagnosis.toLowerCase()));
    const missing = (p.additional as string[]).filter(a => !existing.has(a.toLowerCase()));
    if (missing.length > 0) workItems.push({ disc, pattern: p, missing });
  }

  console.log(`📋 ${workItems.length} discriminators with gaps, ${workItems.reduce((s, w) => s + w.missing.length, 0)} diffs to process\n`);

  let totalAppended = 0;
  let totalSkipped = 0;
  let noDataCount = 0;

  for (const { disc, pattern, missing } of workItems) {
    const newDiffs: any[] = [];

    for (const diagnosisName of missing) {
      const condition = findCondition(diagnosisName, lookup);

      if (!condition) {
        // Add a stub with diagnosis name only so the column appears in the table
        newDiffs.push({
          diagnosis: diagnosisName,
          dominantImagingFinding: "See Dahnert reference.",
          isCorrectDiagnosis: false,
        });
        noDataCount++;
        continue;
      }

      const fields = mapToDiscriminator(condition, diagnosisName);
      newDiffs.push({
        diagnosis: diagnosisName,
        ...fields,
        isCorrectDiagnosis: false,
      });
    }

    if (newDiffs.length === 0) continue;

    if (DRY_RUN) {
      console.log(`[DRY RUN] ${disc.pattern} → +${newDiffs.length} diffs`);
      for (const d of newDiffs) {
        const hasData = d.dominantImagingFinding && d.dominantImagingFinding !== "See Dahnert reference.";
        console.log(`  ${hasData ? "✓" : "○"} ${d.diagnosis}`);
        if (hasData) console.log(`    dominant: ${d.dominantImagingFinding?.slice(0, 80)}`);
      }
      continue;
    }

    try {
      const result = await client.mutation(api.discriminators.appendDifferentials, {
        id: disc._id,
        newDifferentials: newDiffs,
      });
      totalAppended += result.appended;
      totalSkipped += result.skipped;
      console.log(`✓ ${disc.pattern} → +${result.appended} appended, ${result.skipped} skipped`);
    } catch (err: any) {
      console.error(`✗ ${disc.pattern}: ${err.message}`);
    }
  }

  if (!DRY_RUN) {
    console.log(`\n✅ Done | Appended: ${totalAppended} | Skipped (already exist): ${totalSkipped} | Stubs (no Dahnert data): ${noDataCount}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
