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
                    className="object-cover"
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
    </section>
  );
}
