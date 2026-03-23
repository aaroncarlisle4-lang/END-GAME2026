import { query, mutation, internalQuery } from "./_generated/server";
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

// Batch enrich differentials from Dahnert condition data.
// Only fills empty fields — never overwrites existing manual data.
export const batchEnrich = mutation({
  args: {
    patches: v.array(v.object({
      id: v.id("discriminators"),
      enrichments: v.array(v.object({
        differentialIndex: v.number(),
        dahnertConditionSlug: v.optional(v.string()),
        dominantImagingFinding: v.optional(v.string()),
        distributionLocation: v.optional(v.string()),
        demographicsClinicalContext: v.optional(v.string()),
        discriminatingKeyFeature: v.optional(v.string()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    let enriched = 0;
    for (const patch of args.patches) {
      const doc = await ctx.db.get(patch.id);
      if (!doc) continue;
      const diffs = [...doc.differentials];
      let changed = false;
      for (const e of patch.enrichments) {
        const d = diffs[e.differentialIndex];
        if (!d) continue;
        const updated = { ...d };
        if (e.dahnertConditionSlug && !d.dahnertConditionSlug) { updated.dahnertConditionSlug = e.dahnertConditionSlug; changed = true; }
        if (e.dominantImagingFinding && !d.dominantImagingFinding) { updated.dominantImagingFinding = e.dominantImagingFinding; changed = true; }
        if (e.distributionLocation && !d.distributionLocation) { updated.distributionLocation = e.distributionLocation; changed = true; }
        if (e.demographicsClinicalContext && !d.demographicsClinicalContext) { updated.demographicsClinicalContext = e.demographicsClinicalContext; changed = true; }
        if (e.discriminatingKeyFeature && !d.discriminatingKeyFeature) { updated.discriminatingKeyFeature = e.discriminatingKeyFeature; changed = true; }
        diffs[e.differentialIndex] = updated;
      }
      if (changed) {
        await ctx.db.patch(patch.id, { differentials: diffs });
        enriched++;
      }
    }
    return { enriched };
  },
});

// Force-overwrite version — replaces existing data with Dahnert content
export const batchEnrichOverwrite = mutation({
  args: {
    patches: v.array(v.object({
      id: v.id("discriminators"),
      enrichments: v.array(v.object({
        differentialIndex: v.number(),
        dahnertConditionSlug: v.optional(v.string()),
        dominantImagingFinding: v.optional(v.string()),
        distributionLocation: v.optional(v.string()),
        demographicsClinicalContext: v.optional(v.string()),
        discriminatingKeyFeature: v.optional(v.string()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    let enriched = 0;
    for (const patch of args.patches) {
      const doc = await ctx.db.get(patch.id);
      if (!doc) continue;
      const diffs = [...doc.differentials];
      let changed = false;
      for (const e of patch.enrichments) {
        const d = diffs[e.differentialIndex];
        if (!d) continue;
        const updated = {
          ...d,
          ...(e.dahnertConditionSlug !== undefined ? { dahnertConditionSlug: e.dahnertConditionSlug } : {}),
          ...(e.dominantImagingFinding !== undefined ? { dominantImagingFinding: e.dominantImagingFinding } : {}),
          ...(e.distributionLocation !== undefined ? { distributionLocation: e.distributionLocation } : {}),
          ...(e.demographicsClinicalContext !== undefined ? { demographicsClinicalContext: e.demographicsClinicalContext } : {}),
          ...(e.discriminatingKeyFeature !== undefined ? { discriminatingKeyFeature: e.discriminatingKeyFeature } : {}),
        };
        diffs[e.differentialIndex] = updated;
        changed = true;
      }
      if (changed) {
        await ctx.db.patch(patch.id, { differentials: diffs });
        enriched++;
      }
    }
    return { enriched };
  },
});

export const countEnriched = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("discriminators").collect();
    let total = 0, enrichedDiffs = 0, totalDiffs = 0;
    for (const d of all) {
      total++;
      for (const diff of d.differentials) {
        totalDiffs++;
        if (diff.dominantImagingFinding || diff.distributionLocation || diff.discriminatingKeyFeature) enrichedDiffs++;
      }
    }
    return { discriminatorRecords: total, totalDifferentials: totalDiffs, enrichedDifferentials: enrichedDiffs };
  },
});

// Internal query for use by actions (e.g. textIngestion)
export const internalGet = internalQuery({
  args: { id: v.id("discriminators") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Surgical patch: update a single field on a single differential by index
export const patchDifferentialField = mutation({
  args: {
    id: v.id("discriminators"),
    differentialIndex: v.number(),
    field: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Discriminator not found");
    if (args.differentialIndex < 0 || args.differentialIndex >= doc.differentials.length) {
      throw new Error(`Invalid differential index: ${args.differentialIndex}`);
    }
    const validFields = [
      "dominantImagingFinding",
      "distributionLocation",
      "demographicsClinicalContext",
      "discriminatingKeyFeature",
      "associatedFindings",
      "complicationsSeriousAlternatives",
    ];
    if (!validFields.includes(args.field)) {
      throw new Error(`Invalid field: ${args.field}`);
    }
    const updated = [...doc.differentials];
    updated[args.differentialIndex] = {
      ...updated[args.differentialIndex],
      [args.field]: args.value,
    };
    await ctx.db.patch(args.id, { differentials: updated });
  },
});

// Append new authored differentials to an existing discriminator.
// Skips any diagnosis already present (case-insensitive). Returns counts.
export const appendDifferentials = mutation({
  args: {
    id: v.id("discriminators"),
    newDifferentials: v.array(v.object({
      diagnosis: v.string(),
      dominantImagingFinding: v.optional(v.string()),
      distributionLocation: v.optional(v.string()),
      demographicsClinicalContext: v.optional(v.string()),
      discriminatingKeyFeature: v.optional(v.string()),
      associatedFindings: v.optional(v.string()),
      complicationsSeriousAlternatives: v.optional(v.string()),
      isCorrectDiagnosis: v.optional(v.boolean()),
      sortOrder: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Discriminator not found");
    const existing = new Set(doc.differentials.map(d => d.diagnosis.toLowerCase()));
    const toAdd = args.newDifferentials.filter(d => !existing.has(d.diagnosis.toLowerCase()));
    if (toAdd.length === 0) return { appended: 0, skipped: args.newDifferentials.length };
    const baseOrder = doc.differentials.length;
    const withOrder = toAdd.map((d, i) => ({ ...d, sortOrder: d.sortOrder ?? baseOrder + i }));
    await ctx.db.patch(args.id, { differentials: [...doc.differentials, ...withOrder] });
    return { appended: toAdd.length, skipped: args.newDifferentials.length - toAdd.length };
  },
});
