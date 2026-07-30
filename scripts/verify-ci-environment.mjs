import { pathToFileURL } from "node:url";
import { assertNeonPair } from "../src/server/config/database-identity.ts";

export function verifyCiEnvironment(env = process.env) {
  if (env.CI === "true" || env.CI === "1") {
    if (env.DATABASE_ENVIRONMENT !== "test") {
      throw new Error("CI environment isolation violation: DATABASE_ENVIRONMENT must be 'test'");
    }
    if (!env.DATABASE_URL || !env.DIRECT_URL) {
      throw new Error("CI environment isolation violation: DATABASE_URL and DIRECT_URL are required");
    }
    const pair = assertNeonPair(env.DATABASE_URL, env.DIRECT_URL, "test");
    if (pair.database !== "aurora_test") {
      throw new Error("CI environment isolation violation: Database must be aurora_test");
    }
    return { isolated: true, database: pair.database };
  }
  return { isolated: true, environment: env.DATABASE_ENVIRONMENT ?? "local" };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  verifyCiEnvironment(process.env);
  console.log("CI environment isolation: verified");
}
