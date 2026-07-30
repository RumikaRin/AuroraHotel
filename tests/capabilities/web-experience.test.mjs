import assert from "node:assert/strict";
import test from "node:test";
import { capability } from "../../src/capabilities/web-experience.mjs";

test("web-experience baseline declares its identity", () => {
  assert.equal(capability.id, "web-experience");
  assert.equal(capability.status, "baseline");
});
