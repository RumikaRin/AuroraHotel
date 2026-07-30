"use client";

import Link from "next/link";
import { useState } from "react";
import { getTranslation, Language } from "../../domain/i18n.ts";

export function Header() {
  const [lang, setLang] = useState<Language>("vi");

  const toggleLanguage = () => {
    setLang((prev) => (prev === "vi" ? "en" : "vi"));
  };

  return (
    <header className="sticky top-0 z-50 bg-[#17211D] text-[#F7F4ED] shadow-md border-b border-[#C5A46D]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex flex-col">
          <span className="font-serif-display text-2xl font-semibold tracking-wider text-[#F7F4ED]">
            AURORA HOTEL
          </span>
          <span className="text-[10px] tracking-widest text-[#C5A46D] uppercase">
            {getTranslation(lang, "nav.slogan")}
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/rooms" className="hover:text-[#C5A46D] transition-colors">
            {getTranslation(lang, "nav.rooms")}
          </Link>
          <Link href="/experiences" className="hover:text-[#C5A46D] transition-colors">
            {getTranslation(lang, "nav.experience")}
          </Link>
          <Link href="/offers" className="hover:text-[#C5A46D] transition-colors">
            {getTranslation(lang, "nav.offers")}
          </Link>
          <Link href="/my-bookings" className="hover:text-[#C5A46D] transition-colors">
            {getTranslation(lang, "nav.myBookings")}
          </Link>
        </nav>

        {/* Language & CTA */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded text-xs font-semibold border border-[#C5A46D]/40 text-[#C5A46D] hover:bg-[#C5A46D]/10 transition-all"
            aria-label="Toggle language"
          >
            {lang.toUpperCase()}
          </button>
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#C5A46D] text-[#17211D] hover:bg-[#b0905b] transition-all shadow-sm"
          >
            {getTranslation(lang, "nav.bookNow")}
          </Link>
        </div>
      </div>
    </header>
  );
}
