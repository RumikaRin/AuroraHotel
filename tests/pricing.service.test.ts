import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateQuote } from "../src/services/pricing.service.ts";

describe("Aurora Pricing & Quote Service", () => {
  it("calculates room nightly breakdown, taxes, and total correctly", async () => {
    const mockClient = {
      roomCategory: {
        findUnique: async () => ({
          id: "cat-deluxe-king",
          name: "Deluxe Ocean King",
          basePrice: 2500000,
          isActive: true,
        }),
      },
      ratePlan: {
        findUnique: async () => ({
          id: "rp-flex",
          name: "Flexible Rate",
          priceMultiplier: 1.0,
          isActive: true,
        }),
        findFirst: async () => null,
      },
      service: {
        findUnique: async () => null,
      },
      coupon: {
        findUnique: async () => null,
      },
    };

    const quote = await calculateQuote(
      {
        checkIn: "2026-09-10",
        checkOut: "2026-09-12",
        rooms: [{ roomCategoryId: "cat-deluxe-king", ratePlanId: "rp-flex" }],
      },
      mockClient as unknown as Parameters<typeof calculateQuote>[1],
    );

    assert.equal(quote.nights, 2);
    assert.equal(quote.roomSubtotal, 5000000);
    assert.equal(quote.taxAndFeeTotal, 500000);
    assert.equal(quote.totalAmount, 5500000);
  });

  it("applies valid coupon discount correctly", async () => {
    const mockClient = {
      roomCategory: {
        findUnique: async () => ({
          id: "cat-deluxe-king",
          name: "Deluxe Ocean King",
          basePrice: 2500000,
          isActive: true,
        }),
      },
      ratePlan: {
        findUnique: async () => ({
          id: "rp-flex",
          name: "Flexible Rate",
          priceMultiplier: 1.0,
          isActive: true,
        }),
        findFirst: async () => null,
      },
      service: {
        findUnique: async () => null,
      },
      coupon: {
        findUnique: async () => ({
          id: "cp-1",
          code: "WELCOME2026",
          discountAmount: 200000,
          discountPercent: 0,
          minBookingAmount: 1000000,
          maxUsageTotal: 500,
          currentUsageCount: 0,
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-12-31"),
          isActive: true,
        }),
      },
    };

    const quote = await calculateQuote(
      {
        checkIn: "2026-09-10",
        checkOut: "2026-09-11",
        rooms: [{ roomCategoryId: "cat-deluxe-king", ratePlanId: "rp-flex" }],
        couponCode: "WELCOME2026",
      },
      mockClient as unknown as Parameters<typeof calculateQuote>[1],
    );

    assert.equal(quote.discountTotal, 200000);
    assert.equal(quote.appliedCoupon?.code, "WELCOME2026");
    assert.equal(quote.totalAmount, 2530000); // (2500000 - 200000) * 1.1 = 2530000
  });
});
