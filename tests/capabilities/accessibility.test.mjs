import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/accessibility.mjs";

test("accessibility baseline declares its identity", () => {
  assert.equal(capability.id, "accessibility");
  assert.equal(capability.status, "baseline");
});
