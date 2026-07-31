"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookingConsole() {
  const router = useRouter();
  const todayStr = new Date().toISOString().slice(0, 10);
  const next2DaysStr = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(next2DaysStr);
  const [guests, setGuests] = useState("2");
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAvailabilityNotice(null);

    try {
      const res = await fetch(`/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      if (res.ok) {
        const data = await res.json();
        const availableCount = data.quotes ? data.quotes.length : 0;
        if (availableCount > 0) {
          setAvailabilityNotice(`Tìm thấy ${availableCount} hạng phòng khả dụng! Đang chuyển đến danh sách...`);
          setTimeout(() => {
            router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
          }, 600);
        } else {
          setAvailabilityNotice("Không có phòng trống trong khoảng ngày đã chọn. Vui lòng chọn ngày khác.");
        }
      } else {
        router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      }
    } catch {
      router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="booking-console" className="relative z-20 max-w-5xl mx-auto px-4 -mt-16 sm:-mt-20">
      <div className="bg-[#FFFDF8] text-[#17211D] p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#C5A46D]/40 backdrop-blur-md">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#DADDD8]/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D5A]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#355B4B]">
              Đảm Bảo Tồn Kho & Giá Trực Tiếp Nhất
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#B97857] bg-[#B97857]/10 px-3 py-1 rounded-full">
            ✦ Ưu đãi Đặt Trực Tiếp: Giảm 10% & Hủy Miễn Phí
          </span>
        </div>

        {/* Console Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Check In */}
          <div>
            <label htmlFor="checkIn" className="block text-xs font-bold uppercase tracking-wider text-[#355B4B] mb-1.5">
              Ngày Nhận Phòng
            </label>
            <input
              type="date"
              id="checkIn"
              name="checkIn"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={todayStr}
              required
              className="w-full text-sm p-3 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-[#17211D] font-medium focus:outline-none focus:ring-2 focus:ring-[#C5A46D] min-h-[44px]"
            />
          </div>

          {/* Check Out */}
          <div>
            <label htmlFor="checkOut" className="block text-xs font-bold uppercase tracking-wider text-[#355B4B] mb-1.5">
              Ngày Trả Phòng
            </label>
            <input
              type="date"
              id="checkOut"
              name="checkOut"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              required
              className="w-full text-sm p-3 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-[#17211D] font-medium focus:outline-none focus:ring-2 focus:ring-[#C5A46D] min-h-[44px]"
            />
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="guests" className="block text-xs font-bold uppercase tracking-wider text-[#355B4B] mb-1.5">
              Số Lượng Khách
            </label>
            <select
              id="guests"
              name="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-[#17211D] font-medium focus:outline-none focus:ring-2 focus:ring-[#C5A46D] min-h-[44px]"
            >
              <option value="1">1 Khách (Người lớn)</option>
              <option value="2">2 Khách (Phù hợp nhất)</option>
              <option value="3">3 Khách (Gia đình)</option>
              <option value="4">4 Khách (Gia đình / Nhóm)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold bg-[#17211D] text-[#C5A46D] hover:bg-[#242826] hover:text-[#D4B57E] transition-all shadow-md active:scale-95 disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#C5A46D] border-t-transparent rounded-full animate-spin" />
                  Đang Kiểm Tra...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Tìm Phòng Trống</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Feedback Notice */}
        {availabilityNotice && (
          <div className="mt-4 p-3 rounded-xl bg-[#2E7D5A]/10 border border-[#2E7D5A]/30 text-xs font-medium text-[#2E7D5A] text-center animate-fade-in">
            {availabilityNotice}
          </div>
        )}
      </div>
    </div>
  );
}
