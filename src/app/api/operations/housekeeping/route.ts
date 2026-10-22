import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "HOUSEKEEPER" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rooms = await db.room.findMany({
      include: {
        roomCategory: { select: { name: true } },
      },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });

    const formattedRooms = rooms.map((r) => ({
      id: r.id,
      roomNumber: r.number,
      floor: r.floor,
      categoryName: r.roomCategory.name,
      status: r.status,
      notes: r.notes || "",
    }));

    return NextResponse.json({ success: true, rooms: formattedRooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
