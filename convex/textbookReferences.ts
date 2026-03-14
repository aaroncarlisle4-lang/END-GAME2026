import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("textbookReferences").collect();
  },
});

export const getByRefNumber = query({
  args: { refNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("textbookReferences")
      .withIndex("by_refNumber", (q) => q.eq("refNumber", args.refNumber))
      .first();
  },
});

export const create = mutation({
  args: {
    refNumber: v.number(),
    shortName: v.string(),
    fullTitle: v.string(),
    authors: v.string(),
    primaryUseCase: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("textbookReferences", args);
  },
});
