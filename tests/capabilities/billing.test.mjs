import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/billing.mjs";

test("billing baseline declares its identity", () => {
  assert.equal(capability.id, "billing");
  assert.equal(capability.status, "baseline");
});
