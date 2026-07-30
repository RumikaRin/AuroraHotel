import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/commerce.mjs";

test("commerce baseline declares its identity", () => {
  assert.equal(capability.id, "commerce");
  assert.equal(capability.status, "baseline");
});
