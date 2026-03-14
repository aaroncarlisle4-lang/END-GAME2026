import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("discriminators").collect();
  },
});

export const getByLongCase = query({
  args: { longCaseId: v.id("longCases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("discriminators")
      .withIndex("by_longCaseId", (q) => q.eq("longCaseId", args.longCaseId))
      .first();
  },
});

export const get = query({
  args: { id: v.id("discriminators") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const searchByPattern = query({
  args: { pattern: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("discriminators").collect();
    const searchTerm = args.pattern.toLowerCase();
    return all.filter((d) => d.pattern.toLowerCase().includes(searchTerm));
  },
});

export const create = mutation({
  args: {
    longCaseId: v.optional(v.id("longCases")),
    pattern: v.string(),
    differentials: v.array(
      v.object({
        diagnosis: v.string(),
        mnemonicLetter: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
        dominantImagingFinding: v.optional(v.string()),
        distributionLocation: v.optional(v.string()),
        demographicsClinicalContext: v.optional(v.string()),
        discriminatingKeyFeature: v.optional(v.string()),
        associatedFindings: v.optional(v.string()),
        complicationsSeriousAlternatives: v.optional(v.string()),
        isCorrectDiagnosis: v.optional(v.boolean()),
      })
    ),
    seriousAlternatives: v.optional(v.array(v.string())),
    mnemonicRef: v.optional(v.object({
      mnemonic: v.string(),
      chapterNumber: v.number(),
      expandedLetters: v.string(),
    })),
    obrienRef: v.optional(v.object({
      obrienCaseNumber: v.number(),
      pattern: v.string(),
      top3Alignment: v.string(),
    })),
    problemCluster: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("discriminators", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("discriminators"),
    differentials: v.optional(
      v.array(
        v.object({
          diagnosis: v.string(),
          mnemonicLetter: v.optional(v.string()),
          sortOrder: v.optional(v.number()),
          dominantImagingFinding: v.optional(v.string()),
          distributionLocation: v.optional(v.string()),
          demographicsClinicalContext: v.optional(v.string()),
          discriminatingKeyFeature: v.optional(v.string()),
          associatedFindings: v.optional(v.string()),
          complicationsSeriousAlternatives: v.optional(v.string()),
          isCorrectDiagnosis: v.optional(v.boolean()),
        })
      )
    ),
    mnemonicRef: v.optional(v.object({
      mnemonic: v.string(),
      chapterNumber: v.number(),
      expandedLetters: v.string(),
    })),
    obrienRef: v.optional(v.object({
      obrienCaseNumber: v.number(),
      pattern: v.string(),
      top3Alignment: v.string(),
    })),
    problemCluster: v.optional(v.string()),
    seriousAlternatives: v.optional(v.array(v.string())),
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
  args: { id: v.id("discriminators") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
