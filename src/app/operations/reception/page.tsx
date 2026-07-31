"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface ReceptionBooking {
  id: string;
  bookingNumber: string;
  guestName: string;
  roomCategoryName: string;
  status: string;
  checkIn: string;
  checkOut: string;
  assignedRoom?: string;
}

export default function ReceptionPage() {
  const [bookings, setBookings] = useState<ReceptionBooking[]>([]);
  const [actionMessage, setActionMessage] = useState<string>("");

  const fetchData = async () => {
    const mockBookings: ReceptionBooking[] = [
      { id: "bk-101", bookingNumber: "AUR-260801-X1Y2", guestName: "Nguyễn Văn A", roomCategoryName: "Deluxe Ocean King", status: "CONFIRMED", checkIn: "2026-08-01", checkOut: "2026-08-03", assignedRoom: "101" },
      { id: "bk-102", bookingNumber: "AUR-260801-Z9K8", guestName: "Trần Thị B", roomCategoryName: "Executive Bay Suite", status: "CHECKED_IN", checkIn: "2026-08-01", checkOut: "2026-08-04", assignedRoom: "201" },
    ];
    setBookings(mockBookings);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CHECKED_IN" } : b))
    );
    setActionMessage(`Đã thực hiện Check-in cho đơn ${bookingId}`);
  };

  const handleCheckOut = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CHECKED_OUT" } : b))
    );
    setActionMessage(`Đã thực hiện Check-out cho đơn ${bookingId}. Phòng đã chuyển sang trạng thái DIRTY.`);
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242826] flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
          <div>
            <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">RECEPTIONIST DESK</span>
            <h1 className="font-serif-display text-2xl font-light">Nghiệp Vụ Lễ Tân & Check-in / Out</h1>
          </div>
          <Link href="/admin" className="text-xs text-[#C5A46D] border border-[#C5A46D]/40 px-3 py-1.5 rounded-lg hover:bg-[#C5A46D]/10">
            Về Dashboard Quản Trị
          </Link>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-xl bg-[#2E7D5A]/10 border border-[#2E7D5A] text-[#2E7D5A] text-xs font-semibold">
            ✓ {actionMessage}
          </div>
        )}

        {/* Bookings table */}
        <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#DADDD8] shadow-sm space-y-4">
          <h2 className="font-serif-display text-xl text-[#17211D]">Danh Sách Đơn Đặt Phòng Lưu Trú</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DADDD8] text-[#17211D] font-bold">
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Tên Khách</th>
                  <th className="p-3">Hạng Phòng</th>
                  <th className="p-3">Số Phòng</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác Lễ Tân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DADDD8]/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F7F4ED]/50">
                    <td className="p-3 font-mono font-bold text-[#17211D]">{b.bookingNumber}</td>
                    <td className="p-3 font-semibold">{b.guestName}</td>
                    <td className="p-3">{b.roomCategoryName}</td>
                    <td className="p-3 font-mono text-[#355B4B] font-bold">{b.assignedRoom || "Chưa gán"}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        b.status === "CONFIRMED" ? "bg-[#2E7D5A]/10 text-[#2E7D5A]" :
                        b.status === "CHECKED_IN" ? "bg-[#3F6D8C]/10 text-[#3F6D8C]" : "bg-[#DADDD8] text-[#242826]"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleCheckIn(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#2E7D5A] text-white text-[11px] font-semibold hover:bg-[#256649]"
                        >
                          Check-in
                        </button>
                      )}
                      {b.status === "CHECKED_IN" && (
                        <button
                          onClick={() => handleCheckOut(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#C48138] text-white text-[11px] font-semibold hover:bg-[#a66d2e]"
                        >
                          Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
