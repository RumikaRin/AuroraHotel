import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

import { BookingManagerTable, AdminBookingItem } from "@/components/admin/BookingManagerTable";

export const metadata = { title: "Quản lý Đặt phòng - Aurora Hotel" };
export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await requireAdmin(await auth());

  let initialBookings: AdminBookingItem[] = [];

  try {
    const rawBookings = await db.booking.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { roomCategory: true, ratePlan: true },
    });

    initialBookings = rawBookings.map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestPhone: b.guestPhone || "",
      totalAmount: b.totalAmount,
      status: b.status,
      categoryName: b.roomCategory?.name || "Standard Room",
      checkIn: new Date(b.checkIn).toLocaleDateString("vi-VN"),
      checkOut: new Date(b.checkOut).toLocaleDateString("vi-VN"),
    }));
  } catch {
    // Graceful fallback for build
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
        <div>
          <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">BOOKINGS MANAGEMENT</span>
          <h1 className="font-serif-luxury text-2xl font-bold">Quản Lý Đơn Đặt Phòng & Trạng Thái</h1>
        </div>
        <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
          Về Dashboard
        </Link>
      </div>

      <BookingManagerTable initialBookings={initialBookings} />
    </div>
  );
}

