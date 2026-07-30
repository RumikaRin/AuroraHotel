import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyCronSecret } from "../src/server/cron/cron-auth.ts";

describe("Daily cron cleanup authorization", () => {
  it("accepts valid Bearer token matching CRON_SECRET", () => {
    const secret = "test-cron-secret-at-least-32-chars-long";
    assert.equal(
      verifyCronSecret(`Bearer ${secret}`, secret),
      true,
    );
  });

  it("rejects missing, mismatched, or malformed authorization headers", () => {
    const secret = "test-cron-secret-at-least-32-chars-long";
    assert.equal(verifyCronSecret("", secret), false);
    assert.equal(verifyCronSecret("Bearer invalid-secret", secret), false);
    assert.equal(verifyCronSecret("Basic token", secret), false);
  });
});
