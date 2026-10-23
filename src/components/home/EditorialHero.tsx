"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AvailabilityPicker } from "@/components/booking/AvailabilityPicker";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function EditorialHero() {
  const router = useRouter();
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  /* Booking search state */
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [isSearching, setIsSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const defaultCheckOut = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    setCheckIn(todayStr);
    setCheckOut(defaultCheckOut);
  }, []);

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

  const handleBookingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setNotice(null);

    const targetUrl = `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

    try {
      const res = await fetch(`/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data.data) ? data.data.length : 0;
        if (count > 0) {
          setNotice(t("home.availableCount", { count }));
          setNoticeType("success");
          setTimeout(() => {
            router.push(targetUrl);
          }, 450);
        } else {
          setNotice(t("home.noAvailability"));
          setNoticeType("error");
        }
      } else {
        router.push(targetUrl);
      }
    } catch {
      router.push(targetUrl);
    } finally {
      setIsSearching(false);
    }
  };

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

        {/* Custom Atmospheric Booking Ribbon Console */}
        <div className="booking-ribbon-bar bg-[rgba(20,16,14,0.78)] backdrop-blur-xl border border-[rgba(226,199,153,0.32)] rounded-lg p-4 sm:p-6 shadow-2xl">
          <form onSubmit={handleBookingSearch} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex-1">
              <AvailabilityPicker
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                onGuestsChange={setGuests}
              />
            </div>

            <div className="flex items-center pt-2 lg:pt-0 lg:pl-4">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full lg:w-auto inline-flex items-center justify-center py-3.5 px-8 bg-[#e2c799] hover:bg-[#f5e2c4] text-[#110e0c] font-semibold text-xs tracking-[0.16em] uppercase rounded transition-colors shadow-lg disabled:opacity-60 whitespace-nowrap cursor-pointer"
              >
                {isSearching ? t("home.checking") : "Tìm phòng trống →"}
              </button>
            </div>
          </form>

          {/* Feedback Notice Alert */}
          {notice && (
            <div
              className={`mt-4 p-3 rounded text-xs tracking-wider flex items-center justify-between ${
                noticeType === "success"
                  ? "bg-[rgba(34,197,94,0.15)] text-[#86efac] border border-[rgba(34,197,94,0.3)]"
                  : "bg-[rgba(239,68,68,0.15)] text-[#fca5a5] border border-[rgba(239,68,68,0.3)]"
              }`}
              role="alert"
              aria-live="polite"
            >
              <span>{notice}</span>
              {noticeType === "success" && (
                <span className="animate-pulse font-mono text-[10px]">Đang chuyển hướng...</span>
              )}
            </div>
          )}

          {/* Luxury Direct Booking Guarantees */}
          <div className="mt-4 pt-3 border-t border-[rgba(226,199,153,0.18)] flex flex-wrap gap-4 sm:gap-8 text-[11px] text-[#b8ada2]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#e2c799]">✓</span>
              <strong>{t("home.directRate")}</strong> · {t("home.taxTransparency")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#e2c799]">✓</span>
              <strong>{t("home.clearCancellation")}</strong> {t("home.beforeRatePlan")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
