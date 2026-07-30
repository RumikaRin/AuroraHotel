import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/session-registry.mjs";

test("session-registry baseline declares its identity", () => {
  assert.equal(capability.id, "session-registry");
  assert.equal(capability.status, "baseline");
});
