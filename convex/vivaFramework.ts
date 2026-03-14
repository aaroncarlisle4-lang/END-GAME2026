import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vivaFramework").collect();
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vivaFramework")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("vivaFramework") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySpecialty = query({
  args: { specialty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vivaFramework")
      .withIndex("by_specialty", (q) => q.eq("specialty", args.specialty))
      .collect();
  },
});

export const create = mutation({
  args: {
    category: v.string(),
    context: v.string(),
    phrases: v.array(v.string()),
    examples: v.array(v.string()),
    subcategory: v.optional(v.string()),
    specialty: v.optional(v.string()),
    sourceRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vivaFramework", args);
  },
});
