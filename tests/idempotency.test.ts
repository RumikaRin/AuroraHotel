import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hashCheckoutRequest,
  isValidIdempotencyKey,
} from "../src/lib/idempotency.ts";

describe("hashCheckoutRequest", () => {
  it("is deterministic for equal payloads", () => {
    const a = hashCheckoutRequest({ items: [{ productId: "p1", quantity: 2 }] });
    const b = hashCheckoutRequest({ items: [{ productId: "p1", quantity: 2 }] });
    assert.equal(a, b);
  });

  it("differs for different payloads", () => {
    const a = hashCheckoutRequest({ items: [{ productId: "p1", quantity: 2 }] });
    const b = hashCheckoutRequest({ items: [{ productId: "p1", quantity: 3 }] });
    assert.notEqual(a, b);
  });

  it("returns a sha256 hex string", () => {
    assert.match(hashCheckoutRequest({}), /^[a-f0-9]{64}$/);
  });
});

describe("isValidIdempotencyKey", () => {
  it("rejects null and empty values", () => {
    assert.equal(isValidIdempotencyKey(null), false);
    assert.equal(isValidIdempotencyKey(""), false);
  });

  it("rejects keys shorter than 16 chars", () => {
    assert.equal(isValidIdempotencyKey("short-key"), false);
    assert.equal(isValidIdempotencyKey("a".repeat(15)), false);
  });

  it("rejects keys longer than 200 chars", () => {
    assert.equal(isValidIdempotencyKey("a".repeat(201)), false);
  });

  it("accepts boundary lengths and uuids", () => {
    assert.equal(isValidIdempotencyKey("a".repeat(16)), true);
    assert.equal(isValidIdempotencyKey("a".repeat(200)), true);
    assert.equal(isValidIdempotencyKey(crypto.randomUUID()), true);
  });
});
