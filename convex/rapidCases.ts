import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// QUERIES
// ============================================================

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rapidCases").collect();
  },
});

export const get = query({
  args: { id: v.id("rapidCases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCaseNumber = query({
  args: { caseNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rapidCases")
      .withIndex("by_caseNumber", (q) => q.eq("caseNumber", args.caseNumber))
      .first();
  },
});

export const getByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rapidCases")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
  },
});

// Get cases by category abbreviation (convenience for frontend)
export const getByCategoryAbbrev = query({
  args: { abbreviation: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_abbreviation", (q) => q.eq("abbreviation", args.abbreviation))
      .first();
    if (!category) return [];
    return await ctx.db
      .query("rapidCases")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .collect();
  },
});

export const getByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rapidCases")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

// Get cases by DDx problem-type subsection
export const getBySubsection = query({
  args: { subsection: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rapidCases")
      .withIndex("by_subsection", (q) => q.eq("subsection", args.subsection))
      .collect();
  },
});

// Get cases by packet (category + packet number)
export const getByPacket = query({
  args: { categoryId: v.id("categories"), packet: v.number() },
  handler: async (ctx, args) => {
    const cases = await ctx.db
      .query("rapidCases")
      .withIndex("by_packet", (q) =>
        q.eq("categoryId", args.categoryId).eq("packet", args.packet)
      )
      .collect();
    return cases.sort((a, b) => (a.packetOrder ?? 0) - (b.packetOrder ?? 0));
  },
});

// Get cases by shell status
export const getByShellStatus = query({
  args: { shellStatus: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rapidCases")
      .withIndex("by_shellStatus", (q) => q.eq("shellStatus", args.shellStatus))
      .collect();
  },
});

// Dashboard stats for rapid cases
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allCases = await ctx.db.query("rapidCases").collect();
    const categories = await ctx.db.query("categories").collect();
    const rapidCats = categories.filter((c) => c.examSection === "rapid");

    const byCategory: Record<string, { total: number; complete: number; shell: number }> = {};
    for (const cat of rapidCats) {
      const catCases = allCases.filter((c) => c.categoryId === cat._id);
      byCategory[cat.abbreviation] = {
        total: catCases.length,
        complete: catCases.filter((c) => c.shellStatus === "complete").length,
        shell: catCases.filter((c) => c.shellStatus === "shell").length,
      };
    }

    const subsections: Record<string, number> = {};
    for (const c of allCases) {
      if (c.subsection) {
        subsections[c.subsection] = (subsections[c.subsection] || 0) + 1;
      }
    }

    return {
      totalCases: allCases.length,
      complete: allCases.filter((c) => c.shellStatus === "complete").length,
      shell: allCases.filter((c) => c.shellStatus === "shell").length,
      byCategory,
      subsectionCount: Object.keys(subsections).length,
      subsections,
    };
  },
});

// List all distinct subsections for a category
export const listSubsections = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const cases = await ctx.db
      .query("rapidCases")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    const subs = new Map<string, { subsection: string; parentGroup: string; count: number; packet: number }>();
    for (const c of cases) {
      if (c.subsection) {
        const existing = subs.get(c.subsection);
        if (existing) {
          existing.count++;
        } else {
          subs.set(c.subsection, {
            subsection: c.subsection,
            parentGroup: c.parentGroup ?? "",
            count: 1,
            packet: c.packet ?? 0,
          });
        }
      }
    }
    return Array.from(subs.values()).sort((a, b) =>
      a.packet !== b.packet ? a.packet - b.packet : a.subsection.localeCompare(b.subsection)
    );
  },
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
  args: {
    categoryId: v.id("categories"),
    caseNumber: v.number(),
    title: v.string(),
    modality: v.string(),
    keyFinding: v.string(),
    diagnosis: v.string(),
    examPearl: v.string(),
    importantNegatives: v.array(v.string()),
    difficulty: v.string(),
    textbookRefs: v.array(v.number()),
    subsection: v.optional(v.string()),
    parentGroup: v.optional(v.string()),
    packet: v.optional(v.number()),
    packetOrder: v.optional(v.number()),
    shellStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rapidCases", args);
  },
});

// General update — any field
export const update = mutation({
  args: {
    id: v.id("rapidCases"),
    title: v.optional(v.string()),
    modality: v.optional(v.string()),
    keyFinding: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    examPearl: v.optional(v.string()),
    importantNegatives: v.optional(v.array(v.string())),
    difficulty: v.optional(v.string()),
    subsection: v.optional(v.string()),
    parentGroup: v.optional(v.string()),
    packet: v.optional(v.number()),
    packetOrder: v.optional(v.number()),
    shellStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
  },
});

// Update shell status (lifecycle: shell → sourced → imaged → complete)
export const updateShellStatus = mutation({
  args: {
    id: v.id("rapidCases"),
    shellStatus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { shellStatus: args.shellStatus });
  },
});

// Populate RadByte mini-report
export const updateRadByte = mutation({
  args: {
    id: v.id("rapidCases"),
    radByte: v.object({
      clinicalContext: v.string(),
      primarySign: v.string(),
      systematicReview: v.array(v.string()),
      reportConclusion: v.string(),
      urgency: v.string(),
      followUp: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { radByte: args.radByte });
  },
});

// Set Radiopaedia source attribution
export const updateRadiopaediaSource = mutation({
  args: {
    id: v.id("rapidCases"),
    radiopaediaSource: v.object({
      caseId: v.optional(v.number()),
      caseUrl: v.optional(v.string()),
      author: v.optional(v.string()),
      licence: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      radiopaediaSource: args.radiopaediaSource,
      shellStatus: "sourced",
    });
  },
});

// Bulk populate shell content (keyFinding + examPearl + importantNegatives)
export const populateShell = mutation({
  args: {
    id: v.id("rapidCases"),
    keyFinding: v.string(),
    examPearl: v.string(),
    importantNegatives: v.array(v.string()),
    textbookRefs: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, {
      ...fields,
      shellStatus: "complete",
    });
  },
});

// Delete a rapid case
export const remove = mutation({
  args: { id: v.id("rapidCases") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
