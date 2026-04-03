import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySource = query({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .first();
  },
});

export const save = mutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(),
    findings: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("viewerFindings")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        findings: args.findings,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("viewerFindings", {
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        findings: args.findings,
        updatedAt: Date.now(),
      });
    }
  },
});
