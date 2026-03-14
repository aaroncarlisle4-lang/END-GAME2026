/**
 * Generate modelAnswer + vivaModelAnswer for MSK long cases.
 * Purely mechanical synthesis from existing building-block fields.
 * Run with: npx tsx scripts/generateModelAnswers.ts
 */
import { execSync } from "child_process";

console.log("Pulling MSK cases from Convex...");
const casesRaw = execSync(
  `npx convex run longCases:list '{}' 2>/dev/null`,
  { encoding: "utf-8", timeout: 30000 }
);

const allCases = JSON.parse(casesRaw);

// Find MSK category ID
const catsRaw = execSync(
  `npx convex run categories:list '{}' 2>/dev/null`,
  { encoding: "utf-8", timeout: 30000 }
);
const allCats = JSON.parse(catsRaw);
const mskCat = allCats.find((c: any) => c.abbreviation === "MSK");
if (!mskCat) throw new Error("MSK category not found");

const mskCases = allCases
  .filter((c: any) => c.categoryId === mskCat._id)
  .sort((a: any, b: any) => a.caseNumber - b.caseNumber);

console.log(`Found ${mskCases.length} MSK cases`);

interface LongCase {
  caseNumber: number;
  title: string;
  modality: string;
  clinicalHistory: string;
  findings: string;
  interpretation: string;
  diagnosis: string;
  differentials: string[];
  nextSteps: string;
  keyBullets: string[];
  importantNegatives: string[];
  examPearl: string;
  negativesContext?: {
    emergencyExclusions: string[];
    stagingNegatives: string[];
    complicationNegatives: string[];
    incidentalNegatives: string[];
  };
  vivaPresentation?: {
    opening: string;
    anchorStatement: string;
    systemicApproach: string;
    synthesis: string;
    differentialReasoning: string;
    clinicalUrgency: string;
    examinerTip: string;
  };
}

function generateModelAnswer(c: LongCase): string {
  const sections: string[] = [];

  // FINDINGS
  sections.push(`FINDINGS:\n${c.findings}`);

  // INTERPRETATION
  sections.push(`INTERPRETATION:\n${c.interpretation}`);

  // DIAGNOSIS
  sections.push(`DIAGNOSIS:\n${c.diagnosis}.`);

  // DIFFERENTIAL DIAGNOSIS
  if (c.differentials.length > 0) {
    const ddx = c.differentials.map((d, i) => `${i + 1}. ${d}`).join("\n");
    sections.push(`DIFFERENTIAL DIAGNOSIS:\n${ddx}`);
  }

  // IMPORTANT NEGATIVES
  if (c.negativesContext) {
    const negLines: string[] = [];
    const nc = c.negativesContext;
    if (nc.emergencyExclusions.length > 0) {
      negLines.push(...nc.emergencyExclusions.map(n => `- ${n} [emergency exclusion]`));
    }
    if (nc.stagingNegatives.length > 0) {
      negLines.push(...nc.stagingNegatives.map(n => `- ${n} [staging]`));
    }
    if (nc.complicationNegatives.length > 0) {
      negLines.push(...nc.complicationNegatives.map(n => `- ${n} [complication]`));
    }
    if (nc.incidentalNegatives.length > 0) {
      negLines.push(...nc.incidentalNegatives.map(n => `- ${n} [incidental]`));
    }
    if (negLines.length > 0) {
      sections.push(`IMPORTANT NEGATIVES:\n${negLines.join("\n")}`);
    }
  } else if (c.importantNegatives.length > 0) {
    // Fallback to flat list
    const negs = c.importantNegatives.map(n => `- ${n}`).join("\n");
    sections.push(`IMPORTANT NEGATIVES:\n${negs}`);
  }

  // MANAGEMENT
  sections.push(`MANAGEMENT:\n${c.nextSteps}`);

  // EXAM PEARL
  sections.push(`EXAM PEARL:\n${c.examPearl}`);

  return sections.join("\n\n");
}

function generateVivaModelAnswer(c: LongCase): string | undefined {
  const vp = c.vivaPresentation;
  if (!vp) return undefined;

  // Flowing spoken narrative assembled from viva building blocks
  const paragraphs: string[] = [];

  // Opening + anchor
  paragraphs.push(`${vp.opening}\n\n${vp.anchorStatement}`);

  // Systematic approach
  paragraphs.push(vp.systemicApproach);

  // Synthesis
  paragraphs.push(vp.synthesis);

  // Differential reasoning
  paragraphs.push(vp.differentialReasoning);

  // Clinical urgency / management
  paragraphs.push(vp.clinicalUrgency);

  return paragraphs.join("\n\n");
}

// Generate all model answers
const updates: { caseNumber: number; modelAnswer: string; vivaModelAnswer?: string }[] = [];
let skipped = 0;

for (const c of mskCases) {
  // Skip shells with empty findings
  if (!c.findings || c.findings.length < 20) {
    skipped++;
    continue;
  }

  const modelAnswer = generateModelAnswer(c as LongCase);
  const vivaModelAnswer = generateVivaModelAnswer(c as LongCase);

  updates.push({
    caseNumber: c.caseNumber,
    modelAnswer,
    ...(vivaModelAnswer ? { vivaModelAnswer } : {}),
  });
}

console.log(`Generated ${updates.length} model answers (${skipped} skipped — shells without content)`);

// Seed to Convex in batches of 10 (model answers are large strings)
for (let i = 0; i < updates.length; i += 10) {
  const chunk = updates.slice(i, i + 10);
  const args = JSON.stringify({ updates: chunk });
  // Write args to a temp file to avoid shell escaping issues
  const fs = require("fs");
  const tmpFile = `/tmp/model_answers_chunk_${i}.json`;
  fs.writeFileSync(tmpFile, args);

  try {
    const result = execSync(
      `npx convex run longCases:updateModelAnswers "$(cat ${tmpFile})" 2>/dev/null`,
      { encoding: "utf-8", timeout: 30000 }
    );
    console.log(`Chunk ${i}-${i + chunk.length}: ${result.trim()}`);
  } catch (e: any) {
    console.error(`ERROR chunk ${i}: ${e.message?.substring(0, 200)}`);
  }
}

console.log("Done!");
