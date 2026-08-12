"use client";

import { useState, useMemo } from "react";

export interface AdminBookingItem {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  totalAmount: number;
  status: string;
  categoryName: string;
  checkIn: string;
  checkOut: string;
}

interface BookingManagerTableProps {
  initialBookings: AdminBookingItem[];
}

export function BookingManagerTable({ initialBookings }: BookingManagerTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingItem | null>(null);

  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => {
      const matchSearch =
        search === "" ||
        b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.guestEmail.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [initialBookings, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "CHECKED_IN": return "bg-blue-100 text-blue-800 border-blue-300";
      case "CHECKED_OUT": return "bg-gray-100 text-gray-800 border-gray-300";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="bg-white p-4 rounded-2xl border border-aurora-line flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Khách, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-aurora-line text-xs text-aurora-midnight focus:outline-none focus:border-aurora-gold"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-aurora-muted mr-1">Lọc:</span>
          {["ALL", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-aurora-midnight text-aurora-gold border-aurora-midnight"
                  : "bg-white text-aurora-muted border-aurora-line hover:border-aurora-gold"
              }`}
            >
              {st === "ALL" ? "Tất Cả" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-aurora-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-aurora-ivory border-b border-aurora-line text-aurora-midnight font-bold">
                <th className="p-3.5">Mã Đơn</th>
                <th className="p-3.5">Khách Hàng</th>
                <th className="p-3.5">Hạng Phòng</th>
                <th className="p-3.5">Kỳ Nghỉ</th>
                <th className="p-3.5">Tổng Tiền</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-line/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-aurora-muted">
                    Không tìm thấy đơn đặt phòng phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-aurora-ivory/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-aurora-midnight">{b.bookingNumber}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-aurora-midnight">{b.guestName}</div>
                      <div className="text-[11px] text-aurora-muted">{b.guestEmail}</div>
                    </td>
                    <td className="p-3.5 font-medium">{b.categoryName}</td>
                    <td className="p-3.5 text-aurora-muted">
                      {b.checkIn} → {b.checkOut}
                    </td>
                    <td className="p-3.5 font-bold text-aurora-midnight">
                      {b.totalAmount.toLocaleString("vi-VN")} VND
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-aurora-midnight text-white text-[11px] font-semibold hover:bg-aurora-gold hover:text-aurora-midnight transition-all cursor-pointer"
                      >
                        Xem Đơn
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-aurora-gold/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-aurora-line">
              <div>
                <span className="text-xs font-mono text-aurora-gold font-bold block">
                  ĐƠN ĐẶT PHÒNG #{selectedBooking.bookingNumber}
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-aurora-midnight">
                  {selectedBooking.categoryName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-aurora-midnight transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-xs text-aurora-ink">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-aurora-muted">Khách Hàng:</span>
                <span className="font-bold text-aurora-midnight">{selectedBooking.guestName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-aurora-muted">Email:</span>
                <span className="font-semibold">{selectedBooking.guestEmail}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-aurora-muted">Check-in:</span>
                <span className="font-semibold">{selectedBooking.checkIn}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-aurora-muted">Check-out:</span>
                <span className="font-semibold">{selectedBooking.checkOut}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-aurora-muted">Tổng Tiền:</span>
                <span className="font-bold text-aurora-midnight text-sm">
                  {selectedBooking.totalAmount.toLocaleString("vi-VN")} VND
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-aurora-muted">Trạng Thái:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
