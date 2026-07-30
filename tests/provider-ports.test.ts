import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { sendEmail } from "../src/server/providers/email.ts";
import {
  processMockPayment,
  verifyPaymentWebhookSignature,
} from "../src/server/providers/payment.ts";

describe("Provider ports (Email and Payment)", () => {
  it("sends preview email in dev/test environment", async () => {
    const res = await sendEmail({
      to: "guest@aurorahotel.com",
      subject: "Booking Confirmation",
      html: "<p>Thank you for your booking</p>",
    });
    assert.equal(res.status, "sent");
    assert.ok(res.messageId);
  });

  it("processes mock payment and produces transaction reference", async () => {
    const res = await processMockPayment({
      amount: 2500000,
      currency: "VND",
      bookingNumber: "AUR-1001",
      method: "MOCK_PAYMENT",
    });
    assert.equal(res.status, "PAID");
    assert.match(res.transactionRef, /^TXN-/);
  });

  it("verifies webhook signature cleanly", () => {
    const payload = JSON.stringify({ event: "payment.succeeded", txnId: "TXN-123" });
    const secret = "test-secret-32-chars-at-least-long";
    const sig = createHmac("sha256", secret).update(payload).digest("hex");
    assert.equal(verifyPaymentWebhookSignature(payload, sig, secret), true);
    assert.equal(verifyPaymentWebhookSignature(payload, "invalid_sig", secret), false);
  });
});
