"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../../components/layout/Header.tsx";
import { Footer } from "../../components/layout/Footer.tsx";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "history">("history");

  const stayHistory = [
    {
      id: "bk-2001",
      bookingNumber: "AUR-260715-B9A1",
      roomCategory: "Executive Bay Suite",
      checkIn: "2026-07-15",
      checkOut: "2026-07-18",
      nights: 3,
      totalAmount: 12600000,
      status: "CHECKED_OUT",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242826] flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="bg-[#17211D] text-[#F7F4ED] p-8 rounded-3xl border border-[#C5A46D]/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-widest">AURORA GUEST MEMBER</span>
            <h1 className="font-serif-display text-3xl font-light mt-1">Tài Khoản Khách Hàng</h1>
            <p className="text-xs text-[#DADDD8] mt-1">Hạng thành viên: <span className="text-[#C5A46D] font-bold">Aurora Gold Member</span></p>
          </div>
          <Link href="/rooms" className="px-5 py-2.5 rounded-xl bg-[#C5A46D] text-[#17211D] text-xs font-bold hover:bg-[#b0905b] shadow-sm">
            Đặt Kỳ Nghỉ Mới
          </Link>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-4 border-b border-[#DADDD8] pb-2">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "history" ? "border-[#C5A46D] text-[#17211D]" : "border-transparent text-[#242826]/60"
            }`}
          >
            Lịch Sử Đặt Phòng & Lưu Trú
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "profile" ? "border-[#C5A46D] text-[#17211D]" : "border-transparent text-[#242826]/60"
            }`}
          >
            Thông Tin Cá Nhân
          </button>
        </div>

        {activeTab === "history" && (
          <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#DADDD8] shadow-sm space-y-6">
            <h2 className="font-serif-display text-2xl text-[#17211D]">Lịch Sử Kỳ Nghỉ Tại Aurora</h2>

            <div className="space-y-4">
              {stayHistory.map((stay) => (
                <div key={stay.id} className="p-6 rounded-2xl bg-[#F7F4ED] border border-[#DADDD8] flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[#355B4B]">{stay.bookingNumber}</span>
                    <h3 className="font-serif-display text-lg text-[#17211D] font-medium">{stay.roomCategory}</h3>
                    <p className="text-xs text-[#242826]/70">
                      {stay.checkIn} đến {stay.checkOut} ({stay.nights} đêm)
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold bg-[#2E7D5A]/10 text-[#2E7D5A]">
                      {stay.status}
                    </span>
                    <div className="text-sm font-bold text-[#17211D]">{stay.totalAmount.toLocaleString("vi-VN")} VND</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#DADDD8] shadow-sm space-y-4 max-w-2xl">
            <h2 className="font-serif-display text-2xl text-[#17211D]">Thông Tin Cá Nhân</h2>
            <div className="space-y-3 text-sm text-[#242826]">
              <div><span className="font-semibold">Họ và tên:</span> Nguyễn Văn A</div>
              <div><span className="font-semibold">Email:</span> guest@aurorahotel.com</div>
              <div><span className="font-semibold">Số điện thoại:</span> +84 90 123 4567</div>
              <div><span className="font-semibold">Địa chỉ:</span> TP. Hồ Chí Minh, Việt Nam</div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
