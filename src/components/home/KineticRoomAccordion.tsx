"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface RoomData {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  desc: string;
  area: string;
  capacity: string;
  view: string;
  price: string;
  slug: string;
  image: string;
}

const ROOMS_DATA: RoomData[] = [
  {
    id: "01",
    name: "Deluxe King Oceanfront",
    subtitle: "01 · DELUXE KING ROOM",
    tag: "HẠNG PHÒNG TIÊU CHUẨN THƯỢNG LƯU",
    desc: "Ban công riêng biệt lộng gió hướng trọn vẹn bờ cát trắng, phòng tắm ốp đá cẩm thạch Ý sang trọng và giường King ngoại cỡ êm ái.",
    area: "35 m²",
    capacity: "2 Khách",
    view: "180° Vịnh Biển",
    price: "2.500.000 ₫",
    slug: "deluxe-king",
    image: "/images/aurora/deluxe-king.jpg",
  },
  {
    id: "02",
    name: "Executive Ocean Suite",
    subtitle: "02 · EXECUTIVE SUITE",
    tag: "BỘ SƯU TẬP SUITE BIỆT LẬP",
    desc: "Phòng khách độc lập tách biệt phòng ngủ, bồn tắm ngâm thảo mộc hướng biển và đặc quyền thưởng thức trà chiều tại Executive Lounge.",
    area: "65 m²",
    capacity: "3 Khách",
    view: "Hoàng Hôn Vịnh Biển",
    price: "4.500.000 ₫",
    slug: "executive-suite",
    image: "/images/aurora/executive-suite.jpg",
  },
  {
    id: "03",
    name: "Presidential Cliffside Villa",
    subtitle: "03 · PRESIDENTIAL VILLA",
    tag: "DINH THỰ ĐỈNH CAO BÁN ĐẢO",
    desc: "Hồ bơi vô cực riêng biệt dài 12m tràn vách đá sa thạch, dịch vụ quản gia 24/7 và bàn tiệc nướng hải sản ngoài trời chuẩn Michelin.",
    area: "120 m²",
    capacity: "4 Khách",
    view: "Panorama 270° Đại Dương",
    price: "12.000.000 ₫",
    slug: "presidential-suite",
    image: "/images/aurora/presidential-villa.jpg",
  },
  {
    id: "04",
    name: "Grand Reserve Penthouse",
    subtitle: "04 · RESERVE PENTHOUSE",
    tag: "TUYỆT TÁC KHÔNG GIAN BẦU TRỜI",
    desc: "Toàn bộ tầng áp mái với thang máy riêng biệt, quầy bar cocktail cá nhân hóa và góc nhìn bao quát toàn bộ thành phố Đà Nẵng về đêm.",
    area: "210 m²",
    capacity: "6 Khách",
    view: "Toàn Cảnh Bán Đảo & Vịnh",
    price: "22.000.000 ₫",
    slug: "reserve-penthouse",
    image: "/images/hero-hotel.png",
  },
];

export function KineticRoomAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="suites">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">BỘ SƯU TẬP SUITES & VILLAS</div>
        <div className="mb-12">
          <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-3">
            Kiến trúc mở hướng thẳng đại dương
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl">
            Chạm hoặc di chuột qua từng gian phòng để chiêm ngưỡng không gian nghỉ dưỡng biệt lập và thông số kiến trúc độc bản.
          </p>
        </div>

        {/* 4-Panel Kinetic Accordion Container */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[640px] w-full">
          {ROOMS_DATA.map((room, idx) => {
            const isActive = activeIndex === idx;

            return (
              <div
                key={room.id}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => {
                  if (typeof window !== "undefined" && window.innerWidth > 1024) {
                    setActiveIndex(idx);
                  }
                }}
                className={`relative rounded-lg overflow-hidden cursor-pointer bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] shadow-2xl transition-[flex-grow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] min-h-[380px] lg:min-h-0 ${
                  isActive ? "lg:flex-[3.5]" : "lg:flex-[1]"
                }`}
                style={{ willChange: "flex-grow" }}
              >
                {/* Background Image */}
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className={`object-cover transition-transform duration-1000 ease-out ${
                    isActive ? "scale-105 brightness-90" : "scale-100 brightness-60 hover:brightness-75"
                  }`}
                />

                {/* Dark Bottom Scrim Protection */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,16,14,0.95)] via-[rgba(20,16,14,0.4)] to-[rgba(20,16,14,0.1)] pointer-events-none" />

                {/* Collapsed Rotated Label (Desktop only) */}
                <div
                  className={`hidden lg:block absolute bottom-9 left-7 font-serif-luxury text-xl tracking-[0.14em] text-white whitespace-nowrap pointer-events-none drop-shadow-lg transition-opacity duration-300 [writing-mode:vertical-rl] rotate-180 ${
                    isActive ? "opacity-0" : "opacity-90"
                  }`}
                >
                  {room.subtitle}
                </div>

                {/* Anti-Jitter Typography Container Locked to Fixed 540px Width */}
                <div
                  className={`absolute bottom-0 left-0 w-[540px] max-w-[calc(100%-40px)] p-6 sm:p-10 transition-all duration-500 ease-out ${
                    isActive
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-6 pointer-events-none lg:block hidden"
                  }`}
                >
                  <div className="text-[10px] tracking-[0.18em] text-[#e2c799] uppercase mb-1.5 drop-shadow">
                    {room.tag}
                  </div>
                  <h3 className="font-serif-luxury text-2xl sm:text-4xl text-white font-medium mb-3 whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-md">
                    {room.name}
                  </h3>
                  <p className="text-[#d4cbc2] text-sm leading-relaxed mb-6 max-w-[480px] drop-shadow">
                    {room.desc}
                  </p>

                  <div className="flex flex-wrap gap-4 sm:gap-6 py-4 border-t border-[rgba(226,199,153,0.3)] mb-6 tabular-nums">
                    <div>
                      <small className="block text-[9px] uppercase tracking-wider text-[#e2c799]">Diện tích</small>
                      <strong className="font-serif-luxury text-lg text-white">{room.area}</strong>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase tracking-wider text-[#e2c799]">Sức chứa</small>
                      <strong className="font-serif-luxury text-lg text-white">{room.capacity}</strong>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase tracking-wider text-[#e2c799]">Tầm nhìn</small>
                      <strong className="font-serif-luxury text-lg text-white">{room.view}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#e2c799]">Giá khởi điểm</span>
                      <strong className="font-serif-luxury text-2xl sm:text-3xl text-white">{room.price}</strong>
                      <span className="text-xs text-[#d4cbc2]"> / đêm</span>
                    </div>
                    <Link
                      href={`/rooms/${room.slug}`}
                      className="px-5 py-2.5 bg-[#e2c799] hover:bg-[#f5e2c4] text-[#110e0c] font-semibold text-xs tracking-wider uppercase rounded transition-colors shadow-lg"
                    >
                      Đặt phòng này →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
