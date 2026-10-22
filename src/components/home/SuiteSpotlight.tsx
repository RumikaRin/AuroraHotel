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
}

const suiteImages = [
  "/images/hero-hotel.png",
  "/images/hero-hotel.png",
  "/images/hero-hotel.png",
];

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function SuiteSpotlight({ rooms }: SuiteSpotlightProps) {
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
            className={`object-cover transition-all duration-300 ${isChanging ? "opacity-20 scale-[1.025]" : "opacity-100 scale-100"}`}
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
    </>
  );
}
