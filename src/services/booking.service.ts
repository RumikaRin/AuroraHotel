import crypto from "node:crypto";
import { db as defaultDb } from "../lib/db.ts";
import { ConflictError, NotFoundError, ValidationError } from "../domain/errors.ts";
import { parseDates, reserveAvailability, releaseAvailability } from "./availability.service.ts";
import { recordAuditLog } from "./audit.service.ts";
import { recordEmailOutbox } from "./outbox.service.ts";
import { processMockPayment } from "../server/providers/payment.ts";
import { calculateQuote, type QuoteRoomParam, type QuoteServiceParam } from "./pricing.service.ts";
import { redeemCoupon } from "./coupon.service.ts";
import { recordPaymentEvent } from "./payment.service.ts";

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
  couponCode?: string;
  rooms?: QuoteRoomParam[];
  services?: QuoteServiceParam[];
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
  const { start, end, nights, dates } = parseDates(params.checkIn, params.checkOut);

  if (!params.guestName || !params.guestEmail || !params.guestPhone) {
    throw new ValidationError("Guest contact details (name, email, phone) are required");
  }

  // Construct rooms array for multi-room support
  const roomParams: QuoteRoomParam[] =
    params.rooms && params.rooms.length > 0
      ? params.rooms
      : [{ roomCategoryId: params.roomCategoryId, ratePlanId: params.ratePlanId, numGuests: params.numGuests }];

  // Calculate quote server-authoritatively
  const quote = await calculateQuote(
    {
      checkIn: start,
      checkOut: end,
      rooms: roomParams,
      couponCode: params.couponCode,
      services: params.services,
    },
    client,
  );

  const bookingNumber = generateBookingNumber();

  const executeInTx = async (tx: typeof client) => {
    // Reserve availability for all rooms and nights atomically
    for (const rQuote of quote.rooms) {
      await reserveAvailability(
        {
          roomCategoryId: rQuote.roomCategoryId,
          checkIn: start,
          checkOut: end,
        },
        tx,
      );
    }

    let status = "PENDING_PAYMENT";
    let paymentResult = null;

    if (params.paymentMethod === "MOCK_PAYMENT") {
      paymentResult = await processMockPayment({
        amount: quote.totalAmount,
        currency: "VND",
        bookingNumber,
        method: "MOCK_PAYMENT",
      });
      if (paymentResult.status === "PAID") {
        status = "CONFIRMED";
      }
    }

    const primaryRoom = quote.rooms[0];

    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        guestId: params.guestId,
        roomCategoryId: primaryRoom.roomCategoryId,
        ratePlanId: primaryRoom.ratePlanId,
        checkIn: start,
        checkOut: end,
        nights,
        numGuests: params.numGuests ?? 1,
        subtotal: quote.roomSubtotal,
        serviceTotal: quote.serviceSubtotal,
        discountTotal: quote.discountTotal,
        taxAndFeeTotal: quote.taxAndFeeTotal,
        totalAmount: quote.totalAmount,
        currency: "VND",
        status,
        guestName: params.guestName,
        guestEmail: params.guestEmail,
        guestPhone: params.guestPhone,
        specialRequests: params.specialRequests,
      },
    });

    // Create BookingRoom and BookingNight snapshots if supported
    if (tx.bookingRoom) {
      for (const rQuote of quote.rooms) {
        const bRoom = await tx.bookingRoom.create({
          data: {
            bookingId: booking.id,
            roomCategoryId: rQuote.roomCategoryId,
            ratePlanId: rQuote.ratePlanId,
            pricePerNight: rQuote.nightlyPrice,
            numGuests: params.numGuests ?? 1,
          },
        });

        if (tx.bookingNight) {
          for (const d of dates) {
            await tx.bookingNight.create({
              data: {
                bookingId: booking.id,
                bookingRoomId: bRoom.id,
                date: d,
                basePrice: rQuote.basePricePerNight,
                discountAmount: Math.round(rQuote.basePricePerNight * (1 - rQuote.priceMultiplier)),
                finalPrice: rQuote.nightlyPrice,
              },
            });
          }
        }
      }
    }

    // Create BookingService snapshots if supported
    if (tx.bookingService && quote.services.length > 0) {
      for (const sQuote of quote.services) {
        await tx.bookingService.create({
          data: {
            bookingId: booking.id,
            serviceId: sQuote.serviceId,
            serviceName: sQuote.serviceName,
            price: sQuote.unitPrice,
            quantity: sQuote.quantity,
            totalAmount: sQuote.totalAmount,
          },
        });
      }
    }

    // Redeem coupon if applied
    if (quote.appliedCoupon && params.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: quote.appliedCoupon.code },
      });
      if (coupon) {
        await redeemCoupon(coupon.id, booking.id, quote.appliedCoupon.discountApplied, params.guestId, tx);
      }
    }

    // Record payment and event
    if (paymentResult) {
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: quote.totalAmount,
          currency: "VND",
          method: params.paymentMethod ?? "MOCK_PAYMENT",
          status: paymentResult.status,
          transactionRef: paymentResult.transactionRef,
          gatewayPayload: paymentResult.gatewayPayload ? JSON.parse(JSON.stringify(paymentResult.gatewayPayload)) : undefined,
        },
      });

      if (tx.paymentEvent) {
        await recordPaymentEvent(
          {
            paymentId: payment.id,
            previousStatus: "PENDING",
            newStatus: paymentResult.status,
            providerRef: paymentResult.transactionRef,
          },
          tx,
        );
      }
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
          roomCategoryId: primaryRoom.roomCategoryId,
          totalAmount: quote.totalAmount,
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
          totalAmount: quote.totalAmount,
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
    include: { bookingRooms: true },
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

    // Release availability for primary room and all booked rooms
    const categoryIds = booking.bookingRooms.length > 0
      ? booking.bookingRooms.map((r) => r.roomCategoryId)
      : [booking.roomCategoryId];

    for (const catId of categoryIds) {
      await releaseAvailability(
        {
          roomCategoryId: catId,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        },
        tx,
      );
    }

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
