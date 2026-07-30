import { execSync } from "node:child_process";
import { closeSync, openSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resetE2eDatabase({
  root,
  databaseUrl,
  run = (cmd, opts) => execSync(cmd, { ...opts, stdio: "inherit" }),
}) {
  if (!/^file:.*e2e[^/\\]*\.db$/.test(databaseUrl)) {
    throw new Error(
      `Refusing to reset "${databaseUrl}": this script only rebuilds a dedicated e2e SQLite file (file:./e2e.db).`,
    );
  }

  const dbFile = path.join(root, "prisma", databaseUrl.replace(/^file:/, ""));

  for (const suffix of ["", "-journal"]) {
    rmSync(`${dbFile}${suffix}`, { force: true });
  }

  // Ensure empty db file exists before prisma migrate deploy
  const fd = openSync(dbFile, "a");
  closeSync(fd);

  const env = { ...process.env, DATABASE_URL: databaseUrl };
  run("npx prisma migrate deploy", { cwd: root, env });
  run("npx prisma db seed", { cwd: root, env });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const databaseUrl = process.env.DATABASE_URL ?? "file:./e2e.db";
  await resetE2eDatabase({ root, databaseUrl });
}
