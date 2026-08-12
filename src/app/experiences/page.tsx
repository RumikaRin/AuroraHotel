import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SanctuaryExperiences } from "@/components/public/SanctuaryExperiences";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const metadata = {
  title: "Trải nghiệm | Aurora Hotel & Resort",
  description: "Những nhịp nghỉ bên biển, trong phòng và quanh bàn ăn tại Aurora Hotel & Resort Đà Nẵng.",
};

export default function ExperiencesPage() {
  return (
    <div className="experiences-page">
      <a className="skip-link" href="#main-content"><LocalizedText id="common.skipToContent" /></a>
      <Header />
      <main id="main-content">
        <section className="experiences-hero" aria-labelledby="experiences-title" data-scroll-section="experiences-hero" data-header-tone="dark">
          <Image src="/images/aurora/hero-02.jpg" alt="Hoàng hôn bên hồ bơi và bãi biển Aurora" fill priority sizes="100vw" className="experiences-hero-image" />
          <div className="experiences-hero-overlay" />
          <div className="wrap experiences-hero-content">
            <p className="experiences-eyebrow"><LocalizedText id="experiences.heroEyebrow" /></p>
            <h1 id="experiences-title"><LocalizedText id="experiences.heroTitleOne" /><br /><em><LocalizedText id="experiences.heroTitleTwo" /></em></h1>
            <p><LocalizedText id="experiences.heroDescription" /></p>
            <Link href="/rooms" className="experiences-hero-link"><LocalizedText id="experiences.heroCta" /> <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <SanctuaryExperiences />

        <section className="experiences-moments" aria-labelledby="experiences-moments-title" data-testid="experience-moments" data-scroll-section="experience-moments" data-header-tone="light">
          <div className="wrap">
            <div className="experiences-moments-heading">
              <p className="experiences-eyebrow"><LocalizedText id="experiences.momentsEyebrow" /></p>
              <h2 id="experiences-moments-title"><LocalizedText id="experiences.momentsTitle" /></h2>
              <p><LocalizedText id="experiences.momentsDescription" /></p>
            </div>
            <div className="experiences-moments-grid">
              <article className="experience-moment experience-moment-featured">
                <div className="experience-moment-image"><Image src="/images/aurora/deluxe-king.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 58vw" /></div>
                <div className="experience-moment-copy"><p><LocalizedText id="experiences.morningKicker" /></p><h3><LocalizedText id="experiences.morningTitle" /></h3><span><LocalizedText id="experiences.morningDescription" /></span></div>
              </article>
              <article className="experience-moment">
                <div className="experience-moment-image"><Image src="/images/aurora/hero-02.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 34vw" /></div>
                <div className="experience-moment-copy"><p><LocalizedText id="experiences.afternoonKicker" /></p><h3><LocalizedText id="experiences.afternoonTitle" /></h3><span><LocalizedText id="experiences.afternoonDescription" /></span></div>
              </article>
              <article className="experience-moment">
                <div className="experience-moment-image"><Image src="/images/aurora/hero-03.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 34vw" /></div>
                <div className="experience-moment-copy"><p><LocalizedText id="experiences.eveningKicker" /></p><h3><LocalizedText id="experiences.eveningTitle" /></h3><span><LocalizedText id="experiences.eveningDescription" /></span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="experiences-story" aria-labelledby="experiences-story-title" data-scroll-section="experiences-story" data-header-tone="light">
          <div className="wrap experiences-story-grid">
            <div className="experiences-story-image"><Image src="/images/aurora/hero-03.jpg" alt="Sảnh lounge gỗ ấm của Aurora" fill sizes="(max-width: 900px) 100vw, 48vw" /></div>
            <div className="experiences-story-copy"><p className="experiences-eyebrow"><LocalizedText id="experiences.storyEyebrow" /></p><h2 id="experiences-story-title"><LocalizedText id="experiences.storyTitleOne" /><br /><em><LocalizedText id="experiences.storyTitleTwo" /></em></h2><p><LocalizedText id="experiences.storyDescription" /></p><Link href="/rooms" className="text-link"><LocalizedText id="experiences.storyCta" /> <span aria-hidden="true">↗</span></Link></div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        .experiences-page { min-height: 100vh; background: var(--warm-ivory); color: var(--espresso); }
        .experiences-hero { position: relative; min-height: max(100svh, 720px); overflow: hidden; color: var(--warm-ivory); }
        .experiences-hero-image { object-fit: cover; object-position: center 58%; }
        .experiences-hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(25,21,18,.82), rgba(25,21,18,.2) 72%), linear-gradient(0deg, rgba(25,21,18,.78), transparent 52%); }
        .experiences-hero-content { position: relative; z-index: 1; min-height: max(100svh, 720px); display: flex; flex-direction: column; justify-content: end; padding-block: 120px 104px; }
        .experiences-eyebrow { margin: 0 0 16px; color: var(--antique-brass); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .experiences-hero h1 { max-width: 850px; margin: 0; font: 500 clamp(58px, 9vw, 132px)/.81 var(--font-display); letter-spacing: -.06em; }
        .experiences-hero h1 em { color: var(--antique-brass); font-style: italic; font-weight: 400; }
        .experiences-hero-content > p:not(.experiences-eyebrow) { max-width: 450px; margin: 26px 0 24px; color: rgba(243,238,231,.76); font-size: 13px; line-height: 1.8; }
        .experiences-hero-link { width: fit-content; min-height: 44px; display: inline-flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(243,238,231,.6); color: var(--warm-ivory); font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
        .experiences-hero-link:hover { gap: 23px; color: var(--antique-brass); border-color: var(--antique-brass); }
        .experiences-moments { min-height: max(100svh, 760px); display: flex; align-items: center; padding-block: clamp(88px, 10svh, 132px); background: var(--warm-ivory); }
        .experiences-moments-heading { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); align-items: end; column-gap: 72px; padding-bottom: 30px; border-bottom: 1px solid var(--line); }
        .experiences-moments-heading .experiences-eyebrow { grid-column: 1 / -1; }
        .experiences-moments-heading h2 { max-width: 600px; margin: 0; font: 500 clamp(48px, 5.8vw, 84px)/.86 var(--font-display); letter-spacing: -.05em; }
        .experiences-moments-heading > p:last-child { max-width: 390px; margin: 0 0 4px; color: var(--taupe); font-size: 13px; line-height: 1.85; }
        .experiences-moments-grid { display: grid; grid-template-columns: 1.12fr .88fr .88fr; gap: 16px; padding-top: 28px; }
        .experience-moment { position: relative; min-height: min(57vw, 600px); overflow: hidden; background: var(--walnut); color: var(--warm-ivory); }
        .experience-moment-featured { min-height: min(57vw, 600px); }
        .experience-moment-image { position: absolute; inset: 0; }
        .experience-moment-image img { object-fit: cover; transition: transform 700ms cubic-bezier(.22,.8,.22,1); }
        .experience-moment::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(25,21,18,.86) 0%, rgba(25,21,18,.12) 65%); pointer-events: none; }
        .experience-moment:hover .experience-moment-image img { transform: scale(1.035); }
        .experience-moment-copy { position: absolute; z-index: 1; right: 0; bottom: 0; left: 0; padding: clamp(20px, 2.5vw, 34px); }
        .experience-moment-copy p { margin: 0 0 12px; color: var(--antique-brass); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
        .experience-moment-copy h3 { max-width: 360px; margin: 0; font: 500 clamp(29px, 3.2vw, 48px)/.9 var(--font-display); letter-spacing: -.04em; }
        .experience-moment-copy span { display: block; max-width: 340px; margin-top: 13px; color: rgba(243,238,231,.78); font-size: 11px; line-height: 1.65; }
        .experiences-story { min-height: max(100svh, 720px); display: flex; align-items: center; padding-block: clamp(88px, 9svh, 120px); background: var(--linen); }
        .experiences-story-grid { display: grid; grid-template-columns: 1fr .9fr; gap: 80px; align-items: center; }
        .experiences-story-image { position: relative; height: 560px; overflow: hidden; }
        .experiences-story-image img { object-fit: cover; }
        .experiences-story-copy h2 { margin: 0; font: 500 clamp(48px, 6vw, 86px)/.84 var(--font-display); letter-spacing: -.05em; }
        .experiences-story-copy h2 em { color: var(--muted-terracotta); font-style: italic; font-weight: 400; }
        .experiences-story-copy > p:not(.experiences-eyebrow) { max-width: 430px; margin: 24px 0 30px; color: var(--taupe); font-size: 13px; line-height: 1.9; }
        @media (max-width: 900px) { .experiences-hero, .experiences-hero-content { min-height: 720px; } .experiences-hero-content { padding-block: 100px 70px; } .experiences-moments { min-height: unset; padding-block: 74px; } .experiences-moments-heading { grid-template-columns: 1fr; gap: 18px; } .experiences-moments-heading > p:last-child { margin: 0; } .experiences-moments-grid { grid-template-columns: 1.1fr .9fr; } .experience-moment-featured { grid-row: span 2; min-height: 650px; } .experience-moment { min-height: 310px; } .experiences-story { min-height: unset; display: block; padding-block: 70px; } .experiences-story-grid { grid-template-columns: 1fr; gap: 36px; } .experiences-story-image { height: 420px; } }
        @media (max-width: 560px) { .experiences-hero h1 { font-size: 70px; } .experiences-moments { padding-block: 58px; } .experiences-moments-heading h2 { font-size: 52px; } .experiences-moments-grid { grid-template-columns: 1fr; gap: 12px; } .experience-moment, .experience-moment-featured { min-height: 340px; } .experience-moment-copy span { font-size: 11px; } .experiences-story-image { height: 340px; } }
      `}</style>
    </div>
  );
}
