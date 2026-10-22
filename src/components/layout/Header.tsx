"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type HeaderTone = "dark" | "light";

function initialToneForPath(pathname: string): HeaderTone {
  return pathname === "/" || pathname === "/rooms" || pathname === "/experiences" || pathname === "/offers"
    ? "dark"
    : "light";
}

export function Header() {
  const pathname = usePathname();
  const { lang, t, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerTone, setHeaderTone] = useState<HeaderTone>(initialToneForPath(pathname));
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fallbackTone = initialToneForPath(pathname);
    const toneSections = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-header-tone]"),
    );
    let frame = 0;

    const updateTone = () => {
      frame = 0;
      const headerProbeY = Math.min(48, Math.max(1, window.innerHeight * 0.07));
      const activeSection = toneSections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= headerProbeY && rect.bottom > headerProbeY;
      });
      const visibleSection = activeSection || toneSections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      const nextTone = visibleSection?.dataset.headerTone;
      setHeaderTone(nextTone === "light" || nextTone === "dark" ? nextTone : fallbackTone);
    };

    const scheduleToneUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateTone);
    };

    setHeaderTone(fallbackTone);
    updateTone();
    window.addEventListener("scroll", scheduleToneUpdate, { passive: true });
    window.addEventListener("resize", scheduleToneUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleToneUpdate);
      window.removeEventListener("resize", scheduleToneUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const isDarkTone = headerTone === "dark";
  const isHomepage = pathname === "/";
  const shouldFloatOverHero = isDarkTone && ["/", "/rooms", "/experiences", "/offers"].includes(pathname);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
    menuBtnRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    document.body.classList.add("menu-open");
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) closeMenu();
    else openMenu();
  }, [menuOpen, closeMenu, openMenu]);

  // Escape key handler
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen, closeMenu]);

  const navLinks = [
    { href: "/rooms", key: "nav.rooms" },
    { href: "/experiences", key: "nav.experience" },
    { href: "/offers", key: "nav.offers" },
    { href: "/my-bookings", key: "nav.myBookings" },
  ] as const;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className="site-header"
      data-header-tone={headerTone}
      data-floating={shouldFloatOverHero ? "true" : "false"}
      data-homepage={isHomepage ? "true" : "false"}
    >
      <div className="wrap header-inner">
        {/* Brand */}
        <Link href="/" className="header-brand" aria-label={t("nav.home")}>
          <strong className="header-brand-title">AURORA HOTEL</strong>
          <small className="header-brand-slogan">{t("nav.slogan")}</small>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label={t("header.primaryNavigation")}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`desktop-nav-link ${isActive(link.href) ? "active" : ""}`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <button
            type="button"
            onClick={toggleLanguage}
            className="lang-btn"
            aria-label={t(lang === "vi" ? "header.switchToEnglish" : "header.switchToVietnamese")}
          >
            {lang.toUpperCase()}
          </button>

          <Link href="/search" className="header-book-btn">
            {t("nav.bookNow")}
          </Link>

          <button
            ref={menuBtnRef}
            type="button"
            onClick={toggleMenu}
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            aria-label={t(menuOpen ? "header.closeMenu" : "header.openMenu")}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              {menuOpen ? (
                <>
                  <line x1="1" y1="1" x2="17" y2="13" />
                  <line x1="1" y1="13" x2="17" y2="1" />
                </>
              ) : (
                <>
                  <line x1="0" y1="1" x2="18" y2="1" />
                  <line x1="0" y1="7" x2="18" y2="7" />
                  <line x1="0" y1="13" x2="18" y2="13" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      <nav
        id="mobileMenu"
        aria-label={t("header.mobileNavigation")}
        className={`mobile-overlay ${menuOpen ? "is-open" : ""}`}
      >
        <div className="mobile-menu-utility">
          <span className="mobile-brand-title">AURORA HOTEL</span>
          <button
            type="button"
            onClick={closeMenu}
            className="mobile-menu-close"
            aria-label={t("header.closeMenu")}
          >
            <span>{t("header.closeMenu")}</span>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.35">
              <line x1="2" y1="2" x2="16" y2="16" />
              <line x1="16" y1="2" x2="2" y2="16" />
            </svg>
          </button>
        </div>

        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={`mobile-nav-link ${isActive(link.href) ? "active" : ""}`}
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        <div className="mobile-menu-actions">
          <Link
            href="/search"
            onClick={closeMenu}
            className="mobile-book-btn"
          >
            {t("nav.bookNow")}
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            className="mobile-lang-btn"
            aria-label={t(lang === "vi" ? "header.switchToEnglish" : "header.switchToVietnamese")}
          >
            {lang === "vi" ? "EN" : "VI"}
          </button>
        </div>
      </nav>
    </header>
  );
}
