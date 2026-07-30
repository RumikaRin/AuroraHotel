import { pathToFileURL } from "node:url";
import { parseDatabaseIdentity } from "../src/server/config/database-identity.ts";

export function validateBackupTarget(directUrl, environment) {
  const parsed = parseDatabaseIdentity(directUrl);
  return { database: parsed.database, role: parsed.role, environment };
}

export function validateRestoreTarget(directUrl, environment, confirmation) {
  if (environment === "production") {
    throw new Error("Refusing restore to production database environment");
  }
  const parsed = parseDatabaseIdentity(directUrl);
  if (confirmation !== parsed.database) {
    throw new Error("Restore confirmation database name mismatch");
  }
  return { database: parsed.database, role: parsed.role, environment };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directUrl = process.env.DIRECT_URL;
  const environment = process.env.DATABASE_ENVIRONMENT;
  if (!directUrl || !environment) {
    throw new Error("DIRECT_URL and DATABASE_ENVIRONMENT are required for backup");
  }
  const validated = validateBackupTarget(directUrl, environment);
  console.log(`Neon backup initialized for database: ${validated.database}`);
}
