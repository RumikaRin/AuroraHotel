import { db as defaultDb } from "../lib/db.ts";
import { NotFoundError, ValidationError } from "../domain/errors.ts";
import { parseDates } from "./availability.service.ts";

export interface QuoteRoomParam {
  roomCategoryId: string;
  ratePlanId?: string;
  numGuests?: number;
}

export interface QuoteServiceParam {
  serviceId: string;
  quantity?: number;
}

export interface CalculateQuoteParams {
  checkIn: string | Date;
  checkOut: string | Date;
  rooms: QuoteRoomParam[];
  couponCode?: string;
  services?: QuoteServiceParam[];
}

export interface RoomQuoteBreakdown {
  roomCategoryId: string;
  roomCategoryName: string;
  ratePlanId: string;
  ratePlanName: string;
  basePricePerNight: number;
  priceMultiplier: number;
  nightlyPrice: number;
  nights: number;
  roomSubtotal: number;
}

export interface ServiceQuoteBreakdown {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  totalAmount: number;
}

export interface QuoteResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: RoomQuoteBreakdown[];
  services: ServiceQuoteBreakdown[];
  roomSubtotal: number;
  serviceSubtotal: number;
  discountTotal: number;
  taxAndFeeTotal: number;
  totalAmount: number;
  currency: string;
  appliedCoupon?: {
    code: string;
    discountApplied: number;
  };
}

export async function calculateQuote(
  params: CalculateQuoteParams,
  client = defaultDb,
): Promise<QuoteResult> {
  const { start, end, nights } = parseDates(params.checkIn, params.checkOut);

  if (!params.rooms || params.rooms.length === 0) {
    throw new ValidationError("At least one room selection is required for a quote");
  }

  const roomBreakdowns: RoomQuoteBreakdown[] = [];
  let roomSubtotal = 0;

  for (const rParam of params.rooms) {
    const category = await client.roomCategory.findUnique({
      where: { id: rParam.roomCategoryId },
    });
    if (!category || !category.isActive) {
      throw new NotFoundError(`Room category ${rParam.roomCategoryId} not found or inactive`);
    }

    let ratePlan = null;
    if (rParam.ratePlanId) {
      ratePlan = await client.ratePlan.findUnique({
        where: { id: rParam.ratePlanId },
      });
    } else {
      ratePlan = await client.ratePlan.findFirst({
        where: { roomCategoryId: category.id, isActive: true },
      });
    }

    if (!ratePlan || !ratePlan.isActive) {
      throw new NotFoundError(`Rate plan for room category ${category.name} not found or inactive`);
    }

    const nightlyPrice = Math.round(category.basePrice * ratePlan.priceMultiplier);
    const subtotal = nightlyPrice * nights;
    roomSubtotal += subtotal;

    roomBreakdowns.push({
      roomCategoryId: category.id,
      roomCategoryName: category.name,
      ratePlanId: ratePlan.id,
      ratePlanName: ratePlan.name,
      basePricePerNight: category.basePrice,
      priceMultiplier: ratePlan.priceMultiplier,
      nightlyPrice,
      nights,
      roomSubtotal: subtotal,
    });
  }

  // Add-on Services
  const serviceBreakdowns: ServiceQuoteBreakdown[] = [];
  let serviceSubtotal = 0;

  if (params.services && params.services.length > 0) {
    for (const sParam of params.services) {
      const service = await client.service.findUnique({
        where: { id: sParam.serviceId },
      });
      if (service && service.isActive) {
        const qty = sParam.quantity ?? 1;
        let total = 0;
        if (service.unit === "PER_NIGHT") {
          total = service.price * qty * nights;
        } else {
          total = service.price * qty;
        }
        serviceSubtotal += total;
        serviceBreakdowns.push({
          serviceId: service.id,
          serviceCode: service.code,
          serviceName: service.name,
          unitPrice: service.price,
          unit: service.unit,
          quantity: qty,
          totalAmount: total,
        });
      }
    }
  }

  // Coupon Discount
  let discountTotal = 0;
  let appliedCoupon: QuoteResult["appliedCoupon"] = undefined;

  if (params.couponCode) {
    const coupon = await client.coupon.findUnique({
      where: { code: params.couponCode.toUpperCase().trim() },
    });

    const now = new Date();
    if (
      coupon &&
      coupon.isActive &&
      coupon.startDate <= now &&
      coupon.endDate >= now &&
      coupon.currentUsageCount < coupon.maxUsageTotal &&
      roomSubtotal >= coupon.minBookingAmount
    ) {
      if (coupon.discountAmount > 0) {
        discountTotal = coupon.discountAmount;
      } else if (coupon.discountPercent > 0) {
        discountTotal = Math.round((roomSubtotal * coupon.discountPercent) / 100);
        if (coupon.maxDiscountAmount && discountTotal > coupon.maxDiscountAmount) {
          discountTotal = coupon.maxDiscountAmount;
        }
      }
      discountTotal = Math.min(discountTotal, roomSubtotal);
      appliedCoupon = {
        code: coupon.code,
        discountApplied: discountTotal,
      };
    }
  }

  const taxableAmount = Math.max(0, roomSubtotal + serviceSubtotal - discountTotal);
  const taxAndFeeTotal = Math.round(taxableAmount * 0.1);
  const totalAmount = taxableAmount + taxAndFeeTotal;

  return {
    checkIn: start.toISOString().slice(0, 10),
    checkOut: end.toISOString().slice(0, 10),
    nights,
    rooms: roomBreakdowns,
    services: serviceBreakdowns,
    roomSubtotal,
    serviceSubtotal,
    discountTotal,
    taxAndFeeTotal,
    totalAmount,
    currency: "VND",
    appliedCoupon,
  };
}
