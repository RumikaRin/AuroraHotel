import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Quản lý Đặt phòng - Aurora Hotel" };

export default async function AdminBookingsPage() {
  await requireAdmin(await auth());

  let bookings: Array<{
    id: string;
    bookingNumber: string;
    guestName: string;
    guestEmail: string;
    totalAmount: number;
    status: string;
    roomCategory?: { name: string };
    roomCategoryId: string;
  }> = [];

  try {
    bookings = await db.booking.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { roomCategory: true, ratePlan: true },
    });
  } catch {
    // Graceful fallback for build
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
        <div>
          <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">BOOKINGS MANAGEMENT</span>
          <h1 className="font-serif-display text-2xl font-light">Quản Lý Đơn Đặt Phòng & Trạng Thái</h1>
        </div>
        <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
          Về Dashboard Quản Trị
        </Link>
      </div>

      <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#DADDD8] space-y-4">
        <h2 className="font-serif-display text-xl text-[#17211D]">Danh Sách Đơn Đặt Phòng Gần Đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DADDD8] text-[#17211D] font-bold">
                <th className="p-3">Mã Đơn</th>
                <th className="p-3">Tên Khách</th>
                <th className="p-3">Email</th>
                <th className="p-3">Hạng Phòng</th>
                <th className="p-3">Tổng Tiền</th>
                <th className="p-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADDD8]/60">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="p-3 font-mono font-bold text-[#17211D]">{b.bookingNumber}</td>
                  <td className="p-3 font-semibold">{b.guestName}</td>
                  <td className="p-3">{b.guestEmail}</td>
                  <td className="p-3">{b.roomCategory?.name || b.roomCategoryId}</td>
                  <td className="p-3 font-bold">{b.totalAmount.toLocaleString("vi-VN")} VND</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#2E7D5A]/10 text-[#2E7D5A]">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
