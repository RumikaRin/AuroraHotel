import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { checkoutSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import { processCheckout } from "@/services/checkout.service";

export const dynamic = "force-dynamic";

// POST /api/checkout
// Headers: Idempotency-Key: <client-generated, e.g. crypto.randomUUID()>
// Body:    { items: [{ productId, quantity }], couponCode?, note?, paymentMethod }
// Rate limited by src/middleware.ts ("checkout" publicWrite bucket).
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

    const parsed = checkoutSchema.safeParse(body);
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

    if ("existingOrderId" in result) {
      // Idempotent replay: return the original order, 200 not 201.
      return Response.json({ orderId: result.existingOrderId, replayed: true });
    }
    return Response.json(
      {
        orderId: result.newOrderId,
        orderNumber: result.orderNumber,
        total: result.total,
        replayed: false,
      },
      { status: 201 },
    );
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
