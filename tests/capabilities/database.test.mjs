import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/database.mjs";

test("database baseline declares its identity", () => {
  assert.equal(capability.id, "database");
  assert.equal(capability.status, "baseline");
});
