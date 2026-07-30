import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import { verifyDesignLock } from "../scripts/verify-design-lock.mjs";

describe("Aurora design lock", () => {
  it("binds locked design.md to the approved system spec", async () => {
    const result = await verifyDesignLock(process.cwd());
    assert.equal(result.status, "locked");
    assert.match(result.approvalSha256, /^[a-f0-9]{64}$/);
    assert.equal(result.actualSpecSha256, result.approvalSha256);
    const design = await readFile("design.md", "utf8");
    assert.match(design, /Cormorant Garamond/);
    assert.match(design, /Manrope/);
    assert.doesNotMatch(design, /Status: DRAFT/);
    assert.doesNotMatch(design, /Unresolved/);
  });
});
