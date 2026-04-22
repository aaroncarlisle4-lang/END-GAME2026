import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { sourceType: v.string(), sourceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("viewerPreferences")
      .withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId))
      .first();
  },
});

export const setFolderOrder = mutation({
  args: { sourceType: v.string(), sourceId: v.string(), folderOrder: v.array(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("viewerPreferences").withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)).first();
    if (existing) { await ctx.db.patch(existing._id, { folderOrder: args.folderOrder }); }
    else { await ctx.db.insert("viewerPreferences", { sourceType: args.sourceType, sourceId: args.sourceId, folderOrder: args.folderOrder }); }
  },
});

export const setColumnOrder = mutation({
  args: { sourceType: v.string(), sourceId: v.string(), columnOrder: v.array(v.number()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("viewerPreferences").withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)).first();
    if (existing) { await ctx.db.patch(existing._id, { columnOrder: args.columnOrder }); }
    else { await ctx.db.insert("viewerPreferences", { sourceType: args.sourceType, sourceId: args.sourceId, columnOrder: args.columnOrder }); }
  },
});
