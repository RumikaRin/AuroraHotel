import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Bảng Điều Khiển Quản Trị - Aurora Hotel" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin(await auth());

  // Fetch live stats safely
  let totalBookings = 0;
  let totalRevenue = 0;
  let activeCategories = 0;
  let dirtyRooms = 0;
  let occupiedRooms = 0;
  let totalRooms = 0;

  try {
    totalBookings = await db.booking.count();
    const confirmedBookings = await db.booking.findMany({
      where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
      select: { totalAmount: true },
    });
    totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    activeCategories = await db.roomCategory.count({ where: { isActive: true } });
    dirtyRooms = await db.room.count({ where: { status: "DIRTY" } });
    occupiedRooms = await db.room.count({ where: { status: "OCCUPIED" } });
    totalRooms = await db.room.count();
  } catch {
    // Graceful fallback for build step
  }

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const ADMIN_MODULES = [
    {
      title: "Báo Cáo & Doanh Thu",
      desc: "Công suất phòng, doanh thu thực tế, chỉ số ADR & RevPAR",
      href: "/admin/reports",
      stat: `${totalRevenue.toLocaleString("vi-VN")} VND`,
      badge: "Kinh Doanh",
      accentColor: "border-l-4 border-l-emerald-600",
    },
    {
      title: "Quản Lý Đặt Phòng",
      desc: "Xác nhận đặt phòng, huỷ đơn, hoàn tiền, tra cứu lịch sử",
      href: "/admin/bookings",
      stat: `${totalBookings} Đơn`,
      badge: "Vận Hành",
      accentColor: "border-l-4 border-l-blue-600",
    },
    {
      title: "Hạng Phòng & Kho Phòng",
      desc: "Cấu hình loại phòng, giá theo ngày (DailyRate), kho khả dụng",
      href: "/admin/rooms",
      stat: `${activeCategories} Hạng Phòng`,
      badge: "Sản Phẩm",
      accentColor: "border-l-4 border-l-amber-600",
    },
    {
      title: "Nghiệp Vụ Lễ Tân",
      desc: "Gán số phòng, thực hiện thủ tục Check-in và Check-out",
      href: "/operations/reception",
      stat: "Check-in / Out",
      badge: "Lễ Tân",
      accentColor: "border-l-4 border-l-indigo-600",
    },
    {
      title: "Quản Lý Buồng Phòng",
      desc: "Cập nhật trạng thái dọn dẹp phòng (Clean, Dirty, Maintenance)",
      href: "/operations/housekeeping",
      stat: `${dirtyRooms} Phòng Cần Dọn`,
      badge: "Buồng Phòng",
      accentColor: "border-l-4 border-l-rose-600",
    },
    {
      title: "Quản Lý Media & Ảnh",
      desc: "Tải lên, kiểm duyệt Sharp, xuất bản ảnh phòng qua Vercel Blob",
      href: "/admin/media",
      stat: "Vercel Blob",
      badge: "Truyền Thông",
      accentColor: "border-l-4 border-l-purple-600",
    },
    {
      title: "Nhật Ký Audit Logs",
      desc: "Xem nhật ký thao tác bảo mật, outbox email và retry worker",
      href: "/admin/audit",
      stat: "Audit Evidence",
      badge: "Bảo Mật",
      accentColor: "border-l-4 border-l-slate-600",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-[#17211D] text-[#F7F4ED] p-6 sm:p-8 rounded-3xl shadow-lg border border-[#C5A46D]/30 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[#C5A46D] text-xs font-semibold uppercase tracking-widest block mb-1">
            AURORA HOTEL MANAGEMENT CENTER
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#F7F4ED]">
            Xin Chào, {user.name || "Administrator"}
          </h1>
          <p className="mt-1 text-xs text-[#DADDD8]">
            Đã xác thực vai trò <span className="font-mono text-[#C5A46D] font-bold">{user.role}</span> ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-aurora-gold text-aurora-midnight text-xs font-bold hover:bg-aurora-gold/80 transition-all shadow-sm"
          >
            📊 Xuất Báo Cáo Doanh Thu
          </Link>
        </div>
      </div>

      {/* Quick KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-aurora-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-aurora-muted uppercase tracking-wider">Tổng Doanh Thu</span>
          <div className="text-2xl font-bold text-emerald-700 font-serif-luxury">
            {totalRevenue.toLocaleString("vi-VN")} VND
          </div>
          <p className="text-[11px] text-aurora-muted">Cập nhật thời gian thực</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-aurora-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-aurora-muted uppercase tracking-wider">Tổng Đơn Đặt Phòng</span>
          <div className="text-2xl font-bold text-aurora-midnight font-serif-luxury">
            {totalBookings} Đơn
          </div>
          <p className="text-[11px] text-aurora-muted">Bao gồm Confirmed & Checked-in</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-aurora-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-aurora-muted uppercase tracking-wider">Tỷ Lệ Công Suất Phòng</span>
          <div className="text-2xl font-bold text-amber-700 font-serif-luxury">
            {occupancyRate}%
          </div>
          <p className="text-[11px] text-aurora-muted">{occupiedRooms} / {totalRooms} phòng đang có khách</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-aurora-line shadow-sm space-y-1">
          <span className="text-xs font-semibold text-aurora-muted uppercase tracking-wider">Phòng Cần Dọn Dẹp</span>
          <div className="text-2xl font-bold text-rose-600 font-serif-luxury">
            {dirtyRooms} Phòng
          </div>
          <p className="text-[11px] text-aurora-muted">Hàng đợi Buồng phòng</p>
        </div>
      </div>

      {/* Grid of Admin Modules */}
      <div>
        <h2 className="font-serif-luxury text-xl font-bold text-aurora-midnight mb-4">
          Các Phân Hệ Quản Trị Hệ Thống
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_MODULES.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className={`group bg-[#FFFDF8] p-6 rounded-2xl border border-[#DADDD8] shadow-sm hover:shadow-md hover:border-[#C5A46D] transition-all flex flex-col justify-between ${mod.accentColor}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F7F4ED] text-[#355B4B] border border-[#DADDD8]">
                    {mod.badge}
                  </span>
                  <span className="text-xs font-bold text-[#17211D] font-mono">{mod.stat}</span>
                </div>
                <h3 className="font-serif-luxury text-lg text-[#17211D] font-bold mt-4 group-hover:text-[#C5A46D] transition-colors">
                  {mod.title}
                </h3>
                <p className="mt-2 text-xs text-[#242826]/70 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#DADDD8]/60 flex items-center justify-between text-xs text-[#355B4B] font-semibold">
                <span>Truy cập phân hệ</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

