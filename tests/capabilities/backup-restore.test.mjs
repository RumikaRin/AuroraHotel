import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/backup-restore.mjs";

test("backup-restore baseline declares its identity", () => {
  assert.equal(capability.id, "backup-restore");
  assert.equal(capability.status, "baseline");
});
