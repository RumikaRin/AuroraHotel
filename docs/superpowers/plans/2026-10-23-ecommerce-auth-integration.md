# E-Commerce, Auth & Multi-Language Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconnect the full-stack hotel e-commerce engine, room catalog, reservation lookup, customer authentication, and multi-language controls into the flagship Awwwards homepage without aesthetic compromise.

**Architecture:** Upgrade `EditorialHeader.tsx` to provide luxury desktop route navigation (`/rooms`, `/experiences`, `/offers`, `/my-bookings`), language switching (`VI | EN`), authentication links (`/login`), and a mobile slide-out drawer; replace raw native date inputs in `EditorialHero.tsx` with the project's custom `AvailabilityPicker` connected to `/api/availability` and routing to `/rooms?checkIn=...`; reconcile `KineticRoomAccordion.tsx` and `EditorialFooter.tsx` with production routes.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript, `LanguageProvider` (`useLanguage`), `AvailabilityPicker` (React Portal), Playwright, Node.js Test Runner.

---

### Task 1: Re-architect `EditorialHeader.tsx` with Luxury Nav, Auth, I18n & Mobile Drawer

**Files:**
- Create: `tests/editorial-header-contracts.test.ts`
- Modify: `src/components/layout/EditorialHeader.tsx`
- Verify: `npm run ui:contract-check` & `node --experimental-strip-types --test tests/editorial-header-contracts.test.ts`

- [ ] **Step 1: Write the failing unit/contract test**

```typescript
// tests/editorial-header-contracts.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

describe("EditorialHeader architecture and route contracts", () => {
  it("includes all essential e-commerce routes, auth, language toggle, and mobile drawer", async () => {
    const fileContent = await readFile("src/components/layout/EditorialHeader.tsx", "utf8");

    // Route checks
    assert.ok(fileContent.includes('href="/rooms"'), "Must contain link to /rooms catalog");
    assert.ok(fileContent.includes('href="/experiences"'), "Must contain link to /experiences");
    assert.ok(fileContent.includes('href="/offers"'), "Must contain link to /offers");
    assert.ok(fileContent.includes('href="/my-bookings"'), "Must contain link to /my-bookings");
    assert.ok(fileContent.includes('href="/login"'), "Must contain link to /login");

    // i18n & controls
    assert.ok(fileContent.includes("useLanguage"), "Must integrate useLanguage hook");
    assert.ok(fileContent.includes("toggleLanguage"), "Must provide toggleLanguage action");
    assert.ok(fileContent.includes("lang-btn"), "Must expose .lang-btn for QA automation");

    // Mobile drawer affordances
    assert.ok(fileContent.includes("menu-button"), "Must expose .menu-button for mobile toggle");
    assert.ok(fileContent.includes("mobile-overlay"), "Must implement .mobile-overlay drawer");
    assert.ok(!fileContent.includes('href="#"'), "Must not contain dead link href='#'");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/editorial-header-contracts.test.ts`  
Expected: FAIL with "Must contain link to /rooms catalog"

- [ ] **Step 3: Implement `EditorialHeader.tsx` with complete routes, auth, i18n, and mobile drawer**

Replace `src/components/layout/EditorialHeader.tsx` with the complete implementation:

```tsx
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

  return (
    <header className={`site-nav ${isScrolled ? "scrolled" : ""}`} id="main-nav">
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/editorial-header-contracts.test.ts`  
Expected: PASS with 1 passing test.

- [ ] **Step 5: Run UI contract check and commit**

Run: `npm run ui:contract-check`  
Expected: 0 violations.

```bash
git add tests/editorial-header-contracts.test.ts src/components/layout/EditorialHeader.tsx
git commit -m "feat(header): restore full e-commerce routes, auth link, language switch, and mobile drawer"
```

---

### Task 2: Replace Native Date Inputs in `EditorialHero.tsx` with `AvailabilityPicker`

**Files:**
- Create: `tests/editorial-hero-picker.test.ts`
- Modify: `src/components/home/EditorialHero.tsx`
- Verify: `npm run ui:contract-check` & `node --experimental-strip-types --test tests/editorial-hero-picker.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/editorial-hero-picker.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

describe("EditorialHero datepicker and booking search contracts", () => {
  it("eliminates native date inputs and integrates custom luxury AvailabilityPicker", async () => {
    const fileContent = await readFile("src/components/home/EditorialHero.tsx", "utf8");

    // Native date inputs ban (Image #17 bug prevention)
    assert.ok(!fileContent.includes('type="date"'), "Must NOT contain unstyled native type='date' input");

    // Integration of custom AvailabilityPicker
    assert.ok(fileContent.includes("AvailabilityPicker"), "Must import and render AvailabilityPicker");
    assert.ok(fileContent.includes("/api/availability"), "Must query availability endpoint or prepare query string");
    assert.ok(fileContent.includes("/rooms?checkIn="), "Must redirect to /rooms with checkIn query parameter");
    assert.ok(fileContent.includes("useLanguage"), "Must integrate bilingual language dictionary");
    assert.ok(!fileContent.includes('href="#"'), "Must not contain dead links");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/editorial-hero-picker.test.ts`  
Expected: FAIL with "Must NOT contain unstyled native type='date' input"

- [ ] **Step 3: Implement `EditorialHero.tsx` with `AvailabilityPicker` & search engine**

Update `src/components/home/EditorialHero.tsx`:

```tsx
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
                className="w-full lg:w-auto inline-flex items-center justify-center py-3.5 px-8 bg-[#e2c799] hover:bg-[#f5e2c4] text-[#110e0c] font-semibold text-xs tracking-[0.16em] uppercase rounded transition-colors shadow-lg disabled:opacity-60 whitespace-nowrap"
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/editorial-hero-picker.test.ts`  
Expected: PASS with 1 passing test.

- [ ] **Step 5: Run UI contract check and commit**

Run: `npm run ui:contract-check`  
Expected: 0 violations.

```bash
git add tests/editorial-hero-picker.test.ts src/components/home/EditorialHero.tsx
git commit -m "feat(hero): eliminate native datepicker popup with custom luxury AvailabilityPicker"
```

---

### Task 3: Reconcile `KineticRoomAccordion.tsx` & `EditorialFooter.tsx` with Live Routes

**Files:**
- Modify: `src/components/home/KineticRoomAccordion.tsx`
- Modify: `src/components/layout/EditorialFooter.tsx`
- Verify: `npm run ui:contract-check`

- [ ] **Step 1: Check existing links in `EditorialFooter.tsx` and `KineticRoomAccordion.tsx`**

Verify that all internal anchors are replaced with active routes:
- `/rooms` for Suites & Dinh thự
- `/experiences` for Ẩm thực & Trải nghiệm
- `/offers` for Đặc quyền theo mùa
- `/my-bookings` for Tra cứu & Quản lý booking
- `/privacy` for Chính sách bảo mật
- `/terms` for Điều khoản lưu trú
- `/login` for Cổng đăng nhập nội bộ & tài khoản khách

- [ ] **Step 2: Update `EditorialFooter.tsx` to use Next.js `Link` with active routes**

Update `src/components/layout/EditorialFooter.tsx`:

```tsx
import Link from "next/link";

export function EditorialFooter() {
  return (
    <footer className="relative bg-[var(--bg-surface-deep)] text-[var(--text-secondary)] pt-32 pb-12 px-6 sm:px-12 md:px-16 overflow-hidden border-t border-[var(--brass-hairline)]">
      {/* Giant Typography Watermark Background */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 font-serif-luxury text-6xl sm:text-8xl md:text-9xl lg:text-[14rem] tracking-[0.25em] text-[var(--brass-glow)] whitespace-nowrap pointer-events-none select-none font-light opacity-60"
        aria-hidden="true"
      >
        A U R O R A
      </div>

      <div className="relative z-10 max-w-[1380px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[var(--brass-hairline)]">
          <div className="lg:col-span-5">
            <h4 className="font-serif-luxury text-3xl text-[var(--text-primary)] mb-4 tracking-wider">
              A U R O R A
            </h4>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Khu nghỉ dưỡng biệt lập vách đá bán đảo Sơn Trà. Nơi thiên nhiên nguyên sơ giao hòa cùng nghệ thuật kiến trúc tĩnh tại.
            </p>
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <div>Tọa độ: 16°07′12″B · 108°17′06″Đ</div>
              <div>Bãi Bụt, Bán đảo Sơn Trà, TP. Đà Nẵng, Việt Nam</div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] font-semibold mb-4">
              KHÁM PHÁ
            </h5>
            <ul className="space-y-3 text-xs">
              <li><Link href="/rooms" className="hover:text-[var(--text-primary)] transition-colors">Bộ sưu tập Suites & Villas</Link></li>
              <li><Link href="/experiences" className="hover:text-[var(--text-primary)] transition-colors">Ẩm thực vách đá & Trải nghiệm</Link></li>
              <li><Link href="/offers" className="hover:text-[var(--text-primary)] transition-colors">Đặc quyền lưu trú theo mùa</Link></li>
              <li><Link href="/#masterplan" className="hover:text-[var(--text-primary)] transition-colors">Sơ đồ phân khu bán đảo</Link></li>
              <li><Link href="/#manifesto" className="hover:text-[var(--text-primary)] transition-colors">Triết lý kiến trúc</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] font-semibold mb-4">
              THÔNG TIN & QUẢN LÝ
            </h5>
            <ul className="space-y-3 text-xs">
              <li><Link href="/my-bookings" className="hover:text-[var(--text-primary)] transition-colors">Tra cứu & Quản lý đặt phòng</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Chính sách bảo mật dữ liệu</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Điều khoản dịch vụ lưu trú</Link></li>
              <li><Link href="/#faq" className="hover:text-[var(--text-primary)] transition-colors">Hỏi đáp dịch vụ thường gặp</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] font-semibold mb-4">
              LIÊN HỆ QUẢN GIA
            </h5>
            <div className="text-xs space-y-2">
              <div>Hotline 24/7: +84 (0) 236 399 8888</div>
              <div>Email: concierge@aurora-resort.vn</div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block text-[11px] text-[var(--accent-brass)] hover:underline"
                >
                  Cổng đăng nhập khách hàng & nhân viên ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--text-muted)] gap-4">
          <div>© 2026 Aurora Hotel & Sanctuary. Bản quyền đã được bảo lưu.</div>
          <div className="flex items-center gap-6">
            <span>Bán Đảo Sơn Trà, Đà Nẵng</span>
            <span>·</span>
            <span>Awwwards Site of the Day Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Run UI contract check to verify no dead links or empty handlers**

Run: `npm run ui:contract-check`  
Expected: 0 violations.

- [ ] **Step 4: Commit changes**

```bash
git add src/components/home/KineticRoomAccordion.tsx src/components/layout/EditorialFooter.tsx
git commit -m "feat(footer): connect live routes for catalog, offers, legal, and portal"
```

---

### Task 4: Complete System Verification & Production Gate Testing

**Files:**
- Modify: `scripts/run-qa.cjs` (ensure testing headers, language switch, and drawer on port 3000/3003)
- Verify: Full pipeline check (`npm run check`)

- [ ] **Step 1: Run TypeScript typecheck**

Run: `npm run typecheck`  
Expected: Exit code 0 (no TypeScript errors).

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`  
Expected: Exit code 0 (0 errors, 0 warnings).

- [ ] **Step 3: Run unit and contract tests**

Run: `npm test`  
Expected: All tests pass.

- [ ] **Step 4: Run design lock verification**

Run: `npm run design:check`  
Expected: "Aurora design lock: verified"

- [ ] **Step 5: Run full production Next.js build**

Run: `npm run build`  
Expected: Successful static page generation and build completion with exit code 0.

- [ ] **Step 6: Run full composite check gate**

Run: `npm run check`  
Expected: All 6 stages pass cleanly.

- [ ] **Step 7: Final commit**

```bash
git commit --allow-empty -m "chore(release): verify all e-commerce and auth integration quality gates pass"
```
