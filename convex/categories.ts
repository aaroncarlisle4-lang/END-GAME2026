import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const getByAbbreviation = query({
  args: { abbreviation: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", args.abbreviation))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    abbreviation: v.string(),
    examSection: v.string(),
    caseCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", args);
  },
});
