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
  featured?: boolean;
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: "culinary",
    tagline: "Fine Dining & Seafood",
    titleKey: "home.sanctuaryCulinary",
    descriptionKey: "home.sanctuaryCulinaryDescription",
    image: "/images/aurora/hero-03.jpg",
    imageAlt: "Bàn tiệc ẩm thực cao cấp bên bờ biển",
    featured: true,
  },
  {
    id: "wellness",
    tagline: "Holistic Wellness & Spa",
    titleKey: "home.sanctuaryWellness",
    descriptionKey: "home.sanctuaryWellnessDescription",
    image: "/images/aurora/executive-suite.jpg",
    imageAlt: "Không gian spa thư giãn với đá nóng thảo dược",
  },
  {
    id: "private-beach",
    tagline: "Private Oceanfront Oasis",
    titleKey: "home.sanctuaryBeach",
    descriptionKey: "home.sanctuaryBeachDescription",
    image: "/images/aurora/hero-02.jpg",
    imageAlt: "Bể bơi vô cực hướng biển với bầu trời hoàng hôn",
  },
  {
    id: "butler-service",
    tagline: "Tailored Butler Care",
    titleKey: "home.sanctuaryButler",
    descriptionKey: "home.sanctuaryButlerDescription",
    image: "/images/aurora/presidential-villa.jpg",
    imageAlt: "Quản gia phục vụ tại phòng suite sang trọng",
    featured: true,
  },
];

export function SanctuaryExperiences() {
  const { t } = useLanguage();
  return (
    <section aria-label={t("home.sanctuaryAria")} id="experiences" data-scroll-section="experiences" data-header-tone="dark">
      <div className="sanctuary-section">
        <div className="wrap">
          <div className="sanctuary-header">
            <span className="sanctuary-eyebrow">Chapter II · Sanctuary Experiences</span>
            <h2 className="sanctuary-title">
              {t("home.sanctuaryTitleOne")}<br />
              <em>{t("home.sanctuaryTitleTwo")}</em>
            </h2>
            <p className="sanctuary-subtitle">
              {t("home.sanctuaryDescription")}
            </p>
          </div>

          {/* ASYMMETRIC BENTO GRID */}
          <div className="bento-grid">
            {EXPERIENCES.map((item, idx) => (
              <div
                key={item.id}
                className={`bento-card ${idx === 0 ? "bento-large" : idx === 3 ? "bento-wide" : ""}`}
              >
                <div className="bento-card-image">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes={idx === 0 || idx === 3 ? "(max-width: 980px) 100vw, 66vw" : "(max-width: 980px) 100vw, 33vw"}
                    loading="lazy"
                  />
                  <div className="bento-image-overlay" />
                </div>

                <div className="bento-card-body">
                  <span className="bento-card-tagline">{item.tagline}</span>
                  <h3 className="bento-card-title">{t(item.titleKey)}</h3>
                  <p className="bento-card-desc">{t(item.descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="sanctuary-cta">
            <Link
              href="/experiences"
              className="text-link"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
            >
              {t("home.sanctuaryCta")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .sanctuary-section {
          background: var(--espresso);
          min-height: max(100svh, 720px);
          display: flex;
          align-items: center;
          padding-block: clamp(44px, 6svh, 72px);
          border-top: 1px solid rgba(181,154,107,0.24);
          border-bottom: 1px solid rgba(181,154,107,0.24);
        }
        .sanctuary-header {
          text-align: center;
          margin-bottom: clamp(24px, 3svh, 36px);
        }
        .sanctuary-eyebrow {
          display: block;
          color: var(--gold);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .sanctuary-title {
          font: 500 clamp(40px, 4.4vw, 64px)/0.92 "Cormorant Garamond", serif;
          color: white;
          letter-spacing: -0.035em;
          margin-bottom: 20px;
        }
        .sanctuary-title em {
          font-style: italic;
          font-weight: 400;
          color: var(--gold);
        }
        .sanctuary-subtitle {
          max-width: 540px;
          margin: 0 auto;
          color: rgba(243,238,231,.7);
          font-size: 13px;
          line-height: 1.85;
        }

        /* ASYMMETRIC BENTO GRID STYLES */
        .bento-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          grid-template-rows: minmax(0, 1fr);
          height: clamp(260px, 42svh, 330px);
          gap: 24px;
        }
        .bento-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-surface, 16px);
          border: 1px solid rgba(181,154,107,0.24);
          background: var(--warm-carbon);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 0;
          transition: border-color 0.3s, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .bento-card:hover {
          border-color: rgba(181,154,107,0.7);
          transform: translateY(-3px);
        }
        .bento-large {
          grid-column: auto;
        }
        .bento-wide {
          grid-column: auto;
        }
        .bento-card-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .bento-card-image img {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card:hover .bento-card-image img {
          transform: scale(1.04);
        }
        .bento-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(25,21,18,0.94) 0%, rgba(25,21,18,0.34) 60%, transparent 100%);
        }
        .bento-card-body {
          position: relative;
          z-index: 2;
          padding: 24px 28px;
        }
        .bento-card-tagline {
          display: inline-block;
          color: var(--gold);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 8px;
          background: rgba(25,21,18,0.66);
          padding: 4px 10px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }
        .bento-card-title {
          font: 500 clamp(24px, 3vw, 36px)/1.05 "Cormorant Garamond", serif;
          color: white;
          margin-bottom: 8px;
        }
        .bento-card-desc {
          color: rgba(243,238,231,.72);
          font-size: 12px;
          line-height: 1.75;
          margin: 0;
          max-width: 520px;
        }

        .sanctuary-cta {
          text-align: center;
          margin-top: clamp(20px, 3svh, 32px);
        }
        .sanctuary-cta .text-link:hover {
          color: var(--antique-brass) !important;
          border-color: var(--antique-brass) !important;
        }

        @media (max-width: 980px) {
          .sanctuary-section { min-height: unset; display: block; padding-block: 80px; }
          .bento-grid { grid-template-columns: 1fr; grid-template-rows: none; height: auto; gap: 20px; }
          .bento-large, .bento-wide { grid-column: span 1; }
          .bento-card { min-height: 320px; }
          .bento-card-body { padding: 24px; }
        }
      `}</style>
    </section>
  );
}
