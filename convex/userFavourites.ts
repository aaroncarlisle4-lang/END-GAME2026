import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("userFavourites").collect(),
});

export const toggle = mutation({
  args: { sourceType: v.string(), sourceId: v.string(), categoryName: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("userFavourites").withIndex("by_source", (q) => q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)).first();
    if (existing) { await ctx.db.delete(existing._id); return false; }
    else { await ctx.db.insert("userFavourites", args); return true; }
  },
});
