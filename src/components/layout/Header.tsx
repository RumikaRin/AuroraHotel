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
      // Match the tone to the visual layer actually behind the header. This
      // keeps the transition calm when a short utility strip sits between two
      // major sections.
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

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scrollMode = pathname === "/" ? "chapter" : "free";
    return () => {
      delete root.dataset.scrollMode;
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!desktopQuery.matches || reducedMotionQuery.matches) return;

    let isAnimating = false;
    let unlockTimer: number | undefined;

    const getScrollSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("main [data-scroll-section]"))
        .filter((section) => section.getClientRects().length > 0)
        .sort(
          (a, b) =>
            a.getBoundingClientRect().top + window.scrollY -
            (b.getBoundingClientRect().top + window.scrollY),
        );

    const handleWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.shiftKey || Math.abs(event.deltaY) < 8) return;

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [data-scroll-free]")) return;

      const sections = getScrollSections();
      if (sections.length < 2) return;

      const currentY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const positions = sections.map((section) => section.getBoundingClientRect().top + currentY);
      let currentIndex = 0;

      positions.forEach((position, index) => {
        if (position <= currentY + 12) currentIndex = index;
      });

      const currentSection = sections[currentIndex];
      const currentSectionTop = positions[currentIndex];
      const currentSectionHeight = currentSection?.getBoundingClientRect().height || viewportHeight;
      const currentSectionBottom = currentSectionTop + currentSectionHeight;
      const direction = event.deltaY > 0 ? 1 : -1;
      let destination: number | undefined;

      if (direction > 0) {
        const nestedDestination = positions.find(
          (position, index) => index > currentIndex && position > currentY + 24 && position < currentSectionBottom - 12,
        );
        if (nestedDestination !== undefined) {
          destination = nestedDestination;
        } else if (currentSectionHeight > viewportHeight + 120 && currentY < currentSectionBottom - viewportHeight - 24) {
          destination = Math.min(currentY + Math.max(viewportHeight * 0.88, 520), currentSectionBottom - viewportHeight);
        } else {
          destination = positions[currentIndex + 1];
        }
      } else if (currentY > currentSectionTop + 24) {
        destination = Math.max(currentSectionTop, currentY - Math.max(viewportHeight * 0.88, 520));
        if (destination <= currentSectionTop + 24) destination = currentSectionTop;
      } else {
        destination = positions[currentIndex - 1];
      }

      if (destination === undefined || Math.abs(destination - currentY) < 12) return;

      event.preventDefault();
      if (isAnimating) return;

      isAnimating = true;
      window.scrollTo({ top: Math.round(destination), behavior: "smooth" });
      if (unlockTimer !== undefined) window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        isAnimating = false;
        unlockTimer = undefined;
      }, 820);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (unlockTimer !== undefined) window.clearTimeout(unlockTimer);
    };
  }, [pathname]);

  const isDarkTone = headerTone === "dark";
  const isHomepage = pathname === "/";
  const headerForeground = isDarkTone ? "var(--warm-ivory)" : "var(--espresso)";
  const headerMutedForeground = isDarkTone ? "rgba(251,248,242,.78)" : "rgba(38,30,26,.72)";
  const headerControlBorder = isDarkTone ? "rgba(255,255,255,.34)" : "rgba(38,30,26,.24)";
  const headerControlBackground = isDarkTone ? "rgba(25,21,18,.28)" : "rgba(251,248,242,.42)";
  const shouldFloatOverHero = isDarkTone && ["/", "/rooms", "/experiences", "/offers"].includes(pathname);
  const headerSurface = shouldFloatOverHero
    ? "transparent"
    : isDarkTone
      ? "rgba(25,21,18,.96)"
      : "rgba(251,248,242,.96)";

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
      className="site-header"
      data-header-tone={headerTone}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: headerSurface,
        backgroundImage: isHomepage
          ? isDarkTone
            ? "linear-gradient(180deg, rgba(25,21,18,.16) 0%, rgba(25,21,18,0) 100%)"
            : "linear-gradient(180deg, rgba(251,248,242,.28) 0%, rgba(251,248,242,0) 100%)"
          : "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        boxShadow: "none",
        color: headerForeground,
        transition: "color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease",
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
          aria-label={t("nav.home")}
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
            {t("nav.slogan")}
          </small>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="desktop-nav"
          aria-label={t("header.primaryNavigation")}
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
              {t(link.key)}
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
            aria-label={t(lang === "vi" ? "header.switchToEnglish" : "header.switchToVietnamese")}
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
            {t("nav.bookNow")}
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
        className={`mobile-overlay ${menuOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          zIndex: 60,
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
        <div
          className="mobile-menu-utility"
          style={{
            position: "absolute",
            top: 22,
            left: 28,
            right: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span style={{ color: "var(--antique-brass)", font: '600 19px/1 "Cormorant Garamond", serif', letterSpacing: ".08em" }}>AURORA HOTEL</span>
          <button
            type="button"
            onClick={closeMenu}
            className="mobile-menu-close"
            aria-label={t("header.closeMenu")}
            style={{
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "0 13px",
              border: "1px solid rgba(243,238,231,.42)",
              borderRadius: "var(--radius-control)",
              background: "rgba(25,21,18,.28)",
              color: "var(--warm-ivory)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase" as const,
            }}
          >
            {t("header.closeMenu")}
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.35"><line x1="2" y1="2" x2="16" y2="16" /><line x1="16" y1="2" x2="2" y2="16" /></svg>
          </button>
        </div>
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
            {t(link.key)}
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
            {t("nav.bookNow")}
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
            aria-label={t(lang === "vi" ? "header.switchToEnglish" : "header.switchToVietnamese")}
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
