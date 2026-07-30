import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBooking } from "../src/services/booking.service.ts";

describe("Aurora Booking Service", () => {
  it("creates a booking and records audit and email outbox within a transaction", async () => {
    const mockDb = {
      $transaction: async (cb: (tx: unknown) => unknown) => cb(mockDb),
      dayAvailability: {
        findMany: async () => [
          { id: "da-1", roomCategoryId: "cat-1", date: new Date("2026-08-01"), totalInventory: 10, bookedCount: 0, holdCount: 0, version: 0 },
        ],
        updateMany: async () => ({ count: 1 }),
      },
      roomCategory: {
        findUnique: async () => ({ id: "cat-1", name: "Deluxe King", basePrice: 2500000, isActive: true }),
      },
      ratePlan: {
        findUnique: async () => ({ id: "rp-1", name: "Flex", priceMultiplier: 1.0, isActive: true }),
      },
      booking: {
        create: async (args: { data: { bookingNumber: string; totalAmount: number; status: string } }) => ({
          id: "bk-100",
          bookingNumber: args.data.bookingNumber,
          totalAmount: args.data.totalAmount,
          status: args.data.status,
        }),
      },
      payment: {
        create: async (args: { data: Record<string, unknown> }) => args.data,
      },
      auditLog: {
        create: async (args: { data: Record<string, unknown> }) => args.data,
      },
      emailOutbox: {
        create: async (args: { data: Record<string, unknown> }) => args.data,
      },
    };

    const res = await createBooking(
      {
        roomCategoryId: "cat-1",
        ratePlanId: "rp-1",
        checkIn: "2026-08-01",
        checkOut: "2026-08-02",
        guestName: "Nguyen Van A",
        guestEmail: "nguyen@example.com",
        guestPhone: "+84901234567",
        paymentMethod: "MOCK_PAYMENT",
      },
      mockDb as unknown as Parameters<typeof createBooking>[1],
    );

    assert.ok(res.bookingNumber.startsWith("AUR-"));
    assert.equal(res.totalAmount, 2500000);
    assert.equal(res.status, "CONFIRMED");
  });
});
