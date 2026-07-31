"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Slide {
  id: number;
  tagline: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tagline: "Contemporary Oceanfront Luxury",
    title: "Trải Nghiệm Nghỉ Dưỡng Thượng Lưu Bên Bờ Biển",
    subtitle: "Không gian sang trọng tĩnh lặng bên bờ bãi biển thơ mộng. Nơi mỗi khoảnh khắc lưu trú trở thành kỷ niệm khó quên.",
    ctaText: "Khám Phá Phòng & Suite",
    ctaLink: "/rooms",
  },
  {
    id: 2,
    tagline: "Exclusive Presidential Suite",
    title: "Đẳng Cấp Tuyệt Đối Của Sự Riêng Tư",
    subtitle: "Tầm nhìn panorama 360 độ ôm trọn bình minh trên đại dương cùng dịch vụ quản gia cá nhân hóa 24/7.",
    ctaText: "Xem Suite Tổng Thống",
    ctaLink: "/rooms",
  },
  {
    id: 3,
    tagline: "Gourmet Dining & Spa Sanctuary",
    title: "Ẩm Thực Thượng Hạng & Trị Liệu Thư Thái",
    subtitle: "Thưởng thức hương vị hải sản tươi ngon được chế biến bởi các đầu bếp ngôi sao và tái tạo năng lượng tại Aurora Spa.",
    ctaText: "Trải Nghiệm Dịch Vụ",
    ctaLink: "/rooms",
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const activeSlide = SLIDES[currentSlide];

  return (
    <section aria-label="Hero Carousel" className="relative bg-[#17211D] text-[#F7F4ED] pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#C5A46D]/20">
      {/* Decorative ambient background elements */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5A46D_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A46D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#355B4B]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Slide Content */}
        <div
          key={activeSlide.id}
          className={`space-y-6 transition-all duration-700 ease-out ${
            isReducedMotion ? "" : "transform translate-y-0 opacity-100"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A46D]/15 border border-[#C5A46D]/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#C5A46D] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A46D]">
              {activeSlide.tagline}
            </span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.12] tracking-tight text-[#F7F4ED] max-w-4xl mx-auto drop-shadow-sm">
            {activeSlide.title}
          </h1>

          <p className="text-base sm:text-lg text-[#DADDD8] max-w-2xl mx-auto font-light leading-relaxed">
            {activeSlide.subtitle}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={activeSlide.ctaLink}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-[#C5A46D] text-[#17211D] hover:bg-[#D4B57E] transition-all shadow-lg hover:shadow-[#C5A46D]/20 hover:-translate-y-0.5 active:translate-y-0 min-h-[44px] min-w-[140px] inline-flex items-center justify-center"
            >
              {activeSlide.ctaText}
            </Link>
            <a
              href="#booking-console"
              className="px-8 py-3.5 rounded-xl text-sm font-semibold border border-[#F7F4ED]/30 text-[#F7F4ED] hover:bg-[#F7F4ED]/10 transition-all backdrop-blur-sm min-h-[44px] min-w-[140px] inline-flex items-center justify-center"
            >
              Đặt Phòng Trực Tiếp
            </a>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            onClick={prevSlide}
            className="w-11 h-11 rounded-full border border-[#C5A46D]/30 flex items-center justify-center text-[#F7F4ED] hover:bg-[#C5A46D]/20 hover:border-[#C5A46D] transition-all active:scale-95 min-h-[44px] min-w-[44px]"
            aria-label="Trang trước"
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "w-8 bg-[#C5A46D]"
                    : "w-2 bg-[#F7F4ED]/30 hover:bg-[#F7F4ED]/50"
                }`}
                aria-label={`Chuyển tới slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="w-11 h-11 rounded-full border border-[#C5A46D]/30 flex items-center justify-center text-[#F7F4ED] hover:bg-[#C5A46D]/20 hover:border-[#C5A46D] transition-all active:scale-95 min-h-[44px] min-w-[44px]"
            aria-label="Trang kế tiếp"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
