"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case "/admin": return "Bảng Điều Khiển Quản Trị (Dashboard)";
      case "/admin/reports": return "Báo Cáo Doanh Thu & Công Suất";
      case "/admin/bookings": return "Quản Lý Đơn Đặt Phòng";
      case "/admin/rooms": return "Quản Lý Hạng Phòng & Kho";
      case "/admin/media": return "Quản Lý Thư Viện Media";
      case "/admin/audit": return "Nhật Ký Hệ Thống & Bảo Mật";
      default: return "Hệ Thống Quản Trị Aurora";
    }
  };

  return (
    <header className="bg-white border-b border-aurora-line py-4 px-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="font-serif-luxury text-xl font-bold text-aurora-midnight">
          {getPageTitle()}
        </h1>
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
          ● SYSTEM LIVE
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Nav Mobile Links */}
        <div className="flex md:hidden gap-1 text-xs">
          <Link href="/admin" className="px-2 py-1 rounded bg-aurora-ivory text-aurora-midnight font-medium">Dashboard</Link>
          <Link href="/admin/bookings" className="px-2 py-1 rounded bg-aurora-ivory text-aurora-midnight font-medium">Đơn hàng</Link>
          <Link href="/admin/rooms" className="px-2 py-1 rounded bg-aurora-ivory text-aurora-midnight font-medium">Kho phòng</Link>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-aurora-gold hover:text-aurora-midnight px-3 py-1.5 rounded-lg border border-aurora-gold/30 hover:border-aurora-midnight transition-all"
        >
          Trang Chủ →
        </Link>
      </div>
    </header>
  );
}
