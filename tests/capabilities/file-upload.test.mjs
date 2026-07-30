import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/file-upload.mjs";

test("file-upload baseline declares its identity", () => {
  assert.equal(capability.id, "file-upload");
  assert.equal(capability.status, "baseline");
});
