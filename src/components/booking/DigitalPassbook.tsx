"use client";

interface DigitalPassbookProps {
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  roomCategoryName: string;
  checkIn: string;
  checkOut: string;
  totalAmountFormatted: string;
  status: string;
}

export function DigitalPassbook({ bookingNumber, guestName, guestEmail, roomCategoryName, checkIn, checkOut, totalAmountFormatted, status }: DigitalPassbookProps) {
  const handlePrint = () => window.print();
  const isConfirmed = status === "CONFIRMED";

  return (
    <section className="digital-passbook" aria-label="Chi tiết xác nhận đặt phòng">
      <div className="digital-passbook-header">
        <div><p>Aurora · booking record</p><h2>Chi tiết đặt phòng</h2></div>
        <div className="digital-passbook-number"><small>Mã đặt phòng</small><strong>{bookingNumber}</strong></div>
      </div>
      <div className="digital-passbook-body">
        <div className="digital-passbook-details">
          <div><small>Khách hàng</small><strong>{guestName || "Khách Aurora"}</strong><span>{guestEmail}</span></div>
          <div><small>Hạng phòng</small><strong>{roomCategoryName}</strong><span className={isConfirmed ? "confirmed" : "pending"}>{isConfirmed ? "Đã xác nhận" : status}</span></div>
          <div><small>Nhận phòng</small><strong>{checkIn}</strong><span>Từ 14:00</span></div>
          <div><small>Trả phòng</small><strong>{checkOut}</strong><span>Trước 12:00</span></div>
          <div><small>Tổng tiền</small><strong>{totalAmountFormatted}</strong><span>Theo báo giá hệ thống</span></div>
        </div>
        <div className="digital-passbook-recovery">
          <span className="digital-passbook-icon" aria-hidden="true">↗</span>
          <h3>Tra cứu khi cần</h3>
          <p>Mã đặt phòng và email là hai thông tin thật dùng để mở lại hồ sơ. Aurora không tạo mã QR check-in tại giao diện này.</p>
          <button type="button" onClick={handlePrint}>In / lưu hồ sơ</button>
        </div>
      </div>
      <style>{`
        .digital-passbook { margin-block: 32px; overflow: hidden; border: 1px solid rgba(181,154,107,.42); background: var(--warm-ivory); color: var(--espresso); }
        .digital-passbook-header { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 28px; background: var(--espresso); color: var(--warm-ivory); }
        .digital-passbook-header p, .digital-passbook-number small { margin: 0 0 8px; color: var(--antique-brass); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
        .digital-passbook-header h2 { margin: 0; font: 500 40px/.9 var(--font-display); }
        .digital-passbook-number { display: grid; justify-items: end; gap: 4px; }
        .digital-passbook-number strong { font: 600 20px/1 var(--font-display); }
        .digital-passbook-body { display: grid; grid-template-columns: 1fr 260px; gap: 28px; padding: 28px; }
        .digital-passbook-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
        .digital-passbook-details div { display: grid; gap: 6px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
        .digital-passbook-details small { color: var(--taupe); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .digital-passbook-details strong { font-size: 13px; }
        .digital-passbook-details span { color: var(--taupe); font-size: 10px; }
        .digital-passbook-details span.confirmed { color: #2e7d5a; font-weight: 700; }
        .digital-passbook-details span.pending { color: var(--muted-terracotta); font-weight: 700; }
        .digital-passbook-recovery { display: grid; align-content: start; gap: 10px; padding: 20px; border: 1px solid var(--line); background: var(--linen); }
        .digital-passbook-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; background: var(--antique-brass); color: var(--espresso); font-size: 18px; }
        .digital-passbook-recovery h3 { margin: 0; font: 500 28px/.95 var(--font-display); }
        .digital-passbook-recovery p { margin: 0; color: var(--taupe); font-size: 11px; line-height: 1.6; }
        .digital-passbook-recovery button { min-height: 44px; border: 0; background: var(--espresso); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        @media (max-width: 700px) { .digital-passbook-header { align-items: start; flex-direction: column; } .digital-passbook-number { justify-items: start; } .digital-passbook-body { grid-template-columns: 1fr; padding: 18px; } .digital-passbook-details { grid-template-columns: 1fr; } }
        @media print { .digital-passbook { border: 0; } .digital-passbook-recovery button { display: none; } }
      `}</style>
    </section>
  );
}
