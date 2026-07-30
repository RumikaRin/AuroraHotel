import { ValidationError } from "../../domain/errors.ts";

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function parseBlobStoreOrigin(origin: string): "private" | "public" {
  if (origin.endsWith(".private.blob.vercel-storage.com")) {
    return "private";
  }
  if (origin.endsWith(".public.blob.vercel-storage.com")) {
    return "public";
  }
  throw new ValidationError("Invalid Blob store origin");
}

export function validateUploadOptions(options: {
  contentType: string;
  sizeBytes: number;
}) {
  if (!ALLOWED_MIME_TYPES.has(options.contentType)) {
    throw new ValidationError(
      `Invalid file content-type: ${options.contentType}. Allowed types: ${Array.from(
        ALLOWED_MIME_TYPES,
      ).join(", ")}`,
    );
  }

  if (options.sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError(
      `File size exceeds maximum allowed limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
    );
  }

  return { valid: true };
}
