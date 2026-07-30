import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import { assertNeonPair } from "../src/server/config/database-identity.ts";

const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
} else {
  dotenv.config();
}

export function validateCloudConfig(env = process.env) {
  const envName = env.DATABASE_ENVIRONMENT || "development";
  if (!["development", "test", "preview", "production"].includes(envName)) {
    throw new Error(`Invalid cloud environment: ${envName}`);
  }

  const isPlaceholderUrl = (url) => !url || url.includes("YOUR_") || url.includes("example");

  if (env.DATABASE_URL && env.DIRECT_URL && !isPlaceholderUrl(env.DATABASE_URL) && !isPlaceholderUrl(env.DIRECT_URL)) {
    assertNeonPair(env.DATABASE_URL, env.DIRECT_URL, envName);
  }

  if (env.MEDIA_PROVIDER === "vercel-blob" && env.BLOB_PRIVATE_READ_WRITE_TOKEN && !env.BLOB_PRIVATE_READ_WRITE_TOKEN.includes("YOUR_")) {
    if (!env.BLOB_PRIVATE_READ_WRITE_TOKEN || !env.BLOB_PUBLIC_READ_WRITE_TOKEN) {
      throw new Error("Missing Vercel Blob read/write tokens");
    }
    if (!env.NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN?.endsWith(".private.blob.vercel-storage.com")) {
      throw new Error("Invalid NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN domain");
    }
    if (!env.NEXT_PUBLIC_MEDIA_ORIGIN?.endsWith(".public.blob.vercel-storage.com")) {
      throw new Error("Invalid NEXT_PUBLIC_MEDIA_ORIGIN domain");
    }
  }

  if (env.CRON_SECRET && !env.CRON_SECRET.includes("example") && env.CRON_SECRET.length < 32) {
    throw new Error("CRON_SECRET must be at least 32 characters long");
  }

  return { valid: true, environment: envName };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const res = validateCloudConfig(process.env);
    console.log(`Cloud preflight check passed for environment: ${res.environment}`);
  } catch (err) {
    console.error(`Cloud preflight check failed: ${err.message}`);
    process.exit(1);
  }
}
