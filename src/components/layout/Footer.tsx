import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        padding: "74px 0 32px",
        borderTop: "1px solid rgba(255,255,255,.12)",
        background: "var(--night)",
        color: "white",
      }}
    >
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <strong
            style={{
              color: "var(--gold)",
              font: '600 26px/1 "Cormorant Garamond", serif',
              letterSpacing: ".06em",
            }}
          >
            AURORA HOTEL
          </strong>
          <p>
            Nơi mỗi kỳ nghỉ trở thành kỷ niệm. Trải nghiệm nghỉ dưỡng đương đại bên biển tại Đà Nẵng.
          </p>
        </div>
        <div className="footer-column">
          <h3>Khám phá</h3>
          <Link href="/rooms">Phòng và Suites</Link>
          <Link href="/experiences">Trải nghiệm</Link>
          <Link href="/offers">Ưu đãi</Link>
        </div>
        <div className="footer-column">
          <h3>Hỗ trợ</h3>
          <Link href="/my-bookings">Quản lý booking</Link>
          <Link href="/login">Đăng nhập</Link>
          <Link href="/admin">Quản trị</Link>
        </div>
        <div className="footer-column">
          <h3>Liên hệ</h3>
          <p>123 Luxury Coastal Boulevard<br />Đà Nẵng, Việt Nam</p>
          <a href="tel:+842363999999">+84 236 399 9999</a>
          <a href="mailto:reservations@aurorahotel.com">reservations@aurorahotel.com</a>
        </div>
      </div>
      <div
        className="wrap"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 24,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,.1)",
          color: "#88938c",
          fontSize: 9,
        }}
      >
        <span>© {new Date().getFullYear()} Aurora Hotel. All rights reserved.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/" style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>Quyền riêng tư</Link>
          <Link href="/" style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>Điều khoản sử dụng</Link>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr .8fr .8fr 1fr;
          gap: 52px;
          padding-bottom: 58px;
        }
        .footer-brand p,
        .footer-column a,
        .footer-column p {
          color: #aab5ae;
          font-size: 10px;
          line-height: 1.8;
        }
        .footer-brand p { max-width: 300px; margin-top: 18px; }
        .footer-column h3 {
          margin-bottom: 17px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .footer-column a {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          min-height: 44px;
          min-width: 44px;
        }
        .footer-column a:hover { color: white; }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1.2fr 1fr 1fr; }
          .footer-brand { grid-column: 1 / 4; }
        }
        @media (max-width: 620px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 38px 24px; }
          .footer-brand { grid-column: 1 / 3; }
        }
      `}</style>
    </footer>
  );
}
