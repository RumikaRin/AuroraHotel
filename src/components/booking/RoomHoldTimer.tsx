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
    </div>
  );
}
