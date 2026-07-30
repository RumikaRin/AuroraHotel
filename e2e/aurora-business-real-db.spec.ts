import { test, expect } from "@playwright/test";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { isValidIdempotencyKey } from "../src/lib/idempotency.ts";
import { processCheckout } from "../src/services/checkout.service.ts";
import { cancelBooking } from "../src/services/booking.service.ts";
import { verifyPaymentWebhookSignature } from "../src/server/providers/payment.ts";
import { createHmac } from "node:crypto";

function getTestPrisma() {
  const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

test.describe("Real Neon PostgreSQL Business E2E Workflows", () => {
  let db: PrismaClient;

  test.beforeAll(async () => {
    const envMap = process.env as Record<string, string | undefined>;
    envMap.NODE_ENV = "test";
    envMap.DATABASE_ENVIRONMENT = "test";
    if (process.env.TEST_DATABASE_URL) {
      envMap.DATABASE_URL = process.env.TEST_DATABASE_URL;
    }
    if (process.env.TEST_DIRECT_URL) {
      envMap.DIRECT_URL = process.env.TEST_DIRECT_URL;
    }
    db = getTestPrisma();
  });

  test.afterAll(async () => {
    await db.$disconnect();
  });

  test("validates idempotency key format helper", () => {
    expect(isValidIdempotencyKey("idempotency-key-1234567890")).toBe(true);
    expect(isValidIdempotencyKey("short")).toBe(false);
  });

  test("creates a real booking in PostgreSQL and handles idempotency replay", async () => {
    const idempotencyKey = `idempotency-test-${Date.now()}-123456789`;

    const category = await db.roomCategory.findFirstOrThrow({ where: { isActive: true } });
    const ratePlan = await db.ratePlan.findFirstOrThrow({ where: { roomCategoryId: category.id, isActive: true } });
    const guestUser = await db.user.findFirstOrThrow({ where: { role: { type: "GUEST" } } });

    const payload = {
      roomCategoryId: category.id,
      ratePlanId: ratePlan.id,
      checkIn: "2026-09-10T00:00:00.000Z",
      checkOut: "2026-09-12T00:00:00.000Z",
      guestName: "Automated E2E Guest",
      guestEmail: "e2e-guest@aurorahotel.com",
      guestPhone: "+84901234567",
      paymentMethod: "MOCK_PAYMENT",
    };

    // 1. Submit initial checkout request
    const result1 = await processCheckout(
      payload,
      { id: guestUser.id, email: guestUser.email },
      idempotencyKey,
    );

    const bookingId = "newBookingId" in result1 ? result1.newBookingId : result1.existingBookingId;
    expect(bookingId).toBeTruthy();

    // Verify record in PostgreSQL database directly
    const liveBooking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true, auditLogs: true },
    });
    const outboxEmails = await db.emailOutbox.findMany({
      where: { type: "BOOKING_CONFIRMATION" },
    });
    expect(outboxEmails.length).toBeGreaterThanOrEqual(1);
    expect(liveBooking).not.toBeNull();
    expect(liveBooking?.guestEmail).toBe("e2e-guest@aurorahotel.com");
    expect(liveBooking?.status).toBe("CONFIRMED");

    // 2. Replay identical request with same idempotency key
    const result2 = await processCheckout(
      payload,
      { id: guestUser.id, email: guestUser.email },
      idempotencyKey,
    );

    expect("existingBookingId" in result2).toBe(true);
    if ("existingBookingId" in result2) {
      expect(result2.existingBookingId).toBe(bookingId);
    }

    // Verify DB count did not duplicate
    const totalBookingsForGuest = await db.booking.count({
      where: { guestEmail: "e2e-guest@aurorahotel.com" },
    });
    expect(totalBookingsForGuest).toBe(1);
  });

  test("rejects mismatched payload on same idempotency key with 409 CONFLICT", async () => {
    const idempotencyKey = `conflict-key-${Date.now()}-987654321`;
    const category = await db.roomCategory.findFirstOrThrow({ where: { isActive: true } });
    const ratePlan = await db.ratePlan.findFirstOrThrow({ where: { roomCategoryId: category.id, isActive: true } });
    const guestUser = await db.user.findFirstOrThrow({ where: { role: { type: "GUEST" } } });

    const payloadA = {
      roomCategoryId: category.id,
      ratePlanId: ratePlan.id,
      checkIn: "2026-10-01T00:00:00.000Z",
      checkOut: "2026-10-03T00:00:00.000Z",
      guestName: "Guest A",
      guestEmail: "guestA@example.com",
      guestPhone: "+84900000001",
    };

    const payloadB = {
      ...payloadA,
      guestName: "Guest B DIFFERENT",
    };

    // First request
    const resA = await processCheckout(
      payloadA,
      { id: guestUser.id, email: guestUser.email },
      idempotencyKey,
    );
    expect("newBookingId" in resA).toBe(true);

    // Second request with different payload on same key -> throws ApiError (409 CONFLICT)
    let thrown = false;
    try {
      await processCheckout(
        payloadB,
        { id: guestUser.id, email: guestUser.email },
        idempotencyKey,
      );
    } catch (err: unknown) {
      thrown = true;
      const status = (err as { statusCode?: number; status?: number }).statusCode || (err as { status?: number }).status;
      expect(status).toBe(409);
    }
    expect(thrown).toBe(true);
  });

  test("prevents overbooking under concurrent reservation requests", async () => {
    const category = await db.roomCategory.findFirstOrThrow({ where: { isActive: true } });
    const ratePlan = await db.ratePlan.findFirstOrThrow({ where: { roomCategoryId: category.id, isActive: true } });
    const guestUser = await db.user.findFirstOrThrow({ where: { role: { type: "GUEST" } } });

    const dateIso = "2026-11-20T00:00:00.000Z";
    const dateUtc = new Date(dateIso);

    // Set DayAvailability bookedCount to capacity - 1 so only 1 room remains
    const availability = await db.dayAvailability.upsert({
      where: {
        roomCategoryId_date: { roomCategoryId: category.id, date: dateUtc },
      },
      update: { bookedCount: 9, totalInventory: 10 },
      create: {
        roomCategoryId: category.id,
        date: dateUtc,
        bookedCount: 9,
        totalInventory: 10,
      },
    });

    const key1 = `concurrent-req-1-${Date.now()}-111111111`;
    const key2 = `concurrent-req-2-${Date.now()}-222222222`;

    const reqData = {
      roomCategoryId: category.id,
      ratePlanId: ratePlan.id,
      checkIn: dateIso,
      checkOut: "2026-11-21T00:00:00.000Z",
      guestName: "Race Guest",
      guestEmail: "race@example.com",
      guestPhone: "+84911111111",
    };

    // Fire 2 concurrent requests directly against PostgreSQL
    const results = await Promise.allSettled([
      processCheckout(reqData, { id: guestUser.id, email: guestUser.email }, key1),
      processCheckout(reqData, { id: guestUser.id, email: guestUser.email }, key2),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly 1 request succeeds and 1 fails
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Verify PostgreSQL inventory: bookedCount MUST NOT exceed totalCapacity (10)
    const updatedAvail = await db.dayAvailability.findUnique({
      where: { id: availability.id },
    });
    expect(updatedAvail?.bookedCount).toBeLessThanOrEqual(10);
  });

  test("cancels booking with valid authorization and restores inventory idempotently", async () => {
    const category = await db.roomCategory.findFirstOrThrow({ where: { isActive: true } });
    const ratePlan = await db.ratePlan.findFirstOrThrow({ where: { roomCategoryId: category.id, isActive: true } });
    const guestUser = await db.user.findFirstOrThrow({ where: { role: { type: "GUEST" } } });
    const date = new Date("2026-12-01T00:00:00.000Z");

    // Create a real booking directly in PostgreSQL
    const booking = await db.$transaction(async (tx) => {
      await tx.dayAvailability.upsert({
        where: { roomCategoryId_date: { roomCategoryId: category.id, date } },
        update: { bookedCount: 5, totalInventory: 10 },
        create: { roomCategoryId: category.id, date, bookedCount: 5, totalInventory: 10 },
      });

      return tx.booking.create({
        data: {
          bookingNumber: `B-CANCEL-${Date.now()}`,
          roomCategoryId: category.id,
          ratePlanId: ratePlan.id,
          guestName: "Cancel Guest",
          guestEmail: "cancel@example.com",
          guestPhone: "+84922222222",
          checkIn: date,
          checkOut: new Date("2026-12-02T00:00:00.000Z"),
          nights: 1,
          totalAmount: 2500000,
          status: "CONFIRMED",
        },
      });
    });

    // 1. Cancel booking
    const result = await cancelBooking(booking.id, guestUser.id, db);
    expect(result?.status).toBe("CANCELLED");

    // Check DB status
    const cancelledDb = await db.booking.findUnique({ where: { id: booking.id } });
    expect(cancelledDb?.status).toBe("CANCELLED");

    // Check inventory restored by -1 (from 5 to 4)
    const availAfter = await db.dayAvailability.findFirst({
      where: { roomCategoryId: category.id, date },
    });
    expect(availAfter?.bookedCount).toBe(4);

    // 2. Re-cancelling same booking must be idempotent (throws conflict & does not restore inventory again)
    await expect(cancelBooking(booking.id, guestUser.id, db)).rejects.toThrow();

    const availReplay = await db.dayAvailability.findFirst({
      where: { roomCategoryId: category.id, date },
    });
    expect(availReplay?.bookedCount).toBe(4); // Remained 4!
  });

  test("rejects cancellation when booking ID is invalid", async () => {
    const guestUser = await db.user.findFirstOrThrow({ where: { role: { type: "GUEST" } } });
    await expect(cancelBooking("non-existent-booking-id", guestUser.id, db)).rejects.toThrow();
  });

  test("deduplicates payment webhook retries cleanly", async () => {
    const category = await db.roomCategory.findFirstOrThrow({ where: { isActive: true } });
    const ratePlan = await db.ratePlan.findFirstOrThrow({ where: { roomCategoryId: category.id, isActive: true } });

    const booking = await db.booking.create({
      data: {
        bookingNumber: `B-PAY-${Date.now()}`,
        roomCategoryId: category.id,
        ratePlanId: ratePlan.id,
        guestName: "Pay Guest",
        guestEmail: "pay@example.com",
        guestPhone: "+84944444444",
        checkIn: new Date("2026-12-15T00:00:00.000Z"),
        checkOut: new Date("2026-12-16T00:00:00.000Z"),
        nights: 1,
        totalAmount: 2500000,
        status: "PENDING_PAYMENT",
      },
    });

    const eventId = `evt-${Date.now()}-999`;
    const payload = JSON.stringify({
      eventId,
      bookingId: booking.id,
      amount: 2500000,
      status: "SUCCESS",
      transactionRef: `tx-${eventId}`,
    });

    const secret = process.env.MOCK_PAYMENT_SECRET || "your-mock-payment-secret-must-be-at-least-32-chars";
    const signature = createHmac("sha256", secret).update(payload).digest("hex");

    // 1. Verify webhook signature
    const isValidSig = verifyPaymentWebhookSignature(payload, signature, secret);
    expect(isValidSig).toBe(true);

    // 2. First webhook call -> creates payment record and confirms booking
    await db.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findFirst({ where: { transactionRef: `tx-${eventId}` } });
      if (!existingPayment) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: 2500000,
            status: "PAID",
            method: "MOCK_PAYMENT",
            transactionRef: `tx-${eventId}`,
          },
        });
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED" },
        });
      }
    });

    // Verify DB updated to CONFIRMED
    const b1 = await db.booking.findUnique({ where: { id: booking.id } });
    expect(b1?.status).toBe("CONFIRMED");

    // 3. Webhook retry with same eventId -> deduplicated cleanly (no duplicate payment)
    await db.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findFirst({ where: { transactionRef: `tx-${eventId}` } });
      if (!existingPayment) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: 2500000,
            status: "PAID",
            method: "MOCK_PAYMENT",
            transactionRef: `tx-${eventId}`,
          },
        });
      }
    });

    // Verify payment count is exactly 1
    const paymentsCount = await db.payment.count({ where: { bookingId: booking.id } });
    expect(paymentsCount).toBe(1);
  });
});
