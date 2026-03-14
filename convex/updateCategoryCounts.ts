import { mutation } from "./_generated/server";

export const updateAll = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const cases = await ctx.db.query("longCases").collect();
    const counts: Record<string, number> = {};
    for (const c of cases) {
      counts[c.categoryId] = (counts[c.categoryId] || 0) + 1;
    }
    for (const cat of categories) {
      const actual = counts[cat._id] || 0;
      if (cat.caseCount !== actual) {
        await ctx.db.patch(cat._id, { caseCount: actual });
      }
    }
    return { updated: categories.length };
  },
});
