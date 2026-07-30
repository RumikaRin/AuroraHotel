import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/webhooks.mjs";

test("webhooks baseline declares its identity", () => {
  assert.equal(capability.id, "webhooks");
  assert.equal(capability.status, "baseline");
});
