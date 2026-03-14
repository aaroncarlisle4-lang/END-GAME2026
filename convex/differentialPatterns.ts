import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("differentialPatterns").collect();
  },
});

export const getByCategory = query({
  args: { categoryAbbreviation: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("differentialPatterns")
      .withIndex("by_category", (q) =>
        q.eq("categoryAbbreviation", args.categoryAbbreviation)
      )
      .collect();
  },
});

export const getBySection = query({
  args: { section: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("differentialPatterns")
      .withIndex("by_section", (q) => q.eq("section", args.section))
      .collect();
  },
});

export const getByCaseNumber = query({
  args: { obrienCaseNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("differentialPatterns")
      .withIndex("by_caseNumber", (q) =>
        q.eq("obrienCaseNumber", args.obrienCaseNumber)
      )
      .first();
  },
});
