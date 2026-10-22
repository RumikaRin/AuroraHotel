"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useRef } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface Room {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: string;
  type?: string;
  amenities?: unknown;
}

interface OptionCRoomReelProps {
  rooms: Room[];
}

const reelImages = [
  "/images/aurora/deluxe-king.jpg",
  "/images/aurora/executive-suite.jpg",
  "/images/aurora/family-villa.jpg",
  "/images/aurora/presidential-villa.jpg",
];

function formatVND(amount: number, lang: "vi" | "en") {
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function OptionCRoomReel({ rooms }: OptionCRoomReelProps) {
  const { lang, t } = useLanguage();
  const [index, setIndex] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const roomCount = rooms.length;

  const goTo = useCallback(
    (next: number) => {
      if (roomCount === 0) return;
      setIndex(((next % roomCount) + roomCount) % roomCount);
    },
    [roomCount]
  );

  const current = rooms[index] || rooms[0];
  const amenities = Array.isArray(current?.amenities)
    ? (current.amenities as string[])
    : ["48 m²", "2 Khách", "King Bed", "Flexible & Saver"];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 50) {
      if (deltaY < 0) {
        goTo(index + 1); // Swipe up -> next
      } else {
        goTo(index - 1); // Swipe down -> prev
      }
    }
    touchStartY.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <section
      className="snap-section stay-reel-full"
      aria-label={t("home.reelAria")}
      id="suites"
      data-scroll-section="rooms"
      data-header-tone="dark"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background images */}
      <div className="reel-bgs">
        {rooms.map((_, i) => (
          <div
            key={i}
            className={`reel-bg-item ${i === index ? "active" : ""}`}
          >
            <Image
              src={reelImages[i % reelImages.length]}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="reel-gradient-overlay" />

      <div className="wrap reel-content-wrap">
        <div className="reel-head">
          <div className="chapter-mark reel-chapter-mark">
            <span className="eyebrow reel-eyebrow">
              The Stay Collection
            </span>
          </div>
          <div className="reel-head-count">
            {String(index + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}
          </div>
        </div>

        <div className="reel-middle-copy">
          <div className="eyebrow reel-stay-eyebrow">
            {current?.type || t("home.reelFallback")}
          </div>
          <h2>{current?.name}</h2>
          <p>{current?.description}</p>
        </div>

        <nav className="reel-room-list" aria-label={t("home.reelRoomList")}>
          {rooms.map((room, i) => (
            <button
              key={room.id}
              type="button"
              className={i === index ? "active" : ""}
              onClick={() => goTo(i)}
              aria-pressed={i === index}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{room.name}</strong>
              <small>{room.type || t("home.reelStay")}</small>
            </button>
          ))}
        </nav>

        <div className="reel-bottom-bar">
          <div className="reel-facts-row">
            <div className="reel-fact-item">
              <small>{t("home.reelArea")}</small>
              <strong>{amenities[0] || "48 m²"}</strong>
            </div>
            <div className="reel-fact-item">
              <small>{t("home.reelCapacity")}</small>
              <strong>{amenities[1] || "2 Khách"}</strong>
            </div>
            <div className="reel-fact-item">
              <small>{t("home.reelBed")}</small>
              <strong>{amenities[2] || "King Bed"}</strong>
            </div>
            <div className="reel-fact-item">
              <small>{t("home.reelRatePlan")}</small>
              <strong>{amenities[3] || "Flexible & Saver"}</strong>
            </div>
          </div>

          <div className="reel-action-group">
            <div className="reel-price-tag">
              <small>{t("home.reelPrice")}</small>
              <strong>{formatVND(current?.basePrice || 3250000, lang)}</strong>
            </div>
            <Link href={`/rooms/${current?.slug || ""}`} className="btn-reel-cta">
              {t("home.reelCta")}
            </Link>
          </div>
        </div>
      </div>

      {/* Side nav */}
      <nav className="reel-side-nav" aria-label={t("home.reelListAria")}>
        <button
          className="reel-nav-arrow"
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label={t("home.reelPrevious")}
        >
          ↑
        </button>
        <div className="reel-nav-indicators">
          {rooms.map((room, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === index}
              aria-label={t("home.reelGoTo", { name: room.name || `${t("rooms.details")} ${i + 1}` })}
              className={`reel-indicator ${i === index ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          className="reel-nav-arrow"
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label={t("home.reelNext")}
        >
          ↓
        </button>
      </nav>
    </section>
  );
}
