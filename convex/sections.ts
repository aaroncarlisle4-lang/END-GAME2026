import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sections").collect();
  },
});

export const getByCategory = query({
  args: { categoryAbbreviation: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sections")
      .withIndex("by_category", (q) =>
        q.eq("categoryAbbreviation", args.categoryAbbreviation)
      )
      .collect();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sections")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const create = mutation({
  args: {
    categoryAbbreviation: v.string(),
    name: v.string(),
    description: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sections", args);
  },
});
