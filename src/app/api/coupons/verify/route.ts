import type { NextRequest } from "next/server";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { verifyCoupon } from "@/services/coupon.service";
import { auth } from "@/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  code: z.string().min(1).max(50),
  bookingAmount: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonApiError(request, 400, "BAD_REQUEST", "Body must be valid JSON");
    }

    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError(
        request,
        400,
        "BAD_REQUEST",
        "Invalid coupon payload",
        parsed.error.flatten().fieldErrors,
      );
    }

    const session = await auth();
    const userId = session?.user ? (session.user as { id?: string }).id : undefined;

    const result = await verifyCoupon({
      code: parsed.data.code,
      bookingAmount: parsed.data.bookingAmount,
      userId,
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
