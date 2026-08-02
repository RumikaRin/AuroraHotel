import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Tài khoản khách | Aurora Hotel & Resort" };

export default function AccountPage() {
  return (
    <div className="account-page">
      <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
      <Header />
      <main id="main-content" className="wrap account-main">
        <div className="account-intro"><p className="account-eyebrow">Aurora · guest space</p><h1>Cánh cửa vào<br /><em>kỳ nghỉ của bạn.</em></h1><p>Một nơi để bắt đầu đặt phòng, đăng nhập tài khoản hoặc mở lại hồ sơ bằng mã đặt phòng.</p></div>
        <section className="account-actions" aria-label="Các lựa chọn tài khoản">
          <article><span className="account-card-index">01</span><p className="account-eyebrow">Guest account</p><h2>Tài khoản đã đăng nhập</h2><p>Xem thông tin được lưu trong hồ sơ Aurora sau khi đăng nhập thành công.</p><Link href="/profile">Mở tài khoản ↗</Link></article>
          <article><span className="account-card-index">02</span><p className="account-eyebrow">Booking lookup</p><h2>Tra cứu không cần đăng nhập</h2><p>Dùng mã đặt phòng và email để xem trạng thái hoặc gửi yêu cầu huỷ theo điều kiện.</p><Link href="/my-bookings">Mở tra cứu ↗</Link></article>
          <article><span className="account-card-index">03</span><p className="account-eyebrow">Find your stay</p><h2>Bắt đầu một kỳ nghỉ mới</h2><p>Chọn phòng và suite từ inventory hiện có, sau đó xem báo giá server-owned.</p><Link href="/rooms">Xem phòng ↗</Link></article>
        </section>
      </main>
      <Footer />
      <style>{`
        .account-page { min-height: 100vh; background: var(--linen); color: var(--espresso); }
        .account-main { padding-block: calc(var(--header-height) + 56px) 120px; }
        .account-intro { display: grid; grid-template-columns: 1fr .62fr; gap: 45px; align-items: end; padding-bottom: 56px; }
        .account-eyebrow { margin: 0 0 14px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .account-intro h1 { margin: 0; font: 500 clamp(58px, 8vw, 112px)/.82 var(--font-display); letter-spacing: -.055em; }
        .account-intro h1 em { color: var(--muted-terracotta); font-style: italic; font-weight: 400; }
        .account-intro > p:last-child { max-width: 360px; margin: 0 0 4px; color: var(--taupe); font-size: 13px; line-height: 1.8; }
        .account-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .account-actions article { position: relative; min-height: 330px; display: flex; flex-direction: column; align-items: start; padding: 28px; border: 1px solid #d9cfc3; background: var(--warm-ivory); }
        .account-actions article:hover { border-color: var(--antique-brass); }
        .account-card-index { color: var(--antique-brass); font: 500 34px/1 var(--font-display); }
        .account-actions article .account-eyebrow { margin-top: 35px; margin-bottom: 12px; }
        .account-actions h2 { margin: 0; font: 500 32px/.94 var(--font-display); letter-spacing: -.03em; }
        .account-actions article > p:not(.account-eyebrow) { margin: 18px 0 24px; color: var(--taupe); font-size: 12px; line-height: 1.7; }
        .account-actions a { margin-top: auto; min-height: 44px; display: inline-flex; align-items: center; border-bottom: 1px solid var(--walnut); color: var(--walnut); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .account-actions a:hover { color: var(--muted-terracotta); border-color: var(--muted-terracotta); }
        @media (max-width: 800px) { .account-intro { grid-template-columns: 1fr; gap: 18px; } .account-actions { grid-template-columns: 1fr; } .account-actions article { min-height: 250px; } }
        @media (max-width: 560px) { .account-main { padding-block: calc(var(--header-height) + 30px) 80px; } .account-intro h1 { font-size: 70px; } }
      `}</style>
    </div>
  );
}
