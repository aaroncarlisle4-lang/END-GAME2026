import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed a batch of Duke cases into the longCases table.
 * Called repeatedly with chunks of ~20 cases each.
 */
export const seedBatch = mutation({
  args: {
    cases: v.array(
      v.object({
        caseNumber: v.number(),
        categoryAbbrev: v.string(),
        title: v.string(),
        section: v.string(),
        modality: v.string(),
        clinicalHistory: v.string(),
        findings: v.string(),
        interpretation: v.string(),
        diagnosis: v.string(),
        differentials: v.array(v.string()),
        nextSteps: v.string(),
        keyBullets: v.array(v.string()),
        importantNegatives: v.array(v.string()),
        difficulty: v.string(),
        hasDiscriminator: v.boolean(),
        textbookRefs: v.array(v.number()),
        examPearl: v.string(),
        nuclearMedicine: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Look up category IDs
    const categories = await ctx.db.query("categories").collect();
    const catMap: Record<string, string> = {};
    for (const cat of categories) {
      catMap[cat.abbreviation] = cat._id;
    }

    let inserted = 0;
    for (const c of args.cases) {
      const categoryId = catMap[c.categoryAbbrev];
      if (!categoryId) {
        console.log(`Skipping case ${c.caseNumber}: no category for ${c.categoryAbbrev}`);
        continue;
      }

      // Check for duplicate
      const existing = await ctx.db
        .query("longCases")
        .withIndex("by_caseNumber", (q) => q.eq("caseNumber", c.caseNumber))
        .first();
      if (existing) {
        continue;
      }

      await ctx.db.insert("longCases", {
        caseNumber: c.caseNumber,
        categoryId: categoryId as any,
        title: c.title,
        section: c.section,
        modality: c.modality,
        clinicalHistory: c.clinicalHistory,
        findings: c.findings,
        interpretation: c.interpretation,
        diagnosis: c.diagnosis,
        differentials: c.differentials,
        nextSteps: c.nextSteps,
        keyBullets: c.keyBullets,
        importantNegatives: c.importantNegatives,
        difficulty: c.difficulty,
        hasDiscriminator: c.hasDiscriminator,
        textbookRefs: c.textbookRefs,
        examPearl: c.examPearl,
        nuclearMedicine: c.nuclearMedicine,
      });
      inserted++;
    }
    return { inserted };
  },
});
