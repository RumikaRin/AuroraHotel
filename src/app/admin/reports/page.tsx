import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import { db } from "@/lib/db.ts";
import Link from "next/link";

export const metadata = { title: "Báo cáo Doanh thu & Công suất - Aurora Hotel" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdmin(await auth());

  // Aggregate metrics from real database state
  const totalBookingsCount = await db.booking.count();
  const confirmedBookings = await db.booking.findMany({
    where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
    select: { totalAmount: true, nights: true },
  });

  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalNightsBooked = confirmedBookings.reduce((sum, b) => sum + b.nights, 0);

  const totalAvailableRooms = await db.room.count();
  const adr = totalNightsBooked > 0 ? Math.round(totalRevenue / totalNightsBooked) : 0;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
        <div>
          <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">OCCUPANCY & REVENUE REPORTS</span>
          <h1 className="font-serif-display text-2xl font-light">Báo Cáo Doanh Thu & Công Suất Phòng</h1>
        </div>
        <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
          Về Dashboard Quản Trị
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DADDD8] space-y-2">
          <span className="text-xs text-[#242826]/70">Tổng Số Đơn Đặt</span>
          <div className="text-3xl font-mono font-bold text-[#17211D]">{totalBookingsCount}</div>
        </div>
        <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DADDD8] space-y-2">
          <span className="text-xs text-[#242826]/70">Tổng Doanh Thu Thực Tế</span>
          <div className="text-3xl font-mono font-bold text-[#355B4B]">
            {totalRevenue.toLocaleString("vi-VN")} VND
          </div>
        </div>
        <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DADDD8] space-y-2">
          <span className="text-[#242826]/70 text-xs">Giá Trung Bình / Đêm (ADR)</span>
          <div className="text-3xl font-mono font-bold text-[#C5A46D]">
            {adr.toLocaleString("vi-VN")} VND
          </div>
        </div>
        <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DADDD8] space-y-2">
          <span className="text-[#242826]/70 text-xs">Tổng Số Phòng Khách Sạn</span>
          <div className="text-3xl font-mono font-bold text-[#17211D]">{totalAvailableRooms}</div>
        </div>
      </div>
    </div>
  );
}
