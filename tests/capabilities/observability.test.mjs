import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/observability.mjs";

test("observability baseline declares its identity", () => {
  assert.equal(capability.id, "observability");
  assert.equal(capability.status, "baseline");
});
