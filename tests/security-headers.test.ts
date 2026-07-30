import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildContentSecurityPolicy,
  staticSecurityHeaders,
} from "../src/lib/security-headers.ts";

describe("buildContentSecurityPolicy", () => {
  it("embeds the nonce with strict-dynamic", () => {
    const csp = buildContentSecurityPolicy("production", "abc123");
    assert.ok(csp.includes("'nonce-abc123'"));
    assert.ok(csp.includes("'strict-dynamic'"));
  });

  it("forbids inline styles and eval in production", () => {
    const csp = buildContentSecurityPolicy("production", "abc123");
    assert.ok(csp.includes("style-src 'self'"));
    assert.ok(csp.includes("style-src-attr 'none'"));
    assert.ok(!csp.includes("'unsafe-eval'"));
    assert.ok(csp.includes("upgrade-insecure-requests"));
  });

  it("allows dev-only escape hatches outside production", () => {
    const csp = buildContentSecurityPolicy("development", "abc123");
    assert.ok(csp.includes("'unsafe-eval'"));
    assert.ok(csp.includes("style-src 'self' 'unsafe-inline'"));
    assert.ok(!csp.includes("upgrade-insecure-requests"));
  });

  it("locks down framing and object embedding", () => {
    const csp = buildContentSecurityPolicy("production");
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.ok(csp.includes("object-src 'none'"));
    assert.ok(csp.includes("base-uri 'self'"));
  });
});

describe("staticSecurityHeaders", () => {
  it("includes the standard hardening set", () => {
    const headers = staticSecurityHeaders();
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["X-Frame-Options"], "DENY");
    assert.ok(headers["Referrer-Policy"]);
    assert.ok(headers["Permissions-Policy"]);
  });
});
