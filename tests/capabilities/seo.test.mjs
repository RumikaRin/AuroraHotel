import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/seo.mjs";

test("seo baseline declares its identity", () => {
  assert.equal(capability.id, "seo");
  assert.equal(capability.status, "baseline");
});
