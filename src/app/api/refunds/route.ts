import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { requireAdmin } from "@/server/auth/guards";
import { processRefund } from "@/services/payment.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const refundSchema = z.object({
  paymentId: z.string().min(1),
  bookingId: z.string().min(1),
  amount: z.number().int().positive(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(await auth());

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonApiError(request, 400, "BAD_REQUEST", "Body must be valid JSON");
    }

    const parsed = refundSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError(
        request,
        400,
        "BAD_REQUEST",
        "Invalid refund payload",
        parsed.error.flatten().fieldErrors,
      );
    }

    const idempotencyKey =
      request.headers.get("idempotency-key") ||
      `REFUND-KEY-${parsed.data.paymentId}-${parsed.data.amount}`;

    const refund = await processRefund({
      ...parsed.data,
      idempotencyKey,
      actorId: user.id,
    });

    return Response.json({ success: true, data: refund }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
