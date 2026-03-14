import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateBatch = mutation({
  args: {
    updates: v.array(
      v.object({
        caseNumber: v.number(),
        findings: v.string(),
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
        findings: u.findings,
      });
      updated++;
    }
    return { updated };
  },
});
