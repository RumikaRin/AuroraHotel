"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Tổng Quan Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Báo Cáo & Doanh Thu", href: "/admin/reports", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Quản Lý Đặt Phòng", href: "/admin/bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Hạng Phòng & Kho", href: "/admin/rooms", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M15 16h.01M15 12h.01M15 8h.01M9 8h.01" },
  { label: "Nghiệp Vụ Lễ Tân", href: "/operations/reception", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { label: "Buồng Phòng", href: "/operations/housekeeping", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { label: "Quản Lý Media", href: "/admin/media", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Nhật Ký Audit Logs", href: "/admin/audit", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#14201B] text-[#F7F4ED] flex flex-col justify-between p-4 min-h-screen border-r border-[#C5A46D]/20 shadow-xl hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="p-4 mb-6 border-b border-[#C5A46D]/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-aurora-gold flex items-center justify-center font-bold text-aurora-midnight font-serif-luxury text-xl">
            A
          </div>
          <div>
            <span className="font-serif-luxury text-lg font-bold tracking-wide text-white block">
              AURORA HOTEL
            </span>
            <span className="text-[10px] text-aurora-gold uppercase tracking-widest block">
              ADMIN CONTROL
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#C5A46D] text-[#14201B] shadow-md font-bold"
                    : "text-[#DADDD8] hover:bg-[#1F2F29] hover:text-white"
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Return link */}
      <div className="pt-4 border-t border-[#C5A46D]/20">
        <Link
          href="/"
          className="flex items-center justify-between p-3 rounded-xl bg-[#1F2F29] text-xs font-medium text-aurora-gold hover:bg-[#C5A46D] hover:text-[#14201B] transition-all"
        >
          <span>Quay lại Trang Web Public</span>
          <span>→</span>
        </Link>
      </div>
    </aside>
  );
}
