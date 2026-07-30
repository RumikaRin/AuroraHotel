import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/email.mjs";

test("email baseline declares its identity", () => {
  assert.equal(capability.id, "email");
  assert.equal(capability.status, "baseline");
});
