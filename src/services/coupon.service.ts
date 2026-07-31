import { db as defaultDb } from "../lib/db.ts";
import { ConflictError, NotFoundError, ValidationError } from "../domain/errors.ts";

export interface VerifyCouponParams {
  code: string;
  bookingAmount: number;
  userId?: string;
}

export async function verifyCoupon(
  params: VerifyCouponParams,
  client = defaultDb,
) {
  const code = params.code.toUpperCase().trim();
  const coupon = await client.coupon.findUnique({
    where: { code },
  });

  if (!coupon || !coupon.isActive) {
    throw new NotFoundError("Coupon code is invalid or inactive");
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new ValidationError("Coupon code has expired");
  }

  if (coupon.currentUsageCount >= coupon.maxUsageTotal) {
    throw new ConflictError("Coupon usage limit reached");
  }

  if (params.bookingAmount < coupon.minBookingAmount) {
    throw new ValidationError(
      `Booking amount must be at least ${coupon.minBookingAmount.toLocaleString("vi-VN")} VND to use this coupon`,
    );
  }

  if (params.userId) {
    const userUsageCount = await client.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId: params.userId,
      },
    });

    if (userUsageCount >= coupon.maxUsagePerUser) {
      throw new ConflictError("You have reached the maximum usage limit for this coupon");
    }
  }

  let discountApplied = 0;
  if (coupon.discountAmount > 0) {
    discountApplied = coupon.discountAmount;
  } else if (coupon.discountPercent > 0) {
    discountApplied = Math.round((params.bookingAmount * coupon.discountPercent) / 100);
    if (coupon.maxDiscountAmount && discountApplied > coupon.maxDiscountAmount) {
      discountApplied = coupon.maxDiscountAmount;
    }
  }

  discountApplied = Math.min(discountApplied, params.bookingAmount);

  return {
    couponId: coupon.id,
    code: coupon.code,
    name: coupon.name,
    discountApplied,
    minBookingAmount: coupon.minBookingAmount,
  };
}

export async function redeemCoupon(
  couponId: string,
  bookingId: string,
  discountApplied: number,
  userId?: string,
  client = defaultDb,
) {
  const updatedCoupon = await client.coupon.updateMany({
    where: {
      id: couponId,
      isActive: true,
      currentUsageCount: { lt: client.coupon.fields ? undefined : 999999 },
    },
    data: {
      currentUsageCount: { increment: 1 },
    },
  });

  if (updatedCoupon.count === 0) {
    throw new ConflictError("Coupon limit reached during checkout");
  }

  const usage = await client.couponUsage.create({
    data: {
      couponId,
      bookingId,
      userId,
      discountApplied,
    },
  });

  return usage;
}
