"use client";

import { useState } from "react";
import { RoomCategoryData } from "./SuiteSpotlight";
import { AvailabilityPicker } from "@/components/booking/AvailabilityPicker";

interface Props {
  category: RoomCategoryData;
  onClose: () => void;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function BookingModal({ category, onClose }: Props) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const next2DaysStr = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(next2DaysStr);
  const [guestsCount, setGuestsCount] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    id: string;
    bookingCode: string;
    status: string;
    totalAmount: number;
  } | null>(null);

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));
  const estimatedTotal = category.basePrice * nights;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCategoryId: category.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guestsCount,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
          idempotencyKey: `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Không thể tạo đặt phòng. Vui lòng thử lại.");
      }

      setBookingResult({
        id: data.booking?.id || "bkg-" + Date.now(),
        bookingCode: data.booking?.bookingCode || data.bookingCode || "AUR-" + Math.floor(100000 + Math.random() * 900000),
        status: data.booking?.status || "CONFIRMED",
        totalAmount: data.booking?.totalAmount || estimatedTotal,
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo đặt phòng.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[var(--bg-surface-card)] text-[var(--text-primary)] w-full max-w-2xl rounded-3xl shadow-2xl border border-[var(--brass-hairline)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[var(--bg-surface-deep)] text-[var(--text-primary)] p-6 border-b border-[var(--brass-hairline)] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[var(--accent-brass)] font-bold">
              Đặt Phòng Trực Tiếp 5-Star
            </span>
            <h3 className="font-serif-luxury text-2xl font-normal text-[var(--text-primary)] mt-0.5">
              {category.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[var(--brass-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] flex items-center justify-center transition-all min-h-[44px] min-w-[44px]"
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>

        {/* Stepper Status Bar */}
        <div className="bg-[var(--bg-surface-deep)] px-6 py-3 border-b border-[var(--brass-hairline)] flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
          <span className={step === 1 ? "text-[var(--accent-brass)] underline" : ""}>1. Ngày & Số Khách</span>
          <span>→</span>
          <span className={step === 2 ? "text-[var(--accent-brass)] underline" : ""}>2. Thông Tin Khách</span>
          <span>→</span>
          <span className={step === 3 ? "text-emerald-400 underline" : ""}>3. Hoàn Tất</span>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-xs font-semibold text-red-300">
              ⚠️ {errorMsg}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <AvailabilityPicker
                checkIn={checkIn}
                checkOut={checkOut}
                guests={String(guestsCount)}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                onGuestsChange={(val) => setGuestsCount(Number(val) || 2)}
              />

              {/* Price Calculation Summary Card */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--brass-hairline)] space-y-2">
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Đơn giá theo đêm:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formatVND(category.basePrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Số đêm lưu trú:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{nights} đêm</span>
                </div>
                <div className="pt-2 border-t border-[var(--brass-hairline)] flex justify-between text-sm font-bold text-[var(--text-primary)]">
                  <span>Tổng tiền dự kiến:</span>
                  <span className="text-[var(--accent-brass)]">{formatVND(estimatedTotal)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl text-xs font-semibold bg-[var(--accent-brass)] text-[#110e0c] hover:bg-[var(--accent-brass-bright)] transition-all min-h-[44px] cursor-pointer"
                >
                  Tiếp Tục Nhập Thông Tin Khách →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label htmlFor="guestName" className="block text-xs font-bold uppercase text-[var(--accent-brass)] mb-1">
                  Họ và Tên Khách Đặt *
                </label>
                <input
                  type="text"
                  id="guestName"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-[var(--brass-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guestEmail" className="block text-xs font-bold uppercase text-[var(--accent-brass)] mb-1">
                    Email Xác Nhận *
                  </label>
                  <input
                    type="email"
                    id="guestEmail"
                    required
                    placeholder="nguyenvana@gmail.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-[var(--brass-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="guestPhone" className="block text-xs font-bold uppercase text-[var(--accent-brass)] mb-1">
                    Số Điện Thoại *
                  </label>
                  <input
                    type="tel"
                    id="guestPhone"
                    required
                    placeholder="0912345678"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-[var(--brass-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialRequests" className="block text-xs font-bold uppercase text-[var(--accent-brass)] mb-1">
                  Yêu Cầu Đặc Biệt (Tùy chọn)
                </label>
                <textarea
                  id="specialRequests"
                  rows={2}
                  placeholder="Ví dụ: Nhận phòng sớm, giường đôi tầng cao, chuẩn bị bánh sinh nhật..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-[var(--brass-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[var(--brass-hairline)]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--brass-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  ← Quay Lại
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl text-xs font-semibold bg-[var(--accent-brass)] text-[#110e0c] hover:bg-[var(--accent-brass-bright)] transition-all shadow-md min-h-[44px] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#110e0c] border-t-transparent rounded-full animate-spin" />
                      Đang Xử Lý Đặt Phòng...
                    </>
                  ) : (
                    "Xác Nhận & Đặt Phòng"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && bookingResult && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[var(--accent-brass)] font-bold">
                  Đặt Phòng Thành Công!
                </span>
                <h4 className="font-serif-luxury text-3xl font-normal text-[var(--text-primary)]">
                  Mã Đặt Phòng: <span className="text-[var(--accent-brass)]">{bookingResult.bookingCode}</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Cảm ơn quý khách <span className="font-bold text-[var(--text-primary)]">{guestName}</span>. Xác nhận đặt phòng đã được lưu trên hệ thống và gửi đến email <span className="font-bold text-[var(--text-primary)]">{guestEmail}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--brass-hairline)] max-w-md mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Hạng phòng:</span>
                  <span className="font-bold text-[var(--text-primary)]">{category.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Thời gian:</span>
                  <span className="font-bold text-[var(--text-primary)]">{checkIn} đến {checkOut} ({nights} đêm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Tổng chi phí:</span>
                  <span className="font-bold text-emerald-400 text-sm">{formatVND(bookingResult.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-xs font-semibold border border-[var(--brass-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] min-h-[44px] cursor-pointer"
                >
                  Đóng Hộp Thoại
                </button>
                <a
                  href={`/my-bookings`}
                  className="px-6 py-3 rounded-xl text-xs font-semibold bg-[var(--accent-brass)] text-[#110e0c] hover:bg-[var(--accent-brass-bright)] min-h-[44px] inline-flex items-center justify-center cursor-pointer"
                >
                  Tra Cứu Mã Đặt Phòng →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
