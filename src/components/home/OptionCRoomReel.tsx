"use client";

import Link from "next/link";
import { useCallback, useState, useRef } from "react";

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

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function OptionCRoomReel({ rooms }: OptionCRoomReelProps) {
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
      aria-label="Bộ sưu tập phòng nghỉ Aurora"
      id="suites"
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
            style={{ backgroundImage: `url('${reelImages[i % reelImages.length]}')` }}
          />
        ))}
      </div>

      <div className="reel-gradient-overlay" />

      <div className="wrap reel-content-wrap">
        <div className="reel-head">
          <div className="chapter-mark" style={{ color: "#d8bb83", marginBottom: 0 }}>
            <strong style={{ font: '500 44px/1 "Cormorant Garamond", serif' }}>III</strong>
            <span className="eyebrow" style={{ color: "#d8bb83" }}>
              The Stay Collection
            </span>
          </div>
          <div className="reel-head-count">
            {String(index + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}
          </div>
        </div>

        <div className="reel-middle-copy">
          <div className="eyebrow" style={{ color: "var(--gold)" }}>
            {current?.type || "Signature Suite"}
          </div>
          <h2>{current?.name}</h2>
          <p>{current?.description}</p>
        </div>

        <nav className="reel-room-list" aria-label="Chọn hạng phòng nổi bật">
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
              <small>{room.type || "Aurora stay"}</small>
            </button>
          ))}
        </nav>

        <div className="reel-bottom-bar">
          <div className="reel-facts-row">
            <div className="reel-fact-item">
              <small>Diện tích</small>
              <strong>{amenities[0] || "48 m²"}</strong>
            </div>
            <div className="reel-fact-item">
              <small>Sức chứa</small>
              <strong>{amenities[1] || "2 Khách"}</strong>
            </div>
            <div className="reel-fact-item">
              <small>Loại giường</small>
              <strong>{amenities[2] || "King Bed"}</strong>
            </div>
            <div className="reel-fact-item">
              <small>Chính sách Rate Plan</small>
              <strong>{amenities[3] || "Flexible & Saver"}</strong>
            </div>
          </div>

          <div className="reel-action-group">
            <div className="reel-price-tag">
              <small>Giá khởi điểm từ</small>
              <strong>{formatVND(current?.basePrice || 3250000)}</strong>
            </div>
            <Link href={`/rooms/${current?.slug || ""}`} className="btn-reel-cta">
              Xem phòng & giá
            </Link>
          </div>
        </div>
      </div>

      {/* Side nav */}
      <nav className="reel-side-nav" aria-label="Danh sách hạng phòng">
        <button
          className="reel-nav-arrow"
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Phòng trước"
        >
          ↑
        </button>
        <div className="reel-nav-indicators">
          {rooms.map((room, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === index}
              aria-label={`Chuyển tới ${room.name || `Phòng ${i + 1}`}`}
              className={`reel-indicator ${i === index ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          className="reel-nav-arrow"
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Phòng tiếp"
        >
          ↓
        </button>
      </nav>

      <style>{`
        .stay-reel-full {
          position: relative;
          width: 100%;
          min-height: max(100svh, 760px);
          color: #fff;
          overflow: hidden;
          background: var(--warm-carbon);
          outline: none;
        }
        .stay-reel-full:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: -4px;
        }
        .reel-bgs { position: absolute; inset: 0; width: 100%; height: 100%; }
        .reel-bg-item {
          position: absolute; inset: 0; width: 100%; height: 100%;
          opacity: 0;
          transition: opacity 1s cubic-bezier(.66,0,.26,1);
          background-size: cover;
          background-position: center;
        }
        .reel-bg-item.active { opacity: 1; }
        .reel-gradient-overlay {
          position: absolute; inset: 0; z-index: 2;
          background: linear-gradient(90deg, rgba(25,21,18,0.9) 0%, rgba(25,21,18,0.25) 65%, rgba(25,21,18,0.65) 100%),
                      linear-gradient(0deg, rgba(25,21,18,0.8) 0%, transparent 45%);
        }
        .reel-content-wrap {
          position: relative;
          z-index: 3;
          min-height: max(100svh, 760px);
          padding-block: 56px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .reel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.18);
        }
        .reel-head-count {
          font: 500 36px "Cormorant Garamond", serif;
          color: white;
        }
        .reel-middle-copy {
          max-width: 760px;
          padding-block: 20px;
        }
        .reel-middle-copy h2 {
          font: 500 clamp(56px, 7vw, 98px)/0.84 "Cormorant Garamond", serif;
          letter-spacing: -0.045em;
          margin: 16px 0 20px;
          color: white;
        }
        .reel-middle-copy p {
          max-width: 480px;
          color: rgba(255,255,255,0.82);
          font-size: 13px;
          line-height: 1.85;
        }
        .reel-room-list {
          position: absolute;
          right: 0;
          top: 50%;
          width: min(300px, 28vw);
          transform: translateY(-50%);
          display: grid;
          gap: 8px;
        }
        .reel-room-list button {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 2px 12px;
          padding: 14px 16px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: rgba(25,21,18,0.26);
          color: rgba(255,255,255,0.68);
          text-align: left;
          transition: background .25s var(--ease), border-color .25s var(--ease), color .25s var(--ease), transform .25s var(--ease);
        }
        .reel-room-list button:hover,
        .reel-room-list button.active {
          border-color: rgba(181,154,107,.7);
          background: rgba(38,30,26,.78);
          color: var(--warm-ivory);
          transform: translateX(-4px);
        }
        .reel-room-list button > span {
          grid-row: span 2;
          align-self: center;
          color: var(--antique-brass);
          font: 500 18px/1 var(--font-display);
        }
        .reel-room-list strong { font: 600 15px/1.1 var(--font-display); }
        .reel-room-list small { color: rgba(255,255,255,.55); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .reel-room-list button.active small { color: rgba(243,238,231,.68); }
        .reel-bottom-bar {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: flex-end;
          gap: 40px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.18);
        }
        .reel-facts-row { display: flex; gap: 48px; }
        .reel-fact-item small {
          display: block; color: rgba(243,238,231,.62); font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;
        }
        .reel-fact-item strong { display: block; margin-top: 6px; font-size: 12px; font-weight: 600; color: white; }
        .reel-action-group { display: flex; align-items: center; gap: 32px; }
        .reel-price-tag { text-align: right; }
        .reel-price-tag small { display: block; color: rgba(243,238,231,.62); font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
        .reel-price-tag strong { display: block; color: var(--antique-brass); font-size: 24px; font-weight: 600; margin-top: 2px; }
        .btn-reel-cta {
          padding: 16px 28px;
          border-radius: 8px;
          background: var(--warm-ivory);
          color: var(--espresso);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-reel-cta:hover { background: var(--antique-brass); color: var(--espresso); transform: translateY(-2px); }

        .reel-side-nav {
          position: absolute;
          right: 48px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .reel-nav-arrow {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.4);
          background: rgba(25,21,18,0.62);
          color: white;
          font-size: 14px;
          display: grid; place-items: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .reel-nav-arrow:hover { background: var(--warm-ivory); color: var(--espresso); border-color: var(--warm-ivory); }
        .reel-nav-indicators { display: flex; flex-direction: column; gap: 8px; margin-block: 8px; }
        .reel-indicator {
          width: 6px; height: 36px;
          padding: 0;
          border: 0;
          background: rgba(255,255,255,0.3);
          transition: background 0.3s, height 0.3s;
          cursor: pointer;
          border-radius: 3px;
        }
        .reel-indicator.active { background: var(--gold); height: 56px; }

        @media (max-width: 980px) {
          .reel-content-wrap { padding-block: 40px 32px; min-height: max(100svh, 700px); }
          .reel-room-list { position: static; width: 100%; transform: none; display: flex; overflow-x: auto; padding-block: 8px 4px; scrollbar-width: none; }
          .reel-room-list::-webkit-scrollbar { display: none; }
          .reel-room-list button { min-width: 220px; }
          .reel-side-nav { display: none; }
          .reel-bottom-bar { grid-template-columns: 1fr; }
        }

        @media (max-width: 620px) {
          .reel-bg-item { background-position: 62% center; }
          .reel-content-wrap { padding-block: 28px 24px; }
          .reel-middle-copy { padding-block: 12px; }
          .reel-middle-copy h2 { font-size: clamp(48px, 16vw, 72px); }
          .reel-facts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
          .reel-action-group { align-items: flex-start; flex-direction: column; gap: 14px; }
          .reel-price-tag { text-align: left; }
          .btn-reel-cta { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  );
}
