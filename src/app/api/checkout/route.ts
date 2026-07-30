import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { bookingCheckoutSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import { processCheckout } from "@/services/checkout.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(await auth());
    const email = (user as { email?: string }).email;
    if (!email) {
      return jsonApiError(request, 401, "UNAUTHORIZED", "Sign in to checkout");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonApiError(request, 400, "BAD_REQUEST", "Body must be valid JSON");
    }

    const parsed = bookingCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError(
        request,
        400,
        "BAD_REQUEST",
        "Invalid checkout payload",
        parsed.error.flatten().fieldErrors,
      );
    }

    const result = await processCheckout(
      parsed.data,
      { id: user.id, email },
      request.headers.get("idempotency-key"),
    );

    if ("existingBookingId" in result) {
      return Response.json({ bookingId: result.existingBookingId, replayed: true });
    }
    return Response.json(
      {
        bookingId: result.newBookingId,
        bookingNumber: result.bookingNumber,
        totalAmount: result.totalAmount,
        replayed: false,
      },
      { status: 201 },
    );
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
