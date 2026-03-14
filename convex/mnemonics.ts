import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mnemonics").collect();
  },
});

export const getByCategory = query({
  args: { categoryAbbreviation: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mnemonics")
      .withIndex("by_category", (q) =>
        q.eq("categoryAbbreviation", args.categoryAbbreviation)
      )
      .collect();
  },
});

export const getByChapter = query({
  args: { chapterNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mnemonics")
      .withIndex("by_chapter", (q) =>
        q.eq("chapterNumber", args.chapterNumber)
      )
      .first();
  },
});

export const getByPattern = query({
  args: { pattern: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mnemonics")
      .withIndex("by_pattern", (q) => q.eq("pattern", args.pattern))
      .first();
  },
});

export const create = mutation({
  args: {
    chapterNumber: v.number(),
    bookSection: v.string(),
    categoryAbbreviation: v.string(),
    pattern: v.string(),
    mnemonic: v.string(),
    differentials: v.array(
      v.object({
        letter: v.string(),
        condition: v.string(),
        associatedFeatures: v.string(),
      })
    ),
    modelAnswer: v.string(),
    pearls: v.array(v.string()),
    relatedSections: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mnemonics", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("mnemonics"),
    differentials: v.optional(
      v.array(
        v.object({
          letter: v.string(),
          condition: v.string(),
          associatedFeatures: v.string(),
        })
      )
    ),
    pearls: v.optional(v.array(v.string())),
    modelAnswer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("mnemonics") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

