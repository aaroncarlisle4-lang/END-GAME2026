"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Migrate existing Convex _storage images to Cloudflare R2.
 *
 * For each studyImage with storageProvider="convex":
 *   1. Fetch the blob from Convex storage via its temporary URL
 *   2. PUT it to R2 under the same key structure as new uploads
 *   3. Update the Convex record: set s3Key/s3Bucket/storageProvider="s3"
 *   4. Delete the Convex storage blob
 *
 * Run in batches to avoid action timeout (10 min limit).
 * Call repeatedly until result.migrated === 0.
 */
export const migrateConvexImagesToR2 = action({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ migrated: number; errors: string[] }> => {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION ?? "auto";
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;

    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw new Error("R2 not configured. Set S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY.");
    }

    const s3 = new S3Client({
      region,
      ...(endpoint ? { endpoint } : {}),
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: !!endpoint,
    });

    const images = await ctx.runQuery(internal.studyImages.getConvexStoredImages, {
      batchSize: args.batchSize ?? 20,
    });

    const errors: string[] = [];
    let migrated = 0;

    for (const image of images) {
      if (!image.storageId) continue;

      try {
        // Get temporary Convex download URL via internal query
        const convexUrl = await ctx.runQuery(internal.studyImages.getStorageUrl, {
          storageId: image.storageId,
        });
        if (!convexUrl) {
          errors.push(`No URL for storageId ${image.storageId}`);
          continue;
        }

        // Fetch the blob
        const res = await fetch(convexUrl);
        if (!res.ok) {
          errors.push(`Failed to fetch blob for ${image._id}: ${res.status}`);
          continue;
        }
        const blob = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") ?? "image/jpeg";

        // Build R2 key
        const hex = [...Array(8)]
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("");
        const safeName = (image.caption ?? "image").replace(/[^a-zA-Z0-9._-]/g, "_");
        const s3Key = `${image.sourceType}/${image.sourceId}/${Date.now()}-${hex}-${safeName}.jpg`;

        // Upload to R2
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: s3Key,
            Body: Buffer.from(blob),
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        );

        // Update Convex record + delete old blob
        await ctx.runMutation(internal.studyImages.markImageMigratedToR2, {
          imageId: image._id,
          s3Key,
          s3Bucket: bucket,
          oldStorageId: image.storageId,
        });

        migrated++;
      } catch (e) {
        errors.push(`Error migrating ${image._id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return { migrated, errors };
  },
});
