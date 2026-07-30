import { auth } from "@/auth";
import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Quản trị - Aurora Hotel" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin(await auth());

  // Fetch live stats safely
  let totalBookings = 0;
  let totalRevenue = 0;
  let activeCategories = 0;
  let dirtyRooms = 0;

  try {
    totalBookings = await db.booking.count();
    const confirmedBookings = await db.booking.findMany({
      where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
      select: { totalAmount: true },
    });
    totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    activeCategories = await db.roomCategory.count({ where: { isActive: true } });
    dirtyRooms = await db.room.count({ where: { status: "DIRTY" } });
  } catch {
    // Graceful fallback for build step
  }

  const ADMIN_MODULES = [
    {
      title: "Tổng Quan & Báo Cáo Doanh Thu",
      desc: "Công suất phòng, doanh thu thực tế, dự báo lưu trú",
      href: "/admin/reports",
      stat: `${totalRevenue.toLocaleString("vi-VN")} VND`,
      badge: "Kinh Doanh",
    },
    {
      title: "Quản Lý Đặt Phòng & Đơn Hàng",
      desc: "Xác nhận đặt phòng, huỷ đơn, hoàn tiền, tra cứu lịch sử",
      href: "/admin/bookings",
      stat: `${totalBookings} Đơn`,
      badge: "Vận Hành",
    },
    {
      title: "Quản Lý Hạng Phòng & Kho Phòng",
      desc: "Cấu hình loại phòng, giá theo ngày (DailyRate), kho khả dụng",
      href: "/admin/rooms",
      stat: `${activeCategories} Hạng Phòng`,
      badge: "Sản Phẩm",
    },
    {
      title: "Nghiệp Vụ Lễ Tân (Reception)",
      desc: "Gán số phòng, thực hiện thủ tục Check-in và Check-out",
      href: "/operations/reception",
      stat: "Check-in / Out",
      badge: "Lễ Tân",
    },
    {
      title: "Quản Lý Buồng Phòng (Housekeeping)",
      desc: "Cập nhật trạng thái dọn dẹp phòng (Clean, Dirty, Maintenance)",
      href: "/operations/housekeeping",
      stat: `${dirtyRooms} Phòng Cần Dọn`,
      badge: "Buồng Phòng",
    },
    {
      title: "Quản Lý Media & Thư Viện Ảnh",
      desc: "Tải lên, kiểm duyệt Sharp, xuất bản ảnh phòng qua Vercel Blob",
      href: "/admin/media",
      stat: "Vercel Blob",
      badge: "Truyền Thông",
    },
    {
      title: "Nhật Ký Hệ Thống (Audit Logs)",
      desc: "Xem nhật ký thao tác bảo mật, outbox email và retry worker",
      href: "/admin/audit",
      stat: "Audit Evidence",
      badge: "Bảo Mật",
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-[#17211D] text-[#F7F4ED] p-8 rounded-3xl shadow-md border border-[#C5A46D]/30 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[#C5A46D] text-xs font-semibold uppercase tracking-widest">
            AURORA HOTEL MANAGEMENT SYSTEM
          </span>
          <h1 className="font-serif-display text-3xl font-light mt-1 text-[#F7F4ED]">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="mt-1 text-xs text-[#DADDD8]">
            Đăng nhập với vai trò <span className="font-mono text-[#C5A46D] font-bold">{user.role}</span> ({user.email})
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#C5A46D]/40 text-[#C5A46D] hover:bg-[#C5A46D]/10 transition-all"
          >
            Trang Chủ Public
          </Link>
        </div>
      </div>

      {/* Grid of Admin Modules */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_MODULES.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group bg-[#FFFDF8] p-6 rounded-2xl border border-[#DADDD8] shadow-sm hover:shadow-md hover:border-[#C5A46D] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F7F4ED] text-[#355B4B] border border-[#DADDD8]">
                  {mod.badge}
                </span>
                <span className="text-xs font-bold text-[#17211D]">{mod.stat}</span>
              </div>
              <h2 className="font-serif-display text-xl text-[#17211D] font-medium mt-4 group-hover:text-[#C5A46D] transition-colors">
                {mod.title}
              </h2>
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
  );
}
