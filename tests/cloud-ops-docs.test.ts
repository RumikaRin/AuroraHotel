import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Cloud operations runbooks", () => {
  it("documents Vercel, Neon, and Blob deployment procedures and rollback steps", async () => {
    const [deploy, backup] = await Promise.all([
      readFile("docs/ops/cloud-deployment-runbook.md", "utf8"),
      readFile("docs/ops/neon-backup-restore-runbook.md", "utf8"),
    ]);
    assert.match(deploy, /Vercel/);
    assert.match(deploy, /Neon/);
    assert.match(deploy, /aurora-media-private/);
    assert.match(deploy, /aurora-media-public/);
    assert.match(backup, /DIRECT_URL/);
    assert.match(backup, /db:backup/);
    assert.match(backup, /db:restore/);
  });
});
