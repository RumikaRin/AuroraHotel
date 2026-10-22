"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ExperienceItem {
  id: string;
  tagline: string;
  titleKey: string;
  descriptionKey: string;
  image: string;
  imageAlt: string;
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: "culinary",
    tagline: "FINE DINING & COASTAL CELLAR",
    titleKey: "home.sanctuaryCulinary",
    descriptionKey: "home.sanctuaryCulinaryDescription",
    image: "/images/aurora/hero-03.jpg",
    imageAlt: "Bàn tiệc ẩm thực cao cấp bên bờ biển",
  },
  {
    id: "wellness",
    tagline: "HOLISTIC THERAPIES & HERBAL SPA",
    titleKey: "home.sanctuaryWellness",
    descriptionKey: "home.sanctuaryWellnessDescription",
    image: "/images/aurora/executive-suite.jpg",
    imageAlt: "Không gian spa thư giãn với đá nóng thảo dược",
  },
  {
    id: "private-beach",
    tagline: "PRIVATE OCEAN OASIS & INFINITY POOL",
    titleKey: "home.sanctuaryBeach",
    descriptionKey: "home.sanctuaryBeachDescription",
    image: "/images/aurora/hero-02.jpg",
    imageAlt: "Bể bơi vô cực hướng biển với bầu trời hoàng hôn",
  },
  {
    id: "butler-service",
    tagline: "BESPOKE CURATION & CONCIERGE",
    titleKey: "home.sanctuaryButler",
    descriptionKey: "home.sanctuaryButlerDescription",
    image: "/images/aurora/presidential-villa.jpg",
    imageAlt: "Quản gia phục vụ tại phòng suite sang trọng",
  },
];

export function SanctuaryExperiences() {
  const { t } = useLanguage();
  return (
    <section aria-label={t("home.sanctuaryAria")} id="experiences" data-scroll-section="experiences" data-header-tone="dark">
      <div className="sanctuary-section">
        <div className="wrap">
          {/* Section Header with serene Roman Typography */}
          <div className="sanctuary-header">
            <span className="sanctuary-eyebrow">{t("home.sanctuaryEyebrow") || "TRẢI NGHIỆM ĐẶC QUYỀN"}</span>
            <h2 className="sanctuary-title">
              {t("home.sanctuaryTitleOne")} — {t("home.sanctuaryTitleTwo")}
            </h2>
            <p className="sanctuary-subtitle">
              {t("home.sanctuaryDescription")}
            </p>
          </div>

          {/* EDITORIAL HORIZON SHOWCASE (Anti-Bento luxury narrative) */}
          <div className="editorial-showcase-grid">
            {EXPERIENCES.map((item, idx) => (
              <article key={item.id} className="showcase-card">
                <div className="showcase-image-wrapper">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={idx === 0}
                  />
                  <div className="showcase-overlay" />
                  <span className="showcase-index">0{idx + 1}</span>
                </div>

                <div className="showcase-content">
                  <span className="showcase-tagline">{item.tagline}</span>
                  <h3 className="showcase-title">{t(item.titleKey)}</h3>
                  <p className="showcase-desc">{t(item.descriptionKey)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="sanctuary-cta">
            <Link
              href="/experiences"
              className="text-link showcase-btn"
            >
              {t("home.sanctuaryCta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .sanctuary-section {
          background: var(--espresso);
          padding-block: clamp(80px, 8vw, 120px);
          border-top: 1px solid rgba(181, 154, 107, 0.2);
          border-bottom: 1px solid rgba(181, 154, 107, 0.2);
          color: white;
        }
        .sanctuary-header {
          text-align: center;
          margin-bottom: clamp(48px, 6vw, 64px);
        }
        .sanctuary-eyebrow {
          display: block;
          color: var(--antique-brass);
          font-family: var(--font-interface);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .sanctuary-title {
          font-family: var(--font-display);
          font-size: clamp(34px, 4vw, 54px);
          font-weight: 400;
          line-height: 1.1;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
        }
        .sanctuary-subtitle {
          max-width: 600px;
          margin: 0 auto;
          color: rgba(243, 238, 231, 0.75);
          font-family: var(--font-interface);
          font-size: 14px;
          line-height: 1.8;
        }

        /* EDITORIAL 2x2 HORIZON SHOWCASE */
        .editorial-showcase-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 36px 32px;
          margin-bottom: 52px;
        }
        .showcase-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: rgba(25, 21, 18, 0.4);
          border: 1px solid rgba(181, 154, 107, 0.18);
          border-radius: var(--radius-surface, 16px);
          overflow: hidden;
          transition: border-color 0.4s ease, transform 0.4s ease;
        }
        .showcase-card:hover {
          border-color: rgba(181, 154, 107, 0.5);
          transform: translateY(-4px);
        }
        .showcase-image-wrapper {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
        }
        .showcase-image-wrapper img {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .showcase-card:hover .showcase-image-wrapper img {
          transform: scale(1.04);
        }
        .showcase-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(25,21,18,0.1) 0%, rgba(25,21,18,0.5) 100%);
        }
        .showcase-index {
          position: absolute;
          top: 16px;
          left: 16px;
          font-family: var(--font-interface);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--warm-ivory);
          background: rgba(25, 21, 18, 0.7);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(181, 154, 107, 0.3);
        }
        .showcase-content {
          padding: 0 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .showcase-tagline {
          font-family: var(--font-interface);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--antique-brass);
          text-transform: uppercase;
        }
        .showcase-title {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 500;
          color: white;
          line-height: 1.25;
          margin: 0;
        }
        .showcase-desc {
          font-family: var(--font-interface);
          font-size: 13px;
          color: rgba(243, 238, 231, 0.72);
          line-height: 1.7;
          margin: 0;
        }

        .sanctuary-cta {
          display: flex;
          justify-content: center;
        }
        .showcase-btn {
          color: var(--warm-ivory);
          border: 1px solid rgba(181, 154, 107, 0.4);
          padding: 12px 32px;
          border-radius: var(--radius-control, 10px);
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .showcase-btn:hover {
          background: var(--antique-brass);
          color: var(--espresso);
          border-color: var(--antique-brass);
        }

        @media (max-width: 900px) {
          .editorial-showcase-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .showcase-image-wrapper {
            height: 240px;
          }
        }
      `}</style>
    </section>
  );
}
