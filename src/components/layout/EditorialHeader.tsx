"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function EditorialHeader() {
  const pathname = usePathname();
  const { lang, t, toggleLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<"dusk" | "dawn">("dusk");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const savedTheme = (localStorage.getItem("aurora-theme") as "dusk" | "dawn") || "dusk";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSetTheme = (newTheme: "dusk" | "dawn") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("aurora-theme", newTheme);
  };

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

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen, closeMenu]);

  const navLinks = [
    { href: "/rooms", labelVi: "Suites & Villas", labelEn: "Suites & Villas", index: "01" },
    { href: "/experiences", labelVi: "Trải nghiệm", labelEn: "Experiences", index: "02" },
    { href: "/offers", labelVi: "Ưu đãi", labelEn: "Offers", index: "03" },
    { href: "/my-bookings", labelVi: "Tra cứu đặt phòng", labelEn: "My Bookings", index: "04" },
  ];

  const isHeroPage = pathname === "/" || pathname === "/rooms" || pathname === "/experiences" || pathname === "/offers";

  return (
    <header className={`site-nav ${isScrolled ? "scrolled" : ""} ${!isHeroPage ? "solid-header" : ""}`} id="main-nav">
      {/* Brand Logo */}
      <Link href="/" className="brand-mark" aria-label="Aurora Hotel & Sanctuary">
        <span className="brand-title">A U R O R A</span>
        <span className="brand-caption">{t("nav.slogan")}</span>
      </Link>

      {/* Desktop Navigation Links */}
      <nav aria-label={t("header.primaryNavigation")} className="hidden xl:block">
        <ul className="nav-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link href={link.href} className={isActive ? "active" : ""}>
                  <span className="nav-index">{link.index}</span>
                  <span className="nav-label">{lang === "vi" ? link.labelVi : link.labelEn}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Action Utilities (Language, Theme, Login, Book CTA, Mobile Menu) */}
      <div className="nav-actions">
        {/* Language Toggle Button */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="lang-btn px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[var(--accent-brass)] border border-[var(--brass-hairline)] rounded hover:border-[var(--accent-brass)] transition-colors uppercase"
          aria-label={t(lang === "vi" ? "header.switchToEnglish" : "header.switchToVietnamese")}
        >
          {lang.toUpperCase()}
        </button>

        {/* Theme Switcher Segmented Control */}
        <div className="theme-switch-segmented hidden sm:flex" role="group" aria-label="Chuyển chế độ giao diện">
          <button
            type="button"
            className={`theme-switch-btn ${theme === "dusk" ? "active" : ""}`}
            onClick={() => handleSetTheme("dusk")}
            title="Chế độ Tối (Dạ khúc)"
            aria-pressed={theme === "dusk"}
          >
            <span className="theme-icon" aria-hidden="true">☾</span>
            <span>Tối</span>
          </button>
          <button
            type="button"
            className={`theme-switch-btn ${theme === "dawn" ? "active" : ""}`}
            onClick={() => handleSetTheme("dawn")}
            title="Chế độ Sáng (Bình minh)"
            aria-pressed={theme === "dawn"}
          >
            <span className="theme-icon" aria-hidden="true">☼</span>
            <span>Sáng</span>
          </button>
        </div>

        {/* Customer / Staff Login Link */}
        <Link
          href="/login"
          className="hidden md:inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-brass)] transition-colors tracking-wider"
          title="Đăng nhập tài khoản"
        >
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{lang === "vi" ? "Đăng nhập" : "Sign In"}</span>
        </Link>

        {/* Reserve CTA Button */}
        <Link href="/rooms" className="btn-reserve-nav hidden sm:inline-block">
          {t("nav.bookNow")}
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          ref={menuBtnRef}
          type="button"
          onClick={toggleMenu}
          className="menu-button xl:hidden p-2 text-[var(--accent-brass)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-brass)]"
          aria-expanded={menuOpen}
          aria-controls="mobileDrawer"
          aria-label={t(menuOpen ? "header.closeMenu" : "header.openMenu")}
        >
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="1.6">
            {menuOpen ? (
              <>
                <line x1="2" y1="2" x2="20" y2="16" />
                <line x1="2" y1="16" x2="20" y2="2" />
              </>
            ) : (
              <>
                <line x1="0" y1="2" x2="22" y2="2" />
                <line x1="5" y1="9" x2="22" y2="9" />
                <line x1="0" y1="16" x2="22" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Accessible Mobile Slide-Out Drawer */}
      <nav
        id="mobileDrawer"
        aria-label={t("header.mobileNavigation")}
        className={`mobile-overlay ${menuOpen ? "is-open" : ""}`}
      >
        <div className="mobile-menu-utility">
          <span className="mobile-brand-title">AURORA RESORT</span>
          <button
            type="button"
            onClick={closeMenu}
            className="mobile-menu-close"
            aria-label={t("header.closeMenu")}
          >
            <span>{t("header.closeMenu")}</span>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
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
              className={`mobile-nav-link ${pathname === link.href ? "active" : ""}`}
            >
              <span>{link.index} ·</span>
              <span>{lang === "vi" ? link.labelVi : link.labelEn}</span>
            </Link>
          ))}
          <Link
            href="/login"
            onClick={closeMenu}
            className="mobile-nav-link"
          >
            <span>05 ·</span>
            <span>{lang === "vi" ? "Đăng nhập tài khoản" : "Sign In / Portal"}</span>
          </Link>
        </div>

        <div className="mobile-menu-actions">
          <Link
            href="/rooms"
            onClick={closeMenu}
            className="mobile-book-btn"
          >
            {t("nav.bookNow")}
          </Link>
          <div className="flex items-center justify-between pt-4 border-t border-[var(--brass-hairline)] w-full">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs border border-[var(--brass-hairline)] rounded text-[var(--accent-brass)]"
            >
              {lang === "vi" ? "Chuyển sang English" : "Switch to Tiếng Việt"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSetTheme("dusk")}
                className={`px-2 py-1 text-xs rounded ${theme === "dusk" ? "bg-[var(--accent-brass)] text-black" : "text-[var(--text-secondary)]"}`}
              >
                ☾ Tối
              </button>
              <button
                type="button"
                onClick={() => handleSetTheme("dawn")}
                className={`px-2 py-1 text-xs rounded ${theme === "dawn" ? "bg-[var(--accent-brass)] text-black" : "text-[var(--text-secondary)]"}`}
              >
                ☼ Sáng
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
