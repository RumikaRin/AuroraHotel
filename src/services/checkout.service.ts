import { Prisma } from "@prisma/client";
import { db } from "../lib/db.ts";
import { ApiError } from "../lib/api-error.ts";
import { hashCheckoutRequest, isValidIdempotencyKey } from "../lib/idempotency.ts";
import { createBooking, type CreateBookingParams } from "./booking.service.ts";

export type CheckoutResult =
  | { existingBookingId: string }
  | { newBookingId: string; bookingNumber: string; totalAmount: number };

export async function processCheckout(
  input: CreateBookingParams,
  sessionUser: { id: string; email: string },
  idempotencyKey: string | null,
): Promise<CheckoutResult> {
  if (!isValidIdempotencyKey(idempotencyKey)) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Missing or invalid Idempotency-Key header (16..200 chars)",
    );
  }

  const requestHash = hashCheckoutRequest(input as unknown as Record<string, unknown>);

  const existing = await db.checkoutIdempotency.findUnique({
    where: { key: idempotencyKey! },
  });

  if (existing) {
    if (existing.userId !== sessionUser.id || existing.requestHash !== requestHash) {
      throw new ApiError(
        409,
        "CONFLICT",
        "Idempotency-Key already used for a different request",
      );
    }
    if (!existing.bookingId) {
      throw new ApiError(409, "CONFLICT", "Checkout with this key is still in progress");
    }
    return { existingBookingId: existing.bookingId };
  }

  try {
    const txResult = await db.$transaction(async (tx) => {
      await tx.checkoutIdempotency.create({
        data: { key: idempotencyKey!, userId: sessionUser.id, requestHash },
      });

      const booking = await createBooking(
        {
          ...input,
          guestId: sessionUser.id,
        },
        tx as unknown as Parameters<typeof createBooking>[1],
      );

      await tx.checkoutIdempotency.update({
        where: { key: idempotencyKey! },
        data: { bookingId: booking.id },
      });

      return booking;
    });

    return {
      newBookingId: txResult.id,
      bookingNumber: txResult.bookingNumber,
      totalAmount: txResult.totalAmount,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const winner = await db.checkoutIdempotency.findUnique({
        where: { key: idempotencyKey! },
      });
      if (
        winner?.userId === sessionUser.id &&
        winner.requestHash === requestHash &&
        winner.bookingId
      ) {
        return { existingBookingId: winner.bookingId };
      }
      throw new ApiError(409, "CONFLICT", "Duplicate checkout request in flight");
    }
    throw error;
  }
}
