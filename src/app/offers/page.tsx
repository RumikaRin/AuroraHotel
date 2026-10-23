import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DirectBookingBenefits } from "@/components/public/DirectBookingBenefits";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const dynamic = "force-dynamic";

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

        {/* Reassurance & Direct Booking Benefits */}
        <DirectBookingBenefits />
      </main>
      <Footer />
    </div>
  );
}
