import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("chapmanACE").collect();
    console.log(`Returning ${items.length} Chapman items`);
    return items;
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapmanACE")
      .withIndex("by_category", (q) => q.eq("categoryAbbreviation", args.category))
      .collect();
  },
});
