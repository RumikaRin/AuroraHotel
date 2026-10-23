import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SanctuaryExperiences } from "@/components/public/SanctuaryExperiences";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const dynamic = "force-dynamic";

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
    </div>
  );
}
