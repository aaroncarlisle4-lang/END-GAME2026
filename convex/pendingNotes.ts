import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    discriminatorId: v.id("discriminators"),
    differentialIndex: v.number(),
    field: v.string(),
    rawText: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pendingNotes", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pendingNotes")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("asc")
      .collect();
  },
});

export const markProcessed = mutation({
  args: { id: v.id("pendingNotes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "processed" });
  },
});

export const getPendingCounts = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("pendingNotes")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const counts: Record<string, number> = {};
    for (const note of pending) {
      counts[note.discriminatorId] = (counts[note.discriminatorId] ?? 0) + 1;
    }
    return counts;
  },
});
