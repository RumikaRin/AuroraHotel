"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ExperienceItem {
  id: string;
  category: "culinary" | "wellness" | "private-beach" | "butler-service";
  tagline: string;
  titleKey: string;
  descriptionKey: string;
  image: string;
  imageAlt: string;
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: "culinary",
    category: "culinary",
    tagline: "FINE DINING & COASTAL CELLAR",
    titleKey: "home.sanctuaryCulinary",
    descriptionKey: "home.sanctuaryCulinaryDescription",
    image: "/images/aurora/hero-03.jpg",
    imageAlt: "Bàn tiệc ẩm thực cao cấp bên bờ biển",
  },
  {
    id: "wellness",
    category: "wellness",
    tagline: "HOLISTIC THERAPIES & HERBAL SPA",
    titleKey: "home.sanctuaryWellness",
    descriptionKey: "home.sanctuaryWellnessDescription",
    image: "/images/aurora/executive-suite.jpg",
    imageAlt: "Không gian spa thư giãn với đá nóng thảo dược",
  },
  {
    id: "private-beach",
    category: "private-beach",
    tagline: "PRIVATE OCEAN OASIS & INFINITY POOL",
    titleKey: "home.sanctuaryBeach",
    descriptionKey: "home.sanctuaryBeachDescription",
    image: "/images/aurora/hero-02.jpg",
    imageAlt: "Bể bơi vô cực hướng biển với bầu trời hoàng hôn",
  },
  {
    id: "butler-service",
    category: "butler-service",
    tagline: "BESPOKE CURATION & CONCIERGE",
    titleKey: "home.sanctuaryButler",
    descriptionKey: "home.sanctuaryButlerDescription",
    image: "/images/aurora/presidential-villa.jpg",
    imageAlt: "Quản gia phục vụ tại phòng suite sang trọng",
  },
];

export function SanctuaryExperiences() {
  const { t, lang } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterTabs = [
    { id: "all", labelVi: "Tất Cả", labelEn: "All Curations", count: 4 },
    { id: "culinary", labelVi: "Ẩm Thực Biển", labelEn: "Culinary", count: 1 },
    { id: "wellness", labelVi: "Trị Liệu & Spa", labelEn: "Wellness", count: 1 },
    { id: "private-beach", labelVi: "Hồ Bơi & Biển", labelEn: "Ocean Oasis", count: 1 },
    { id: "butler-service", labelVi: "Quản Gia Riêng", labelEn: "Concierge", count: 1 },
  ];

  const filteredExperiences = activeFilter === "all"
    ? EXPERIENCES
    : EXPERIENCES.filter((item) => item.category === activeFilter);

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

          {/* Luxury Filter Segment Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10" role="tablist" aria-label="Bộ lọc trải nghiệm">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[var(--accent-brass)] text-[#110e0c] font-bold border-[var(--accent-brass)] shadow-md"
                      : "bg-[var(--bg-surface-card)] text-[var(--text-secondary)] border-[var(--brass-hairline)] hover:border-[var(--accent-brass)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{lang === "vi" ? tab.labelVi : tab.labelEn}</span>
                  <span className={`ml-1.5 text-[10px] opacity-75 font-mono ${isActive ? "text-[#110e0c]" : "text-[var(--accent-brass)]"}`}>
                    (0{tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* EDITORIAL HORIZON SHOWCASE (Anti-Bento luxury narrative) */}
          <div className="editorial-showcase-grid">
            {filteredExperiences.map((item, idx) => (
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

                <div className="showcase-content flex flex-col justify-between flex-1">
                  <div>
                    <span className="showcase-tagline">{item.tagline}</span>
                    <h3 className="showcase-title">{t(item.titleKey)}</h3>
                    <p className="showcase-desc">{t(item.descriptionKey)}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[var(--brass-hairline)]/40 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {lang === "vi" ? "Dành riêng cho khách lưu trú" : "Exclusive to in-house guests"}
                    </span>
                    <Link
                      href="/rooms"
                      className="text-xs text-[var(--accent-brass)] hover:text-[var(--accent-brass-bright)] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      {lang === "vi" ? "Xem Phòng Phù Hợp" : "Explore Suites"} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="sanctuary-cta">
            <Link
              href="/rooms"
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
