import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { assignRoomToBooking, performCheckIn } from "@/services/operations.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, roomId } = body;
    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    if (roomId && typeof roomId === "string") {
      await assignRoomToBooking({
        bookingId,
        roomId,
        staffId: session.user.id,
      });
    }

    const updated = await performCheckIn({
      bookingId,
      staffId: session.user.id,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
