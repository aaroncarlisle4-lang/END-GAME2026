import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByImageId = query({
  args: { imageId: v.string() },
  handler: async (ctx, { imageId }) => {
    if (!imageId) return [];
    return await ctx.db
      .query("imageAnnotations")
      .withIndex("by_imageId", (q) => q.eq("imageId", imageId))
      .collect();
  },
});

export const create = mutation({
  args: {
    imageId: v.string(),
    x1: v.number(),
    y1: v.number(),
    x2: v.number(),
    y2: v.number(),
    captionRotation: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("imageAnnotations", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("imageAnnotations"),
    x1: v.optional(v.number()),
    y1: v.optional(v.number()),
    x2: v.optional(v.number()),
    y2: v.optional(v.number()),
    captionRotation: v.optional(v.number()),
    text: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("imageAnnotations") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
