"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../../../components/layout/Header.tsx";
import { Footer } from "../../../components/layout/Footer.tsx";

const INITIAL_ROOMS = [
  { id: "rm-101", number: "101", category: "Deluxe Ocean King", status: "CLEAN", floor: 1 },
  { id: "rm-102", number: "102", category: "Deluxe Ocean King", status: "DIRTY", floor: 1 },
  { id: "rm-201", number: "201", category: "Executive Bay Suite", status: "INSPECTING", floor: 2 },
  { id: "rm-301", number: "301", category: "Presidential Villa", status: "MAINTENANCE", floor: 3 },
];

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [actionMessage, setActionMessage] = useState("");

  const updateStatus = (roomId: string, newStatus: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
    );
    setActionMessage(`Đã cập nhật phòng ${roomId} sang trạng thái ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242826] flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center bg-[#17211D] text-[#F7F4ED] p-6 rounded-2xl border border-[#C5A46D]/30">
          <div>
            <span className="text-xs text-[#C5A46D] font-bold uppercase tracking-wider">HOUSEKEEPING MANAGEMENT</span>
            <h1 className="font-serif-display text-2xl font-light">Quản Lý Trạng Thái Dọn Dẹp Buồng Phòng</h1>
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

        {/* Room Status Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#DADDD8] shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#355B4B]">Tầng {room.floor}</span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      room.status === "CLEAN"
                        ? "bg-[#2E7D5A]/10 text-[#2E7D5A]"
                        : room.status === "DIRTY"
                        ? "bg-[#B84A4A]/10 text-[#B84A4A]"
                        : room.status === "INSPECTING"
                        ? "bg-[#C48138]/10 text-[#C48138]"
                        : "bg-[#DADDD8] text-[#242826]"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="text-3xl font-mono font-bold text-[#17211D]">Phòng {room.number}</div>
                <div className="text-xs text-[#242826]/70">{room.category}</div>
              </div>

              {/* Status transition controls */}
              <div className="space-y-2 pt-3 border-t border-[#DADDD8]">
                <span className="text-[11px] font-semibold text-[#17211D]">Cập nhật trạng thái:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => updateStatus(room.id, "CLEAN")}
                    className="px-2 py-1.5 rounded-lg bg-[#2E7D5A]/10 text-[#2E7D5A] text-[11px] font-bold hover:bg-[#2E7D5A] hover:text-white transition-all"
                  >
                    Clean
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "DIRTY")}
                    className="px-2 py-1.5 rounded-lg bg-[#B84A4A]/10 text-[#B84A4A] text-[11px] font-bold hover:bg-[#B84A4A] hover:text-white transition-all"
                  >
                    Dirty
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "INSPECTING")}
                    className="px-2 py-1.5 rounded-lg bg-[#C48138]/10 text-[#C48138] text-[11px] font-bold hover:bg-[#C48138] hover:text-white transition-all"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "MAINTENANCE")}
                    className="px-2 py-1.5 rounded-lg bg-[#242826]/10 text-[#242826] text-[11px] font-bold hover:bg-[#242826] hover:text-white transition-all"
                  >
                    Maint
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
