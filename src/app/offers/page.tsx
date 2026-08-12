import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const metadata = {
  title: "Ưu đãi | Aurora Hotel & Resort",
  description: "Khám phá các rate plan trực tiếp của Aurora Hotel & Resort và xem điều kiện trước khi báo giá.",
};

const OFFERS = [
  {
    id: "advance-saver",
    translationPrefix: "offers.advance",
    image: "/images/aurora/deluxe-king.jpg",
  },
  {
    id: "flexible-stay",
    translationPrefix: "offers.flexible",
    image: "/images/aurora/family-villa.jpg",
  },
];

export default function OffersPage() {
  return (
    <div className="offers-page">
      <a className="skip-link" href="#main-content"><LocalizedText id="common.skipToContent" /></a>
      <Header />
      <main id="main-content">
        <section className="offers-hero" aria-labelledby="offers-title" data-scroll-section="offers-hero" data-header-tone="dark">
          <Image src="/images/aurora/presidential-villa.jpg" alt="" fill priority sizes="100vw" className="offers-hero-image" />
          <div className="offers-hero-overlay" />
          <div className="wrap offers-hero-content"><p className="offers-eyebrow"><LocalizedText id="offers.heroEyebrow" /></p><h1 id="offers-title"><LocalizedText id="offers.heroTitleOne" /><br /><em><LocalizedText id="offers.heroTitleTwo" /></em></h1><p><LocalizedText id="offers.heroDescription" /></p></div>
        </section>
        <section className="offers-list" aria-labelledby="offers-list-title" data-scroll-section="offers-list" data-header-tone="light">
          <div className="wrap"><div className="offers-list-heading"><div><p className="offers-eyebrow"><LocalizedText id="offers.listEyebrow" /></p><h2 id="offers-list-title"><LocalizedText id="offers.listTitle" /></h2></div><span><LocalizedText id="offers.serverOwned" /></span></div><div className="offers-grid">{OFFERS.map((offer, index) => <article className="offer-card" data-scroll-section={`offer-${index + 1}`} key={offer.id}><div className="offer-card-media"><Image src={offer.image} alt="" fill sizes="(max-width: 860px) 100vw, 42vw" priority={index === 0} /><span><LocalizedText id={`${offer.translationPrefix}.badge`} /></span></div><div className="offer-card-copy"><p className="offers-eyebrow"><LocalizedText id={`${offer.translationPrefix}.label`} /></p><h3><LocalizedText id={`${offer.translationPrefix}.title`} /></h3><p><LocalizedText id={`${offer.translationPrefix}.description`} /></p><ul>{["termOne", "termTwo", "termThree"].map((term) => <li key={term}><LocalizedText id={`${offer.translationPrefix}.${term}`} /></li>)}</ul><div className="offer-card-footer"><span><LocalizedText id="offers.quoteNote" /></span><Link href={`/booking?offer=${offer.id}`}><LocalizedText id="offers.cta" /> <span aria-hidden="true">↗</span></Link></div></div></article>)}</div></div>
        </section>
      </main>
      <Footer />
      <style>{`
        .offers-page { min-height: 100vh; background: var(--warm-ivory); color: var(--espresso); }
        .offers-hero { position: relative; display: flex; min-height: max(100svh, 720px); overflow: hidden; padding-top: var(--header-height); background: var(--espresso); color: var(--warm-ivory); }
        .offers-hero-image { object-fit: cover; object-position: center 53%; }
        .offers-hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(25,21,18,.86) 0%, rgba(25,21,18,.48) 46%, rgba(25,21,18,.22) 100%), linear-gradient(0deg, rgba(25,21,18,.55), transparent 58%); }
        .offers-hero-content { position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; padding-block: clamp(84px, 10svh, 126px); }
        .offers-eyebrow { margin: 0 0 14px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .offers-hero .offers-eyebrow { color: var(--antique-brass); }
        .offers-hero h1 { max-width: 900px; margin: 0; font: 500 clamp(54px, 8vw, 116px)/.82 var(--font-display); letter-spacing: -.055em; }
        .offers-hero h1 em { color: var(--antique-brass); font-style: italic; font-weight: 400; }
        .offers-hero-content > p:last-child { max-width: 440px; margin: 26px 0 0; color: rgba(243,238,231,.7); font-size: 13px; line-height: 1.8; }
        .offers-list { min-height: max(100svh, 720px); padding-block: clamp(72px, 9svh, 120px); background: var(--linen); }
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
