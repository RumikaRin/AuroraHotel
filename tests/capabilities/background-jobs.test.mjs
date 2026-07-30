import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/background-jobs.mjs";

test("background-jobs baseline declares its identity", () => {
  assert.equal(capability.id, "background-jobs");
  assert.equal(capability.status, "baseline");
});
