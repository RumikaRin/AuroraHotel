"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "../../components/layout/Header.tsx";
import { Footer } from "../../components/layout/Footer.tsx";

interface BookingRecord {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  status: string;
  cancelToken?: string;
}

function MyBookingsContent() {
  const searchParams = useSearchParams();

  const [bookingNumber, setBookingNumber] = useState<string>(
    searchParams.get("bookingNumber") || ""
  );
  const [email, setEmail] = useState<string>(
    searchParams.get("email") || ""
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [bookingData, setBookingData] = useState<BookingRecord | null>(null);

  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelSuccess, setCancelSuccess] = useState<boolean>(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingNumber || !email) return;

    setIsLoading(true);
    setErrorMessage("");
    setBookingData(null);
    setCancelSuccess(false);

    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingNumber, email }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không tìm thấy thông tin đơn đặt phòng");
      }

      setBookingData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi tra cứu";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingNumber && email) {
      handleLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelBooking = async () => {
    if (!bookingData || !bookingData.cancelToken) return;
    if (!confirm("Bạn có chắc chắn muốn huỷ đơn đặt phòng này? Hành động này sẽ giải phóng phòng.")) return;

    setIsCancelling(true);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.id,
          token: bookingData.cancelToken,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Huỷ đơn thất bại");
      }

      setBookingData({ ...bookingData, status: "CANCELLED" });
      setCancelSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Huỷ đơn không thành công";
      alert(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242826] flex flex-col font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-[#C5A46D] uppercase tracking-widest">
            AURORA SELF-SERVICE PORTAL
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#17211D]">
            Tra Cứu & Quản Lý Đặt Phòng
          </h1>
          <p className="text-sm text-[#242826]/70">
            Nhập mã đặt phòng (VD: AUR-...) và email để kiểm tra trạng thái hoặc huỷ đơn đặt phòng.
          </p>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleLookup} className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#DADDD8] shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">Mã Đặt Phòng (Booking Number)</label>
              <input
                type="text"
                placeholder="AUR-260801-A1B2"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm uppercase font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">Email Đặt Phòng</label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !bookingNumber || !email}
            className="w-full py-3.5 rounded-xl bg-[#17211D] text-[#F7F4ED] text-sm font-semibold hover:bg-[#242826] disabled:opacity-50 transition-all shadow-sm"
          >
            {isLoading ? "Đang tra cứu..." : "Tìm Đơn Đặt Phòng →"}
          </button>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#B84A4A]/10 border border-[#B84A4A] text-[#B84A4A] text-sm font-medium text-center">
            {errorMessage}
          </div>
        )}

        {cancelSuccess && (
          <div className="p-4 rounded-xl bg-[#2E7D5A]/10 border border-[#2E7D5A] text-[#2E7D5A] text-sm font-medium text-center">
            ✓ Đơn đặt phòng đã được huỷ thành công và giải phóng phòng về kho khả dụng.
          </div>
        )}

        {/* Booking Details Card */}
        {bookingData && (
          <div className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#DADDD8] shadow-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DADDD8]">
              <div>
                <span className="text-xs text-[#242826]/60">Mã đơn đặt phòng</span>
                <div className="text-2xl font-mono font-bold text-[#17211D]">{bookingData.bookingNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#242826]/60">Trạng thái</span>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                      bookingData.status === "CONFIRMED"
                        ? "bg-[#2E7D5A]/10 text-[#2E7D5A]"
                        : bookingData.status === "CANCELLED"
                        ? "bg-[#B84A4A]/10 text-[#B84A4A]"
                        : "bg-[#C48138]/10 text-[#C48138]"
                    }`}
                  >
                    {bookingData.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#17211D] uppercase tracking-wider">Thông Tin Khách</div>
                <div><span className="text-[#242826]/70">Họ tên:</span> <span className="font-semibold">{bookingData.guestName}</span></div>
                <div><span className="text-[#242826]/70">Email:</span> <span>{bookingData.guestEmail}</span></div>
                <div><span className="text-[#242826]/70">SĐT:</span> <span>{bookingData.guestPhone}</span></div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#17211D] uppercase tracking-wider">Chi Tiết Kỳ Nghỉ</div>
                <div><span className="text-[#242826]/70">Nhận phòng:</span> <span className="font-semibold">{new Date(bookingData.checkIn).toLocaleDateString("vi-VN")}</span></div>
                <div><span className="text-[#242826]/70">Trả phòng:</span> <span className="font-semibold">{new Date(bookingData.checkOut).toLocaleDateString("vi-VN")}</span></div>
                <div><span className="text-[#242826]/70">Số đêm:</span> <span>{bookingData.nights} đêm</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DADDD8] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#242826]/60">Tổng cộng thanh toán</span>
                <div className="text-xl font-bold text-[#17211D]">{bookingData.totalAmount?.toLocaleString("vi-VN")} VND</div>
              </div>

              {bookingData.status !== "CANCELLED" && bookingData.status !== "CHECKED_OUT" && (
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="px-5 py-2.5 rounded-xl border border-[#B84A4A] text-[#B84A4A] text-xs font-semibold hover:bg-[#B84A4A] hover:text-white transition-all disabled:opacity-50"
                >
                  {isCancelling ? "Đang xử lý..." : "Huỷ Đơn Đặt Phòng"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-semibold">Đang tải...</div>}>
      <MyBookingsContent />
    </Suspense>
  );
}
