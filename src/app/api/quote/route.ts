import type { NextRequest } from "next/server";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { calculateQuote } from "@/services/pricing.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const roomParamSchema = z.object({
  roomCategoryId: z.string().min(1),
  ratePlanId: z.string().optional(),
  numGuests: z.number().int().positive().optional(),
});

const serviceParamSchema = z.object({
  serviceId: z.string().min(1),
  quantity: z.number().int().positive().optional(),
});

const quoteRequestSchema = z.object({
  checkIn: z.string().min(10),
  checkOut: z.string().min(10),
  rooms: z.array(roomParamSchema).min(1),
  couponCode: z.string().optional(),
  services: z.array(serviceParamSchema).optional(),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonApiError(request, 400, "BAD_REQUEST", "Body must be valid JSON");
    }

    const parsed = quoteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError(
        request,
        400,
        "BAD_REQUEST",
        "Invalid quote payload",
        parsed.error.flatten().fieldErrors,
      );
    }

    const quote = await calculateQuote(parsed.data);
    return Response.json({ success: true, data: quote });
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
