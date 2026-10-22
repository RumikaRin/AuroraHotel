import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { performCheckOut } from "@/services/operations.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId } = body;
    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const updated = await performCheckOut({
      bookingId,
      staffId: session.user.id,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-out failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
