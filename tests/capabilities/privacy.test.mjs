import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/privacy.mjs";

test("privacy baseline declares its identity", () => {
  assert.equal(capability.id, "privacy");
  assert.equal(capability.status, "baseline");
});
