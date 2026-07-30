import { db } from "../../../../lib/db.ts";
import { cancelBooking } from "../../../../services/booking.service.ts";
import { z } from "zod";

const lookupSchema = z.object({
  bookingNumber: z.string().trim().min(5),
  email: z.string().email(),
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

    return Response.json({ success: true, data: booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid parameters";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;
    if (!bookingId) {
      return Response.json({ success: false, error: "Missing bookingId" }, { status: 400 });
    }

    const updated = await cancelBooking(bookingId);
    return Response.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cancellation failed";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}
