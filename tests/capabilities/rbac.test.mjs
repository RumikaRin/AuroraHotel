import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/rbac.mjs";

test("rbac baseline declares its identity", () => {
  assert.equal(capability.id, "rbac");
  assert.equal(capability.status, "baseline");
});
