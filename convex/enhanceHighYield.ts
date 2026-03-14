import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateBatch = mutation({
  args: {
    updates: v.array(
      v.object({
        caseNumber: v.number(),
        scoringGuide: v.object({
          score4: v.string(),
          score5: v.string(),
          score6: v.string(),
          score7: v.string(),
          score8: v.string(),
        }),
        vivaPresentation: v.object({
          opening: v.string(),
          anchorStatement: v.string(),
          systemicApproach: v.string(),
          synthesis: v.string(),
          differentialReasoning: v.string(),
          clinicalUrgency: v.string(),
          examinerTip: v.string(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    let updated = 0;
    for (const u of args.updates) {
      const existing = await ctx.db
        .query("longCases")
        .withIndex("by_caseNumber", (q) => q.eq("caseNumber", u.caseNumber))
        .first();
      if (!existing) {
        console.log(`Case ${u.caseNumber} not found`);
        continue;
      }
      await ctx.db.patch(existing._id, {
        scoringGuide: u.scoringGuide,
        vivaPresentation: u.vivaPresentation,
      });
      updated++;
    }
    return { updated };
  },
});
