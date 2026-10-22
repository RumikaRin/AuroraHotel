"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoomMatrixGrid, MatrixRoomItem } from "@/components/operations/RoomMatrixGrid";

interface ReceptionBooking {
  id: string;
  bookingNumber: string;
  guestName: string;
  roomCategoryId: string;
  roomCategoryName: string;
  status: string;
  checkIn: string;
  checkOut: string;
  assignedRoom?: string | null;
  assignedRoomId?: string | null;
}

export default function ReceptionPage() {
  const [matrixRooms, setMatrixRooms] = useState<MatrixRoomItem[]>([]);
  const [bookings, setBookings] = useState<ReceptionBooking[]>([]);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<ReceptionBooking | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/operations/reception");
      if (!res.ok) throw new Error("Failed to load operations data");
      const json = await res.json();
      if (json.success) {
        setBookings(json.bookings || []);
        setMatrixRooms(json.rooms || []);
      }
    } catch {
      setActionMessage("Lỗi tải dữ liệu phòng và đơn đặt.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const initiateCheckIn = (booking: ReceptionBooking) => {
    setSelectedBookingForCheckIn(booking);
    // Find available CLEAN rooms for this booking's category
    const availableClean = matrixRooms.filter(
      (r) => r.roomCategoryId === booking.roomCategoryId && r.status === "CLEAN"
    );
    setSelectedRoomId(booking.assignedRoomId || (availableClean[0]?.id ?? ""));
  };

  const confirmCheckIn = async () => {
    if (!selectedBookingForCheckIn) return;
    try {
      const res = await fetch("/api/operations/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForCheckIn.id,
          roomId: selectedRoomId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Check-in thất bại");
      }
      setActionMessage(`Check-in thành công cho đơn ${selectedBookingForCheckIn.bookingNumber}`);
      setSelectedBookingForCheckIn(null);
      fetchData();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Check-in thất bại");
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    try {
      const res = await fetch("/api/operations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Check-out thất bại");
      }
      setActionMessage("Check-out thành công. Phòng đã chuyển sang trạng thái DIRTY.");
      fetchData();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Check-out thất bại");
    }
  };

  const cleanRoomsForCategory = selectedBookingForCheckIn
    ? matrixRooms.filter((r) => r.roomCategoryId === selectedBookingForCheckIn.roomCategoryId && r.status === "CLEAN")
    : [];

  return (
    <div className="min-h-screen bg-aurora-ivory text-aurora-espresso flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center bg-aurora-espresso text-aurora-ivory p-6 rounded-surface border border-aurora-brass/30">
          <div>
            <span className="text-xs text-aurora-brass font-bold uppercase tracking-wider">RECEPTIONIST DESK</span>
            <h1 className="font-serif-display text-2xl font-light">Nghiệp Vụ Lễ Tân & Check-in / Out</h1>
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

        {/* Room Assignment Modal */}
        {selectedBookingForCheckIn && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-aurora-ivory text-aurora-espresso p-6 rounded-surface border border-aurora-brass max-w-md w-full space-y-4">
              <h3 className="font-serif-display text-xl font-bold">Xác Nhận Check-In & Phân Phòng</h3>
              <p className="text-xs text-aurora-taupe">
                Đơn: <strong>{selectedBookingForCheckIn.bookingNumber}</strong> ({selectedBookingForCheckIn.guestName})
                <br />
                Hạng phòng: <strong>{selectedBookingForCheckIn.roomCategoryName}</strong>
              </p>

              <div>
                <label className="text-xs font-bold block mb-2">Gợi ý phòng CLEAN khả dụng:</label>
                {cleanRoomsForCategory.length === 0 ? (
                  <p className="text-xs text-aurora-error">Không có phòng sạch khả dụng cho hạng phòng này.</p>
                ) : (
                  <select
                    className="w-full min-h-[44px] border border-aurora-mist rounded-input p-2 text-xs bg-white"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                  >
                    {cleanRoomsForCategory.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        Phòng {rm.roomNumber} (Tầng {rm.floor}) — {rm.status}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-aurora-mist">
                <button
                  onClick={() => setSelectedBookingForCheckIn(null)}
                  className="px-4 py-2 min-h-[44px] border border-aurora-mist rounded-control text-xs"
                >
                  Huỷ
                </button>
                <button
                  onClick={confirmCheckIn}
                  disabled={cleanRoomsForCategory.length === 0 && !selectedBookingForCheckIn.assignedRoomId}
                  className="px-4 py-2 min-h-[44px] bg-aurora-success text-white rounded-control text-xs font-bold disabled:opacity-50"
                >
                  Xác Nhận Check-In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Matrix Grid */}
        <div className="space-y-4">
          <h2 className="font-serif-luxury text-2xl font-bold text-aurora-espresso">
            Sơ Đồ Phòng Theo Tầng & Trạng Thái Trực Quan
          </h2>
          {isLoading ? (
            <div className="p-8 text-center text-xs text-aurora-taupe">Đang tải sơ đồ phòng...</div>
          ) : (
            <RoomMatrixGrid rooms={matrixRooms} />
          )}
        </div>

        {/* Bookings table */}
        <div className="bg-aurora-ivory rounded-surface p-6 border border-aurora-mist shadow-sm space-y-4">
          <h2 className="font-serif-display text-xl text-aurora-espresso">Danh Sách Đơn Đặt Phòng Lưu Trú</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-aurora-mist text-aurora-espresso font-bold">
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Tên Khách</th>
                  <th className="p-3">Hạng Phòng</th>
                  <th className="p-3">Số Phòng</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác Lễ Tân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-mist/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-aurora-linen/50">
                    <td className="p-3 font-mono font-bold text-aurora-espresso">{b.bookingNumber}</td>
                    <td className="p-3 font-semibold">{b.guestName}</td>
                    <td className="p-3">{b.roomCategoryName}</td>
                    <td className="p-3 font-mono text-aurora-walnut font-bold">{b.assignedRoom || "Chưa gán"}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        b.status === "CONFIRMED" ? "bg-aurora-success/10 text-aurora-success" :
                        b.status === "CHECKED_IN" ? "bg-aurora-information/10 text-aurora-information" : "bg-aurora-mist text-aurora-espresso"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => initiateCheckIn(b)}
                          className="px-3 py-2 min-h-[44px] rounded-control bg-aurora-success text-white text-[11px] font-semibold hover:opacity-90"
                        >
                          Check-in
                        </button>
                      )}
                      {b.status === "CHECKED_IN" && (
                        <button
                          onClick={() => handleCheckOut(b.id)}
                          className="px-3 py-2 min-h-[44px] rounded-control bg-aurora-warning text-white text-[11px] font-semibold hover:opacity-90"
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
