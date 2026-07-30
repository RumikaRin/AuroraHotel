import { z } from "zod";
import { assertNeonPair, type DatabaseEnvironment } from "./database-identity.ts";

const databaseEnvSchema = z.enum([
  "development",
  "test",
  "preview",
  "production",
  "restore-test",
]);

const runtimeEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_ENVIRONMENT: databaseEnvSchema,
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
});

const mediaEnvSchema = z.object({
  MEDIA_PROVIDER: z.enum(["vercel-blob", "local", "in-memory", "test"]),
  BLOB_PRIVATE_READ_WRITE_TOKEN: z.string().min(1),
  BLOB_PUBLIC_READ_WRITE_TOKEN: z.string().min(1),
  NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://") && url.endsWith(".private.blob.vercel-storage.com"), {
      message: "Must be HTTPS origin ending in .private.blob.vercel-storage.com",
    }),
  NEXT_PUBLIC_MEDIA_ORIGIN: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://") && url.endsWith(".public.blob.vercel-storage.com"), {
      message: "Must be HTTPS origin ending in .public.blob.vercel-storage.com",
    }),
});

export function readRuntimeEnvironment(source: Record<string, string | undefined>) {
  const parsed = runtimeEnvSchema.parse(source);
  const identity = assertNeonPair(
    parsed.DATABASE_URL,
    parsed.DIRECT_URL,
    parsed.DATABASE_ENVIRONMENT as DatabaseEnvironment,
  );
  return {
    nodeEnv: parsed.NODE_ENV,
    databaseEnvironment: parsed.DATABASE_ENVIRONMENT as DatabaseEnvironment,
    databaseUrl: parsed.DATABASE_URL,
    directUrl: parsed.DIRECT_URL,
    identity,
  };
}

export function readMediaEnvironment(source: Record<string, string | undefined>) {
  const parsed = mediaEnvSchema.parse(source);
  if (
    parsed.BLOB_PRIVATE_READ_WRITE_TOKEN === parsed.BLOB_PUBLIC_READ_WRITE_TOKEN
  ) {
    throw new Error("Private and public Blob tokens must differ");
  }
  return {
    mediaProvider: parsed.MEDIA_PROVIDER,
    privateBlobToken: parsed.BLOB_PRIVATE_READ_WRITE_TOKEN,
    publicBlobToken: parsed.BLOB_PUBLIC_READ_WRITE_TOKEN,
    privateBlobOrigin: parsed.NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN,
    publicMediaOrigin: parsed.NEXT_PUBLIC_MEDIA_ORIGIN,
  };
}
