"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a presigned PUT URL for uploading an image to S3-compatible storage.
 *
 * Required environment variables:
 *   S3_ACCESS_KEY    — IAM access key (scoped to bucket PutObject/GetObject)
 *   S3_SECRET_KEY    — IAM secret key
 *   S3_BUCKET        — Bucket name (e.g. "radquiz-images")
 *   S3_REGION        — AWS region or "auto" for R2
 *   S3_ENDPOINT      — Custom endpoint URL (required for R2/MinIO, optional for AWS)
 *   S3_PUBLIC_URL    — Public base URL for reads (e.g. "https://pub-xxx.r2.dev")
 *
 * Returns { uploadUrl, s3Key, s3Bucket, publicUrl } so the client can:
 *   1. PUT the file to uploadUrl
 *   2. Call addImage with s3Key + s3Bucket + storageProvider: "s3"
 */
export const generateS3UploadUrl = action({
  args: {
    filename: v.string(),
    contentType: v.string(),
    prefix: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION ?? "auto";
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const publicUrl = process.env.S3_PUBLIC_URL;

    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3 storage not configured. Set S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY environment variables."
      );
    }

    const client = new S3Client({
      region,
      ...(endpoint ? { endpoint } : {}),
      credentials: { accessKeyId, secretAccessKey },
      // R2 requires this for path-style access
      forcePathStyle: !!endpoint,
    });

    // Generate a unique key: prefix/timestamp-randomhex-filename
    const prefix = args.prefix ?? "images";
    const hex = [...Array(8)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
    const safeName = args.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const s3Key = `${prefix}/${Date.now()}-${hex}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: args.contentType,
    });

    // Presigned URL valid for 10 minutes
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

    return {
      uploadUrl,
      s3Key,
      s3Bucket: bucket,
      publicUrl: publicUrl
        ? `${publicUrl.replace(/\/$/, "")}/${s3Key}`
        : undefined,
    };
  },
});
