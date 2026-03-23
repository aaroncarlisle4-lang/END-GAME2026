import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

type SourceType = "differentialPattern" | "mnemonic" | "chapman" | "rapidCase";

export function useImageUpload(sourceType: SourceType, sourceId: string) {
  const generateUploadUrl = useMutation(api.studyImages.generateUploadUrl);
  const generateS3UploadUrl = useAction(api.s3Storage.generateS3UploadUrl);
  const addImage = useMutation(api.studyImages.addImage);
  const batchAddImages = useMutation(api.studyImages.batchAddImages);
  const addManifest = useMutation(api.studyImages.addManifest);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  async function uploadFile(file: File, caseGroup?: string) {
    setError(null);
    setIsUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await addImage({
        sourceType,
        sourceId,
        storageId,
        caption: file.name,
        caseGroup,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadFileToS3(file: File, caseGroup?: string) {
    setError(null);
    setIsUploading(true);
    try {
      const { uploadUrl, s3Key, s3Bucket } = await generateS3UploadUrl({
        filename: file.name,
        contentType: file.type,
        prefix: `${sourceType}/${sourceId}`,
      });

      // PUT directly to S3 presigned URL
      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResult.ok) {
        throw new Error(`S3 upload failed: ${uploadResult.status}`);
      }

      // Record metadata in Convex
      await addImage({
        sourceType,
        sourceId,
        s3Key,
        s3Bucket,
        storageProvider: "s3",
        caption: file.name,
        caseGroup,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "S3 upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function addByUrl(
    externalUrl: string,
    caption?: string,
    caseGroup?: string
  ) {
    setError(null);
    setIsUploading(true);
    try {
      await addImage({
        sourceType,
        sourceId,
        externalUrl,
        caption,
        caseGroup,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add URL");
    } finally {
      setIsUploading(false);
    }
  }

  async function addByUrlBatch(
    urls: string[],
    caseGroup: string,
    captionPrefix?: string,
    attribution?: string
  ) {
    setError(null);
    setIsUploading(true);
    setBatchProgress({ done: 0, total: urls.length });
    try {
      const result = await batchAddImages({
        sourceType,
        sourceId,
        urls,
        caseGroup,
        captionPrefix,
        attribution,
      });
      setBatchProgress({ done: result.inserted, total: urls.length });
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch import failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setBatchProgress(null), 2000);
    }
  }

  async function addByUrlBatchAsManifest(
    urls: string[],
    caseGroup: string,
    captionPrefix?: string,
    attribution?: string
  ) {
    setError(null);
    setIsUploading(true);
    setBatchProgress({ done: 0, total: urls.length });
    try {
      await addManifest({
        sourceType,
        sourceId,
        caseGroup,
        urls,
        captionPrefix,
        attribution,
      });
      setBatchProgress({ done: urls.length, total: urls.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Manifest import failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setBatchProgress(null), 2000);
    }
  }

  return {
    uploadFile,
    uploadFileToS3,
    addByUrl,
    addByUrlBatch,
    addByUrlBatchAsManifest,
    isUploading,
    error,
    batchProgress,
  };
}
