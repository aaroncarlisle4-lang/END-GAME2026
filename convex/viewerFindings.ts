import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySourceBucket = query({
  args: { sourceType: v.string(), sourceId: v.string(), bucketName: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId))
      .collect();
    return all.find((r) => (r.bucketName ?? "") === args.bucketName) ?? null;
  },
});

export const getAllBySource = query({
  args: { sourceType: v.string(), sourceId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId))
      .collect();
    return all.map((r) => ({ bucketName: r.bucketName ?? "", findings: r.findings }));
  },
});

export const getBySource = query({
  args: { sourceType: v.string(), sourceId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId))
      .collect();
    return all.find((r) => !r.bucketName) ?? null;
  },
});

export const save = mutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    bucketName: v.optional(v.string()),
    findings: v.string(),
  },
  handler: async (ctx, args) => {
    const targetBucket = args.bucketName ?? "";
    const all = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId))
      .collect();
    const existing = all.find((r) => (r.bucketName ?? "") === targetBucket);
    if (existing) {
      await ctx.db.patch(existing._id, { findings: args.findings, updatedAt: Date.now() });
      return existing._id;
    } else {
      return await ctx.db.insert("viewerFindings", {
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        bucketName: targetBucket,
        findings: args.findings,
        updatedAt: Date.now(),
      });
    }
  },
});
