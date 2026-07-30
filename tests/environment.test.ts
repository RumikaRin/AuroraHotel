import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  readMediaEnvironment,
  readRuntimeEnvironment,
} from "../src/server/config/environment.ts";

describe("Cloud environment parsing", () => {
  it("parses valid runtime environment", () => {
    const validDevelopmentEnv = {
      NODE_ENV: "development",
      DATABASE_ENVIRONMENT: "development",
      DATABASE_URL:
        "postgresql://aurora_development_app:s@ep-dev-pooler.us-east-2.aws.neon.tech/aurora_development?sslmode=require",
      DIRECT_URL:
        "postgresql://aurora_development_app:s@ep-dev.us-east-2.aws.neon.tech/aurora_development?sslmode=require",
    };

    assert.equal(
      readRuntimeEnvironment(validDevelopmentEnv).databaseEnvironment,
      "development",
    );

    assert.throws(() =>
      readRuntimeEnvironment({
        ...validDevelopmentEnv,
        DATABASE_ENVIRONMENT: "production",
      }),
    );
  });

  it("parses valid media environment and rejects invalid tokens or origins", () => {
    assert.throws(() =>
      readMediaEnvironment({
        MEDIA_PROVIDER: "vercel-blob",
        BLOB_PRIVATE_READ_WRITE_TOKEN: "",
        BLOB_PUBLIC_READ_WRITE_TOKEN: "",
        NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN:
          "https://private.private.blob.vercel-storage.com",
        NEXT_PUBLIC_MEDIA_ORIGIN:
          "https://public.public.blob.vercel-storage.com",
      }),
    );
  });
});
