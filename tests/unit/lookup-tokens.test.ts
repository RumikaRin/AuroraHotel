import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createLookupToken, verifyLookupToken } from "../../src/server/auth/tokens.ts";

describe("Signed Guest Lookup & Action Tokens", () => {
  it("creates and verifies valid token", () => {
    const token = createLookupToken({
      bookingId: "bk-123",
      bookingNumber: "AUR-260801-A1B2",
      guestEmail: "guest@example.com",
      action: "cancel",
    });

    const payload = verifyLookupToken(token, "cancel");
    assert.equal(payload.bookingId, "bk-123");
    assert.equal(payload.bookingNumber, "AUR-260801-A1B2");
  });

  it("rejects token when action mismatches", () => {
    const token = createLookupToken({
      bookingId: "bk-123",
      bookingNumber: "AUR-260801-A1B2",
      guestEmail: "guest@example.com",
      action: "view",
    });

    assert.throws(() => verifyLookupToken(token, "cancel"), /Invalid or mismatched token action/i);
  });

  it("rejects tampered token", () => {
    const token = createLookupToken({
      bookingId: "bk-123",
      bookingNumber: "AUR-260801-A1B2",
      guestEmail: "guest@example.com",
      action: "cancel",
    });

    const tampered = token.slice(0, -4) + "XXXX";
    assert.throws(() => verifyLookupToken(tampered, "cancel"), /Invalid token signature/i);
  });
});
