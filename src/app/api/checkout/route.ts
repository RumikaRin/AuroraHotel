import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { bookingCheckoutSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { processCheckout } from "@/services/checkout.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
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

    // Resolve user: Use active session or auto-upsert guest account
    const session = await auth();
    let checkoutUser: { id: string; email: string };

    if (session?.user?.id && session?.user?.email) {
      checkoutUser = { id: session.user.id, email: session.user.email };
    } else {
      const guestEmail = parsed.data.guestEmail.trim().toLowerCase();
      let user = await db.user.findUnique({
        where: { email: guestEmail },
      });

      if (!user) {
        let role = await db.role.findFirst({
          where: { type: { in: ["CUSTOMER", "GUEST"] } },
        });
        if (!role) {
          role = await db.role.create({
            data: { name: "Customer", type: "CUSTOMER" },
          });
        }

        user = await db.user.create({
          data: {
            email: guestEmail,
            name: parsed.data.guestName.trim(),
            phone: parsed.data.guestPhone.trim(),
            roleId: role.id,
            password: null, // Unregistered guest account
          },
        });
      }

      checkoutUser = { id: user.id, email: user.email };
    }

    const result = await processCheckout(
      parsed.data,
      checkoutUser,
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
