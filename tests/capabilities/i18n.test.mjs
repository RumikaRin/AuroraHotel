import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/i18n.mjs";

test("i18n baseline declares its identity", () => {
  assert.equal(capability.id, "i18n");
  assert.equal(capability.status, "baseline");
});
