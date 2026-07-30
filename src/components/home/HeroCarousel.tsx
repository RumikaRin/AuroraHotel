"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  { src: "/images/hero-hotel.png", alt: "Không gian nghỉ dưỡng Aurora mở ra giữa cây xanh và ánh sáng tự nhiên" },
  { src: "/images/hero-hotel.png", alt: "Hồ bơi và kiến trúc đương đại của Aurora Hotel" },
  { src: "/images/hero-hotel.png", alt: "Nội thất nghỉ dưỡng với vật liệu ấm và ánh sáng dịu" },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useRef(false);

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

  return (
    <section className="hero" aria-label="Giới thiệu Aurora Hotel">
      {/* Slide images */}
      <div
        className="hero-track"
        style={{ transform: `translate3d(-${index * 33.3333}%, 0, 0)` }}
      >
        {slides.map((slide, i) => (
          <figure key={i} className="hero-slide">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              style={{ objectFit: "cover" }}
              sizes="100vw"
            />
          </figure>
        ))}
      </div>

      {/* Content overlay */}
      <div className="hero-layout wrap">
        <div className="hero-copy">
          <div className="eyebrow">Contemporary oceanfront luxury</div>
          <h1>
            Trải nghiệm <em>nghỉ dưỡng thượng lưu</em>
          </h1>
          <p>
            Không gian tĩnh lặng bên biển, nơi kiến trúc, ánh sáng và sự chăm sóc tạo nên một kỳ nghỉ đáng nhớ.
          </p>
        </div>

        <div className="hero-ui" aria-label="Điều khiển ảnh giới thiệu">
          <div className="hero-counter">
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span>Chuyển từ phải sang trái</span>
          </div>
          <div className="hero-progress">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? "active" : ""}
                onClick={() => { go(i); startTimer(); }}
                aria-label={`Hiển thị ảnh giới thiệu ${i + 1}`}
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
                aria-label="Ảnh trước"
              >←</button>
              <button
                className="circle-button"
                type="button"
                onClick={() => { go(index + 1); startTimer(); }}
                aria-label="Ảnh tiếp"
              >→</button>
            </div>
            <button
              className="pause-button"
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
            >
              {paused ? "Tiếp tục" : "Tạm dừng"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 92dvh;
          overflow: hidden;
          background: var(--night);
          color: white;
        }
        .hero-track {
          position: absolute;
          inset: 0;
          display: flex;
          width: 300%;
          height: 100%;
          transition: transform 1.15s var(--ease);
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
            linear-gradient(90deg, rgba(10,18,14,.72) 0%, rgba(10,18,14,.2) 55%, rgba(10,18,14,.38) 100%),
            linear-gradient(0deg, rgba(10,18,14,.78) 0%, transparent 55%, rgba(10,18,14,.22) 100%);
          z-index: 1;
        }
        .hero-layout {
          position: relative;
          z-index: 3;
          min-height: 92dvh;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(250px, .8fr);
          align-items: end;
          gap: 80px;
          padding-top: calc(var(--header-height) + 72px);
          padding-bottom: 13dvh;
        }
        .hero-copy { max-width: 880px; }
        .hero-copy h1 {
          max-width: 850px;
          margin: 20px 0 24px;
          font: 500 clamp(62px, 7.5vw, 112px)/.84 "Cormorant Garamond", serif;
          letter-spacing: -.045em;
          text-wrap: balance;
        }
        .hero-copy h1 em {
          display: inline-block;
          padding-bottom: .08em;
          font-weight: 400;
        }
        .hero-copy p {
          max-width: 480px;
          margin: 0;
          color: rgba(255,255,255,.78);
          font-size: 14px;
          line-height: 1.75;
        }
        .hero-ui {
          justify-self: end;
          width: min(100%, 320px);
          padding-bottom: 4px;
        }
        .hero-counter {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 16px;
        }
        .hero-counter strong {
          font: 500 48px/1 "Cormorant Garamond", serif;
        }
        .hero-counter span {
          color: rgba(255,255,255,.68);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: .14em;
          text-transform: uppercase;
        }
        .hero-progress {
          display: flex;
          height: 18px;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,.28);
        }
        .hero-progress button {
          position: relative;
          flex: 1;
          height: 18px;
          padding: 0;
          border: 0;
          background: transparent;
        }
        .hero-progress button::after {
          content: "";
          position: absolute;
          top: -1px; right: 0; left: 0;
          height: 2px;
          transform: scaleX(0);
          background: var(--gold);
          transition: transform .35s var(--ease);
        }
        .hero-progress button.active::after {
          transform: scaleX(1);
        }
        .hero-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }
        .arrow-group { display: flex; gap: 8px; }
        .circle-button {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255,255,255,.42);
          border-radius: 50%;
          background: rgba(20,32,27,.18);
          color: white;
          transition: background .2s var(--ease), color .2s var(--ease);
        }
        .circle-button:hover {
          background: var(--paper);
          color: var(--night);
        }
        .pause-button {
          min-height: 44px;
          padding: 0;
          border: 0;
          background: transparent;
          color: white;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        @media (max-width: 1080px) {
          .hero-layout { grid-template-columns: 1fr .42fr; }
        }
        @media (max-width: 900px) {
          .hero-layout {
            grid-template-columns: 1fr;
            gap: 38px;
            padding-bottom: 12dvh;
          }
          .hero-ui { justify-self: start; width: min(100%, 420px); }
        }
        @media (max-width: 620px) {
          .hero { min-height: 820px; }
          .hero-layout {
            min-height: 820px;
            align-items: center;
            padding-top: 118px;
            padding-bottom: 172px;
          }
          .hero-copy h1 { margin-top: 15px; font-size: clamp(48px, 14vw, 68px); line-height: .91; }
          .hero-copy p { max-width: 340px; font-size: 12px; }
          .hero-ui { display: none; }
        }
      `}</style>
    </section>
  );
}
