"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AvailabilityPicker } from "@/components/booking/AvailabilityPicker";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const slides = [
  { src: "/images/aurora/hero-01-hd.png", altKey: "home.heroSlideOne" },
  { src: "/images/aurora/hero-02-hd.png", altKey: "home.heroSlideTwo" },
  { src: "/images/aurora/hero-03-hd.png", altKey: "home.heroSlideThree" },
];

export function HeroCarousel() {
  const router = useRouter();
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useRef(false);

  /* Booking form state */
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [isSearching, setIsSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const defaultCheckOut = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    setCheckIn(todayStr);
    setCheckOut(defaultCheckOut);
  }, []);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion.current) setPaused(true);
  }, []);

  const go = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, []);

  /* Booking search handler */
  const handleBookingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setNotice(null);
    try {
      const res = await fetch(
        `/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
      );
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data.data) ? data.data.length : 0;
        if (count > 0) {
          setNotice(t("home.availableCount", { count }));
          setNoticeType("success");
          setTimeout(() => {
            router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
          }, 600);
        } else {
          setNotice(t("home.noAvailability"));
          setNoticeType("error");
        }
      } else {
        router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      }
    } catch {
      router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="snap-section hero" aria-label={t("home.heroAria")} id="top" data-scroll-section="hero" data-header-tone="dark">
      {/* Slide images — horizontal slide track */}
      <div
        className="hero-track"
        data-active-index={index}
      >
        {slides.map((slide, i) => (
          <figure key={i} className="hero-slide">
            <Image
              src={slide.src}
              alt={t(slide.altKey)}
              fill
              priority={i === 0}
              quality={92}
              className="object-cover"
              sizes="100vw"
            />
          </figure>
        ))}
      </div>

      {/* Content overlay */}
      <div className="hero-layout wrap">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">{t("home.heroEyebrow")}</div>
          <h1>
            {t("home.heroTitleOne")}<br /><span className="hero-subline">{t("home.heroTitleTwo")}</span>
          </h1>
          <p>
            {t("home.heroDescription")}
          </p>
        </div>

        <div className="hero-ui" aria-label={t("home.heroControls")}>
          <div className="hero-counter">
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span>{t("home.heroDirection")}</span>
          </div>
          <div className="hero-progress">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? "active" : ""}
                onClick={() => go(i)}
                aria-label={t("home.heroSlide", { count: i + 1 })}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
          <div className="hero-controls">
            <div className="arrow-group">
              <button
                className="circle-button"
                type="button"
                onClick={() => go(index - 1)}
                aria-label={t("home.heroPrevious")}
              >←</button>
              <button
                className="circle-button"
                type="button"
                onClick={() => go(index + 1)}
                aria-label={t("home.heroNext")}
              >→</button>
            </div>
            <button
              className="pause-button"
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
            >
              {paused ? t("home.heroResume") : t("home.heroPause")}
            </button>
          </div>
        </div>
      </div>

      {/* BOOKING KEY CONSOLE OVERLAY */}
      <div className="booking-key" id="booking">
        <div className="booking-body">
          <form onSubmit={handleBookingSearch} className="booking-row">
            <AvailabilityPicker
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
              onGuestsChange={setGuests}
            />
            <button className="booking-submit" type="submit" disabled={isSearching}>
              {isSearching ? t("home.checking") : t("home.checkAvailability")}
            </button>
          </form>
          {notice && (
            <div
              className={`booking-notice ${noticeType === "success" ? "is-success" : "is-error"}`}
              role="alert"
              aria-live="polite"
            >
              {notice}
            </div>
          )}
          <div className="booking-note">
            <span><b>✓ {t("home.directRate")}</b> · {t("home.taxTransparency")}</span>
            <span><b>✓ {t("home.clearCancellation")}</b> {t("home.beforeRatePlan")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
