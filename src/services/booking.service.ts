import crypto from "node:crypto";
import { db as defaultDb } from "../lib/db.ts";
import { ConflictError, NotFoundError, ValidationError } from "../domain/errors.ts";
import { parseDates, reserveAvailability, releaseAvailability } from "./availability.service.ts";
import { recordAuditLog } from "./audit.service.ts";
import { recordEmailOutbox } from "./outbox.service.ts";
import { processMockPayment } from "../server/providers/payment.ts";

export interface CreateBookingParams {
  guestId?: string;
  roomCategoryId: string;
  ratePlanId: string;
  checkIn: string | Date;
  checkOut: string | Date;
  numGuests?: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  paymentMethod?: string;
}

export function generateBookingNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `AUR-${dateStr}-${randomHex}`;
}

export async function createBooking(
  params: CreateBookingParams,
  client = defaultDb,
) {
  const { start, end, nights } = parseDates(params.checkIn, params.checkOut);

  if (!params.guestName || !params.guestEmail || !params.guestPhone) {
    throw new ValidationError("Guest contact details (name, email, phone) are required");
  }

  const category = await client.roomCategory.findUnique({
    where: { id: params.roomCategoryId },
  });
  if (!category || !category.isActive) {
    throw new NotFoundError("Room category not found or inactive");
  }

  const ratePlan = await client.ratePlan.findUnique({
    where: { id: params.ratePlanId },
  });
  if (!ratePlan || !ratePlan.isActive) {
    throw new NotFoundError("Rate plan not found or inactive");
  }

  const totalAmount = Math.round(category.basePrice * ratePlan.priceMultiplier * nights);
  const bookingNumber = generateBookingNumber();

  const executeInTx = async (tx: typeof client) => {
    await reserveAvailability(
      {
        roomCategoryId: params.roomCategoryId,
        checkIn: start,
        checkOut: end,
      },
      tx,
    );

    let status = "PENDING_PAYMENT";
    let paymentResult = null;

    if (params.paymentMethod === "MOCK_PAYMENT") {
      paymentResult = await processMockPayment({
        amount: totalAmount,
        currency: "VND",
        bookingNumber,
        method: "MOCK_PAYMENT",
      });
      if (paymentResult.status === "PAID") {
        status = "CONFIRMED";
      }
    }

    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        guestId: params.guestId,
        roomCategoryId: params.roomCategoryId,
        ratePlanId: params.ratePlanId,
        checkIn: start,
        checkOut: end,
        nights,
        numGuests: params.numGuests ?? 1,
        totalAmount,
        currency: "VND",
        status,
        guestName: params.guestName,
        guestEmail: params.guestEmail,
        guestPhone: params.guestPhone,
        specialRequests: params.specialRequests,
      },
    });

    if (paymentResult) {
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalAmount,
          currency: "VND",
          method: params.paymentMethod ?? "MOCK_PAYMENT",
          status: paymentResult.status,
          transactionRef: paymentResult.transactionRef,
          gatewayPayload: paymentResult.gatewayPayload ? JSON.parse(JSON.stringify(paymentResult.gatewayPayload)) : undefined,
        },
      });
    }

    await recordAuditLog(
      {
        actorId: params.guestId,
        bookingId: booking.id,
        action: "BOOKING_CREATED",
        entityType: "Booking",
        entityId: booking.id,
        payload: {
          bookingNumber,
          roomCategoryId: params.roomCategoryId,
          totalAmount,
          status,
        },
      },
      tx,
    );

    await recordEmailOutbox(
      {
        type: "BOOKING_CONFIRMATION",
        payload: {
          bookingId: booking.id,
          bookingNumber,
          guestName: params.guestName,
          guestEmail: params.guestEmail,
          checkIn: start.toISOString().slice(0, 10),
          checkOut: end.toISOString().slice(0, 10),
          totalAmount,
        },
      },
      tx,
    );

    return booking;
  };

  if (typeof client.$transaction === "function") {
    return client.$transaction((tx: unknown) => executeInTx(tx as typeof client));
  } else {
    return executeInTx(client);
  }
}

export async function cancelBooking(
  bookingId: string,
  actorId?: string,
  client = defaultDb,
) {
  const booking = await client.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const executeInTx = async (tx: typeof client) => {
    const { count } = await tx.booking.updateMany({
      where: {
        id: bookingId,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
      },
      data: { status: "CANCELLED" },
    });

    if (count !== 1) {
      throw new ConflictError(`Cannot cancel booking ${bookingId}: booking is in status ${booking.status}`);
    }

    await releaseAvailability(
      {
        roomCategoryId: booking.roomCategoryId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      },
      tx,
    );

    await recordAuditLog(
      {
        actorId,
        bookingId,
        action: "BOOKING_CANCELLED",
        entityType: "Booking",
        entityId: bookingId,
        payload: { bookingNumber: booking.bookingNumber },
      },
      tx,
    );

    await recordEmailOutbox(
      {
        type: "BOOKING_CANCELLATION",
        payload: {
          bookingNumber: booking.bookingNumber,
          guestEmail: booking.guestEmail,
        },
      },
      tx,
    );

    return tx.booking.findUnique({ where: { id: bookingId } });
  };

  if (typeof client.$transaction === "function") {
    return client.$transaction((tx: unknown) => executeInTx(tx as typeof client));
  } else {
    return executeInTx(client);
  }
}
