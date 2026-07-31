import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyCoupon } from "../../src/services/coupon.service.ts";
import { processRefund } from "../../src/services/payment.service.ts";
import { ValidationError, ConflictError } from "../../src/domain/errors.ts";

describe("Aurora Security & Negative Rule Enforcements", () => {
  it("rejects expired coupon code with ValidationError", async () => {
    const mockClient = {
      coupon: {
        findUnique: async () => ({
          id: "cp-old",
          code: "EXPIRED2020",
          isActive: true,
          startDate: new Date("2020-01-01"),
          endDate: new Date("2020-12-31"),
          currentUsageCount: 0,
          maxUsageTotal: 100,
          minBookingAmount: 500000,
        }),
      },
    };

    await assert.rejects(
      async () => {
        await verifyCoupon(
          { code: "EXPIRED2020", bookingAmount: 1000000 },
          mockClient as unknown as Parameters<typeof verifyCoupon>[1],
        );
      },
      (err: unknown) => {
        assert(err instanceof ValidationError);
        assert.match(err.message, /expired/i);
        return true;
      },
    );
  });

  it("rejects coupon when usage limit is reached", async () => {
    const mockClient = {
      coupon: {
        findUnique: async () => ({
          id: "cp-full",
          code: "LIMITED",
          isActive: true,
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-12-31"),
          currentUsageCount: 100,
          maxUsageTotal: 100,
          minBookingAmount: 500000,
        }),
      },
    };

    await assert.rejects(
      async () => {
        await verifyCoupon(
          { code: "LIMITED", bookingAmount: 1000000 },
          mockClient as unknown as Parameters<typeof verifyCoupon>[1],
        );
      },
      (err: unknown) => {
        assert(err instanceof ConflictError);
        assert.match(err.message, /limit reached/i);
        return true;
      },
    );
  });

  it("rejects refund attempt exceeding paid balance", async () => {
    const mockClient = {
      refund: {
        findUnique: async () => null,
      },
      payment: {
        findUnique: async () => ({
          id: "pay-100",
          amount: 5000000,
          status: "PAID",
          refunds: [
            { id: "ref-1", amount: 4000000, status: "PROCESSED" },
          ],
        }),
      },
    };

    await assert.rejects(
      async () => {
        await processRefund(
          {
            paymentId: "pay-100",
            bookingId: "bk-100",
            amount: 2000000, // 4M + 2M = 6M > 5M total
            idempotencyKey: "REFUND-KEY-1234567890123456",
          },
          mockClient as unknown as Parameters<typeof processRefund>[1],
        );
      },
      (err: unknown) => {
        assert(err instanceof ConflictError);
        assert.match(err.message, /exceeds remaining refundable balance/i);
        return true;
      },
    );
  });
});
