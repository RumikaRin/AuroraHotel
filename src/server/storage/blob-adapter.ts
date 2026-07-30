import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { ValidationError } from "../../domain/errors.ts";

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
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

export async function processAndNormalizeImage(inputBuffer: Buffer | Uint8Array) {
  const image = sharp(inputBuffer, { failOn: "error", limitInputPixels: 6000 * 6000 });
  const metadata = await image.metadata();

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width > 6000 ||
    metadata.height > 6000 ||
    !["jpeg", "png", "webp", "avif"].includes(metadata.format || "")
  ) {
    throw new ValidationError("Invalid or unsupported image format / dimensions exceed 6000x6000");
  }

  const normalized = await image
    .rotate()
    .webp({ quality: 84, effort: 5 })
    .toBuffer();

  const sha256 = createHash("sha256").update(normalized).digest("hex");

  return {
    bytes: normalized,
    sha256,
    width: metadata.width,
    height: metadata.height,
    format: "webp",
    contentType: "image/webp",
  };
}

export class VercelBlobStoreAdapter {
  private privateToken: string;
  private publicToken: string;

  constructor(tokens?: { privateToken?: string; publicToken?: string }) {
    this.privateToken = tokens?.privateToken || process.env.BLOB_PRIVATE_READ_WRITE_TOKEN || "";
    this.publicToken = tokens?.publicToken || process.env.BLOB_PUBLIC_READ_WRITE_TOKEN || "";
  }

  isConfigured(): boolean {
    return Boolean(this.privateToken && this.publicToken && !this.privateToken.includes("YOUR_"));
  }

  async uploadPrivateQuarantine(pathname: string, body: Buffer | Uint8Array, contentType: string) {
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
    validateUploadOptions({ contentType, sizeBytes: buffer.length });
    if (!this.isConfigured()) {
      return {
        url: `https://quarantine.private.blob.vercel-storage.com/${pathname}`,
        pathname,
        etag: `etag-${Date.now()}`,
        size: buffer.length,
      };
    }

    return put(pathname, buffer, {
      access: "private",
      token: this.privateToken,
      contentType,
      addRandomSuffix: false,
    });
  }

  async publishToPublicStore(pathname: string, body: Buffer | Uint8Array) {
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
    if (!this.isConfigured()) {
      return {
        url: `https://public.public.blob.vercel-storage.com/${pathname}`,
        pathname,
        etag: `pub-etag-${Date.now()}`,
        size: buffer.length,
      };
    }

    return put(pathname, buffer, {
      access: "public",
      token: this.publicToken,
      contentType: "image/webp",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
  }

  async deleteBlobObject(urlOrPathname: string, store: "private" | "public") {
    const token = store === "private" ? this.privateToken : this.publicToken;
    if (!this.isConfigured()) return;
    await del(urlOrPathname, { token });
  }
}
