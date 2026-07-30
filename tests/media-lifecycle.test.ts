import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  determineMediaTargetStore,
  shouldCleanupTempFile,
} from "../src/server/storage/media-lifecycle.ts";

describe("Media lifecycle rules", () => {
  it("determines store based on visibility and attached state", () => {
    assert.equal(
      determineMediaTargetStore({ isPublic: false, attachedEntityId: null }),
      "private",
    );
    assert.equal(
      determineMediaTargetStore({ isPublic: true, attachedEntityId: "cat-1" }),
      "public",
    );
  });

  it("identifies expired temp files for daily cleanup", () => {
    const now = Date.now();
    const age25h = new Date(now - 25 * 60 * 60 * 1000);
    const age2h = new Date(now - 2 * 60 * 60 * 1000);

    assert.equal(
      shouldCleanupTempFile({ isPublic: false, createdAt: age25h, attachedEntityId: null }),
      true,
    );
    assert.equal(
      shouldCleanupTempFile({ isPublic: false, createdAt: age2h, attachedEntityId: null }),
      false,
    );
    assert.equal(
      shouldCleanupTempFile({ isPublic: false, createdAt: age25h, attachedEntityId: "cat-1" }),
      false,
    );
  });
});
