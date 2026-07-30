"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTranslation, Language } from "../../domain/i18n.ts";

export function Header() {
  const [lang, setLang] = useState<Language>("vi");
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "vi" ? "en" : "vi"));
  };

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, closeMobile]);

  // Trap focus inside mobile menu
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return;
    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [mobileOpen]);

  const navLinks = [
    { href: "/rooms", key: "nav.rooms" },
    { href: "/experiences", key: "nav.experience" },
    { href: "/offers", key: "nav.offers" },
    { href: "/my-bookings", key: "nav.myBookings" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-aurora-midnight/95 backdrop-blur-sm text-aurora-ivory border-b border-aurora-gold/15">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex flex-col min-h-[44px] justify-center">
          <span className="font-display text-2xl font-semibold tracking-wider text-aurora-ivory">
            AURORA HOTEL
          </span>
          <span className="text-[10px] tracking-[0.2em] text-aurora-gold uppercase">
            {getTranslation(lang, "nav.slogan")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center space-x-8 text-sm font-medium"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-aurora-gold transition-colors duration-200 min-h-[44px] inline-flex items-center"
            >
              {getTranslation(lang, link.key)}
            </Link>
          ))}
        </nav>

        {/* Language & CTA & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-btn text-xs font-semibold border border-aurora-gold/40 text-aurora-gold hover:bg-aurora-gold/10 transition-all duration-200"
            aria-label={`Switch language to ${lang === "vi" ? "English" : "Tiếng Việt"}`}
          >
            {lang.toUpperCase()}
          </button>
          <Link
            href="/search"
            className="hidden sm:inline-flex px-5 py-2.5 rounded-btn text-sm font-semibold bg-aurora-gold text-aurora-midnight hover:bg-aurora-gold/85 transition-all duration-200 shadow-sm min-h-[44px] items-center"
          >
            {getTranslation(lang, "nav.bookNow")}
          </Link>

          {/* Mobile hamburger */}
          <button
            ref={toggleRef}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-btn text-aurora-ivory hover:bg-aurora-charcoal/50 transition-colors duration-200"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          id="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden bg-aurora-midnight border-t border-aurora-gold/15 animate-slide-down"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="block px-4 py-3 min-h-[44px] rounded-btn text-sm font-medium text-aurora-ivory hover:bg-aurora-charcoal/40 hover:text-aurora-gold transition-colors duration-200"
              >
                {getTranslation(lang, link.key)}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={closeMobile}
              className="block mt-3 px-4 py-3 min-h-[44px] rounded-btn text-sm font-semibold text-center bg-aurora-gold text-aurora-midnight hover:bg-aurora-gold/85 transition-all duration-200"
            >
              {getTranslation(lang, "nav.bookNow")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
