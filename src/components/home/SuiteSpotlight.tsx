"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Room {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: string;
  type?: string;
  amenities?: unknown;
}

interface SuiteSpotlightProps {
  rooms: Room[];
  formatVND: (amount: number) => string;
}

const suiteImages = [
  "/images/hero-hotel.png",
  "/images/hero-hotel.png",
  "/images/hero-hotel.png",
];

export function SuiteSpotlight({ rooms, formatVND }: SuiteSpotlightProps) {
  const [index, setIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const goTo = useCallback((next: number) => {
    const nextIndex = ((next % rooms.length) + rooms.length) % rooms.length;
    setIsChanging(true);
    setTimeout(() => {
      setIndex(nextIndex);
      setIsChanging(false);
    }, reduceMotion.current ? 0 : 180);
  }, [rooms.length]);

  const current = rooms[index];
  if (!current) return null;

  const amenities = Array.isArray(current.amenities) ? (current.amenities as string[]) : [];

  return (
    <>
      <div className="suite-spotlight">
        {/* Image side */}
        <div className="suite-media">
          <Image
            src={suiteImages[index] || suiteImages[0]}
            alt={current.name}
            fill
            style={{
              objectFit: "cover",
              opacity: isChanging ? 0.2 : 1,
              transform: isChanging ? "scale(1.025)" : "scale(1)",
              transition: "opacity .45s var(--ease), transform .9s var(--ease)",
            }}
            sizes="60vw"
          />
          <div className="suite-count">
            {String(index + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}
          </div>
          <div className="suite-image-control">
            <button type="button" onClick={() => goTo(index - 1)} aria-label="Phòng trước">←</button>
            <button type="button" onClick={() => goTo(index + 1)} aria-label="Phòng tiếp">→</button>
          </div>
        </div>

        {/* Info panel */}
        <div className="suite-panel">
          <div>
            <div className="eyebrow">{current.type || "Suite"}</div>
            <h3 className="suite-name">{current.name}</h3>
            <p className="suite-description">{current.description}</p>
            <div className="suite-facts">
              <div className="suite-fact">
                <small>Hạng phòng</small>
                <strong>{current.type || "Suite"}</strong>
              </div>
              <div className="suite-fact">
                <small>Sức chứa</small>
                <strong>2 khách</strong>
              </div>
              <div className="suite-fact">
                <small>Tiện nghi</small>
                <strong>{amenities[0] || "—"}</strong>
              </div>
              <div className="suite-fact">
                <small>Rate plans</small>
                <strong>Flexible, Saver</strong>
              </div>
            </div>
          </div>

          <div>
            <div className="suite-price-row">
              <div className="suite-price">
                <span>Giá khởi điểm theo ngày</span>
                <strong>{formatVND(current.basePrice)}</strong>
              </div>
              <Link href={`/rooms/${current.slug}`} className="suite-cta">
                Xem phòng và giá
              </Link>
            </div>
            {/* Suite tabs */}
            <div className="suite-tabs" role="tablist" aria-label="Chọn hạng phòng">
              {rooms.map((room, i) => (
                <button
                  key={room.id}
                  className="suite-tab"
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => goTo(i)}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .suite-spotlight {
          min-height: 690px;
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(360px, .6fr);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: var(--radius-panel);
          background: var(--night-soft);
        }
        .suite-media {
          position: relative;
          min-height: 690px;
          overflow: hidden;
        }
        .suite-media::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(7,13,10,.6), transparent 50%);
          pointer-events: none;
          z-index: 1;
        }
        .suite-count {
          position: absolute;
          z-index: 2;
          bottom: 27px;
          left: 28px;
          color: white;
          font: 500 28px/1 "Cormorant Garamond", serif;
        }
        .suite-image-control {
          position: absolute;
          z-index: 2;
          right: 24px;
          bottom: 24px;
          display: flex;
          gap: 8px;
        }
        .suite-image-control button {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255,255,255,.5);
          border-radius: 50%;
          background: rgba(20,32,27,.42);
          color: white;
        }
        .suite-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(40px, 4.2vw, 66px) clamp(30px, 3.4vw, 52px) 38px;
        }
        .suite-name {
          min-height: 2.05em;
          margin: 18px 0 22px;
          font: 500 clamp(48px, 4.4vw, 72px)/.86 "Cormorant Garamond", serif;
          letter-spacing: -.035em;
        }
        .suite-description {
          max-width: 420px;
          color: #aeb8b1;
          font-size: 12px;
          line-height: 1.82;
        }
        .suite-facts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          margin: 30px 0;
          border-top: 1px solid rgba(255,255,255,.14);
          border-bottom: 1px solid rgba(255,255,255,.14);
        }
        .suite-fact { padding: 17px 0; }
        .suite-fact:nth-child(odd) { border-right: 1px solid rgba(255,255,255,.14); }
        .suite-fact:nth-child(even) { padding-left: 20px; }
        .suite-fact small {
          display: block;
          color: #849087;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .suite-fact strong {
          display: block;
          margin-top: 7px;
          color: white;
          font-size: 11px;
          font-weight: 600;
        }
        .suite-price-row {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
        }
        .suite-price span { display: block; color: #87928b; font-size: 8px; }
        .suite-price strong {
          display: block;
          margin-top: 5px;
          color: var(--gold-light);
          font-size: 17px;
        }
        .suite-cta {
          display: inline-flex;
          min-height: 48px;
          align-items: center;
          padding: 0 18px;
          border-radius: var(--radius-control);
          background: var(--ivory);
          color: var(--night);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: transform .2s var(--ease), background .2s var(--ease);
        }
        .suite-cta:hover {
          transform: translateY(-2px);
          background: var(--gold-light);
        }
        .suite-tabs {
          display: grid;
          grid-template-columns: repeat(${rooms.length}, 1fr);
          margin-top: 18px;
          border-top: 1px solid rgba(255,255,255,.14);
        }
        .suite-tab {
          min-height: 62px;
          padding: 0 18px;
          border: 0;
          border-right: 1px solid rgba(255,255,255,.14);
          background: transparent;
          color: #88938c;
          font-size: 10px;
          font-weight: 600;
          text-align: left;
          transition: background .2s var(--ease), color .2s var(--ease);
        }
        .suite-tab:last-child { border-right: 0; }
        .suite-tab:hover,
        .suite-tab[aria-selected="true"] {
          background: rgba(255,255,255,.055);
          color: white;
        }
        .suite-tab[aria-selected="true"] {
          box-shadow: inset 0 2px 0 var(--gold);
        }

        @media (max-width: 1080px) {
          .suite-spotlight { grid-template-columns: 1.15fr .85fr; }
        }
        @media (max-width: 900px) {
          .suite-spotlight { grid-template-columns: 1fr; }
          .suite-media { min-height: 580px; }
          .suite-name { min-height: 0; }
          .suite-tabs { overflow-x: auto; }
          .suite-tab { min-width: 180px; }
        }
        @media (max-width: 620px) {
          .suite-spotlight { border-radius: 14px; }
          .suite-media { min-height: 390px; }
          .suite-panel { padding: 38px 22px 26px; }
          .suite-name { font-size: 51px; }
          .suite-price-row { align-items: stretch; flex-direction: column; }
          .suite-cta { justify-content: center; }
          .suite-tabs { grid-template-columns: 1fr; overflow: visible; }
          .suite-tab { min-width: 0; min-height: 50px; border-right: 0; border-bottom: 1px solid rgba(255,255,255,.12); }
        }
      `}</style>
    </>
  );
}
