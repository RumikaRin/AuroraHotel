"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "../../components/layout/Header.tsx";
import { Footer } from "../../components/layout/Footer.tsx";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [roomCategoryId, setRoomCategoryId] = useState<string>(
    searchParams.get("roomCategoryId") || "cat-deluxe-king"
  );
  const [ratePlanId, setRatePlanId] = useState<string>(
    searchParams.get("ratePlanId") || "rp-flex"
  );
  const [checkIn, setCheckIn] = useState<string>(
    searchParams.get("checkIn") || new Date().toISOString().slice(0, 10)
  );
  const [checkOut, setCheckOut] = useState<string>(
    searchParams.get("checkOut") || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );

  // Guest details
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<string>("MOCK_PAYMENT");

  // Booking result state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingNumber: string;
    totalAmount: number;
    status: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Calculation helpers
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const baseRate = roomCategoryId.includes("executive") ? 4200000 : 2500000;
  const planMultiplier = ratePlanId.includes("non-ref") ? 0.85 : 1.0;
  const nightlyPrice = Math.round(baseRate * planMultiplier);
  const subtotal = nightlyPrice * nights;
  const taxesAndFees = Math.round(subtotal * 0.1);
  const totalAmount = subtotal + taxesAndFees;

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCategoryId,
          ratePlanId,
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
          paymentMethod,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Đặt phòng thất bại. Vui lòng thử lại.");
      }

      setBookingResult({
        bookingNumber: json.data.bookingNumber,
        totalAmount: json.data.totalAmount,
        status: json.data.status,
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242826] flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Stepper Header */}
        <div className="bg-[#FFFDF8] rounded-2xl p-6 border border-[#DADDD8] shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-[#17211D] text-[#C5A46D]" : "bg-[#DADDD8] text-[#242826]"
              }`}
            >
              1
            </span>
            <span className="text-sm font-semibold text-[#17211D]">Chọn Hạng Phòng</span>
          </div>
          <div className="w-12 h-0.5 bg-[#DADDD8]" />
          <div className="flex items-center space-x-4">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-[#17211D] text-[#C5A46D]" : "bg-[#DADDD8] text-[#242826]"
              }`}
            >
              2
            </span>
            <span className="text-sm font-semibold text-[#17211D]">Thông Tin Khách Hàng</span>
          </div>
          <div className="w-12 h-0.5 bg-[#DADDD8]" />
          <div className="flex items-center space-x-4">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? "bg-[#17211D] text-[#C5A46D]" : "bg-[#DADDD8] text-[#242826]"
              }`}
            >
              3
            </span>
            <span className="text-sm font-semibold text-[#17211D]">Xác Nhận & Thanh Toán</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Step Dynamic Body */}
          <div className="lg:col-span-8 space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-[#B84A4A]/10 border border-[#B84A4A] text-[#B84A4A] text-sm font-medium">
                {errorMessage}
              </div>
            )}

            {/* STEP 1: Dates & Selection */}
            {step === 1 && (
              <div className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#DADDD8] space-y-6 shadow-sm">
                <h2 className="font-serif-display text-2xl text-[#17211D]">Bước 1: Chọn Ngày & Hạng Phòng</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#17211D] mb-1">Ngày Nhận Phòng (Check-in)</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17211D] mb-1">Ngày Trả Phòng (Check-out)</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#DADDD8]">
                  <label className="block text-xs font-semibold text-[#17211D]">Chọn Hạng Phòng:</label>
                  <select
                    value={roomCategoryId}
                    onChange={(e) => setRoomCategoryId(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm font-medium text-[#17211D]"
                  >
                    <option value="cat-deluxe-king">Deluxe Ocean King Suite - 2.500.000 VND / đêm</option>
                    <option value="cat-executive-suite">Executive Bay Suite - 4.200.000 VND / đêm</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-[#17211D]">Chọn Gói Giá:</label>
                  <select
                    value={ratePlanId}
                    onChange={(e) => setRatePlanId(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm font-medium text-[#17211D]"
                  >
                    <option value="rp-flex">Linh Hoạt Huỷ Phòng (Flexible Rate - 100%)</option>
                    <option value="rp-non-ref">Ưu Đãi Không Hoàn Huỷ (Non-Refundable - Giảm 15%)</option>
                  </select>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl bg-[#17211D] text-[#F7F4ED] text-sm font-semibold hover:bg-[#242826] transition-all shadow-md mt-4"
                >
                  Tiếp Tục: Nhập Thông Tin Khách Hàng →
                </button>
              </div>
            )}

            {/* STEP 2: Guest Information */}
            {step === 2 && (
              <div className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#DADDD8] space-y-6 shadow-sm">
                <h2 className="font-serif-display text-2xl text-[#17211D]">Bước 2: Thông Tin Liên Hệ Khách Hàng</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#17211D] mb-1">Họ & Tên *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17211D] mb-1">Email Nhận Xác Nhận *</label>
                    <input
                      type="email"
                      placeholder="nguyen@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17211D] mb-1">Số Điện Thoại Liên Hệ *</label>
                    <input
                      type="tel"
                      placeholder="+84 90 123 4567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17211D] mb-1">Yêu Cầu Đặc Biệt (Tuỳ chọn)</label>
                    <textarea
                      rows={3}
                      placeholder="Ví dụ: Tầng cao, giường phụ, mừng kỷ niệm ngày cưới..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#DADDD8]">
                  <label className="block text-xs font-semibold text-[#17211D]">Hình Thức Thanh Toán:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("MOCK_PAYMENT")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        paymentMethod === "MOCK_PAYMENT"
                          ? "border-[#C5A46D] bg-[#F7F4ED] font-semibold"
                          : "border-[#DADDD8]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#17211D]">Thẻ Ngân Hàng / Mock Payment</div>
                      <div className="text-[11px] text-[#355B4B] mt-1">Xác nhận đơn lập tức trong môi trường Demo</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PAY_AT_HOTEL")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        paymentMethod === "PAY_AT_HOTEL"
                          ? "border-[#C5A46D] bg-[#F7F4ED] font-semibold"
                          : "border-[#DADDD8]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#17211D]">Thanh Toán Tại Khách Sạn</div>
                      <div className="text-[11px] text-[#242826]/70 mt-1">Thanh toán trực tiếp khi check-in</div>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3.5 rounded-xl border border-[#17211D] text-[#17211D] text-sm font-semibold hover:bg-[#17211D] hover:text-[#F7F4ED] transition-all"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={handleSubmitBooking}
                    disabled={isSubmitting || !guestName || !guestEmail || !guestPhone}
                    className="w-2/3 py-3.5 rounded-xl bg-[#C5A46D] text-[#17211D] text-sm font-semibold hover:bg-[#b0905b] disabled:opacity-50 transition-all shadow-md"
                  >
                    {isSubmitting ? "Đang xử lý đặt phòng..." : "Hoàn Tất Đặt Phòng ✨"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirmation Result */}
            {step === 3 && bookingResult && (
              <div className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#2E7D5A]/40 space-y-6 shadow-md text-center">
                <div className="w-16 h-16 rounded-full bg-[#2E7D5A]/10 text-[#2E7D5A] mx-auto flex items-center justify-center text-3xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#2E7D5A] uppercase tracking-widest">
                    ĐẶT PHÒNG THÀNH CÔNG
                  </span>
                  <h2 className="font-serif-display text-3xl text-[#17211D]">Cảm ơn bạn đã lựa chọn Aurora Hotel!</h2>
                  <p className="text-sm text-[#242826]/80 max-w-md mx-auto">
                    Mã xác nhận đơn hàng của bạn là:
                  </p>
                  <div className="text-2xl font-mono font-bold text-[#17211D] bg-[#F7F4ED] inline-block px-6 py-2 rounded-xl border border-[#C5A46D]">
                    {bookingResult.bookingNumber}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#F7F4ED] text-left space-y-2 text-xs text-[#17211D]">
                  <div className="flex justify-between">
                    <span>Trạng Thái Đơn:</span>
                    <span className="font-bold text-[#2E7D5A]">{bookingResult.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng Số Tiền:</span>
                    <span className="font-bold text-[#17211D]">{bookingResult.totalAmount.toLocaleString("vi-VN")} VND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Nhận Xác Nhận:</span>
                    <span className="font-semibold">{guestEmail}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button
                    onClick={() => router.push(`/my-bookings?bookingNumber=${bookingResult.bookingNumber}&email=${encodeURIComponent(guestEmail)}`)}
                    className="px-6 py-3 rounded-xl bg-[#17211D] text-[#F7F4ED] text-xs font-semibold hover:bg-[#242826] transition-all"
                  >
                    Xem Chi Tiết Đơn Hàng
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 rounded-xl border border-[#17211D] text-[#17211D] text-xs font-semibold hover:bg-[#17211D] hover:text-[#F7F4ED] transition-all"
                  >
                    Về Trang Chủ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Order Summary Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-[#FFFDF8] rounded-3xl p-6 border border-[#DADDD8] shadow-sm space-y-4">
              <h3 className="font-serif-display text-xl text-[#17211D] pb-3 border-b border-[#DADDD8]">
                Tóm Tắt Đặt Phòng
              </h3>

              <div className="space-y-3 text-xs text-[#242826]">
                <div className="flex justify-between">
                  <span className="text-[#242826]/70">Hạng phòng:</span>
                  <span className="font-semibold text-[#17211D]">
                    {roomCategoryId.includes("executive") ? "Executive Bay Suite" : "Deluxe Ocean King"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#242826]/70">Thời gian lưu trú:</span>
                  <span className="font-semibold text-[#17211D]">{nights} đêm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#242826]/70">Check-in:</span>
                  <span className="font-semibold">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#242826]/70">Check-out:</span>
                  <span className="font-semibold">{checkOut}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DADDD8] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Giá phòng ({nights} đêm):</span>
                  <span>{subtotal.toLocaleString("vi-VN")} VND</span>
                </div>
                <div className="flex justify-between text-[#242826]/70">
                  <span>Thuế & Phí dịch vụ (10%):</span>
                  <span>{taxesAndFees.toLocaleString("vi-VN")} VND</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#17211D] pt-2 border-t border-[#DADDD8]">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#355B4B]">{totalAmount.toLocaleString("vi-VN")} VND</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-semibold">Đang tải...</div>}>
      <BookingContent />
    </Suspense>
  );
}
