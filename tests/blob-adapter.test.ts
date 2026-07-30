import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseBlobStoreOrigin,
  validateUploadOptions,
} from "../src/server/storage/blob-adapter.ts";

describe("Vercel Blob storage adapter", () => {
  it("validates store origins for private and public stores", () => {
    assert.equal(
      parseBlobStoreOrigin("https://abc.private.blob.vercel-storage.com"),
      "private",
    );
    assert.equal(
      parseBlobStoreOrigin("https://xyz.public.blob.vercel-storage.com"),
      "public",
    );
    assert.throws(
      () => parseBlobStoreOrigin("https://evil-storage.com"),
      /Invalid Blob store origin/i,
    );
  });

  it("validates file mime types and max size bounds", () => {
    assert.equal(
      validateUploadOptions({
        contentType: "image/jpeg",
        sizeBytes: 2 * 1024 * 1024, // 2MB
      }).valid,
      true,
    );

    assert.throws(
      () =>
        validateUploadOptions({
          contentType: "application/x-executable",
          sizeBytes: 1024,
        }),
      /Invalid file content-type/i,
    );

    assert.throws(
      () =>
        validateUploadOptions({
          contentType: "image/png",
          sizeBytes: 20 * 1024 * 1024, // 20MB > 10MB limit
        }),
      /File size exceeds maximum allowed/i,
    );
  });
});
