import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateRoomCleaningStatus } from "@/services/operations.service";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "HOUSEKEEPER" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { roomId, status, notes } = body;
    if (!roomId || !status) {
      return NextResponse.json({ error: "roomId and status are required" }, { status: 400 });
    }

    const updated = await updateRoomCleaningStatus({
      roomId,
      status,
      notes,
      staffId: session.user.id,
    });

    return NextResponse.json({ success: true, room: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status update failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
