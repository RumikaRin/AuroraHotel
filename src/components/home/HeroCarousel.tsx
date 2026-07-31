"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const slides = [
  { src: "/images/aurora/hero-01.jpg", alt: "Không gian nghỉ dưỡng Aurora mở ra giữa cây xanh và ánh sáng tự nhiên" },
  { src: "/images/aurora/hero-02.jpg", alt: "Hồ bơi và kiến trúc đương đại của Aurora Hotel" },
  { src: "/images/aurora/hero-03.jpg", alt: "Nội thất nghỉ dưỡng với vật liệu ấm và ánh sáng dịu" },
];

export function HeroCarousel() {
  const router = useRouter();
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
        const count = data.quotes ? data.quotes.length : 0;
        if (count > 0) {
          setNotice(`${count} hạng phòng khả dụng`);
          setNoticeType("success");
          setTimeout(() => {
            router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
          }, 600);
        } else {
          setNotice("Không có phòng trống trong khoảng ngày đã chọn.");
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
    <section className="snap-section hero" aria-label="Giới thiệu Aurora Hotel" id="top">
      {/* Slide images — horizontal slide track */}
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
          <div className="eyebrow" style={{ color: "#ebd8b6" }}>Aurora · A contemporary retreat</div>
          <h1>
            Three chapters.<br /><em>One memorable stay.</em>
          </h1>
          <p>
            Mỗi khung hình mở ra một nhịp nghỉ khác nhau — thiên nhiên, kiến trúc và sự chăm sóc được kết nối trong trải nghiệm Aurora.
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

      {/* BOOKING KEY CONSOLE OVERLAY */}
      <div className="booking-key" id="booking">
        <div className="key-number">01</div>
        <div className="booking-body">
          <form onSubmit={handleBookingSearch} className="booking-row">
            <div className="field">
              <small>Nhận phòng</small>
              <input
                type="date"
                name="checkIn"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={checkIn || undefined}
                aria-label="Ngày nhận phòng"
                required
              />
            </div>
            <div className="field">
              <small>Trả phòng</small>
              <input
                type="date"
                name="checkOut"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
                aria-label="Ngày trả phòng"
                required
              />
            </div>
            <div className="field">
              <small>Số khách</small>
              <select
                name="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                aria-label="Số khách"
              >
                <option value="1">1 khách · 1 phòng</option>
                <option value="2">2 khách · 1 phòng</option>
                <option value="3">3 khách · 1 phòng</option>
                <option value="4">4 khách · 2 phòng</option>
              </select>
            </div>
            <button type="submit" disabled={isSearching}>
              {isSearching ? "Đang kiểm tra…" : "Kiểm tra phòng"}
            </button>
          </form>
          {notice && (
            <div
              className="booking-notice"
              style={{
                color: noticeType === "success" ? "var(--leaf)" : "#B84A4A",
              }}
            >
              {notice}
            </div>
          )}
          <div className="booking-note">
            <span><b>✓ Giá trực tiếp minh bạch</b> · Tổng thuế phí hiển thị rõ ràng</span>
            <span><b>✓ Điều kiện hủy rõ ràng</b> trước khi chọn rate plan</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: max(100vh, 760px);
          overflow: hidden;
          background: var(--night);
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
            linear-gradient(90deg, rgba(9,17,13,.76) 0%, rgba(9,17,13,.12) 68%),
            linear-gradient(0deg, rgba(9,17,13,.76) 0%, transparent 44%);
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
          background: var(--paper);
          box-shadow: 0 24px 64px rgba(20,32,27,.28);
          display: grid;
          grid-template-columns: 84px 1fr;
          border: 1px solid var(--line);
        }
        .key-number {
          display: grid;
          place-items: center;
          background: var(--gold);
          color: var(--night);
          font: 600 28px "Cormorant Garamond", serif;
        }
        .booking-body { padding: 8px 14px; }
        .booking-row {
          display: grid;
          grid-template-columns: 1.1fr 1.1fr 1fr .75fr;
          align-items: center;
        }
        .field {
          padding: 10px 20px;
          border-right: 1px solid var(--line);
        }
        .field small {
          display: block;
          color: #888f8a;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-weight: 700;
        }
        .field input, .field select {
          width: 100%;
          border: 0;
          background: transparent;
          color: var(--night);
          font-size: 13px;
          font-weight: 600;
          margin-top: 4px;
          outline: none;
        }
        .booking-row button {
          border: 0;
          background: var(--night);
          color: #fff;
          font-size: 9px;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
          min-height: 46px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .booking-row button:hover { background: var(--leaf); }
        .booking-note {
          padding: 6px 18px 2px;
          color: #77807a;
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
        .booking-row button:disabled {
          opacity: 0.6;
          cursor: wait;
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
      `}</style>
    </section>
  );
}
