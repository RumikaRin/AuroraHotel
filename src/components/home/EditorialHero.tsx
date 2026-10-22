"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function EditorialHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !bgRef.current || !heroRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const heroEl = heroRef.current;
    const bgEl = bgRef.current;

    const tween = gsap.to(bgEl, {
      y: "22%",
      scale: 1.0,
      ease: "none",
      scrollTrigger: {
        trigger: heroEl,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === heroEl) trigger.kill();
      });
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden" id="hero" ref={heroRef}>
      {/* Background Parallax Canvas */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%] z-0 pointer-events-none scale-105"
        style={{ willChange: "transform" }}
      >
        <Image
          src="/images/hero-hotel.png"
          alt="Aurora Hotel & Sanctuary - Vách đá bán đảo Sơn Trà"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Multi-stop Left Scrim Gradient for Contrast Protection */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(17,14,12,0.92)] via-[rgba(17,14,12,0.55)] to-[rgba(17,14,12,0.2)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,14,12,0.95)] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Hero Typography Container */}
      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-6 sm:px-12 md:px-16 pb-12 pt-40">
        <div className="max-w-3xl">
          <div className="section-eyebrow !text-[#e2c799] drop-shadow-md">
            KHU NGHỈ DƯỠNG BIỆT LẬP · BÁN ĐẢO SƠN TRÀ, ĐÀ NẴNG
          </div>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-medium leading-[1.08] tracking-tight mb-6 drop-shadow-lg">
            Thành phố ở gần. <br />
            <span className="text-[#e2c799]">Kỳ nghỉ ở rất xa.</span>
          </h1>
          <p className="text-[#d4cbc2] text-base sm:text-lg max-w-xl leading-relaxed mb-10 drop-shadow">
            Nơi vách đá sa thạch ôm trọn vịnh biển nguyên sinh. Trải nghiệm lưu trú tĩnh tại với tầm nhìn panorama 270 độ và đặc quyền quản gia riêng biệt.
          </p>
        </div>

        {/* 4-Column Hairline Booking Ribbon Bar */}
        <div className="booking-ribbon-bar bg-[rgba(20,16,14,0.72)] backdrop-blur-xl border border-[rgba(226,199,153,0.32)] rounded-lg p-4 sm:p-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="lg:border-r border-[rgba(226,199,153,0.2)] pr-4">
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[#e2c799] font-medium mb-1">
                NHẬN PHÒNG
              </label>
              <input
                type="date"
                defaultValue="2026-10-25"
                className="w-full bg-transparent text-white font-serif-luxury text-lg border-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="lg:border-r border-[rgba(226,199,153,0.2)] pr-4 sm:pl-2">
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[#e2c799] font-medium mb-1">
                TRẢ PHÒNG
              </label>
              <input
                type="date"
                defaultValue="2026-10-28"
                className="w-full bg-transparent text-white font-serif-luxury text-lg border-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="lg:border-r border-[rgba(226,199,153,0.2)] pr-4 sm:pl-2">
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[#e2c799] font-medium mb-1">
                SỐ KHÁCH
              </label>
              <select
                defaultValue="2"
                className="w-full bg-transparent text-white font-serif-luxury text-lg border-none focus:outline-none cursor-pointer [&>option]:text-black"
              >
                <option value="1">1 Khách · 1 Phòng</option>
                <option value="2">2 Khách · 1 Phòng</option>
                <option value="3">3 Khách · 1 Phòng</option>
                <option value="4">4 Khách · 2 Phòng</option>
              </select>
            </div>

            <div className="sm:pl-2 flex items-center">
              <a
                href="#suites"
                className="w-full inline-flex items-center justify-center py-3 px-6 bg-[#e2c799] hover:bg-[#f5e2c4] text-[#110e0c] font-semibold text-xs tracking-[0.16em] uppercase rounded transition-colors shadow-lg"
              >
                Tìm phòng trống →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
