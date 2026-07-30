import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { resetE2eDatabase } from "../scripts/reset-e2e-db.mjs";

describe("resetE2eDatabase", () => {
  it("creates an empty database file before running migrations", async () => {
    const root = await mkdtemp(join(tmpdir(), "starter-e2e-db-"));
    const prismaDir = join(root, "prisma");
    await mkdir(prismaDir, { recursive: true });

    const commands: string[] = [];
    const run = (cmd: string): string => {
      commands.push(cmd);
      return "";
    };

    await resetE2eDatabase({
      root,
      databaseUrl: "file:./e2e.db",
      run,
    });

    const dbFile = join(prismaDir, "e2e.db");
    const exists = await readFile(dbFile).then(
      () => true,
      () => false,
    );

    assert.equal(exists, true);
    assert.deepEqual(commands, [
      "npx prisma migrate deploy",
      "npx prisma db seed",
    ]);

    await rm(root, { recursive: true, force: true });
  });

  it("rejects non-E2E database URLs before deletion", async () => {
    const commands: string[] = [];
    const run = (cmd: string): string => {
      commands.push(cmd);
      return "";
    };

    await assert.rejects(
      async () => {
        await resetE2eDatabase({
          root: "/tmp",
          databaseUrl: "file:./dev.db",
          run,
        });
      },
      (err: Error) => {
        assert.match(err.message, /Refusing to reset/);
        return true;
      },
    );

    assert.equal(commands.length, 0);
  });
});
