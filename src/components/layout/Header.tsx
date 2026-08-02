"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTranslation, Language } from "../../domain/i18n.ts";

type HeaderTone = "dark" | "light";

export function Header() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>("vi");
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerTone, setHeaderTone] = useState<HeaderTone>(pathname === "/" ? "dark" : "light");
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fallbackTone: HeaderTone = pathname === "/" ? "dark" : "light";
    const toneSections = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-header-tone]"),
    );
    let frame = 0;

    const updateTone = () => {
      frame = 0;
      const headerProbeY = Math.min(42, Math.max(1, window.innerHeight / 2));
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
  const headerForeground = isDarkTone ? "var(--warm-ivory)" : "var(--espresso)";
  const headerMutedForeground = isDarkTone ? "rgba(251,248,242,.78)" : "rgba(38,30,26,.72)";
  const headerControlBorder = isDarkTone ? "rgba(255,255,255,.34)" : "rgba(38,30,26,.24)";
  const headerControlBackground = isDarkTone ? "rgba(25,21,18,.28)" : "rgba(251,248,242,.42)";

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      data-header-tone={headerTone}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "transparent",
        backdropFilter: "none",
        boxShadow: "none",
        color: headerForeground,
        transition: "color 0.3s ease",
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
          borderBottom: `1px solid ${isDarkTone ? "rgba(255,255,255,.2)" : "rgba(38,30,26,.16)"}`,
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
              color: isDarkTone ? "var(--gold-light)" : "var(--muted-terracotta)",
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
              aria-current={isActive(link.href) ? "page" : undefined}
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
                color: isActive(link.href) ? headerForeground : headerMutedForeground,
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
              border: `1px solid ${headerControlBorder}`,
              borderRadius: "var(--radius-control)",
              background: headerControlBackground,
              color: headerForeground,
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
              border: `1px solid ${headerControlBorder}`,
              borderRadius: "var(--radius-control)",
              background: headerControlBackground,
              color: headerForeground,
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
          background: "rgba(25,21,18,.98)",
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
        <div style={{ display: "flex", gap: 16, marginTop: 24, alignItems: "center" }}>
          <Link
            href="/search"
            onClick={closeMenu}
            style={{
              padding: "14px 24px",
              borderRadius: "var(--radius-control)",
              background: "var(--antique-brass)",
              color: "var(--night)",
              font: '700 11px/1 Manrope, sans-serif',
              letterSpacing: ".1em",
              textTransform: "uppercase" as const,
            }}
          >
            {getTranslation(lang, "nav.bookNow")}
          </Link>
          <button
            onClick={toggleLanguage}
            style={{
              minWidth: 44,
              minHeight: 44,
              padding: "0 16px",
              border: "1px solid rgba(255,255,255,.4)",
              borderRadius: "var(--radius-control)",
              background: "rgba(255,255,255,.1)",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
            }}
            aria-label={`Chuyển ngôn ngữ sang ${lang === "vi" ? "tiếng Anh" : "tiếng Việt"}`}
          >
            {lang === "vi" ? "EN" : "VI"}
          </button>
        </div>
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
