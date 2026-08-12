import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const metadata = { title: "Tài khoản khách | Aurora Hotel & Resort" };

export default function AccountPage() {
  return (
    <div className="account-page">
      <a className="skip-link" href="#main-content"><LocalizedText id="common.skipToContent" /></a>
      <Header />
      <main id="main-content" className="wrap account-main">
        <div className="account-intro"><p className="account-eyebrow"><LocalizedText id="account.eyebrow" /></p><h1><LocalizedText id="account.titleOne" /><br /><em><LocalizedText id="account.titleTwo" /></em></h1><p><LocalizedText id="account.description" /></p></div>
        <section className="account-actions">
          <article><span className="account-card-index">01</span><p className="account-eyebrow"><LocalizedText id="account.signedInEyebrow" /></p><h2><LocalizedText id="account.signedInTitle" /></h2><p><LocalizedText id="account.signedInDescription" /></p><Link href="/profile"><LocalizedText id="account.openAccount" /></Link></article>
          <article><span className="account-card-index">02</span><p className="account-eyebrow"><LocalizedText id="account.lookupEyebrow" /></p><h2><LocalizedText id="account.lookupTitle" /></h2><p><LocalizedText id="account.lookupDescription" /></p><Link href="/my-bookings"><LocalizedText id="account.openLookup" /></Link></article>
          <article><span className="account-card-index">03</span><p className="account-eyebrow"><LocalizedText id="account.findEyebrow" /></p><h2><LocalizedText id="account.findTitle" /></h2><p><LocalizedText id="account.findDescription" /></p><Link href="/rooms"><LocalizedText id="account.viewRooms" /></Link></article>
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
