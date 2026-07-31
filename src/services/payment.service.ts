import { db as defaultDb } from "../lib/db.ts";
import { ConflictError, NotFoundError, ValidationError } from "../domain/errors.ts";
import { recordAuditLog } from "./audit.service.ts";
import { processMockPayment } from "../server/providers/payment.ts";

export interface RecordPaymentEventParams {
  paymentId: string;
  previousStatus: string;
  newStatus: string;
  eventPayload?: unknown;
  providerRef?: string;
}

export interface ProcessRefundParams {
  paymentId: string;
  bookingId: string;
  amount: number;
  reason?: string;
  idempotencyKey: string;
  actorId?: string;
}

export async function recordPaymentEvent(
  params: RecordPaymentEventParams,
  client = defaultDb,
) {
  return client.paymentEvent.create({
    data: {
      paymentId: params.paymentId,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      eventPayload: params.eventPayload ? JSON.parse(JSON.stringify(params.eventPayload)) : undefined,
      providerRef: params.providerRef,
    },
  });
}

export async function processRefund(
  params: ProcessRefundParams,
  client = defaultDb,
) {
  if (!params.idempotencyKey || params.idempotencyKey.length < 16) {
    throw new ValidationError("Valid idempotency key required for refund");
  }

  const existingRefund = await client.refund.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
  });

  if (existingRefund) {
    return existingRefund;
  }

  const payment = await client.payment.findUnique({
    where: { id: params.paymentId },
    include: { refunds: true },
  });

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  if (payment.status !== "PAID") {
    throw new ConflictError(`Cannot refund payment in status ${payment.status}`);
  }

  const alreadyRefundedAmount = payment.refunds
    .filter((r) => r.status === "PROCESSED")
    .reduce((sum, r) => sum + r.amount, 0);

  if (alreadyRefundedAmount + params.amount > payment.amount) {
    throw new ConflictError(
      `Refund amount (${params.amount.toLocaleString("vi-VN")} VND) exceeds remaining refundable balance (${(payment.amount - alreadyRefundedAmount).toLocaleString("vi-VN")} VND)`,
    );
  }

  const executeInTx = async (tx: typeof client) => {
    const refund = await tx.refund.create({
      data: {
        paymentId: payment.id,
        bookingId: params.bookingId,
        amount: params.amount,
        currency: "VND",
        reason: params.reason,
        status: "PROCESSED",
        idempotencyKey: params.idempotencyKey,
        transactionRef: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        processedAt: new Date(),
      },
    });

    const newRefundedTotal = alreadyRefundedAmount + params.amount;
    if (newRefundedTotal >= payment.amount) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });

      await recordPaymentEvent(
        {
          paymentId: payment.id,
          previousStatus: payment.status,
          newStatus: "REFUNDED",
          providerRef: refund.transactionRef ?? undefined,
        },
        tx,
      );
    }

    await recordAuditLog(
      {
        actorId: params.actorId,
        bookingId: params.bookingId,
        action: "REFUND_ISSUED",
        entityType: "Refund",
        entityId: refund.id,
        payload: {
          refundId: refund.id,
          amount: params.amount,
          reason: params.reason,
        },
      },
      tx,
    );

    return refund;
  };

  if (typeof client.$transaction === "function") {
    return client.$transaction((tx: unknown) => executeInTx(tx as typeof client));
  } else {
    return executeInTx(client);
  }
}

export async function retryPayment(
  bookingId: string,
  paymentMethod = "MOCK_PAYMENT",
  client = defaultDb,
) {
  const booking = await client.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status === "CONFIRMED" || booking.status === "CHECKED_IN") {
    throw new ConflictError("Booking is already confirmed or paid");
  }

  if (booking.status === "CANCELLED") {
    throw new ConflictError("Cannot retry payment for a cancelled booking");
  }

  const paymentResult = await processMockPayment({
    amount: booking.totalAmount,
    currency: "VND",
    bookingNumber: booking.bookingNumber,
    method: paymentMethod,
  });

  const executeInTx = async (tx: typeof client) => {
    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: "VND",
        method: paymentMethod,
        status: paymentResult.status,
        transactionRef: paymentResult.transactionRef,
        gatewayPayload: paymentResult.gatewayPayload ? JSON.parse(JSON.stringify(paymentResult.gatewayPayload)) : undefined,
      },
    });

    await recordPaymentEvent(
      {
        paymentId: payment.id,
        previousStatus: "PENDING",
        newStatus: paymentResult.status,
        providerRef: paymentResult.transactionRef,
      },
      tx,
    );

    if (paymentResult.status === "PAID") {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      });
    }

    return payment;
  };

  if (typeof client.$transaction === "function") {
    return client.$transaction((tx: unknown) => executeInTx(tx as typeof client));
  } else {
    return executeInTx(client);
  }
}
