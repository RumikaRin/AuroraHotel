"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

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
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2200&q=88",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2200&q=88",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2200&q=88",
];

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function OptionCRoomReel({ rooms }: OptionCRoomReelProps) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    setIndex(((next % rooms.length) + rooms.length) % rooms.length);
  }, [rooms.length]);

  const current = rooms[index] || rooms[0];
  const amenities = Array.isArray(current?.amenities) ? (current.amenities as string[]) : ["48 m²", "2 Khách", "King Bed", "Flexible & Saver"];

  return (
    <section className="snap-section stay-reel-full" aria-label="Bộ sưu tập phòng nghỉ Aurora" id="suites">
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
            <span className="eyebrow" style={{ color: "#d8bb83" }}>The Stay Collection</span>
          </div>
          <div className="reel-head-count">
            {String(index + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}
          </div>
        </div>

        <div className="reel-middle-copy">
          <div className="eyebrow" style={{ color: "var(--gold)" }}>{current?.type || "Signature Suite"}</div>
          <h2>{current?.name}</h2>
          <p>{current?.description}</p>
        </div>

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
      <div className="reel-side-nav">
        <button className="reel-nav-arrow" type="button" onClick={() => goTo(index - 1)} aria-label="Phòng trước">↑</button>
        <div className="reel-nav-indicators">
          {rooms.map((_, i) => (
            <div
              key={i}
              className={`reel-indicator ${i === index ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button className="reel-nav-arrow" type="button" onClick={() => goTo(index + 1)} aria-label="Phòng tiếp">↓</button>
      </div>

      <style>{`
        .stay-reel-full {
          position: relative;
          width: 100%;
          height: 100vh;
          color: #fff;
          overflow: hidden;
          background: var(--night);
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
          background: linear-gradient(90deg, rgba(9,17,13,0.88) 0%, rgba(9,17,13,0.2) 65%, rgba(9,17,13,0.6) 100%),
                      linear-gradient(0deg, rgba(9,17,13,0.75) 0%, transparent 45%);
        }
        .reel-content-wrap {
          position: relative;
          z-index: 3;
          height: 100vh;
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
          display: block; color: #a0aaa3; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;
        }
        .reel-fact-item strong { display: block; margin-top: 6px; font-size: 12px; font-weight: 600; color: white; }
        .reel-action-group { display: flex; align-items: center; gap: 32px; }
        .reel-price-tag { text-align: right; }
        .reel-price-tag small { display: block; color: #a0aaa3; font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
        .reel-price-tag strong { display: block; color: var(--gold); font-size: 24px; font-weight: 600; margin-top: 2px; }
        .btn-reel-cta {
          padding: 16px 28px;
          border-radius: 8px;
          background: var(--ivory);
          color: var(--night);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-reel-cta:hover { background: var(--gold); transform: translateY(-2px); }

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
          background: rgba(14,23,19,0.5);
          color: white;
          font-size: 14px;
          display: grid; place-items: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .reel-nav-arrow:hover { background: var(--ivory); color: var(--night); border-color: var(--ivory); }
        .reel-nav-indicators { display: flex; flex-direction: column; gap: 8px; margin-block: 8px; }
        .reel-indicator {
          width: 2px; height: 36px;
          background: rgba(255,255,255,0.3);
          transition: background 0.3s, height 0.3s;
          cursor: pointer;
        }
        .reel-indicator.active { background: var(--gold); height: 56px; }

        @media (max-width: 980px) {
          .reel-content-wrap { padding-block: 40px 32px; height: auto; }
          .reel-side-nav { display: none; }
          .reel-bottom-bar { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
