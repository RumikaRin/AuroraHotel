"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTranslation, Language } from "../../domain/i18n.ts";

export function Header() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>("vi");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomeTop = pathname === "/" && !scrolled;

  const toggleLanguage = () => {
    setLang((prev) => (prev === "vi" ? "en" : "vi"));
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

  // Escape key
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

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: isHomeTop ? "transparent" : "rgba(23, 33, 29, 0.95)",
        backdropFilter: isHomeTop ? "none" : "blur(12px)",
        boxShadow: isHomeTop ? "none" : "0 4px 20px rgba(0,0,0,0.35)",
        color: "#F7F4ED",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      <div
        className="wrap"
        style={{
          height: "var(--header-height)",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 32,
          borderBottom: "1px solid rgba(255,255,255,.2)",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            flexDirection: "column",
            justifySelf: "start",
            minHeight: 44,
            minWidth: 44,
            justifyContent: "center",
          }}
          aria-label="Aurora Hotel, về trang chủ"
        >
          <strong
            style={{
              font: '600 28px/1 "Cormorant Garamond", serif',
              letterSpacing: ".1em",
            }}
          >
            AURORA HOTEL
          </strong>
          <small
            style={{
              marginTop: 6,
              color: "var(--gold-light)",
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: ".22em",
              textTransform: "uppercase" as const,
            }}
          >
            {getTranslation(lang, "nav.slogan")}
          </small>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="desktop-nav"
          aria-label="Điều hướng chính"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            whiteSpace: "nowrap" as const,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                minWidth: 44,
                paddingBlock: 12,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {getTranslation(lang, link.key)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifySelf: "end",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={toggleLanguage}
            className="lang-btn"
            style={{
              minWidth: 44,
              minHeight: 44,
              border: "1px solid rgba(255,255,255,.34)",
              borderRadius: "var(--radius-control)",
              background: "rgba(20,32,27,.28)",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
            }}
            aria-label={`Chuyển ngôn ngữ sang ${lang === "vi" ? "tiếng Anh" : "tiếng Việt"}`}
          >
            {lang.toUpperCase()}
          </button>
          <Link
            href="/search"
            className="header-book"
            style={{
              display: "inline-flex",
              minHeight: 46,
              alignItems: "center",
              padding: "0 20px",
              borderRadius: "var(--radius-control)",
              background: "var(--gold)",
              color: "var(--night)",
              fontSize: 11,
              fontWeight: 700,
              transition: "transform .2s var(--ease), background .2s var(--ease)",
            }}
          >
            {getTranslation(lang, "nav.bookNow")}
          </Link>
          {/* Mobile menu button */}
          <button
            ref={menuBtnRef}
            onClick={toggleMenu}
            className="menu-button"
            style={{
              display: "none",
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,.3)",
              borderRadius: "var(--radius-control)",
              background: "rgba(20,32,27,.32)",
              color: "white",
            }}
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
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
        aria-label="Điều hướng di động"
        className={`mobile-overlay ${menuOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          zIndex: 19,
          inset: 0,
          display: "flex",
          visibility: menuOpen ? "visible" : "hidden",
          flexDirection: "column" as const,
          justifyContent: "center",
          gap: 6,
          transform: menuOpen ? "translateY(0)" : "translateY(-16px)",
          padding: "100px 28px 34px",
          background: "rgba(20,32,27,.98)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" as const : "none" as const,
          transition: "opacity .25s var(--ease), transform .25s var(--ease), visibility .25s",
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            style={{
              padding: "11px 0",
              color: "white",
              font: '500 clamp(34px, 8vw, 52px)/1 "Cormorant Garamond", serif',
            }}
          >
            {getTranslation(lang, link.key)}
          </Link>
        ))}
        <Link
          href="/search"
          onClick={closeMenu}
          style={{
            width: "fit-content",
            marginTop: 18,
            padding: "14px 18px",
            borderRadius: "var(--radius-control)",
            background: "var(--gold)",
            color: "var(--night)",
            font: '700 11px/1 Manrope, sans-serif',
            letterSpacing: ".1em",
            textTransform: "uppercase" as const,
          }}
        >
          {getTranslation(lang, "nav.bookNow")}
        </Link>
      </nav>

      <style>{`
        @media (min-width: 901px) {
          .menu-button { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .lang-btn { display: none !important; }
          .header-book { display: none !important; }
          .menu-button { display: inline-flex !important; }
          header .wrap {
            grid-template-columns: 1fr auto !important;
          }
        }
        @media (max-width: 620px) {
          header .wrap strong { font-size: 22px !important; }
          header .wrap small { max-width: 220px; font-size: 6px !important; }
        }
        .desktop-nav a { position: relative; }
        .desktop-nav a::after {
          content: "";
          position: absolute;
          right: 0; bottom: 5px; left: 0;
          height: 1px;
          transform: scaleX(0);
          transform-origin: right;
          background: var(--gold);
          transition: transform .25s var(--ease);
        }
        .desktop-nav a:hover::after,
        .desktop-nav a:focus-visible::after {
          transform: scaleX(1);
          transform-origin: left;
        }
        .header-book:hover {
          transform: translateY(-2px);
          background: var(--gold-light) !important;
        }
      `}</style>
    </header>
  );
}
