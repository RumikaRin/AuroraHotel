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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => go(index + 1), 7600);
    }
  }, [paused, go, index]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

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
        style={{ transform: `translate3d(-${index * 33.3333}%, 0, 0)` }}
      >
        {slides.map((slide, i) => (
          <figure key={i} className="hero-slide">
            <Image
              src={slide.src}
              alt={t(slide.altKey)}
              fill
              priority={i === 0}
              quality={92}
              style={{ objectFit: "cover" }}
              sizes="100vw"
            />
          </figure>
        ))}
      </div>

      {/* Content overlay */}
      <div className="hero-layout wrap">
        <div className="hero-copy">
          <div className="eyebrow" style={{ color: "#e3c895" }}>{t("home.heroEyebrow")}</div>
          <h1>
            {t("home.heroTitleOne")}<br /><em>{t("home.heroTitleTwo")}</em>
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
                onClick={() => { go(i); startTimer(); }}
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
                onClick={() => { go(index - 1); startTimer(); }}
                aria-label={t("home.heroPrevious")}
              >←</button>
              <button
                className="circle-button"
                type="button"
                onClick={() => { go(index + 1); startTimer(); }}
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
        <div className="key-number">01</div>
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
              className="booking-notice"
              role="alert"
              aria-live="polite"
              style={{
                color: noticeType === "success" ? "var(--leaf)" : "#B84A4A",
              }}
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

      <style>{`
        .hero {
          position: relative;
          min-height: max(100svh, 720px);
          overflow: hidden;
          background: var(--warm-carbon);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .hero-track {
          position: absolute;
          inset: 0;
          display: flex;
          width: 300%;
          height: 100%;
          transition: transform 1.25s cubic-bezier(.66,0,.26,1);
        }
        .hero-slide {
          position: relative;
          width: 33.3333%;
          flex: 0 0 33.3333%;
          margin: 0;
        }
        .hero-slide::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(25,21,18,.72) 0%, rgba(25,21,18,.18) 68%),
            linear-gradient(0deg, rgba(25,21,18,.78) 0%, transparent 48%);
          z-index: 1;
        }
        .hero-layout {
          position: relative;
          z-index: 3;
          flex: 1;
          display: grid;
          grid-template-columns: 1.35fr .65fr;
          align-items: end;
          padding-top: 110px;
          padding-bottom: 210px;
        }
        .hero-copy { max-width: 880px; }
        .hero-copy h1 {
          font: 500 clamp(44px, 5.5vw, 88px)/.9 "Cormorant Garamond", serif;
          letter-spacing: -.035em;
          margin: 18px 0 20px;
        }
        .hero-copy h1 em {
          font-weight: 400;
          font-style: italic;
          color: var(--gold-light);
        }
        .hero-copy p {
          max-width: 480px;
          margin: 0;
          color: rgba(255,255,255,.8);
          font-size: 13px;
          line-height: 1.8;
        }
        .hero-ui {
          justify-self: end;
          align-self: end;
          width: 290px;
          margin-bottom: 1vh;
        }
        .hero-counter {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 16px;
        }
        .hero-counter strong {
          font: 500 44px/1 "Cormorant Garamond", serif;
        }
        .hero-counter span {
          color: #d8ded9;
          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }
        .hero-progress {
          display: flex;
          height: 1px;
          background: rgba(255,255,255,.32);
        }
        .hero-progress button {
          position: relative;
          flex: 1;
          height: 18px;
          margin-top: -8px;
          padding: 0;
          border: 0;
          background: transparent;
        }
        .hero-progress button::after {
          content: "";
          position: absolute;
          left: 0; right: 0; top: 8px;
          height: 1px;
          background: transparent;
        }
        .hero-progress button.active::after {
          height: 2px;
          background: var(--gold);
        }
        .hero-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 17px;
        }
        .arrow-group { display: flex; gap: 8px; }
        .circle-button {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255,255,255,.4);
          border-radius: 50%;
          background: transparent;
          color: white;
          transition: background .2s, color .2s;
        }
        .circle-button:hover {
          background: var(--paper);
          color: var(--night);
        }
        .pause-button {
          border: 0;
          background: transparent;
          color: white;
          font-size: 9px;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .pause-button:hover { color: var(--gold); }

        /* Booking Key Console */
        .booking-key {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 6;
          width: min(1280px, calc(100% - 64px));
          background: var(--warm-ivory);
          box-shadow: 0 24px 64px rgba(38,30,26,.28);
          display: grid;
          grid-template-columns: 84px 1fr;
          border: 1px solid var(--line);
        }
        .key-number {
          display: grid;
          place-items: center;
          background: var(--antique-brass);
          color: var(--espresso);
          font: 600 28px "Cormorant Garamond", serif;
        }
        .booking-body { padding: 8px 14px; }
        .booking-row {
          display: grid;
          grid-template-columns: 1.1fr 1.1fr 1fr .75fr;
          align-items: center;
          position: relative;
        }
        .field {
          padding: 10px 20px;
          border-right: 1px solid var(--line);
        }
        .field small {
          display: block;
          color: #3b423d;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-weight: 700;
        }
        .booking-row .booking-submit {
          border: 0;
          background: var(--espresso);
          color: #fff;
          font-size: 9px;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
          min-height: 46px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 220ms cubic-bezier(.22,.8,.22,1), transform 220ms cubic-bezier(.22,.8,.22,1);
        }
        .booking-row .booking-submit:hover { background: var(--walnut); transform: translateY(-1px); }
        .booking-row .booking-submit:focus-visible { outline: 2px solid var(--antique-brass); outline-offset: 3px; }
        .booking-note {
          padding: 6px 18px 2px;
          color: #353b37;
          font-size: 9px;
          display: flex;
          gap: 24px;
        }
        .booking-note span b { color: var(--leaf); font-weight: 600; }
        .booking-notice {
          padding: 6px 18px 0;
          font-size: 11px;
          font-weight: 600;
        }
        .booking-row .booking-submit:disabled {
          opacity: 0.6;
          cursor: wait;
          transform: none;
        }

        @media (max-width: 980px) {
          .hero-layout { grid-template-columns: 1fr; }
          .hero-ui { display: none; }
          .booking-key {
            position: relative;
            bottom: auto;
            left: auto;
            transform: none;
            margin: -44px auto 0;
          }
          .booking-row { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 620px) {
          .booking-key {
            width: min(100% - 28px, 440px);
            grid-template-columns: 1fr;
            border-radius: 16px 16px 0 0;
            box-shadow: 0 -2px 22px rgba(38,30,26,.16), 0 20px 48px rgba(38,30,26,.22);
          }
          .key-number { display: none; }
          .booking-body { padding: 8px 10px 9px; }
          .booking-row { grid-template-columns: 1fr 1fr; }
          .field { min-width: 0; padding: 7px 10px 9px; border-bottom: 1px solid var(--line); }
          .field:nth-child(1) { border-right: 1px solid var(--line); }
          .field:nth-child(2) { border-right: 0; }
          .field:nth-child(3) { border-bottom: 0; border-right: 1px solid var(--line); }
          .booking-row .booking-submit {
            min-height: 58px;
            margin: 6px 0 0 6px;
            padding: 9px 8px;
            border-radius: 10px;
            line-height: 1.35;
          }
          .booking-note { padding: 8px 4px 1px; flex-direction: column; gap: 4px; font-size: 8.5px; }
          .booking-notice { padding: 7px 4px 0; }
        }
      `}</style>
    </section>
  );
}
