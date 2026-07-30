import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { processAndNormalizeImage, VercelBlobStoreAdapter } from "../../src/server/storage/blob-adapter.ts";

describe("Vercel Blob SDK & Sharp Image Processing Adapter", () => {
  it("validates upload options and mime type", () => {
    const adapter = new VercelBlobStoreAdapter({
      privateToken: "test_private_token",
      publicToken: "test_public_token",
    });

    assert.equal(adapter.isConfigured(), true);
  });

  it("decodes and normalizes raw image bytes using Sharp", async () => {
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const normalized = await processAndNormalizeImage(pngBuffer);
    assert.ok(normalized.bytes.length > 0);
    assert.equal(normalized.format, "webp");
    assert.equal(normalized.width, 1);
    assert.equal(normalized.height, 1);
  });
});
