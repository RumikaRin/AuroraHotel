import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/authentication.mjs";

test("authentication baseline declares its identity", () => {
  assert.equal(capability.id, "authentication");
  assert.equal(capability.status, "baseline");
});
