import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Ưu đãi | Aurora Hotel & Resort",
  description: "Khám phá các rate plan trực tiếp của Aurora Hotel & Resort và xem điều kiện trước khi báo giá.",
};

const OFFERS = [
  {
    id: "advance-saver",
    label: "Advance saver · Rate plan",
    title: "Đặt sớm, nghỉ sâu hơn.",
    description: "Một lựa chọn tiết kiệm cho hành trình đã có ngày. Điều kiện hủy, giá và tổng tiền sẽ được hệ thống xác nhận sau khi bạn chọn phòng.",
    terms: ["Rate plan không hoàn hủy theo điều kiện hiển thị", "Giá server-owned sau khi chọn ngày", "Không thêm dịch vụ ngoài lựa chọn của bạn"],
    image: "/images/aurora/deluxe-king.jpg",
    alt: "Phòng Deluxe Ocean King với ban công hướng biển",
    badge: "Tiết kiệm theo ngày",
  },
  {
    id: "flexible-stay",
    label: "Flexible stay · Rate plan",
    title: "Giữ chỗ cho những đổi thay.",
    description: "Rate plan linh hoạt cho lịch trình cần khoảng thở. Hãy đọc điều kiện hủy và chờ báo giá chính thức trước khi gửi yêu cầu.",
    terms: ["Điều kiện hủy hiển thị cùng rate plan", "Tổng tiền được tính theo ngày lưu trú", "Tình trạng phòng được kiểm tra khi báo giá"],
    image: "/images/aurora/family-villa.jpg",
    alt: "Villa nghỉ dưỡng riêng tư giữa khu vườn nhiệt đới",
    badge: "Linh hoạt hơn",
  },
];

export default function OffersPage() {
  return (
    <div className="offers-page">
      <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
      <Header />
      <main id="main-content">
        <section className="offers-hero" aria-labelledby="offers-title" data-header-tone="dark">
          <div className="wrap offers-hero-content"><p className="offers-eyebrow">Aurora · Direct rate plans</p><h1 id="offers-title">Một lý do để đặt trực tiếp,<br /><em>một kỳ nghỉ rõ ràng hơn.</em></h1><p>Chọn rate plan phù hợp, xem điều kiện và nhận báo giá từ hệ thống trước khi gửi yêu cầu.</p></div>
        </section>
        <section className="offers-list" aria-labelledby="offers-list-title" data-header-tone="light">
          <div className="wrap"><div className="offers-list-heading"><div><p className="offers-eyebrow">The booking ledger</p><h2 id="offers-list-title">Hai cách bắt đầu</h2></div><span>Rate plan · giá server-owned</span></div><div className="offers-grid">{OFFERS.map((offer, index) => <article className="offer-card" key={offer.id}><div className="offer-card-media"><Image src={offer.image} alt={offer.alt} fill sizes="(max-width: 860px) 100vw, 42vw" priority={index === 0} /><span>{offer.badge}</span></div><div className="offer-card-copy"><p className="offers-eyebrow">{offer.label}</p><h3>{offer.title}</h3><p>{offer.description}</p><ul>{offer.terms.map((term) => <li key={term}>{term}</li>)}</ul><div className="offer-card-footer"><span>Giá & điều kiện hiển thị trong báo giá</span><Link href={`/booking?offer=${offer.id}`}>Xem rate plan <span aria-hidden="true">↗</span></Link></div></div></article>)}</div></div>
        </section>
      </main>
      <Footer />
      <style>{`
        .offers-page { min-height: 100vh; background: var(--warm-ivory); color: var(--espresso); }
        .offers-hero { position: relative; overflow: hidden; padding-top: var(--header-height); background: var(--espresso); color: var(--warm-ivory); }
        .offers-hero::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 76% 20%, rgba(181,154,107,.2), transparent 32%); pointer-events: none; }
        .offers-hero-content { position: relative; z-index: 1; padding-block: 112px 126px; }
        .offers-eyebrow { margin: 0 0 14px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .offers-hero .offers-eyebrow { color: var(--antique-brass); }
        .offers-hero h1 { max-width: 900px; margin: 0; font: 500 clamp(54px, 8vw, 116px)/.82 var(--font-display); letter-spacing: -.055em; }
        .offers-hero h1 em { color: var(--antique-brass); font-style: italic; font-weight: 400; }
        .offers-hero-content > p:last-child { max-width: 440px; margin: 26px 0 0; color: rgba(243,238,231,.7); font-size: 13px; line-height: 1.8; }
        .offers-list { padding-block: 70px 120px; background: var(--linen); }
        .offers-list-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
        .offers-list-heading .offers-eyebrow { margin-bottom: 8px; }
        .offers-list-heading h2 { margin: 0; font: 500 clamp(38px, 5vw, 64px)/.9 var(--font-display); letter-spacing: -.04em; }
        .offers-list-heading > span { color: var(--taupe); font-size: 10px; letter-spacing: .13em; text-transform: uppercase; }
        .offers-grid { display: grid; gap: 30px; padding-top: 32px; }
        .offer-card { display: grid; grid-template-columns: minmax(300px, .85fr) minmax(0, 1.15fr); border: 1px solid #dacfc2; background: var(--warm-ivory); }
        .offer-card-media { position: relative; min-height: 390px; overflow: hidden; background: var(--walnut); }
        .offer-card-media img { object-fit: cover; transition: transform .8s var(--ease); }
        .offer-card:hover .offer-card-media img { transform: scale(1.035); }
        .offer-card-media span { position: absolute; left: 22px; bottom: 22px; padding: 8px 11px; background: rgba(25,21,18,.74); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; backdrop-filter: blur(8px); }
        .offer-card-copy { display: flex; flex-direction: column; justify-content: space-between; padding: clamp(28px, 4vw, 52px); }
        .offer-card-copy h3 { margin: 0; font: 500 clamp(38px, 4.5vw, 64px)/.85 var(--font-display); letter-spacing: -.045em; }
        .offer-card-copy > p:not(.offers-eyebrow) { max-width: 500px; margin: 22px 0 22px; color: var(--taupe); font-size: 13px; line-height: 1.85; }
        .offer-card-copy ul { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; color: var(--walnut); font-size: 11px; }
        .offer-card-copy li { display: flex; gap: 10px; align-items: baseline; }
        .offer-card-copy li::before { content: "✦"; color: var(--antique-brass); }
        .offer-card-footer { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-top: 34px; padding-top: 18px; border-top: 1px solid var(--line); }
        .offer-card-footer > span { color: var(--taupe); font-size: 10px; line-height: 1.4; }
        .offer-card-footer a { min-height: 44px; display: inline-flex; align-items: center; gap: 12px; padding: 0 14px; border-radius: 5px; background: var(--espresso); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
        .offer-card-footer a:hover { background: var(--walnut); }
        @media (max-width: 860px) { .offers-hero-content { padding-block: 84px 90px; } .offer-card { grid-template-columns: 1fr; } .offer-card-media { min-height: 330px; } }
        @media (max-width: 560px) { .offers-list { padding-block: 54px 72px; } .offers-list-heading { align-items: start; flex-direction: column; } .offer-card-media { min-height: 280px; } .offer-card-copy { padding: 26px 20px; } .offer-card-footer { align-items: stretch; flex-direction: column; } .offer-card-footer a { justify-content: center; } }
      `}</style>
    </div>
  );
}
