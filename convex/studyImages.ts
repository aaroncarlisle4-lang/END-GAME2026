import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

const sourceTypeValidator = v.union(
  v.literal("differentialPattern"),
  v.literal("mnemonic"),
  v.literal("chapman")
);

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const addImage = mutation({
  args: {
    sourceType: sourceTypeValidator,
    sourceId: v.string(),
    storageId: v.optional(v.id("_storage")),
    externalUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    caseGroup: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current max sortOrder for this source
    const existing = await ctx.db
      .query("studyImages")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();
    const maxSort = existing.reduce((max, img) => Math.max(max, img.sortOrder), -1);

    return await ctx.db.insert("studyImages", {
      sourceType: args.sourceType,
      sourceId: args.sourceId,
      storageId: args.storageId,
      externalUrl: args.externalUrl,
      caption: args.caption,
      caseGroup: args.caseGroup,
      sortOrder: maxSort + 1,
      createdAt: Date.now(),
    });
  },
});

export const listBySource = query({
  args: {
    sourceType: sourceTypeValidator,
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("studyImages")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();

    // Resolve storageIds to URLs
    const resolved = await Promise.all(
      images.map(async (img) => {
        let url = img.externalUrl;
        if (img.storageId) {
          url = await ctx.storage.getUrl(img.storageId) ?? undefined;
        }
        return { ...img, url };
      })
    );

    return resolved.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const deleteImage = mutation({
  args: { id: v.id("studyImages") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) return;
    if (image.storageId) {
      await ctx.storage.delete(image.storageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const deleteStack = mutation({
  args: { ids: v.array(v.id("studyImages")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const image = await ctx.db.get(id);
      if (!image) continue;
      if (image.storageId) {
        await ctx.storage.delete(image.storageId);
      }
      await ctx.db.delete(id);
    }
    return { deleted: args.ids.length };
  },
});

export const batchAddImages = mutation({
  args: {
    sourceType: sourceTypeValidator,
    sourceId: v.string(),
    urls: v.array(v.string()),
    caseGroup: v.string(),
    captionPrefix: v.optional(v.string()),
    attribution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("studyImages")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();
    let sortOrder =
      existing.reduce((max, img) => Math.max(max, img.sortOrder), -1) + 1;

    for (let i = 0; i < args.urls.length; i++) {
      await ctx.db.insert("studyImages", {
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        externalUrl: args.urls[i],
        caption: args.captionPrefix
          ? `${args.captionPrefix} [${i + 1}]`
          : `Slice ${i + 1}`,
        caseGroup: args.caseGroup,
        // Store attribution on the first image only
        ...(i === 0 && args.attribution ? { attribution: args.attribution } : {}),
        sortOrder: sortOrder++,
        createdAt: Date.now(),
      });
    }
    return { inserted: args.urls.length };
  },
});

export const batchGetImageCounts = query({
  args: {
    sourceType: sourceTypeValidator,
    sourceIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const counts: Record<string, number> = {};
    for (const sourceId of args.sourceIds) {
      const images = await ctx.db
        .query("studyImages")
        .withIndex("by_source", (q) =>
          q.eq("sourceType", args.sourceType).eq("sourceId", sourceId)
        )
        .collect();
      if (images.length > 0) {
        counts[sourceId] = images.length;
      }
    }
    return counts;
  },
});

const CDN_BASE = "https://prod-images-static.radiopaedia.org/images";

/**
 * Fetch image URLs from a Radiopaedia study JSON endpoint.
 * The study ID must be extracted client-side (the case page is JS-rendered).
 * Use the bookmarklet to get the study ID, or pass it directly.
 */
export const fetchRadiopaediaStudy = action({
  args: { studyId: v.string() },
  handler: async (_ctx, args) => {
    const jsonRes = await fetch(
      `https://radiopaedia.org/studies/${args.studyId}/annotated_viewer_json?lang=us`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json, */*;q=0.01",
        },
      }
    );
    if (!jsonRes.ok)
      throw new Error(`Failed to fetch study: ${jsonRes.status}`);
    const data = await jsonRes.json();

    const label =
      data.study?.caption || data.study?.modality || `Study ${args.studyId}`;
    const urls: string[] = [];

    for (const series of data.study?.series || []) {
      const encodings = series.encodings?.thumbnailed_files;
      if (!encodings || !Array.isArray(encodings)) continue;

      const frames: Array<{ id: number }> = series.frames || [];

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const encoding = encodings[i] || encodings[0];

        const filename =
          encoding?.big_gallery ||
          encoding?.gallery ||
          encoding?.original ||
          encoding?.medium;

        if (filename && frame.id) {
          urls.push(`${CDN_BASE}/${frame.id}/${filename}`);
        }
      }
    }

    if (urls.length === 0) {
      throw new Error("Study found but no image URLs extracted");
    }

    return { studyId: args.studyId, label, urls };
  },
});
