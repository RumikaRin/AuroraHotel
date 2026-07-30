import { pathToFileURL } from "node:url";
import { validateRestoreTarget } from "./backup-neon.mjs";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directUrl = process.env.DIRECT_URL;
  const environment = process.env.DATABASE_ENVIRONMENT;
  const confirmation = process.env.CONFIRM_RESTORE_DATABASE;
  if (!directUrl || !environment) {
    throw new Error("DIRECT_URL and DATABASE_ENVIRONMENT are required for restore");
  }
  const validated = validateRestoreTarget(directUrl, environment, confirmation);
  console.log(`Neon restore target validated for database: ${validated.database}`);
}
