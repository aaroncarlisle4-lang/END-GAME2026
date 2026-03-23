import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const diffFields = {
  name: v.string(),
  rank: v.number(),
  frequency: v.optional(v.string()),
  conditionSlug: v.optional(v.string()),
  definition: v.optional(v.string()),
  dominantFinding: v.optional(v.string()),
  distribution: v.optional(v.string()),
  demographics: v.optional(v.string()),
  discriminatingFeatures: v.optional(v.array(v.string())),
};

const clusterFields = {
  finding: v.string(),
  slug: v.string(),
  chapter: v.string(),
  clusterType: v.string(),
  qualityScore: v.number(),
  differentials: v.array(v.object(diffFields)),
  context: v.optional(v.string()),
};

export const list = query({
  args: { minQuality: v.optional(v.number()), chapter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const min = args.minQuality ?? 0;
    if (args.chapter) {
      const byChapter = await ctx.db
        .query("dahnertDDxClusters")
        .withIndex("by_chapter", q => q.eq("chapter", args.chapter!))
        .collect();
      return byChapter.filter(c => c.qualityScore >= min);
    }
    const all = await ctx.db.query("dahnertDDxClusters").collect();
    return all.filter(c => c.qualityScore >= min);
  },
});

export const chapters = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("dahnertDDxClusters").collect();
    const seen = new Set<string>();
    const result: string[] = [];
    for (const c of all) {
      if (!seen.has(c.chapter)) { seen.add(c.chapter); result.push(c.chapter); }
    }
    return result.sort();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) =>
    ctx.db.query("dahnertDDxClusters")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first(),
});

export const count = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("dahnertDDxClusters").collect()).length,
});

export const batchSeed = mutation({
  args: { clusters: v.array(v.object(clusterFields)) },
  handler: async (ctx, args) => {
    let inserted = 0;
    for (const c of args.clusters) {
      const exists = await ctx.db.query("dahnertDDxClusters")
        .withIndex("by_slug", q => q.eq("slug", c.slug)).first();
      if (!exists) { await ctx.db.insert("dahnertDDxClusters", c); inserted++; }
    }
    return { inserted };
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("dahnertDDxClusters").collect();
    for (const d of all) await ctx.db.delete(d._id);
    return { deleted: all.length };
  },
});

// Enrich differentials with Dahnert condition data.
// Patches are [{slug, enrichments: [{differentialIndex, ...fields}]}]
// Only fills empty fields — never overwrites.
export const batchEnrichDifferentials = mutation({
  args: {
    patches: v.array(v.object({
      slug: v.string(),
      enrichments: v.array(v.object({
        differentialIndex: v.number(),
        conditionSlug: v.optional(v.string()),
        definition: v.optional(v.string()),
        dominantFinding: v.optional(v.string()),
        distribution: v.optional(v.string()),
        demographics: v.optional(v.string()),
        discriminatingFeatures: v.optional(v.array(v.string())),
      })),
    })),
  },
  handler: async (ctx, args) => {
    let enriched = 0;
    for (const patch of args.patches) {
      const doc = await ctx.db.query("dahnertDDxClusters")
        .withIndex("by_slug", q => q.eq("slug", patch.slug)).first();
      if (!doc) continue;
      const diffs = [...doc.differentials];
      let changed = false;
      for (const e of patch.enrichments) {
        const d = diffs[e.differentialIndex];
        if (!d) continue;
        const u = { ...d };
        if (e.conditionSlug && !d.conditionSlug) { u.conditionSlug = e.conditionSlug; changed = true; }
        if (e.definition && !d.definition) { u.definition = e.definition; changed = true; }
        if (e.dominantFinding && !d.dominantFinding) { u.dominantFinding = e.dominantFinding; changed = true; }
        if (e.distribution && !d.distribution) { u.distribution = e.distribution; changed = true; }
        if (e.demographics && !d.demographics) { u.demographics = e.demographics; changed = true; }
        if (e.discriminatingFeatures?.length && !d.discriminatingFeatures?.length) { u.discriminatingFeatures = e.discriminatingFeatures; changed = true; }
        diffs[e.differentialIndex] = u;
      }
      if (changed) { await ctx.db.patch(doc._id, { differentials: diffs }); enriched++; }
    }
    return { enriched };
  },
});

export const enrichStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("dahnertDDxClusters").collect();
    let totalDiffs = 0, enrichedDiffs = 0;
    for (const c of all) {
      for (const d of c.differentials) {
        totalDiffs++;
        if (d.conditionSlug) enrichedDiffs++;
      }
    }
    return { clusters: all.length, totalDiffs, enrichedDiffs, pct: Math.round(enrichedDiffs / totalDiffs * 100) };
  },
});

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Link dahnertDDxClusters to highYieldClusters and differentialPatterns by pattern name
export const linkToHighYieldAndPatterns = mutation({
  args: {},
  handler: async (ctx) => {
    const clusters = await ctx.db.query("dahnertDDxClusters").collect();
    const clusterMap = new Map<string, string>(); // norm(finding) → slug
    for (const c of clusters) clusterMap.set(norm(c.finding), c.slug);

    let hyLinked = 0, patLinked = 0;

    // highYieldClusters
    const hyClusters = await ctx.db.query("highYieldClusters").collect();
    for (const hy of hyClusters) {
      if (hy.dahnertDdxSlug) continue;
      const slug = clusterMap.get(norm(hy.clusterName));
      if (slug) { await ctx.db.patch(hy._id, { dahnertDdxSlug: slug }); hyLinked++; }
    }

    // differentialPatterns — match by pattern field
    const patterns = await ctx.db.query("differentialPatterns").collect();
    for (const p of patterns) {
      if (p.dahnertDdxSlug) continue;
      const slug = clusterMap.get(norm(p.pattern));
      if (slug) { await ctx.db.patch(p._id, { dahnertDdxSlug: slug }); patLinked++; }
    }

    return { hyLinked, patLinked, totalClusters: clusters.length };
  },
});
