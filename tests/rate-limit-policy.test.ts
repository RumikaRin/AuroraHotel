// Runs via "node --test" with type stripping. IMPORTANT: node cannot resolve
// the "@/" tsconfig alias, so tests import pure libs with RELATIVE paths and
// explicit ".ts" extensions (see tsconfig allowImportingTsExtensions).

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getRateLimitPolicy } from "../src/lib/rate-limit-policy.ts";

describe("getRateLimitPolicy", () => {
  it("limits the credentials callback regardless of method", () => {
    const policy = getRateLimitPolicy("/api/auth/callback/credentials", "POST");
    assert.ok(policy);
    assert.equal(policy.keyPrefix, "auth");
    assert.equal(policy.limiter, "auth");
    assert.equal(policy.limit, 10);
  });

  it("limits checkout writes with the publicWrite bucket", () => {
    const policy = getRateLimitPolicy("/api/checkout", "POST");
    assert.ok(policy);
    assert.equal(policy.keyPrefix, "checkout");
    assert.equal(policy.limiter, "publicWrite");
  });

  it("does not apply the checkout bucket to reads", () => {
    const policy = getRateLimitPolicy("/api/checkout", "GET");
    assert.ok(policy);
    assert.equal(policy.keyPrefix, "api");
  });

  it("applies the general api bucket to other api routes", () => {
    const policy = getRateLimitPolicy("/api/products", "GET");
    assert.ok(policy);
    assert.equal(policy.keyPrefix, "api");
    assert.equal(policy.limit, 60);
  });

  it("leaves nextauth internals unlimited", () => {
    assert.equal(getRateLimitPolicy("/api/auth/session", "GET"), null);
    assert.equal(getRateLimitPolicy("/api/auth/csrf", "GET"), null);
  });

  it("leaves pages unlimited", () => {
    assert.equal(getRateLimitPolicy("/", "GET"), null);
    assert.equal(getRateLimitPolicy("/admin", "GET"), null);
  });
});
