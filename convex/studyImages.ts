import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
const sourceTypeValidator = v.union(
  v.literal("differentialPattern"),
  v.literal("mnemonic"),
  v.literal("chapman"),
  v.literal("rapidCase")
);

/**
 * Resolve an image record to a displayable URL.
 * Centralises storage-provider logic so listBySource (and future queries)
 * don't need inline branching. Extensible for "s3" in Phase 3.
 */
async function resolveImageUrl(
  ctx: {
    storage: { getUrl(id: Id<"_storage">): Promise<string | null> };
    // Env access available in queries/mutations via process.env in Convex
  },
  image: {
    storageId?: Id<"_storage">;
    externalUrl?: string;
    s3Key?: string;
    storageProvider?: "convex" | "external" | "s3";
  }
): Promise<string | undefined> {
  const provider =
    image.storageProvider ?? (image.storageId ? "convex" : "external");

  switch (provider) {
    case "convex":
      return (image.storageId
        ? (await ctx.storage.getUrl(image.storageId)) ?? undefined
        : undefined);
    case "external":
      return image.externalUrl ?? undefined;
    case "s3": {
      // Construct public URL from S3_PUBLIC_URL env var + s3Key
      if (image.s3Key) {
        const baseUrl = process.env.S3_PUBLIC_URL;
        if (baseUrl) {
          return `${baseUrl.replace(/\/$/, "")}/${image.s3Key}`;
        }
      }
      // Fallback to externalUrl if s3Key or env var not available
      return image.externalUrl ?? undefined;
    }
    default:
      return undefined;
  }
}

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
    s3Key: v.optional(v.string()),
    s3Bucket: v.optional(v.string()),
    storageProvider: v.optional(v.union(
      v.literal("convex"),
      v.literal("external"),
      v.literal("s3")
    )),
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

    // Determine storage provider from args
    const storageProvider = args.storageProvider
      ?? (args.s3Key ? "s3" : args.storageId ? "convex" : "external");

    return await ctx.db.insert("studyImages", {
      sourceType: args.sourceType,
      sourceId: args.sourceId,
      storageId: args.storageId,
      externalUrl: args.externalUrl,
      s3Key: args.s3Key,
      s3Bucket: args.s3Bucket,
      storageProvider,
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
    // Fetch manifests for this source
    const manifests = await ctx.db
      .query("studyManifests")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();

    // Track which caseGroups are covered by manifests (for deduplication)
    const manifestCaseGroups = new Set(manifests.map((m) => m.caseGroup));

    // Fetch individual image rows
    const images = await ctx.db
      .query("studyImages")
      .withIndex("by_source", (q) =>
        q.eq("sourceType", args.sourceType).eq("sourceId", args.sourceId)
      )
      .collect();

    // Resolve individual images, skipping those superseded by manifests
    const individualResults = await Promise.all(
      images
        .filter((img) => !img.caseGroup || !manifestCaseGroups.has(img.caseGroup))
        .map(async (img) => {
          const url = await resolveImageUrl(ctx, img);
          return {
            _id: img._id as string,
            url,
            caption: img.caption,
            caseGroup: img.caseGroup,
            attribution: img.attribution,
            sortOrder: img.sortOrder,
            _source: "individual" as const,
          };
        })
    );

    // Expand manifest slices into the same shape
    const manifestResults = await Promise.all(
      manifests.flatMap((manifest) =>
        manifest.slices.map(async (slice) => {
          // For convex-stored slices within manifests, resolve the URL
          let url = slice.url;
          if (slice.storageId && manifest.storageProvider === "convex") {
            url = (await ctx.storage.getUrl(slice.storageId)) ?? slice.url;
          }
          return {
            _id: manifest._id as string,
            url,
            caption: slice.caption,
            caseGroup: manifest.caseGroup,
            attribution: manifest.attribution,
            sortOrder: slice.sortOrder,
            _source: "manifest" as const,
            _manifestId: manifest._id as string,
            _sliceIndex: slice.sortOrder,
          };
        })
      )
    );

    const all = [...individualResults, ...manifestResults];
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
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

export const addManifest = mutation({
  args: {
    sourceType: sourceTypeValidator,
    sourceId: v.string(),
    caseGroup: v.string(),
    urls: v.array(v.string()),
    captionPrefix: v.optional(v.string()),
    attribution: v.optional(v.string()),
    storageProvider: v.optional(v.union(
      v.literal("convex"),
      v.literal("external"),
      v.literal("s3")
    )),
  },
  handler: async (ctx, args) => {
    const slices = args.urls.map((url, i) => ({
      url,
      caption: args.captionPrefix
        ? `${args.captionPrefix} [${i + 1}]`
        : `Slice ${i + 1}`,
      sortOrder: i,
    }));

    return await ctx.db.insert("studyManifests", {
      sourceType: args.sourceType,
      sourceId: args.sourceId,
      caseGroup: args.caseGroup,
      attribution: args.attribution,
      storageProvider: args.storageProvider ?? "external",
      slices,
      createdAt: Date.now(),
    });
  },
});

export const deleteManifest = mutation({
  args: { id: v.id("studyManifests") },
  handler: async (ctx, args) => {
    const manifest = await ctx.db.get(args.id);
    if (!manifest) return;
    // Delete any Convex storage blobs referenced in slices
    for (const slice of manifest.slices) {
      if (slice.storageId) {
        await ctx.storage.delete(slice.storageId);
      }
    }
    await ctx.db.delete(args.id);
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
        storageProvider: "external",
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
      // Count individual image rows
      const images = await ctx.db
        .query("studyImages")
        .withIndex("by_source", (q) =>
          q.eq("sourceType", args.sourceType).eq("sourceId", sourceId)
        )
        .collect();

      // Count manifest slices
      const manifests = await ctx.db
        .query("studyManifests")
        .withIndex("by_source", (q) =>
          q.eq("sourceType", args.sourceType).eq("sourceId", sourceId)
        )
        .collect();

      // Deduplicate: exclude individual rows whose caseGroup is covered by a manifest
      const manifestCaseGroups = new Set(manifests.map((m) => m.caseGroup));
      const individualCount = images.filter(
        (img) => !img.caseGroup || !manifestCaseGroups.has(img.caseGroup)
      ).length;
      const manifestSliceCount = manifests.reduce(
        (sum, m) => sum + m.slices.length, 0
      );

      const total = individualCount + manifestSliceCount;
      if (total > 0) {
        counts[sourceId] = total;
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
