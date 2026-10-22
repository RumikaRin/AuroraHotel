"use client";

import { useState } from "react";
import Image from "next/image";

interface ZoneData {
  tag: string;
  title: string;
  desc: string;
  area: string;
  perk: string;
  lat: number;
  lng: number;
  zoom: number;
  img: string;
}

const MASTERPLAN_ZONES: ZoneData[] = [
  {
    tag: "PHÂN KHU ĐỘ CAO 45M · VÁCH ĐÁ HOÀNG HÔN",
    title: "Cliffside Sanctuary Reserve",
    desc: "Tọa lạc trên đỉnh mỏm sa thạch đón gió biển lộng lẫy, bao trọn 270° tầm nhìn hoàng hôn vịnh Đà Nẵng với hồ bơi vô cực tràn vách đá.",
    area: "220 m²",
    perk: "Hải trình riêng & Quản gia",
    lat: 16.12,
    lng: 108.285,
    zoom: 15,
    img: "/images/epilogue-resort.png",
  },
  {
    tag: "BỜ BIỂN RIÊNG TƯ · CÁCH MẶT NƯỚC 15M",
    title: "Presidential Beachfront Villa",
    desc: "Hồ bơi riêng dài 16m ngay trước bậc thềm cát trắng mịn, bao quanh bởi rặng dừa và tiếng sóng vỗ bờ êm dịu suốt ngày đêm.",
    area: "180 m²",
    perk: "Đầu bếp riêng & Bãi biển riêng",
    lat: 16.102,
    lng: 108.263,
    zoom: 16,
    img: "/images/aurora/presidential-villa.jpg",
  },
  {
    tag: "THUNG LŨNG THẢO MỘC NGUYÊN SINH",
    title: "Spa Mộc & Suối Khoáng Nhiệt Đới",
    desc: "Các gian nhà trị liệu mái lá biệt lập giữa thảm thực vật Sơn Trà cổ thụ, mang đến không gian tĩnh lặng tuyệt đối cho việc hồi phục thân tâm.",
    area: "1.200 m²",
    perk: "Vườn dược liệu & Yoga Pavilion",
    lat: 16.108,
    lng: 108.27,
    zoom: 16,
    img: "/images/aurora/deluxe-king.jpg",
  },
  {
    tag: "VỊNH BIỂN HOANG SƠ BẢO TỒN",
    title: "Bến Du Thuyền Aurora Marina",
    desc: "Bến neo đậu riêng biệt phục vụ hải trình khám phá rạn san hô Bãi Bụt và các chuyến du ngoạn ngắm hoàng hôn vịnh Đà Nẵng.",
    area: "Vịnh riêng",
    perk: "Đội du thuyền Catamaran riêng",
    lat: 16.0965,
    lng: 108.254,
    zoom: 15,
    img: "/images/hero-hotel.png",
  },
];

export function SpatialMasterplan() {
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);
  const [mapMode, setMapMode] = useState<"k" | "m">("k"); // 'k' = satellite, 'm' = standard map
  const [isInteractive, setIsInteractive] = useState(false);

  const activeZone = MASTERPLAN_ZONES[activeZoneIndex];

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="masterplan">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">SƠ ĐỒ ĐỊA THẾ & KHÔNG GIAN BÁN ĐẢO</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4">
          Kiến trúc hòa mình cùng tự nhiên nguyên bản
        </h2>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-2xl mb-12">
          Bấm vào từng phân khu trên sơ đồ địa thế Sơn Trà để khám phá các không gian biệt lập của Aurora Sanctuary.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Google Maps Explorer */}
          <div className="lg:col-span-8 bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg overflow-hidden shadow-xl">
            {/* Map Header Bar */}
            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-b border-[var(--brass-hairline)] bg-[var(--bg-card)] text-xs text-[var(--text-secondary)] gap-2">
              <div className="flex items-center gap-2 font-medium tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[var(--hud-dot-color)] animate-pulse" />
                <span>GOOGLE MAPS · BÁN ĐẢO SƠN TRÀ, ĐÀ NẴNG</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMapMode("k")}
                  className={`px-3 py-1 rounded text-[11px] uppercase tracking-wider transition-colors ${
                    mapMode === "k"
                      ? "bg-[var(--accent-brass)] text-[var(--accent-brass-ink)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Vệ tinh
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode("m")}
                  className={`px-3 py-1 rounded text-[11px] uppercase tracking-wider transition-colors ${
                    mapMode === "m"
                      ? "bg-[var(--accent-brass)] text-[var(--accent-brass-ink)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Bản đồ
                </button>
                <a
                  href="https://www.google.com/maps/place/B%C3%A1n+%C4%91%E1%BA%A3o+S%C6%A1n+Tr%C3%A0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-brass)] hover:underline ml-2 text-[11px]"
                >
                  Mở tab mới ↗
                </a>
              </div>
            </div>

            {/* Zone Selector Pills Bar */}
            <div className="flex overflow-x-auto gap-2 p-3 bg-[var(--bg-surface-card)] border-b border-[var(--brass-hairline)]">
              {MASTERPLAN_ZONES.map((zone, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveZoneIndex(idx)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs tracking-wider transition-all ${
                    activeZoneIndex === idx
                      ? "bg-[var(--accent-brass)] text-[var(--accent-brass-ink)] font-semibold shadow-md"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  {`0${idx + 1} · ${zone.title.split(" ")[0]} ${zone.title.split(" ")[1] || ""}`}
                </button>
              ))}
            </div>

            {/* Iframe Container with Pointer Shield */}
            <div
              className="relative w-full h-[460px] bg-[#0a0807]"
              data-lenis-prevent
              onMouseLeave={() => setIsInteractive(false)}
            >
              <iframe
                title="Google Maps Bán đảo Sơn Trà"
                src={`https://maps.google.com/maps?q=${activeZone.lat},${activeZone.lng}&t=${mapMode}&z=${activeZone.zoom}&ie=UTF8&iwloc=&output=embed`}
                className={`w-full h-full border-none ${isInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
                loading="lazy"
                allowFullScreen
                data-lenis-prevent
              />

              {/* Pointer Shield for Lenis Scroll Safety */}
              {!isInteractive && (
                <div
                  className="map-pointer-shield absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer backdrop-blur-[1px] hover:bg-black/10 transition-colors"
                  onClick={() => setIsInteractive(true)}
                  title="Nhấp để tương tác bản đồ vệ tinh"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setIsInteractive(true);
                  }}
                >
                  <div className="px-5 py-2.5 rounded-full bg-[rgba(20,16,14,0.85)] border border-[var(--accent-brass)] text-[var(--accent-brass)] text-xs tracking-widest uppercase flex items-center gap-2 shadow-2xl">
                    <span>✥</span>
                    <span>Nhấp để tương tác bản đồ vệ tinh</span>
                  </div>
                </div>
              )}

              {isInteractive && (
                <button
                  type="button"
                  onClick={() => setIsInteractive(false)}
                  className="absolute top-4 right-4 px-4 py-2 bg-[rgba(20,16,14,0.85)] text-white text-xs border border-[var(--brass-hairline)] rounded hover:border-[var(--accent-brass)] transition-colors shadow-lg z-20"
                >
                  ✕ Khóa bản đồ để cuộn trang
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Zone Card */}
          <div className="lg:col-span-4 bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="relative w-full h-48 rounded-md overflow-hidden mb-6 border border-[var(--brass-hairline)]">
                <Image
                  src={activeZone.img}
                  alt={activeZone.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] mb-2 font-medium">
                {activeZone.tag}
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[var(--text-primary)] mb-3">
                {activeZone.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                {activeZone.desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--brass-hairline)] tabular-nums">
              <div>
                <span className="block text-[9px] tracking-wider uppercase text-[var(--accent-brass)] mb-1">
                  Diện tích
                </span>
                <strong className="font-serif-luxury text-xl text-[var(--text-primary)]">
                  {activeZone.area}
                </strong>
              </div>
              <div>
                <span className="block text-[9px] tracking-wider uppercase text-[var(--accent-brass)] mb-1">
                  Đặc quyền
                </span>
                <strong className="font-serif-luxury text-lg text-[var(--text-primary)]">
                  {activeZone.perk}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
