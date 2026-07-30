import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateCloudConfig } from "../../scripts/check-cloud-env.mjs";

describe("Cloud production & preview configuration test", () => {
  it("validates valid preview and production environments", () => {
    const previewEnv = {
      DATABASE_ENVIRONMENT: "preview",
      DATABASE_URL: "postgresql://aurora_preview_app:pass@ep-preview-pooler.us-east-2.aws.neon.tech/aurora_preview?sslmode=require",
      DIRECT_URL: "postgresql://aurora_preview_app:pass@ep-preview.us-east-2.aws.neon.tech/aurora_preview?sslmode=require",
      MEDIA_PROVIDER: "vercel-blob",
      BLOB_PRIVATE_READ_WRITE_TOKEN: "vercel_blob_private_token_1234567890",
      BLOB_PUBLIC_READ_WRITE_TOKEN: "vercel_blob_public_token_1234567890",
      NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN: "https://abc.private.blob.vercel-storage.com",
      NEXT_PUBLIC_MEDIA_ORIGIN: "https://xyz.public.blob.vercel-storage.com",
      CRON_SECRET: "cron_secret_at_least_32_characters_long_secret",
    };

    const res = validateCloudConfig(previewEnv as unknown as NodeJS.ProcessEnv);
    assert.equal(res.valid, true);
  });

  it("rejects configuration when database environment or origin is invalid", () => {
    assert.throws(
      () => validateCloudConfig({ DATABASE_ENVIRONMENT: "invalid" } as unknown as NodeJS.ProcessEnv),
      /Invalid cloud environment/i,
    );
  });
});
