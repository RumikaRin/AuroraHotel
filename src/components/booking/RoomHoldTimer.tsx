"use client";

interface RoomHoldTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
}

/**
 * Kept as a compatibility export for older customer surfaces. It deliberately
 * does not create a client-side hold or countdown; availability is owned by
 * the server and revalidated by quote/checkout.
 */
export function RoomHoldTimer(_props: RoomHoldTimerProps) {
  void _props;
  return (
    <div className="booking-live-check" role="status">
      <span aria-hidden="true">✦</span>
      <strong>Tình trạng phòng được xác thực trực tiếp</strong>
      <small>Giá và khả dụng sẽ được kiểm tra lại khi gửi yêu cầu.</small>
      <style>{`
        .booking-live-check { display: flex; align-items: center; gap: 9px; padding: 12px 14px; border: 1px solid rgba(181,154,107,.35); background: rgba(181,154,107,.1); color: var(--walnut); font-size: 11px; }
        .booking-live-check > span { color: var(--antique-brass); }
        .booking-live-check small { color: var(--taupe); }
        @media (max-width: 620px) { .booking-live-check { align-items: start; flex-wrap: wrap; } .booking-live-check small { flex-basis: 100%; margin-left: 18px; } }
      `}</style>
    </div>
  );
}
