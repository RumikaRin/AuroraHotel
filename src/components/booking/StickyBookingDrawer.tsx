"use client";

import { useState } from "react";

interface StickyBookingDrawerProps {
  totalAmountFormatted: string;
  roomCount: number;
  nightCount: number;
  discountFormatted?: string;
  onNextStep: () => void;
  nextStepText: string;
  isSubmitting?: boolean;
}

export function StickyBookingDrawer({ totalAmountFormatted, roomCount, nightCount, discountFormatted, onNextStep, nextStepText, isSubmitting = false }: StickyBookingDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className="booking-mobile-drawer" aria-label="Tóm tắt đặt phòng trên di động">
      {isExpanded && (
        <div className="booking-mobile-details">
          <div><span>Số phòng</span><strong>{roomCount}</strong></div>
          <div><span>Thời gian lưu trú</span><strong>{nightCount ? `${nightCount} đêm` : "Chưa đủ ngày"}</strong></div>
          {discountFormatted && <div><span>Ưu đãi</span><strong>-{discountFormatted}</strong></div>}
          <p>Giá hiển thị là dữ liệu từ báo giá hiện tại; hệ thống sẽ kiểm tra lại khi gửi yêu cầu.</p>
        </div>
      )}
      <div className="booking-mobile-bar">
        <button type="button" className="booking-mobile-toggle" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded}>
          <span>Chi tiết tổng đơn</span><strong>{totalAmountFormatted}</strong>
        </button>
        <button type="button" className="booking-mobile-next" onClick={onNextStep} disabled={isSubmitting}>{isSubmitting ? "Đang cập nhật…" : nextStepText} <span aria-hidden="true">↗</span></button>
      </div>
      <style>{`
        .booking-mobile-drawer { display: none; }
        @media (max-width: 900px) {
          .booking-mobile-drawer { position: fixed; z-index: 50; right: 0; bottom: 0; left: 0; display: block; border-top: 1px solid rgba(181,154,107,.45); background: rgba(251,248,242,.97); box-shadow: 0 -18px 45px rgba(38,30,26,.16); backdrop-filter: blur(14px); }
          .booking-mobile-details { display: grid; gap: 9px; padding: 16px 18px; border-bottom: 1px solid var(--line); color: var(--taupe); font-size: 11px; }
          .booking-mobile-details div { display: flex; justify-content: space-between; gap: 12px; }
          .booking-mobile-details strong { color: var(--espresso); }
          .booking-mobile-details p { margin: 5px 0 0; padding-top: 10px; border-top: 1px solid var(--line); font-size: 10px; line-height: 1.5; }
          .booking-mobile-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; }
          .booking-mobile-toggle { display: grid; gap: 4px; border: 0; background: transparent; color: var(--taupe); text-align: left; font-size: 10px; }
          .booking-mobile-toggle strong { color: var(--espresso); font: 600 21px/1 var(--font-display); }
          .booking-mobile-next { min-height: 46px; padding: 0 14px; border: 0; border-radius: 5px; background: var(--espresso); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
          .booking-mobile-next:disabled { opacity: .48; cursor: wait; }
        }
      `}</style>
    </aside>
  );
}
