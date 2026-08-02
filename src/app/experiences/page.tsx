import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SanctuaryExperiences } from "@/components/public/SanctuaryExperiences";

export const metadata = {
  title: "Trải nghiệm | Aurora Hotel & Resort",
  description: "Những nhịp nghỉ bên biển, trong phòng và quanh bàn ăn tại Aurora Hotel & Resort Đà Nẵng.",
};

export default function ExperiencesPage() {
  return (
    <div className="experiences-page">
      <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
      <Header />
      <main id="main-content">
        <section className="experiences-hero" aria-labelledby="experiences-title">
          <Image src="/images/aurora/hero-02.jpg" alt="Hoàng hôn bên hồ bơi và bãi biển Aurora" fill priority sizes="100vw" className="experiences-hero-image" />
          <div className="experiences-hero-overlay" />
          <div className="wrap experiences-hero-content">
            <p className="experiences-eyebrow">Aurora · Hotel & Resort · Đà Nẵng</p>
            <h1 id="experiences-title">Nơi mỗi giác quan<br /><em>được nghỉ ngơi.</em></h1>
            <p>Từ ánh sáng đầu ngày trong căn phòng hướng biển đến bữa tối chậm bên hồ bơi — Aurora để bạn chọn nhịp riêng cho kỳ nghỉ.</p>
            <Link href="/rooms" className="experiences-hero-link">Chọn không gian lưu trú <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <SanctuaryExperiences />

        <section className="experiences-story" aria-labelledby="experiences-story-title">
          <div className="wrap experiences-story-grid">
            <div className="experiences-story-image"><Image src="/images/aurora/hero-03.jpg" alt="Sảnh lounge gỗ ấm của Aurora" fill sizes="(max-width: 900px) 100vw, 48vw" /></div>
            <div className="experiences-story-copy"><p className="experiences-eyebrow">A quiet kind of care</p><h2 id="experiences-story-title">Sự chăm chút<br /><em>âm thầm mà thật gần.</em></h2><p>Không cần một lịch trình dày đặc. Hãy để khoảng sáng trong suite, một bàn ăn bên biển và những lối đi giữa vườn làm phần còn lại.</p><Link href="/rooms" className="text-link">Bắt đầu kỳ nghỉ <span aria-hidden="true">↗</span></Link></div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        .experiences-page { min-height: 100vh; background: var(--warm-ivory); color: var(--espresso); }
        .experiences-hero { position: relative; min-height: min(88svh, 820px); overflow: hidden; color: var(--warm-ivory); }
        .experiences-hero-image { object-fit: cover; object-position: center 58%; }
        .experiences-hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(25,21,18,.82), rgba(25,21,18,.2) 72%), linear-gradient(0deg, rgba(25,21,18,.78), transparent 52%); }
        .experiences-hero-content { position: relative; z-index: 1; min-height: min(88svh, 820px); display: flex; flex-direction: column; justify-content: end; padding-block: 120px 104px; }
        .experiences-eyebrow { margin: 0 0 16px; color: var(--antique-brass); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .experiences-hero h1 { max-width: 850px; margin: 0; font: 500 clamp(58px, 9vw, 132px)/.81 var(--font-display); letter-spacing: -.06em; }
        .experiences-hero h1 em { color: var(--antique-brass); font-style: italic; font-weight: 400; }
        .experiences-hero-content > p:not(.experiences-eyebrow) { max-width: 450px; margin: 26px 0 24px; color: rgba(243,238,231,.76); font-size: 13px; line-height: 1.8; }
        .experiences-hero-link { width: fit-content; min-height: 44px; display: inline-flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(243,238,231,.6); color: var(--warm-ivory); font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
        .experiences-hero-link:hover { gap: 23px; color: var(--antique-brass); border-color: var(--antique-brass); }
        .experiences-story { padding-block: 120px; background: var(--linen); }
        .experiences-story-grid { display: grid; grid-template-columns: 1fr .9fr; gap: 80px; align-items: center; }
        .experiences-story-image { position: relative; height: 560px; overflow: hidden; }
        .experiences-story-image img { object-fit: cover; }
        .experiences-story-copy h2 { margin: 0; font: 500 clamp(48px, 6vw, 86px)/.84 var(--font-display); letter-spacing: -.05em; }
        .experiences-story-copy h2 em { color: var(--muted-terracotta); font-style: italic; font-weight: 400; }
        .experiences-story-copy > p:not(.experiences-eyebrow) { max-width: 430px; margin: 24px 0 30px; color: var(--taupe); font-size: 13px; line-height: 1.9; }
        @media (max-width: 900px) { .experiences-hero, .experiences-hero-content { min-height: 720px; } .experiences-hero-content { padding-block: 100px 70px; } .experiences-story { padding-block: 70px; } .experiences-story-grid { grid-template-columns: 1fr; gap: 36px; } .experiences-story-image { height: 420px; } }
        @media (max-width: 560px) { .experiences-hero h1 { font-size: 70px; } .experiences-story-image { height: 340px; } }
      `}</style>
    </div>
  );
}
