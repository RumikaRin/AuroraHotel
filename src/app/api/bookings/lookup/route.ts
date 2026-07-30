import { db } from "../../../../lib/db.ts";
import { cancelBooking } from "../../../../services/booking.service.ts";
import { createLookupToken, verifyLookupToken } from "../../../../server/auth/tokens.ts";
import { z } from "zod";

const lookupSchema = z.object({
  bookingNumber: z.string().trim().min(5),
  email: z.string().email(),
});

const cancelSchema = z.object({
  bookingId: z.string().cuid().or(z.string().min(5)),
  token: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = lookupSchema.parse(body);

    const booking = await db.booking.findFirst({
      where: {
        bookingNumber: { equals: parsed.bookingNumber, mode: "insensitive" },
        guestEmail: { equals: parsed.email, mode: "insensitive" },
      },
      include: {
        roomCategory: true,
        ratePlan: true,
        payments: true,
        roomAssignments: { include: { room: true } },
      },
    });

    if (!booking) {
      return Response.json(
        { success: false, error: "Không tìm thấy thông tin đặt phòng với mã và email đã cung cấp" },
        { status: 404 }
      );
    }

    const cancelToken = createLookupToken({
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      guestEmail: booking.guestEmail,
      action: "cancel",
      expiresInSeconds: 86400,
    });

    return Response.json({
      success: true,
      data: {
        ...booking,
        cancelToken,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid parameters";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const parsed = cancelSchema.parse(body);

    // Verify token
    const tokenPayload = verifyLookupToken(parsed.token, "cancel");

    if (tokenPayload.bookingId !== parsed.bookingId) {
      return Response.json({ success: false, error: "Token mismatch for booking" }, { status: 403 });
    }

    const booking = await db.booking.findUnique({
      where: { id: parsed.bookingId },
    });

    if (!booking || booking.guestEmail.toLowerCase() !== tokenPayload.guestEmail.toLowerCase()) {
      return Response.json({ success: false, error: "Ownership verification failed" }, { status: 403 });
    }

    const updated = await cancelBooking(parsed.bookingId);
    return Response.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cancellation failed";
    const status = message.includes("Invalid token") || message.includes("expired") ? 401 : 400;
    return Response.json({ success: false, error: message }, { status });
  }
}
