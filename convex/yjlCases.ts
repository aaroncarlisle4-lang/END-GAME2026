import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("yjlCases").collect();
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("yjlCases")
      .withIndex("by_category", (q) => q.eq("playlistCategory", args.category))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("yjlCases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    playlistId: v.number(),
    playlistName: v.string(),
    playlistCategory: v.string(),
    sortOrder: v.number(),
    entryId: v.number(),
    radiopaediaCaseId: v.number(),
    radiopaediaCaseUrl: v.string(),
    title: v.string(),
    studyIds: v.array(v.number()),
    presentation: v.optional(v.string()),
    findings: v.optional(v.string()),
    top3Differentials: v.array(v.string()),
    discriminatorId: v.optional(v.id("discriminators")),
    attribution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("yjlCases", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("yjlCases"),
    top3Differentials: v.optional(v.array(v.string())),
    discriminatorId: v.optional(v.id("discriminators")),
    findings: v.optional(v.string()),
    presentation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) updates[k] = v;
    }
    await ctx.db.patch(id, updates);
  },
});

export const createManual = mutation({
  args: {
    playlistCategory: v.string(),
    title: v.string(),
    top3Differentials: v.array(v.string()),
    presentation: v.optional(v.string()),
    findings: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find highest sortOrder in this category to append at end
    const existing = await ctx.db
      .query("yjlCases")
      .withIndex("by_category", (q) => q.eq("playlistCategory", args.playlistCategory))
      .collect();
    const maxSort = existing.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    const sortOrder = maxSort + 1;
    const radiopaediaCaseId = Date.now();

    // Create a blank discriminator matrix with the differentials pre-populated
    const differentials = args.top3Differentials.map((dx, i) => ({
      diagnosis: dx,
      sortOrder: i,
    }));
    // Always include the title as the primary/correct diagnosis row if not already a differential
    const titleLower = args.title.toLowerCase().trim();
    const hasTitleAsDx = differentials.some(
      (d) => d.diagnosis.toLowerCase().trim() === titleLower
    );
    const allDifferentials = hasTitleAsDx
      ? differentials
      : [{ diagnosis: args.title, sortOrder: -1, isCorrectDiagnosis: true as const }, ...differentials];

    const discriminatorId = await ctx.db.insert("discriminators", {
      pattern: args.title,
      differentials: allDifferentials,
    });

    return await ctx.db.insert("yjlCases", {
      playlistId: 0,
      playlistName: `Manual - ${args.playlistCategory}`,
      playlistCategory: args.playlistCategory,
      sortOrder,
      entryId: 0,
      radiopaediaCaseId,
      radiopaediaCaseUrl: "",
      title: args.title,
      studyIds: [],
      top3Differentials: args.top3Differentials,
      presentation: args.presentation,
      findings: args.findings,
      discriminatorId,
    });
  },
});

export const upsertFromScrape = mutation({
  args: {
    cases: v.array(v.object({
      playlistId: v.number(),
      playlistName: v.string(),
      playlistCategory: v.string(),
      sortOrder: v.number(),
      entryId: v.number(),
      radiopaediaCaseId: v.number(),
      radiopaediaCaseUrl: v.string(),
      title: v.string(),
      studyIds: v.array(v.number()),
      presentation: v.optional(v.string()),
      findings: v.optional(v.string()),
      top3Differentials: v.array(v.string()),
      attribution: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;
    for (const c of args.cases) {
      const existing = await ctx.db
        .query("yjlCases")
        .withIndex("by_caseId", (q) => q.eq("radiopaediaCaseId", c.radiopaediaCaseId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          playlistId: c.playlistId,
          playlistName: c.playlistName,
          playlistCategory: c.playlistCategory,
          sortOrder: c.sortOrder,
          entryId: c.entryId,
          radiopaediaCaseUrl: c.radiopaediaCaseUrl,
          title: c.title,
          studyIds: c.studyIds,
          presentation: c.presentation,
          findings: c.findings,
          attribution: c.attribution,
        });
        updated++;
      } else {
        await ctx.db.insert("yjlCases", { ...c, top3Differentials: [] });
        created++;
      }
    }
    return { created, updated };
  },
});

export const seedShells = mutation({
  args: {
    shells: v.array(v.object({
      playlistId: v.number(),
      playlistName: v.string(),
      playlistCategory: v.string(),
      sortOrder: v.number(),
      title: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    let created = 0;
    let skipped = 0;
    for (const shell of args.shells) {
      // Use a stable placeholder ID: playlistId * 100000 + sortOrder
      const placeholderCaseId = shell.playlistId * 100000 + shell.sortOrder;
      const existing = await ctx.db
        .query("yjlCases")
        .withIndex("by_playlist", (q) => q.eq("playlistId", shell.playlistId))
        .filter((q) => q.eq(q.field("sortOrder"), shell.sortOrder))
        .first();
      if (!existing) {
        await ctx.db.insert("yjlCases", {
          playlistId: shell.playlistId,
          playlistName: shell.playlistName,
          playlistCategory: shell.playlistCategory,
          sortOrder: shell.sortOrder,
          title: shell.title,
          entryId: 0,
          radiopaediaCaseId: placeholderCaseId,
          radiopaediaCaseUrl: "",
          studyIds: [],
          top3Differentials: [],
        });
        created++;
      } else {
        skipped++;
      }
    }
    return { created, skipped };
  },
});

export const linkDiscriminator = mutation({
  args: {
    id: v.id("yjlCases"),
    discriminatorId: v.id("discriminators"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { discriminatorId: args.discriminatorId });
  },
});
