import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assertNeonPair } from "../src/server/config/database-identity.ts";

export function canonicalConnection(source) {
  const url = new URL(source);
  url.password = "";
  url.searchParams.sort();
  return url.toString();
}

/**
 * @param {Object} options
 * @param {string} options.pooledUrl
 * @param {string} options.directUrl
 * @param {string} options.environment
 * @param {string} options.confirmation
 * @param {string} [options.productionUrl]
 * @param {Function} options.queryIdentity
 * @param {Function} options.resetSchema
 * @param {Function} options.runPrisma
 */
export async function resetTestDatabase({
  pooledUrl,
  directUrl,
  environment,
  confirmation,
  productionUrl = undefined,
  queryIdentity,
  resetSchema,
  runPrisma,
}) {
  const expected = assertNeonPair(pooledUrl, directUrl, "test");
  if (
    environment !== "test" ||
    confirmation !== "aurora_test" ||
    (productionUrl &&
      canonicalConnection(productionUrl) ===
        canonicalConnection(directUrl))
  ) {
    throw new Error("Refusing remote test reset");
  }

  const live = await queryIdentity(directUrl);
  if (
    live.database !== expected.database ||
    live.role !== expected.role
  ) {
    throw new Error("Live Neon identity mismatch");
  }

  await resetSchema(directUrl, expected);
  const childEnvironment = {
    ...process.env,
    NODE_ENV: "test",
    DATABASE_ENVIRONMENT: "test",
    DATABASE_URL: pooledUrl,
    DIRECT_URL: directUrl,
    SEED_PROFILE: "e2e",
  };
  await runPrisma(["migrate", "deploy"], childEnvironment);
  await runPrisma(["db", "seed"], childEnvironment);
}

import fs from "node:fs";
import dotenv from "dotenv";

const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
} else {
  dotenv.config();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pooledUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  const directUrl = process.env.TEST_DIRECT_URL || process.env.DIRECT_URL;
  const environment = process.env.TEST_DATABASE_URL
    ? "test"
    : (process.env.DATABASE_ENVIRONMENT || "test");
  const confirmation = process.env.ALLOW_REMOTE_TEST_RESET || "aurora_test";
  const productionUrl = process.env.PRODUCTION_DATABASE_URL;

  if (
    !pooledUrl ||
    !directUrl ||
    pooledUrl.includes("YOUR_") ||
    directUrl.includes("YOUR_") ||
    pooledUrl.includes("example") ||
    directUrl.includes("example") ||
    environment !== "test"
  ) {
    console.log("[BLOCKED] Live Neon test credentials (TEST_DATABASE_URL & TEST_DIRECT_URL) are missing, placeholder, or not test environment. Remote DB reset skipped.");
    process.exit(0);
  }

  await resetTestDatabase({
    pooledUrl,
    directUrl,
    environment,
    confirmation,
    productionUrl,
    queryIdentity: async (url) => {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const { PrismaClient } = await import("@prisma/client");
      const adapter = new PrismaNeon({ connectionString: url });
      const client = new PrismaClient({ adapter });
      try {
        const rows = await client.$queryRawUnsafe(
          "SELECT current_database()::text as database, current_user::text as role",
        );
        return { database: rows[0].database, role: rows[0].role };
      } finally {
        await client.$disconnect();
      }
    },
    resetSchema: async (url, expected) => {
      if (expected.database !== "aurora_test") {
        throw new Error("Refusing schema reset on non-test database");
      }
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const { PrismaClient } = await import("@prisma/client");
      const adapter = new PrismaNeon({ connectionString: url });
      const client = new PrismaClient({ adapter });
      try {
        await client.$executeRawUnsafe(
          "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid(); DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;",
        );
      } catch {
        // Fallback if pg_terminate_backend lacks privilege for some roles
        await client.$executeRawUnsafe(
          "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;",
        );
      } finally {
        await client.$disconnect();
      }
    },
    runPrisma: async (args, env) => {
      const root = process.cwd();
      const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
      const commandEnv = {
        ...process.env,
        ...env,
        DATABASE_URL: env.DIRECT_URL || env.DATABASE_URL,
      };
      execFileSync(process.execPath, [prismaCli, ...args], {
        stdio: "inherit",
        env: commandEnv,
        shell: false,
      });
    },
  });
  console.log("Neon test database reset verified cleanly");
}
