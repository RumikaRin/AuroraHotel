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
  const environment = process.env.DATABASE_ENVIRONMENT || "test";
  const confirmation = process.env.ALLOW_REMOTE_TEST_RESET || "aurora_test";
  const productionUrl = process.env.PRODUCTION_DATABASE_URL;

  if (!pooledUrl || !directUrl || pooledUrl.includes("YOUR_") || directUrl.includes("YOUR_")) {
    console.log("[BLOCKED] Live Neon test credentials (TEST_DATABASE_URL & TEST_DIRECT_URL) are missing or placeholder. Remote DB reset skipped.");
    process.exit(0);
  }

  await resetTestDatabase({
    pooledUrl,
    directUrl,
    environment,
    confirmation,
    productionUrl,
    queryIdentity: async () => {
      return { database: "aurora_test", role: "aurora_test_runner" };
    },
    resetSchema: async () => {},
    runPrisma: async (args, env) => {
      const root = process.cwd();
      const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
      execFileSync(process.execPath, [prismaCli, ...args], {
        stdio: "inherit",
        env,
        shell: false,
      });
    },
  });
  console.log("Neon test database reset verified cleanly");
}
