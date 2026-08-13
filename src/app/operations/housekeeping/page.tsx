"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { RoomMatrixGrid, MatrixRoomItem } from "@/components/operations/RoomMatrixGrid";

const INITIAL_HOUSEKEEPING_ROOMS: MatrixRoomItem[] = [
  { id: "rm-101", roomNumber: "101", categoryName: "Deluxe Ocean King", status: "CLEAN", floor: 1 },
  { id: "rm-102", roomNumber: "102", categoryName: "Deluxe Ocean King", status: "DIRTY", floor: 1 },
  { id: "rm-103", roomNumber: "103", categoryName: "Deluxe Ocean King", status: "CLEAN", floor: 1 },
  { id: "rm-201", roomNumber: "201", categoryName: "Executive Bay Suite", status: "INSPECTING", floor: 2 },
  { id: "rm-202", roomNumber: "202", categoryName: "Executive Bay Suite", status: "DIRTY", floor: 2 },
  { id: "rm-301", roomNumber: "301", categoryName: "Presidential Villa", status: "MAINTENANCE", floor: 3 },
];

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<MatrixRoomItem[]>(INITIAL_HOUSEKEEPING_ROOMS);
  const [actionMessage, setActionMessage] = useState("");

  const updateStatus = (roomId: string, newStatus: MatrixRoomItem["status"]) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
    );
    setActionMessage(`Đã cập nhật phòng sang trạng thái ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-aurora-ivory text-aurora-espresso flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center bg-aurora-espresso text-aurora-ivory p-6 rounded-surface border border-aurora-brass/30">
          <div>
            <span className="text-xs text-aurora-brass font-bold uppercase tracking-wider">HOUSEKEEPING COMMAND</span>
            <h1 className="font-serif-display text-2xl font-light">Quản Lý & Phân Luồng Dọn Phòng</h1>
          </div>
          <Link href="/admin" className="text-xs text-aurora-brass border border-aurora-brass/40 px-4 py-2 min-h-[44px] inline-flex items-center rounded-control hover:bg-aurora-brass/10">
            Về Dashboard Quản Trị
          </Link>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-input bg-aurora-success/10 border border-aurora-success text-aurora-success text-xs font-semibold">
            ✓ {actionMessage}
          </div>
        )}

        {/* Interactive Floor Matrix */}
        <div className="space-y-4">
          <h2 className="font-serif-luxury text-2xl font-bold text-aurora-espresso">
            Hàng Đợi Trạng Thái Buồng Phòng Trực Quan
          </h2>
          <RoomMatrixGrid
            rooms={rooms}
            onStatusChange={updateStatus}
            isHousekeeperView
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-aurora-ivory rounded-surface p-6 border border-aurora-mist shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-aurora-walnut">Tầng {room.floor}</span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      room.status === "CLEAN"
                        ? "bg-aurora-success/10 text-aurora-success"
                        : room.status === "DIRTY"
                        ? "bg-aurora-error/10 text-aurora-error"
                        : room.status === "INSPECTING"
                        ? "bg-aurora-warning/10 text-aurora-warning"
                        : "bg-aurora-mist text-aurora-espresso"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="text-3xl font-mono font-bold text-aurora-espresso">Phòng {room.roomNumber}</div>
                <div className="text-xs text-aurora-taupe">{room.categoryName}</div>
              </div>

              {/* Status transition controls */}
              <div className="space-y-2 pt-3 border-t border-aurora-mist">
                <span className="text-[11px] font-semibold text-aurora-espresso">Cập nhật trạng thái:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(room.id, "CLEAN")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-success/10 text-aurora-success text-[11px] font-bold hover:bg-aurora-success hover:text-white transition-all"
                  >
                    Clean
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "DIRTY")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-error/10 text-aurora-error text-[11px] font-bold hover:bg-aurora-error hover:text-white transition-all"
                  >
                    Dirty
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "INSPECTING")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-warning/10 text-aurora-warning text-[11px] font-bold hover:bg-aurora-warning hover:text-white transition-all"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "MAINTENANCE")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-espresso/10 text-aurora-espresso text-[11px] font-bold hover:bg-aurora-espresso hover:text-white transition-all"
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
