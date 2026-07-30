// Checkout service, distilled from FLOF src/services/checkout.service.ts.
// Demonstrates the two concurrency patterns the starter exists to teach:
//
//   A) IDEMPOTENCY: the client sends an Idempotency-Key header. The key row
//      is created INSIDE the order transaction; a concurrent duplicate hits
//      the primary-key constraint (P2002), and the loser returns the winner's
//      order instead of creating a second one.
//
//   B) ATOMIC STOCK DECREMENT: stock is decremented with
//      updateMany({ where: { stock: { gte: qty } } }). The WHERE guard and
//      the UPDATE are one SQL statement, so two concurrent checkouts can
//      never both take the last unit. count !== 1 means insufficient stock
//      and rolls the whole transaction back.
//
// DIVERGENCES vs FLOF: no VNPAY gateway, no notifications, no inventory
// ledger, no customer profile table. Coupon + outbox + audit are kept to
// show the transactional-outbox and conditional-increment patterns.

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { hashCheckoutRequest, isValidIdempotencyKey } from "@/lib/idempotency";
import type { CheckoutInput } from "@/lib/validation";

export type CheckoutResult =
  | { existingOrderId: string }
  | { newOrderId: string; orderNumber: string; total: number };

export async function processCheckout(
  input: CheckoutInput,
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

  const requestHash = hashCheckoutRequest(input);

  // 1. Fast path: this key was already processed.
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
    if (!existing.orderId) {
      throw new ApiError(409, "CONFLICT", "Checkout with this key is still in progress");
    }
    return { existingOrderId: existing.orderId };
  }

  // 2. Load and validate products outside the transaction (read-only).
  const requestedIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await db.product.findMany({
    where: { id: { in: requestedIds }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  if (products.length !== requestedIds.length) {
    throw new ApiError(400, "BAD_REQUEST", "One or more products no longer exist");
  }

  const orderItems = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity,
      total: product.price * item.quantity,
    };
  });

  // Aggregate per product so the same product listed twice decrements once.
  const stockByProduct = new Map<string, number>();
  for (const item of orderItems) {
    stockByProduct.set(
      item.productId,
      (stockByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  // 3. Coupon lookup (validity re-checked atomically inside the transaction).
  const couponCode = input.couponCode?.trim().toUpperCase();
  const coupon = couponCode
    ? await db.coupon.findUnique({ where: { code: couponCode } })
    : null;
  const now = new Date();
  if (couponCode) {
    const usable =
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > now) &&
      subtotal >= coupon.minOrder &&
      (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit);
    if (!usable) {
      throw new ApiError(400, "BAD_REQUEST", "Coupon is invalid or expired");
    }
  }
  const discount = coupon
    ? coupon.type === "PERCENTAGE"
      ? Math.floor((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)
    : 0;
  const total = subtotal - discount;
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  // 4. One transaction: idempotency row, stock, order, coupon, outbox, audit.
  try {
    const txResult = await db.$transaction(async (tx) => {
      // Creating the key first turns concurrent duplicates into a P2002
      // unique violation that the catch block below resolves gracefully.
      await tx.checkoutIdempotency.create({
        data: { key: idempotencyKey!, userId: sessionUser.id, requestHash },
      });

      // ATOMIC conditional decrement: guard + update in one statement.
      for (const [productId, quantity] of stockByProduct) {
        const updated = await tx.product.updateMany({
          where: { id: productId, isActive: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updated.count !== 1) {
          const name = productMap.get(productId)?.name ?? productId;
          throw new ApiError(409, "CONFLICT", `Insufficient stock for "${name}"`);
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: sessionUser.id,
          status: "PENDING",
          subtotal,
          discount,
          total,
          couponId: coupon?.id,
          note: input.note ?? "",
          items: { create: orderItems },
          payment: {
            create: {
              method: input.paymentMethod,
              status: "PENDING",
              amount: total,
            },
          },
        },
      });

      await tx.checkoutIdempotency.update({
        where: { key: idempotencyKey! },
        data: { orderId: order.id },
      });

      // Conditional coupon consumption: same guard-in-WHERE pattern as stock.
      if (coupon && coupon.usageLimit !== null) {
        const consumed = await tx.coupon.updateMany({
          where: { id: coupon.id, usageCount: { lt: coupon.usageLimit } },
          data: { usageCount: { increment: 1 } },
        });
        if (consumed.count !== 1) {
          throw new ApiError(409, "CONFLICT", "Coupon usage limit just ran out");
        }
      } else if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Transactional outbox: the confirmation email intent commits with the
      // order or not at all. A worker drains PENDING rows later.
      await tx.emailOutbox.create({
        data: {
          type: "ORDER_CONFIRMATION",
          payload: JSON.stringify({
            email: sessionUser.email,
            orderNumber,
            total,
          }),
        },
      });

      await tx.auditLog.create({
        data: {
          actorEmail: sessionUser.email,
          action: "ORDER_CREATED",
          entityType: "Order",
          entityId: order.id,
          metadata: JSON.stringify({ orderNumber, total, itemCount: orderItems.length }),
        },
      });

      return { orderId: order.id, orderNumber: order.orderNumber, total };
    });

    return {
      newOrderId: txResult.orderId,
      orderNumber: txResult.orderNumber,
      total: txResult.total,
    };
  } catch (error) {
    // Concurrent duplicate: someone else inserted the same key first.
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
        winner.orderId
      ) {
        return { existingOrderId: winner.orderId };
      }
      throw new ApiError(409, "CONFLICT", "Duplicate checkout request in flight");
    }
    throw error;
  }
}
