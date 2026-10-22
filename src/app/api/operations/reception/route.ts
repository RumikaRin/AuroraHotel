import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [bookings, rooms] = await Promise.all([
      db.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
        },
        include: {
          guest: { select: { name: true, email: true, phone: true } },
          roomCategory: { select: { id: true, name: true, slug: true } },
          roomAssignments: {
            include: { room: true },
          },
        },
        orderBy: { checkIn: "asc" },
        take: 100,
      }),
      db.room.findMany({
        include: {
          roomCategory: { select: { id: true, name: true } },
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      }),
    ]);

    const formattedBookings = bookings.map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      guestName: b.guest ? (b.guest.name || b.guest.email) : "Guest",
      roomCategoryId: b.roomCategoryId,
      roomCategoryName: b.roomCategory.name,
      status: b.status,
      checkIn: b.checkIn.toISOString().slice(0, 10),
      checkOut: b.checkOut.toISOString().slice(0, 10),
      assignedRoom: b.roomAssignments[0]?.room?.number || null,
      assignedRoomId: b.roomAssignments[0]?.room?.id || null,
    }));

    const formattedRooms = rooms.map((r) => ({
      id: r.id,
      roomNumber: r.number,
      floor: r.floor,
      categoryName: r.roomCategory.name,
      roomCategoryId: r.roomCategoryId,
      status: r.status,
    }));

    return NextResponse.json({ success: true, bookings: formattedBookings, rooms: formattedRooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
