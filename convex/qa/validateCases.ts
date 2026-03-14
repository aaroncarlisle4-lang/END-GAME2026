import { query } from "../_generated/server";
import { CASE_QUALITY_SPEC, VALID_SECTIONS, MAX_TEXTBOOK_REF } from "../data/caseQualitySpec";

type ValidationIssue = {
  caseNumber: number;
  title: string;
  field: string;
  issue: string;
  severity: "error" | "warning";
};

/**
 * Validates all populated long cases against the quality spec.
 * Returns a list of validation issues per case.
 */
export const validatePopulatedCases = query({
  args: {},
  handler: async (ctx) => {
    const allCases = await ctx.db.query("longCases").collect();
    const populated = allCases.filter((c) => c.findings !== "");

    const allSections = await ctx.db.query("sections").collect();
    const validSectionNames = new Set(allSections.map((s) => s.name));

    const issues: ValidationIssue[] = [];

    for (const c of populated) {
      // Findings: bullet-point format check
      const findingLines = c.findings
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (findingLines.length < CASE_QUALITY_SPEC.findings.minBullets) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "findings",
          issue: `Too few finding bullets: ${findingLines.length} (min ${CASE_QUALITY_SPEC.findings.minBullets})`,
          severity: "error",
        });
      }
      if (findingLines.length > CASE_QUALITY_SPEC.findings.maxBullets) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "findings",
          issue: `Too many finding bullets: ${findingLines.length} (max ${CASE_QUALITY_SPEC.findings.maxBullets})`,
          severity: "warning",
        });
      }

      // Check for prose (sentences with periods mid-text suggest prose, not bullets)
      const proseIndicators = findingLines.filter(
        (l) => l.includes(". ") && l.length > 80
      );
      if (proseIndicators.length > 2) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "findings",
          issue: "Findings appear to be in prose format (should be bullet-point style)",
          severity: "warning",
        });
      }

      // Diagnosis: length 30-100
      if (c.diagnosis.length < CASE_QUALITY_SPEC.diagnosis.minLength) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "diagnosis",
          issue: `Diagnosis too short: ${c.diagnosis.length} chars (min ${CASE_QUALITY_SPEC.diagnosis.minLength})`,
          severity: "error",
        });
      }
      if (c.diagnosis.length > CASE_QUALITY_SPEC.diagnosis.maxLength) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "diagnosis",
          issue: `Diagnosis too long: ${c.diagnosis.length} chars (max ${CASE_QUALITY_SPEC.diagnosis.maxLength})`,
          severity: "warning",
        });
      }

      // Differentials: exactly 3
      if (c.differentials.length !== CASE_QUALITY_SPEC.differentials.count) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "differentials",
          issue: `Expected ${CASE_QUALITY_SPEC.differentials.count} differentials, got ${c.differentials.length}`,
          severity: "error",
        });
      }

      // KeyBullets: exactly 8
      if (c.keyBullets.length !== CASE_QUALITY_SPEC.keyBullets.count) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "keyBullets",
          issue: `Expected ${CASE_QUALITY_SPEC.keyBullets.count} keyBullets, got ${c.keyBullets.length}`,
          severity: "error",
        });
      }

      // ImportantNegatives: exactly 5
      if (
        c.importantNegatives.length !==
        CASE_QUALITY_SPEC.importantNegatives.count
      ) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "importantNegatives",
          issue: `Expected ${CASE_QUALITY_SPEC.importantNegatives.count} importantNegatives, got ${c.importantNegatives.length}`,
          severity: "error",
        });
      }

      // ExamPearl: contains [n] reference
      if (!/\[\d+\]/.test(c.examPearl)) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "examPearl",
          issue: "examPearl missing textbook reference in [n] format",
          severity: "error",
        });
      }

      // TextbookRefs: values in range 1-19
      for (const ref of c.textbookRefs) {
        if (ref < 1 || ref > MAX_TEXTBOOK_REF) {
          issues.push({
            caseNumber: c.caseNumber,
            title: c.title,
            field: "textbookRefs",
            issue: `Invalid textbook ref: ${ref} (must be 1-${MAX_TEXTBOOK_REF})`,
            severity: "error",
          });
        }
      }

      // Section: must match valid section name
      if (c.section && !validSectionNames.has(c.section)) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "section",
          issue: `Section "${c.section}" not found in sections table`,
          severity: "error",
        });
      }

      // Interpretation: non-empty check
      if (c.interpretation.length === 0) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "interpretation",
          issue: "Interpretation is empty",
          severity: "error",
        });
      }

      // NextSteps: non-empty check
      if (c.nextSteps.length === 0) {
        issues.push({
          caseNumber: c.caseNumber,
          title: c.title,
          field: "nextSteps",
          issue: "NextSteps is empty",
          severity: "error",
        });
      }
    }

    return {
      totalPopulated: populated.length,
      totalIssues: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      issues,
    };
  },
});
