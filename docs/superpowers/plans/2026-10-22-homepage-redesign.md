# Aurora Hotel Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Aurora Hotel homepage into a world-class architectural resort experience benchmarked against luxury icons (Aman, Six Senses, Capella, Cheval Blanc) with an 8-chapter narrative, Lenis smooth scrolling, GSAP kinetic animations, and Hallmark 58-gate anti-slop compliance.

**Architecture:** Decompose the validated visual prototype (`full-homepage-mockup.html`) into modular Next.js client and server components under `src/components/home/` and `src/components/layout/`. Integrate dual-state atmosphere theming (`dusk` / `dawn`) with photographic viewport scrim isolation, Lenis smooth scroll iframe isolation for Google Maps, zero-reflow accordion typography, and CSS Grid kinetic FAQ expansion.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.7, Tailwind CSS, Lenis 1.3, GSAP 3.12 (ScrollTrigger), Node.js test runner.

---

## File Structure & Component Boundaries

```
src/
├── app/
│   ├── globals.css                       # Atmospheric design tokens, scrim isolation rules, kinetic keyframes
│   └── page.tsx                          # Master 8-chapter homepage assembly with DB resilience
├── components/
│   ├── layout/
│   │   ├── EditorialHeader.tsx           # Awwwards micro-indexed nav, dual-state atmosphere switch, scroll-aware blur
│   │   └── EditorialFooter.tsx           # Giant typographic watermark, resort coordinates, luxury colophon
│   └── home/
│       ├── EditorialHero.tsx             # Monumental headline, multi-stop scrim, 4-col booking ribbon
│       ├── ManifestoScrub.tsx            # GSAP word-by-word scroll-driven opacity scrub
│       ├── SpatialMasterplan.tsx         # Google Maps satellite/terrain embed, pointer shield, zone switcher
│       ├── KineticRoomAccordion.tsx      # Anti-jitter GSAP flexGrow accordion suite showcase
│       ├── OceanGastronomy.tsx           # Oceanfront dining & rock cave wine cellar split section
│       ├── WellnessSanctuary.tsx         # 3-column botanical spa & holistic wellness grid
│       ├── EcoExpeditions.tsx            # Red-shanked Douc Langur spotlight & catamaran expedition
│       ├── CuratedJourneys.tsx           # Asymmetric editorial seasonal dossiers & stays ledger
│       ├── AccoladesRow.tsx              # International luxury hospitality accolades & EarthCheck
│       └── ConciergeFaq.tsx              # Zero-layout-shift CSS Grid kinetic FAQ accordion
tests/
└── unit/
    └── homepage-redesign.test.ts         # Contract verification for atmospheric tokens, navigation, and components
```

---

### Task 1: Install GSAP & Configure Atmospheric Design Tokens

**Files:**
- Modify: `package.json`
- Modify: `src/app/globals.css`
- Create: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write the failing test for atmospheric tokens and GSAP dependency**

Create `tests/unit/homepage-redesign.test.ts`:
```typescript
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Homepage Redesign - Tokens & Dependencies", () => {
  it("has gsap installed in package.json", async () => {
    const pkgJson = JSON.parse(await readFile("package.json", "utf8"));
    assert.ok(
      pkgJson.dependencies?.gsap || pkgJson.devDependencies?.gsap,
      "gsap package must be declared in package.json"
    );
  });

  it("defines atmospheric design tokens in globals.css", async () => {
    const css = await readFile("src/app/globals.css", "utf8");
    // Verify base atmospheric tokens
    assert.match(css, /--bg-surface:\s*#110e0c/i, "--bg-surface token missing or invalid");
    assert.match(css, /--bg-surface-card:\s*#1c1613/i, "--bg-surface-card token missing");
    assert.match(css, /--accent-brass:\s*#e2c799/i, "--accent-brass token missing");
    assert.match(css, /--brass-hairline:\s*rgba\(226,\s*199,\s*153/i, "--brass-hairline token missing");
    // Verify dawn theme overrides
    assert.match(css, /\[data-theme=["']dawn["']\]/, "dawn theme selector missing");
    // Verify photographic viewport scrim protection rules
    assert.match(css, /\.site-nav:not\(\.scrolled\)/, "unscrolled navbar contrast protection missing");
    assert.match(css, /overflow-x:\s*clip/, "overflow-x: clip root safety rail missing");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "gsap package must be declared in package.json"

- [ ] **Step 3: Install GSAP and add atmospheric tokens to globals.css**

Install GSAP:
```bash
npm install gsap@^3.12.5 @types/gsap@^3.0.0
```

Add atmospheric tokens and scrim rules to `src/app/globals.css` (retaining all existing base tokens to preserve `tests/design-tokens.test.ts`):
```css
/* Atmospheric Resort Tokens (SPEC-2026-10-22-HOMEPAGE-REDESIGN) */
:root {
  --bg-surface: #110e0c;
  --bg-surface-deep: #0a0807;
  --bg-surface-card: #1c1613;
  --bg-canvas: #181310;
  --bg-card: rgba(255, 255, 255, 0.055);
  --bg-card-hover: rgba(255, 255, 255, 0.095);

  --text-primary: #ffffff;
  --text-secondary: #d4cbc2;
  --text-muted: #a89c90;

  --accent-brass: #e2c799;
  --accent-brass-bright: #f5e2c4;
  --accent-brass-ink: #110e0c;
  --brass-hairline: rgba(226, 199, 153, 0.32);
  --brass-glow: rgba(226, 199, 153, 0.16);
  --hud-dot-color: #4ade80;
}

[data-theme="dawn"] {
  --bg-surface: #faf6f0;
  --bg-surface-deep: #eae0d2;
  --bg-surface-card: #f2e9dc;
  --bg-canvas: #f5ece0;
  --bg-card: rgba(26, 20, 18, 0.05);
  --bg-card-hover: rgba(26, 20, 18, 0.09);
  --text-primary: #1c1410;
  --text-secondary: #5e5147;
  --text-muted: #8c7e73;
  --accent-brass: #8e6d38;
  --accent-brass-bright: #ad8646;
  --accent-brass-ink: #ffffff;
  --brass-hairline: rgba(142, 109, 56, 0.32);
  --brass-glow: rgba(142, 109, 56, 0.12);
  --hud-dot-color: #16a34a;
}

html, body {
  overflow-x: clip;
}

/* Photographic Viewport Scrim Protection Rules */
.site-nav:not(.scrolled) .brand-title {
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}
.site-nav:not(.scrolled) .brand-caption {
  color: #e2c799;
}
.site-nav:not(.scrolled) .nav-label {
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
}
.site-nav:not(.scrolled) .nav-index {
  color: #e2c799;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
}
.site-nav:not(.scrolled) .btn-reserve-nav {
  border-color: #e2c799;
  color: #e2c799;
}
.site-nav:not(.scrolled) .theme-switch-segmented {
  background: rgba(20, 16, 14, 0.5);
  border-color: rgba(226, 199, 153, 0.35);
  backdrop-filter: blur(10px);
}
.site-nav:not(.scrolled) .theme-switch-btn {
  color: rgba(255, 255, 255, 0.78);
}
.site-nav:not(.scrolled) .theme-switch-btn.active {
  background: #e2c799;
  color: #110e0c;
}

[data-theme="dawn"] .site-nav.scrolled {
  background: rgba(250, 246, 240, 0.96);
  border-bottom: 1px solid var(--brass-hairline);
}
[data-theme="dawn"] .site-nav.scrolled .brand-title {
  color: var(--text-primary);
}
[data-theme="dawn"] .site-nav.scrolled .nav-label {
  color: var(--text-primary);
}
[data-theme="dawn"] .site-nav.scrolled .nav-index {
  color: var(--accent-brass);
}
[data-theme="dawn"] .site-nav.scrolled .theme-switch-segmented {
  background: rgba(28, 20, 16, 0.06);
  border-color: var(--brass-hairline);
}
[data-theme="dawn"] .site-nav.scrolled .theme-switch-btn {
  color: var(--text-secondary);
}
[data-theme="dawn"] .site-nav.scrolled .theme-switch-btn.active {
  background: var(--accent-brass);
  color: var(--accent-brass-ink);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && node --experimental-strip-types --test tests/design-tokens.test.ts`
Expected: PASS with 0 failures

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/app/globals.css tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): configure atmospheric tokens and install gsap"
```

---

### Task 2: Implement Editorial Header with Awwwards Nav & Dual-State Atmosphere Switcher

**Files:**
- Create: `src/components/layout/EditorialHeader.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for EditorialHeader component structure and affordance contracts**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("EditorialHeader Component", () => {
  it("exports EditorialHeader with Awwwards micro-indexes and segmented theme switcher", async () => {
    const file = await readFile("src/components/layout/EditorialHeader.tsx", "utf8");
    assert.match(file, /"use client"/, "EditorialHeader must be a client component");
    assert.match(file, /01\s*·\s*Triết lý/, "Missing 01 Triet ly micro-index");
    assert.match(file, /02\s*·\s*Phân khu/, "Missing 02 Phan khu micro-index");
    assert.match(file, /03\s*·\s*Suites & Villas/, "Missing 03 Suites micro-index");
    assert.match(file, /04\s*·\s*Ẩm thực/, "Missing 04 Am thuc micro-index");
    assert.match(file, /05\s*·\s*Trị liệu/, "Missing 05 Tri lieu micro-index");
    assert.match(file, /06\s*·\s*Đặc quyền/, "Missing 06 Dac quyen micro-index");
    assert.match(file, /theme-switch-segmented/, "Segmented theme switcher container missing");
    assert.match(file, /Tối/, "Dusk 'Tối' label missing");
    assert.match(file, /Sáng/, "Dawn 'Sáng' label missing");
    assert.doesNotMatch(file, /href="#"/, "Dead link violation (href='#') forbidden");
    assert.doesNotMatch(file, /onClick=\{\(\)\s*=>\s*\{\}\}/, "Empty onClick handler forbidden");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "ENOENT: no such file or directory, open 'src/components/layout/EditorialHeader.tsx'"

- [ ] **Step 3: Implement EditorialHeader component**

Create `src/components/layout/EditorialHeader.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function EditorialHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<"dusk" | "dawn">("dusk");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Check document or local storage for initial theme
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

  return (
    <header className={`site-nav ${isScrolled ? "scrolled" : ""}`} id="main-nav">
      <Link href="/" className="brand-mark">
        <span className="brand-title">A U R O R A</span>
        <span className="brand-caption">Đà Nẵng · Resort & Reserve</span>
      </Link>

      <nav aria-label="Điều hướng chính" className="hidden lg:block">
        <ul className="nav-links">
          <li>
            <a href="#manifesto">
              <span className="nav-index">01</span>
              <span className="nav-label">Triết lý</span>
            </a>
          </li>
          <li>
            <a href="#masterplan">
              <span className="nav-index">02</span>
              <span className="nav-label">Phân khu</span>
            </a>
          </li>
          <li>
            <a href="#suites">
              <span className="nav-index">03</span>
              <span className="nav-label">Suites & Villas</span>
            </a>
          </li>
          <li>
            <a href="#gastronomy">
              <span className="nav-index">04</span>
              <span className="nav-label">Ẩm thực</span>
            </a>
          </li>
          <li>
            <a href="#wellness">
              <span className="nav-index">05</span>
              <span className="nav-label">Trị liệu</span>
            </a>
          </li>
          <li>
            <a href="#packages">
              <span className="nav-index">06</span>
              <span className="nav-label">Đặc quyền</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="nav-actions">
        <div className="theme-switch-segmented" role="group" aria-label="Chuyển chế độ giao diện">
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

        <a href="#suites" className="btn-reserve-nav">
          Đặt kỳ nghỉ
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && npm run ui:contract-check`
Expected: PASS with 0 violations

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/EditorialHeader.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): add EditorialHeader with Awwwards nav and segmented theme switcher"
```

---

### Task 3: Implement Editorial Hero with Parallax & Booking Ribbon

**Files:**
- Create: `src/components/home/EditorialHero.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for EditorialHero component**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("EditorialHero Component", () => {
  it("renders pure editorial headline and 4-column booking ribbon without inline pill breaks", async () => {
    const file = await readFile("src/components/home/EditorialHero.tsx", "utf8");
    assert.match(file, /KHU NGHỈ DƯỠNG BIỆT LẬP · BÁN ĐẢO SƠN TRÀ, ĐÀ NẴNG/);
    assert.match(file, /Thành phố ở gần\./);
    assert.match(file, /Kỳ nghỉ ở rất xa\./);
    assert.match(file, /booking-ribbon-bar/, "Booking ribbon container missing");
    assert.match(file, /NHẬN PHÒNG/);
    assert.match(file, /TRẢ PHÒNG/);
    assert.match(file, /SỐ KHÁCH/);
    assert.doesNotMatch(file, /pill-badge/, "Inline pill badges forbidden per editorial standard");
    assert.doesNotMatch(file, /href="#"/, "Dead link violation forbidden");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "no such file or directory, open 'src/components/home/EditorialHero.tsx'"

- [ ] **Step 3: Implement EditorialHero component**

Create `src/components/home/EditorialHero.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function EditorialHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !bgRef.current || !heroRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const tween = gsap.to(bgRef.current, {
      y: "22%",
      scale: 1.0,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === heroRef.current) trigger.kill();
      });
    };
  }, []);

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

        {/* 4-Column Hairline Booking Ribbon Bar */}
        <div className="booking-ribbon-bar bg-[rgba(20,16,14,0.72)] backdrop-blur-xl border border-[rgba(226,199,153,0.32)] rounded-lg p-4 sm:p-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="lg:border-r border-[rgba(226,199,153,0.2)] pr-4">
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[#e2c799] font-medium mb-1">
                NHẬN PHÒNG
              </label>
              <input
                type="date"
                defaultValue="2026-10-25"
                className="w-full bg-transparent text-white font-serif-luxury text-lg border-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="lg:border-r border-[rgba(226,199,153,0.2)] pr-4 sm:pl-2">
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[#e2c799] font-medium mb-1">
                TRẢ PHÒNG
              </label>
              <input
                type="date"
                defaultValue="2026-10-28"
                className="w-full bg-transparent text-white font-serif-luxury text-lg border-none focus:outline-none cursor-pointer"
              />
            </div>

            <div className="lg:border-r border-[rgba(226,199,153,0.2)] pr-4 sm:pl-2">
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[#e2c799] font-medium mb-1">
                SỐ KHÁCH
              </label>
              <select
                defaultValue="2"
                className="w-full bg-transparent text-white font-serif-luxury text-lg border-none focus:outline-none cursor-pointer [&>option]:text-black"
              >
                <option value="1">1 Khách · 1 Phòng</option>
                <option value="2">2 Khách · 1 Phòng</option>
                <option value="3">3 Khách · 1 Phòng</option>
                <option value="4">4 Khách · 2 Phòng</option>
              </select>
            </div>

            <div className="sm:pl-2 flex items-center">
              <a
                href="#suites"
                className="w-full inline-flex items-center justify-center py-3 px-6 bg-[#e2c799] hover:bg-[#f5e2c4] text-[#110e0c] font-semibold text-xs tracking-[0.16em] uppercase rounded transition-colors shadow-lg"
              >
                Tìm phòng trống →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && npm run ui:contract-check`
Expected: PASS with 0 violations

- [ ] **Step 5: Commit**

```bash
git add src/components/home/EditorialHero.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): add EditorialHero with parallax and 4-column booking ribbon"
```

---

### Task 4: Implement Manifesto Word-by-Word Scroll Scrub

**Files:**
- Create: `src/components/home/ManifestoScrub.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for ManifestoScrub component**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("ManifestoScrub Component", () => {
  it("renders architectural manifesto and Sơn Trà conservation narrative", async () => {
    const file = await readFile("src/components/home/ManifestoScrub.tsx", "utf8");
    assert.match(file, /TRIẾT LÝ KIẾN TRÚC & NGHỈ DƯỠNG TĨNH TẠI/);
    assert.match(file, /SƠN TRÀ PENINSULA · KHU BẢO TỒN TỰ NHIÊN NGUYÊN SINH/);
    assert.match(file, /Chúng tôi không đơn thuần xây dựng một khách sạn nghỉ dưỡng/);
    assert.match(file, /id=["']manifesto["']/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "no such file or directory, open 'src/components/home/ManifestoScrub.tsx'"

- [ ] **Step 3: Implement ManifestoScrub component**

Create `src/components/home/ManifestoScrub.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MANIFESTO_TEXT =
  "Chúng tôi không đơn thuần xây dựng một khách sạn nghỉ dưỡng. Chúng tôi kiến tạo nơi trú ẩn của tâm hồn giữa vách đá sa thạch và bờ vịnh hoang sơ. Nơi mỗi căn phòng mở toang đón gió đại dương, và thời gian trôi đi theo nhịp thở êm đềm của từng con sóng vỗ bờ.";

export function ManifestoScrub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !textRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const words = textRef.current.querySelectorAll(".manifesto-word");
    const triggers: ScrollTrigger[] = [];

    words.forEach((word) => {
      const st = ScrollTrigger.create({
        trigger: word,
        start: "top 75%",
        onEnter: () => word.classList.add("text-opacity-100", "!text-white"),
        onLeaveBack: () => word.classList.remove("text-opacity-100", "!text-white"),
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, []);

  const words = MANIFESTO_TEXT.split(/\s+/);

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] transition-colors duration-500" id="manifesto" ref={containerRef}>
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] tracking-[0.24em] uppercase text-[var(--accent-brass)] border-b border-[var(--brass-hairline)] pb-6 mb-16 gap-2">
          <span>TRIẾT LÝ KIẾN TRÚC & NGHỈ DƯỠNG TĨNH TẠI</span>
          <span>SƠN TRÀ PENINSULA · KHU BẢO TỒN TỰ NHIÊN NGUYÊN SINH</span>
        </div>

        <p
          ref={textRef}
          className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] font-light leading-[1.35] tracking-wide"
        >
          {words.map((word, index) => (
            <span
              key={index}
              className="manifesto-word inline-block mr-[0.28em] text-[var(--text-primary)] opacity-25 transition-opacity duration-300"
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ManifestoScrub.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): add ManifestoScrub component with word-by-word scroll scrub"
```

---

### Task 5: Implement Spatial Masterplan with Google Maps Lenis Isolation

**Files:**
- Create: `src/components/home/SpatialMasterplan.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for SpatialMasterplan and Lenis conflict prevention**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("SpatialMasterplan Component", () => {
  it("implements Google Maps embed with pointer shield and data-lenis-prevent attribute", async () => {
    const file = await readFile("src/components/home/SpatialMasterplan.tsx", "utf8");
    assert.match(file, /data-lenis-prevent/, "data-lenis-prevent attribute required for iframe container");
    assert.match(file, /map-pointer-shield/, "Pointer shield required to prevent Lenis scroll trap");
    assert.match(file, /16\.1200,\s*108\.2850/, "Hotspot 01 Cliffside coordinates missing");
    assert.match(file, /16\.1020,\s*108\.2630/, "Hotspot 02 Beachfront coordinates missing");
    assert.match(file, /16\.1080,\s*108\.2700/, "Hotspot 03 Spa coordinates missing");
    assert.match(file, /16\.0965,\s*108\.2540/, "Hotspot 04 Marina coordinates missing");
    assert.doesNotMatch(file, /href="#"/, "Dead link violation forbidden");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "no such file or directory, open 'src/components/home/SpatialMasterplan.tsx'"

- [ ] **Step 3: Implement SpatialMasterplan component**

Create `src/components/home/SpatialMasterplan.tsx`:
```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface ZoneData {
  tag: string;
  title: string;
  desc: string;
  area: string;
  perk: string;
  lat: number;
  lng: number;
  zoom: number;
  img: string;
}

const MASTERPLAN_ZONES: ZoneData[] = [
  {
    tag: "PHÂN KHU ĐỘ CAO 45M · VÁCH ĐÁ HOÀNG HÔN",
    title: "Cliffside Sanctuary Reserve",
    desc: "Tọa lạc trên đỉnh mỏm sa thạch đón gió biển lộng lẫy, bao trọn 270° tầm nhìn hoàng hôn vịnh Đà Nẵng với hồ bơi vô cực tràn vách đá.",
    area: "220 m²",
    perk: "Hải trình riêng & Quản gia",
    lat: 16.12,
    lng: 108.285,
    zoom: 15,
    img: "/images/epilogue-resort.png",
  },
  {
    tag: "BỜ BIỂN RIÊNG TƯ · CÁCH MẶT NƯỚC 15M",
    title: "Presidential Beachfront Villa",
    desc: "Hồ bơi riêng dài 16m ngay trước bậc thềm cát trắng mịn, bao quanh bởi rặng dừa và tiếng sóng vỗ bờ êm dịu suốt ngày đêm.",
    area: "180 m²",
    perk: "Đầu bếp riêng & Bãi biển riêng",
    lat: 16.102,
    lng: 108.263,
    zoom: 16,
    img: "/images/aurora/presidential-villa.jpg",
  },
  {
    tag: "THUNG LŨNG THẢO MỘC NGUYÊN SINH",
    title: "Spa Mộc & Suối Khoáng Nhiệt Đới",
    desc: "Các gian nhà trị liệu mái lá biệt lập giữa thảm thực vật Sơn Trà cổ thụ, mang đến không gian tĩnh lặng tuyệt đối cho việc hồi phục thân tâm.",
    area: "1.200 m²",
    perk: "Vườn dược liệu & Yoga Pavilion",
    lat: 16.108,
    lng: 108.27,
    zoom: 16,
    img: "/images/aurora/deluxe-king.jpg",
  },
  {
    tag: "VỊNH BIỂN HOANG SƠ BẢO TỒN",
    title: "Bến Du Thuyền Aurora Marina",
    desc: "Bến neo đậu riêng biệt phục vụ hải trình khám phá rạn san hô Bãi Bụt và các chuyến du ngoạn ngắm hoàng hôn vịnh Đà Nẵng.",
    area: "Vịnh riêng",
    perk: "Đội du thuyền Catamaran riêng",
    lat: 16.0965,
    lng: 108.254,
    zoom: 15,
    img: "/images/hero-hotel.png",
  },
];

export function SpatialMasterplan() {
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);
  const [mapMode, setMapMode] = useState<"k" | "m">("k"); // 'k' = satellite, 'm' = standard map
  const [isInteractive, setIsInteractive] = useState(false);

  const activeZone = MASTERPLAN_ZONES[activeZoneIndex];

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="masterplan">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">SƠ ĐỒ ĐỊA THẾ & KHÔNG GIAN BÁN ĐẢO</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4">
          Kiến trúc hòa mình cùng tự nhiên nguyên bản
        </h2>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-2xl mb-12">
          Bấm vào từng phân khu trên sơ đồ địa thế Sơn Trà để khám phá các không gian biệt lập của Aurora Sanctuary.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Google Maps Explorer */}
          <div className="lg:col-span-8 bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg overflow-hidden shadow-xl">
            {/* Map Header Bar */}
            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-b border-[var(--brass-hairline)] bg-[var(--bg-card)] text-xs text-[var(--text-secondary)] gap-2">
              <div className="flex items-center gap-2 font-medium tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[var(--hud-dot-color)] animate-pulse" />
                <span>GOOGLE MAPS · BÁN ĐẢO SƠN TRÀ, ĐÀ NẴNG</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMapMode("k")}
                  className={`px-3 py-1 rounded text-[11px] uppercase tracking-wider transition-colors ${
                    mapMode === "k"
                      ? "bg-[var(--accent-brass)] text-[var(--accent-brass-ink)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Vệ tinh
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode("m")}
                  className={`px-3 py-1 rounded text-[11px] uppercase tracking-wider transition-colors ${
                    mapMode === "m"
                      ? "bg-[var(--accent-brass)] text-[var(--accent-brass-ink)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Bản đồ
                </button>
                <a
                  href="https://www.google.com/maps/place/B%C3%A1n+%C4%91%E1%BA%A3o+S%C6%A1n+Tr%C3%A0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-brass)] hover:underline ml-2 text-[11px]"
                >
                  Mở tab mới ↗
                </a>
              </div>
            </div>

            {/* Zone Selector Pills Bar */}
            <div className="flex overflow-x-auto gap-2 p-3 bg-[var(--bg-surface-card)] border-b border-[var(--brass-hairline)]">
              {MASTERPLAN_ZONES.map((zone, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveZoneIndex(idx)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs tracking-wider transition-all ${
                    activeZoneIndex === idx
                      ? "bg-[var(--accent-brass)] text-[var(--accent-brass-ink)] font-semibold shadow-md"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  {`0${idx + 1} · ${zone.title.split(" ")[0]} ${zone.title.split(" ")[1] || ""}`}
                </button>
              ))}
            </div>

            {/* Iframe Container with Pointer Shield */}
            <div
              className="relative w-full h-[460px] bg-[#0a0807]"
              data-lenis-prevent
              onMouseLeave={() => setIsInteractive(false)}
            >
              <iframe
                title="Google Maps Bán đảo Sơn Trà"
                src={`https://maps.google.com/maps?q=${activeZone.lat},${activeZone.lng}&t=${mapMode}&z=${activeZone.zoom}&ie=UTF8&iwloc=&output=embed`}
                className={`w-full h-full border-none ${isInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
                loading="lazy"
                allowFullScreen
                data-lenis-prevent
              />

              {/* Pointer Shield for Lenis Scroll Safety */}
              {!isInteractive && (
                <div
                  className="map-pointer-shield absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer backdrop-blur-[1px] hover:bg-black/10 transition-colors"
                  onClick={() => setIsInteractive(true)}
                  title="Nhấp để tương tác bản đồ vệ tinh"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setIsInteractive(true);
                  }}
                >
                  <div className="px-5 py-2.5 rounded-full bg-[rgba(20,16,14,0.85)] border border-[var(--accent-brass)] text-[var(--accent-brass)] text-xs tracking-widest uppercase flex items-center gap-2 shadow-2xl">
                    <span>✥</span>
                    <span>Nhấp để tương tác bản đồ vệ tinh</span>
                  </div>
                </div>
              )}

              {isInteractive && (
                <button
                  type="button"
                  onClick={() => setIsInteractive(false)}
                  className="absolute top-4 right-4 px-4 py-2 bg-[rgba(20,16,14,0.85)] text-white text-xs border border-[var(--brass-hairline)] rounded hover:border-[var(--accent-brass)] transition-colors shadow-lg z-20"
                >
                  ✕ Khóa bản đồ để cuộn trang
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Zone Card */}
          <div className="lg:col-span-4 bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="relative w-full h-48 rounded-md overflow-hidden mb-6 border border-[var(--brass-hairline)]">
                <Image
                  src={activeZone.img}
                  alt={activeZone.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] mb-2">
                {activeZone.tag}
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[var(--text-primary)] mb-3">
                {activeZone.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                {activeZone.desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--brass-hairline)] tabular-nums">
              <div>
                <span className="block text-[9px] tracking-wider uppercase text-[var(--accent-brass)] mb-1">
                  Diện tích
                </span>
                <strong className="font-serif-luxury text-xl text-[var(--text-primary)]">
                  {activeZone.area}
                </strong>
              </div>
              <div>
                <span className="block text-[9px] tracking-wider uppercase text-[var(--accent-brass)] mb-1">
                  Đặc quyền
                </span>
                <strong className="font-serif-luxury text-lg text-[var(--text-primary)]">
                  {activeZone.perk}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && npm run ui:contract-check`
Expected: PASS with 0 violations

- [ ] **Step 5: Commit**

```bash
git add src/components/home/SpatialMasterplan.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): add SpatialMasterplan with Google Maps Lenis scroll isolation"
```

---

### Task 6: Implement Kinetic Accordion Suites Showcase with Anti-Jitter Typography

**Files:**
- Create: `src/components/home/KineticRoomAccordion.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for KineticRoomAccordion component**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("KineticRoomAccordion Component", () => {
  it("implements anti-jitter typography with locked 540px width and eliminates quick-selector pills", async () => {
    const file = await readFile("src/components/home/KineticRoomAccordion.tsx", "utf8");
    assert.match(file, /id=["']suites["']/);
    assert.match(file, /Deluxe King Oceanfront/);
    assert.match(file, /Executive Ocean Suite/);
    assert.match(file, /Presidential Cliffside Villa/);
    assert.match(file, /Grand Reserve Penthouse/);
    assert.match(file, /w-\[540px\]|max-w-\[calc\(100%-40px\)\]|width:\s*540px/, "Typography container constraint missing");
    assert.doesNotMatch(file, /room-selector-pills/, "Quick selector pills must be removed");
    assert.doesNotMatch(file, /href="#"/, "Dead link violation forbidden");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "no such file or directory, open 'src/components/home/KineticRoomAccordion.tsx'"

- [ ] **Step 3: Implement KineticRoomAccordion component**

Create `src/components/home/KineticRoomAccordion.tsx`:
```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface RoomData {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  desc: string;
  area: string;
  capacity: string;
  view: string;
  price: string;
  slug: string;
  image: string;
}

const ROOMS_DATA: RoomData[] = [
  {
    id: "01",
    name: "Deluxe King Oceanfront",
    subtitle: "01 · DELUXE KING ROOM",
    tag: "HẠNG PHÒNG TIÊU CHUẨN THƯỢNG LƯU",
    desc: "Ban công riêng biệt lộng gió hướng trọn vẹn bờ cát trắng, phòng tắm ốp đá cẩm thạch Ý sang trọng và giường King ngoại cỡ êm ái.",
    area: "35 m²",
    capacity: "2 Khách",
    view: "180° Vịnh Biển",
    price: "2.500.000 ₫",
    slug: "deluxe-king",
    image: "/images/aurora/deluxe-king.jpg",
  },
  {
    id: "02",
    name: "Executive Ocean Suite",
    subtitle: "02 · EXECUTIVE SUITE",
    tag: "BỘ SƯU TẬP SUITE BIỆT LẬP",
    desc: "Phòng khách độc lập tách biệt phòng ngủ, bồn tắm ngâm thảo mộc hướng biển và đặc quyền thưởng thức trà chiều tại Executive Lounge.",
    area: "65 m²",
    capacity: "3 Khách",
    view: "Hoàng Hôn Vịnh Biển",
    price: "4.500.000 ₫",
    slug: "executive-suite",
    image: "/images/aurora/executive-suite.jpg",
  },
  {
    id: "03",
    name: "Presidential Cliffside Villa",
    subtitle: "03 · PRESIDENTIAL VILLA",
    tag: "DINH THỰ ĐỈNH CAO BÁN ĐẢO",
    desc: "Hồ bơi vô cực riêng biệt dài 12m tràn vách đá sa thạch, dịch vụ quản gia 24/7 và bàn tiệc nướng hải sản ngoài trời chuẩn Michelin.",
    area: "120 m²",
    capacity: "4 Khách",
    view: "Panorama 270° Đại Dương",
    price: "12.000.000 ₫",
    slug: "presidential-suite",
    image: "/images/aurora/presidential-villa.jpg",
  },
  {
    id: "04",
    name: "Grand Reserve Penthouse",
    subtitle: "04 · RESERVE PENTHOUSE",
    tag: "TUYỆT TÁC KHÔNG GIAN BẦU TRỜI",
    desc: "Toàn bộ tầng áp mái với thang máy riêng biệt, quầy bar cocktail cá nhân hóa và góc nhìn bao quát toàn bộ thành phố Đà Nẵng về đêm.",
    area: "210 m²",
    capacity: "6 Khách",
    view: "Toàn Cảnh Bán Đảo & Vịnh",
    price: "22.000.000 ₫",
    slug: "reserve-penthouse",
    image: "/images/hero-hotel.png",
  },
];

export function KineticRoomAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="suites">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">BỘ SƯU TẬP SUITES & VILLAS</div>
        <div className="mb-12">
          <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-3">
            Kiến trúc mở hướng thẳng đại dương
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl">
            Chạm hoặc di chuột qua từng gian phòng để chiêm ngưỡng không gian nghỉ dưỡng biệt lập và thông số kiến trúc độc bản.
          </p>
        </div>

        {/* 4-Panel Kinetic Accordion Container */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[640px] w-full">
          {ROOMS_DATA.map((room, idx) => {
            const isActive = activeIndex === idx;

            return (
              <div
                key={room.id}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => {
                  if (typeof window !== "undefined" && window.innerWidth > 1024) {
                    setActiveIndex(idx);
                  }
                }}
                className={`relative rounded-lg overflow-hidden cursor-pointer bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] shadow-2xl transition-[flex-grow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] min-h-[380px] lg:min-h-0 ${
                  isActive ? "lg:flex-[3.5]" : "lg:flex-[1]"
                }`}
                style={{ willChange: "flex-grow" }}
              >
                {/* Background Image */}
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className={`object-cover transition-transform duration-1000 ease-out ${
                    isActive ? "scale-105 brightness-90" : "scale-100 brightness-60 hover:brightness-75"
                  }`}
                />

                {/* Dark Bottom Scrim Protection */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,16,14,0.95)] via-[rgba(20,16,14,0.4)] to-[rgba(20,16,14,0.1)] pointer-events-none" />

                {/* Collapsed Rotated Label (Desktop only) */}
                <div
                  className={`hidden lg:block absolute bottom-9 left-7 font-serif-luxury text-xl tracking-[0.14em] text-white whitespace-nowrap pointer-events-none drop-shadow-lg transition-opacity duration-300 [writing-mode:vertical-rl] rotate-180 ${
                    isActive ? "opacity-0" : "opacity-90"
                  }`}
                >
                  {room.subtitle}
                </div>

                {/* Anti-Jitter Typography Container Locked to Fixed 540px Width */}
                <div
                  className={`absolute bottom-0 left-0 w-[540px] max-w-[calc(100%-40px)] p-6 sm:p-10 transition-all duration-500 ease-out ${
                    isActive
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-6 pointer-events-none lg:block hidden"
                  }`}
                >
                  <div className="text-[10px] tracking-[0.18em] text-[#e2c799] uppercase mb-1.5 drop-shadow">
                    {room.tag}
                  </div>
                  <h3 className="font-serif-luxury text-2xl sm:text-4xl text-white font-medium mb-3 whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-md">
                    {room.name}
                  </h3>
                  <p className="text-[#d4cbc2] text-sm leading-relaxed mb-6 max-w-[480px] drop-shadow">
                    {room.desc}
                  </p>

                  <div className="flex flex-wrap gap-4 sm:gap-6 py-4 border-t border-[rgba(226,199,153,0.3)] mb-6 tabular-nums">
                    <div>
                      <small className="block text-[9px] uppercase tracking-wider text-[#e2c799]">Diện tích</small>
                      <strong className="font-serif-luxury text-lg text-white">{room.area}</strong>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase tracking-wider text-[#e2c799]">Sức chứa</small>
                      <strong className="font-serif-luxury text-lg text-white">{room.capacity}</strong>
                    </div>
                    <div>
                      <small className="block text-[9px] uppercase tracking-wider text-[#e2c799]">Tầm nhìn</small>
                      <strong className="font-serif-luxury text-lg text-white">{room.view}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#e2c799]">Giá khởi điểm</span>
                      <strong className="font-serif-luxury text-2xl sm:text-3xl text-white">{room.price}</strong>
                      <span className="text-xs text-[#d4cbc2]"> / đêm</span>
                    </div>
                    <Link
                      href={`/rooms/${room.slug}`}
                      className="px-5 py-2.5 bg-[#e2c799] hover:bg-[#f5e2c4] text-[#110e0c] font-semibold text-xs tracking-wider uppercase rounded transition-colors shadow-lg"
                    >
                      Đặt phòng này →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && npm run ui:contract-check`
Expected: PASS with 0 violations

- [ ] **Step 5: Commit**

```bash
git add src/components/home/KineticRoomAccordion.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): add KineticRoomAccordion with anti-jitter typography"
```

---

### Task 7: Implement Ocean Gastronomy, Wellness, and Eco-Expeditions

**Files:**
- Create: `src/components/home/OceanGastronomy.tsx`
- Create: `src/components/home/WellnessSanctuary.tsx`
- Create: `src/components/home/EcoExpeditions.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for Chapters 5, 6, and 7**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("Gastronomy, Wellness & Expeditions Components", () => {
  it("renders OceanGastronomy, WellnessSanctuary, and EcoExpeditions without dead controls", async () => {
    const gastro = await readFile("src/components/home/OceanGastronomy.tsx", "utf8");
    assert.match(gastro, /ẨM THỰC BẢN ĐỊA & HẦM RƯỢU TỰ NHIÊN/);
    assert.match(gastro, /Nhà hàng Vách Đá Sa Thạch/);
    assert.doesNotMatch(gastro, /href="#"/);

    const wellness = await readFile("src/components/home/WellnessSanctuary.tsx", "utf8");
    assert.match(wellness, /LIỆU TRÌNH PHỤC HỒI THÂN TÂM/);
    assert.match(wellness, /Spa Mộc giữa Rừng Nguyên Sinh/);
    assert.doesNotMatch(wellness, /href="#"/);

    const expeditions = await readFile("src/components/home/EcoExpeditions.tsx", "utf8");
    assert.match(expeditions, /HẢI TRÌNH & BẢO TỒN THIÊN NHIÊN/);
    assert.match(expeditions, /Voọc Chà Vá Chân Nâu/);
    assert.doesNotMatch(expeditions, /href="#"/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "no such file or directory, open 'src/components/home/OceanGastronomy.tsx'"

- [ ] **Step 3: Implement OceanGastronomy, WellnessSanctuary, and EcoExpeditions**

Create `src/components/home/OceanGastronomy.tsx`:
```tsx
import Image from "next/image";

export function OceanGastronomy() {
  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] transition-colors duration-500" id="gastronomy">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">ẨM THỰC BẢN ĐỊA & HẦM RƯỢU TỰ NHIÊN</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-12">
          Hương vị tinh hoa biển miền Trung
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[480px] rounded-lg overflow-hidden border border-[var(--brass-hairline)] shadow-2xl">
            <Image
              src="/images/aurora/executive-suite.jpg"
              alt="Nhà hàng Vách Đá Sa Thạch"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent-brass)] mb-2 font-medium">
              ẨM THỰC TỪ TRANG TRẠI ĐẾN BÀN ĂN
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[var(--text-primary)] mb-6">
              Nhà hàng Vách Đá Sa Thạch
            </h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-6">
              Nguyên liệu tươi ngon đánh bắt trong ngày từ ngư dân Sơn Trà, kết hợp cùng các loại thảo mộc rừng bản địa và kỹ thuật chế biến đương đại của bếp trưởng quốc tế.
            </p>
            <ul className="space-y-4 border-t border-[var(--brass-hairline)] pt-6 text-sm text-[var(--text-primary)] mb-8">
              <li className="flex items-center gap-3">
                <span className="text-[var(--accent-brass)]">—</span>
                <span>Bò Wagyu ủ khô trên than củi gỗ đước tự nhiên</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[var(--accent-brass)]">—</span>
                <span>Hải sản vịnh Đà Nẵng hấp sả chanh và lá giang Sơn Trà</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[var(--accent-brass)]">—</span>
                <span>Hầm rượu vách đá tự nhiên lưu trữ hơn 450 nhãn rượu vang danh tiếng thế giới</span>
              </li>
            </ul>

            <a
              href="#suites"
              className="inline-flex items-center gap-3 text-xs tracking-[0.16em] uppercase text-[var(--accent-brass)] hover:text-[var(--accent-brass-bright)] font-semibold"
            >
              Đặt bàn bữa tối ngắm hoàng hôn <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/home/WellnessSanctuary.tsx`:
```tsx
import Image from "next/image";

export function WellnessSanctuary() {
  const TREATMENTS = [
    {
      title: "Massage Đá Nóng & Tinh Dầu Tràm Gió",
      time: "90 Phút · Liệu trình thư giãn sâu",
      desc: "Sử dụng đá núi lửa hấp nóng kết hợp tinh dầu tràm gió Sơn Trà giúp giải tỏa căng thẳng cơ bắp và phục hồi năng lượng tinh thần.",
      img: "/images/aurora/deluxe-king.jpg",
    },
    {
      title: "Yoga Đón Bình Minh Trên Vách Đá",
      time: "06:00 Sáng · Lớp học buổi sáng",
      desc: "Thực hành hít thở pranayama và chuỗi động tác chào mặt trời giữa không gian mở lộng gió trên đỉnh vách đá hướng ra vịnh biển.",
      img: "/images/hero-hotel.png",
    },
    {
      title: "Thủy Liệu Pháp Thảo Mộc Rừng",
      time: "60 Phút · Tắm bồn gỗ tuyết tùng",
      desc: "Ngâm mình trong bồn gỗ thơm ngát lá thảo dược rừng thu hái thủ công, giúp thải độc toàn diện và lưu thông khí huyết.",
      img: "/images/epilogue-resort.png",
    },
  ];

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="wellness">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">LIỆU TRÌNH PHỤC HỒI THÂN TÂM</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4">
          Spa Mộc giữa Rừng Nguyên Sinh
        </h2>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl mb-12">
          Các gian trị liệu biệt lập được thiết kế tôn trọng địa hình tự nhiên, mang lại sự yên bình tuyệt đối cho hành trình chăm sóc sức khỏe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TREATMENTS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg overflow-hidden shadow-xl hover:border-[var(--accent-brass)] transition-colors"
            >
              <div className="relative h-56 w-full">
                <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <div className="text-[10px] tracking-wider uppercase text-[var(--accent-brass)] mb-2">{item.time}</div>
                <h3 className="font-serif-luxury text-2xl text-[var(--text-primary)] mb-3">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">{item.desc}</p>
                <a
                  href="#suites"
                  className="text-xs uppercase tracking-wider text-[var(--accent-brass)] hover:underline inline-block font-medium"
                >
                  Tư vấn liệu trình ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/home/EcoExpeditions.tsx`:
```tsx
import Image from "next/image";

export function EcoExpeditions() {
  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] transition-colors duration-500" id="expeditions">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">HẢI TRÌNH & BẢO TỒN THIÊN NHIÊN</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-12">
          Khám phá hệ sinh thái di sản Sơn Trà
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent-brass)] mb-2 font-medium block">
              DI SẢN THIÊN NHIÊN QUỐC GIA
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[var(--text-primary)] mb-6">
              Voọc Chà Vá Chân Nâu — Nữ hoàng linh trưởng
            </h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-6">
              Bán đảo Sơn Trà là ngôi nhà tự nhiên lớn nhất của loài linh trưởng quý hiếm bậc nhất thế giới. Cùng chuyên gia sinh thái của resort tham gia tour đi bộ tĩnh lặng trong rừng nguyên sinh vào lúc sáng sớm.
            </p>
            <div className="space-y-4 border-t border-[var(--brass-hairline)] pt-6 text-sm text-[var(--text-primary)] mb-8">
              <div className="flex items-start gap-3">
                <span className="text-[var(--accent-brass)]">✦</span>
                <div>
                  <strong>Hải trình Catamaran riêng ngắm hoàng hôn vịnh:</strong> Du ngoạn quanh bán đảo, lặn ngắm san hô Bãi Bụt và thưởng thức cocktail chiều.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--accent-brass)]">✦</span>
                <div>
                  <strong>Cam kết bảo tồn & Du lịch tái tạo:</strong> Trích 5% doanh thu mỗi đêm lưu trú để đóng góp trực tiếp vào quỹ bảo tồn sinh cảnh Sơn Trà.
                </div>
              </div>
            </div>

            <a
              href="#suites"
              className="inline-flex items-center gap-3 text-xs tracking-[0.16em] uppercase text-[var(--accent-brass)] hover:text-[var(--accent-brass-bright)] font-semibold"
            >
              Tìm hiểu lịch trình thám hiểm <span>→</span>
            </a>
          </div>

          <div className="relative h-[480px] rounded-lg overflow-hidden border border-[var(--brass-hairline)] shadow-2xl">
            <Image
              src="/images/epilogue-resort.png"
              alt="Hệ sinh thái bán đảo Sơn Trà"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && npm run ui:contract-check`
Expected: PASS with 0 violations

- [ ] **Step 5: Commit**

```bash
git add src/components/home/OceanGastronomy.tsx src/components/home/WellnessSanctuary.tsx src/components/home/EcoExpeditions.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): add OceanGastronomy, WellnessSanctuary, and EcoExpeditions components"
```

---

### Task 8: Implement Curated Journeys, Accolades, Kinetic FAQ & Watermark Colophon

**Files:**
- Create: `src/components/home/CuratedJourneys.tsx`
- Create: `src/components/home/AccoladesRow.tsx`
- Create: `src/components/home/ConciergeFaq.tsx`
- Create: `src/components/layout/EditorialFooter.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for CuratedJourneys, AccoladesRow, ConciergeFaq, and EditorialFooter**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("CuratedJourneys, FAQ & Footer Components", () => {
  it("implements zero-layout-shift FAQ accordion and watermark footer", async () => {
    const journeys = await readFile("src/components/home/CuratedJourneys.tsx", "utf8");
    assert.match(journeys, /id=["']packages["']/);
    assert.match(journeys, /Hành Trình Tĩnh Tại Sơn Trà & Dạ Tiệc Bờ Sóng/);
    assert.doesNotMatch(journeys, /href="#"/);

    const faq = await readFile("src/components/home/ConciergeFaq.tsx", "utf8");
    assert.match(faq, /"use client"/);
    assert.match(faq, /grid-template-rows:\s*0fr|grid-template-rows:\s*1fr/, "Grid fraction height animation required");
    assert.match(faq, /faq-icon/, "Rotating icon element required");
    assert.doesNotMatch(faq, /href="#"/);

    const footer = await readFile("src/components/layout/EditorialFooter.tsx", "utf8");
    assert.match(footer, /A U R O R A/, "Giant watermark colophon wordmark required");
    assert.match(footer, /Bãi Bụt, Bán đảo Sơn Trà, TP\. Đà Nẵng/);
    assert.doesNotMatch(footer, /href="#"/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "no such file or directory, open 'src/components/home/CuratedJourneys.tsx'"

- [ ] **Step 3: Implement CuratedJourneys, AccoladesRow, ConciergeFaq, and EditorialFooter**

Create `src/components/home/CuratedJourneys.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";

export function CuratedJourneys() {
  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="packages">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">HÀNH TRÌNH ĐẶC BIỆT THEO MÙA</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4">
          Những kỳ nghỉ thiết kế riêng
        </h2>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl mb-12">
          Các gói trải nghiệm trọn gói kết hợp lưu trú thượng lưu, ẩm thực tinh hoa và các hoạt động khám phá bản địa.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Signature 4D3N Journey */}
          <div className="lg:col-span-7 bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="relative h-72 sm:h-80 w-full">
              <Image
                src="/images/aurora/presidential-villa.jpg"
                alt="Signature Journey"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface-card)] via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] mb-2 block font-medium">
                  GÓI NGHỈ DƯỠNG TRỌN GÓI 4 NGÀY 3 ĐÊM
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[var(--text-primary)] mb-4">
                  Hành Trình Tĩnh Tại Sơn Trà & Dạ Tiệc Bờ Sóng
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                  Nghỉ dưỡng tại Biệt thự Biển riêng, hải trình du thuyền ngắm hoàng hôn, tiệc tối 5 món của bếp trưởng trên bãi cát và liệu trình chăm sóc spa mỗi ngày.
                </p>

                <ul className="space-y-3 border-t border-[var(--brass-hairline)] pt-6 text-sm text-[var(--text-primary)] mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-[var(--accent-brass)]">—</span>
                    <span>3 đêm lưu trú tại Presidential Beachfront Villa</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[var(--accent-brass)]">—</span>
                    <span>Bữa sáng buffet thượng hạng và tiệc tối riêng tư trên bãi biển</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[var(--accent-brass)]">—</span>
                    <span>Dịch vụ xe Limousine đưa đón hai chiều sân bay Đà Nẵng</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-6 border-t border-[var(--brass-hairline)] gap-4 tabular-nums">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--accent-brass)]">Trọn gói cho 2 khách</span>
                  <strong className="font-serif-luxury text-2xl sm:text-3xl text-[var(--text-primary)]">24.500.000 ₫</strong>
                </div>
                <Link
                  href="/rooms/presidential-suite"
                  className="px-6 py-3 bg-[var(--accent-brass)] hover:bg-[var(--accent-brass-bright)] text-[var(--accent-brass-ink)] font-semibold text-xs tracking-wider uppercase rounded transition-colors shadow-lg"
                >
                  Khám phá hải trình →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Curated Stays Ledger */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {/* Ledger Card 1 */}
            <div className="bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between hover:border-[var(--accent-brass)] transition-colors">
              <div>
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 border border-[var(--brass-hairline)]">
                    <Image src="/images/aurora/executive-suite.jpg" alt="Trăng Mật" fill sizes="80px" className="object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--accent-brass)] block mb-1">
                      3 NGÀY 2 ĐÊM · DÀNH CHO CẶP ĐÔI
                    </span>
                    <h4 className="font-serif-luxury text-xl sm:text-2xl text-[var(--text-primary)]">
                      Kỳ Nghỉ Trăng Mật Hoàng Hôn
                    </h4>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-6">
                  Nâng hạng Suite hướng biển lộng gió, hoa tươi đón chào, bữa tối lãng mạn dưới ánh nến và liệu trình phục hồi đôi tại Spa Mộc.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--brass-hairline)] tabular-nums">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[var(--accent-brass)]">Trọn gói kỳ nghỉ</span>
                  <strong className="font-serif-luxury text-xl text-[var(--text-primary)]">9.800.000 ₫</strong>
                </div>
                <Link href="/rooms/executive-suite" className="text-xs uppercase tracking-wider text-[var(--accent-brass)] hover:underline font-medium">
                  Chi tiết gói →
                </Link>
              </div>
            </div>

            {/* Ledger Card 2 */}
            <div className="bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between hover:border-[var(--accent-brass)] transition-colors">
              <div>
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 border border-[var(--brass-hairline)]">
                    <Image src="/images/aurora/deluxe-king.jpg" alt="Đặc Quyền" fill sizes="80px" className="object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--accent-brass)] block mb-1">
                      ƯU ĐÃI ĐẶT TRƯỚC 30 NGÀY · TỪ 2 ĐÊM
                    </span>
                    <h4 className="font-serif-luxury text-xl sm:text-2xl text-[var(--text-primary)]">
                      Đặc Quyền Mùa Tĩnh Lặng
                    </h4>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-6">
                  Ưu đãi 20% trên giá công bố trực tiếp, tặng kèm voucher 1.000.000 ₫ ẩm thực & spa, đặc quyền nhận phòng sớm từ 10:00 sáng.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--brass-hairline)] tabular-nums">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[var(--accent-brass)]">Giá khởi điểm từ</span>
                  <strong className="font-serif-luxury text-xl text-[var(--text-primary)]">2.000.000 ₫ / đêm</strong>
                </div>
                <Link href="/rooms/deluxe-king" className="text-xs uppercase tracking-wider text-[var(--accent-brass)] hover:underline font-medium">
                  Chi tiết gói →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/home/AccoladesRow.tsx`:
```tsx
export function AccoladesRow() {
  const AWARDS = [
    { seal: "★", title: "Condé Nast Traveler", sub: "Đề cử Khu nghỉ dưỡng biển cảnh quan hàng đầu Châu Á" },
    { seal: "✦", title: "Design Heritage", sub: "Giải thưởng Kiến trúc Sa thạch & Cảnh quan Tự nhiên" },
    { seal: "5★", title: "Hospitality Excellence", sub: "Chuẩn mực dịch vụ quản gia & Trải nghiệm cá nhân hóa" },
    { seal: "ECO", title: "EarthCheck Certified", sub: "Cam kết bảo tồn thiên nhiên & năng lượng sinh thái bền vững" },
  ];

  return (
    <section className="py-20 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] border-y border-[var(--brass-hairline)] transition-colors duration-500">
      <div className="max-w-[1380px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {AWARDS.map((award, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full border border-[var(--brass-hairline)] flex items-center justify-center text-[var(--accent-brass)] text-lg mb-4">
              {award.seal}
            </div>
            <div className="font-serif-luxury text-xl text-[var(--text-primary)] mb-2">{award.title}</div>
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[240px]">{award.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Create `src/components/home/ConciergeFaq.tsx`:
```tsx
"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Thời gian nhận phòng và trả phòng tại Aurora như thế nào?",
    a: "Thời gian nhận phòng tiêu chuẩn là 14:00 và trả phòng là 12:00 trưa. Khách đặt phòng trực tiếp qua website được ưu tiên nhận phòng sớm hoặc trả phòng muộn tùy thuộc vào tình trạng phòng trống mà không tính thêm phụ phí.",
  },
  {
    q: "Khu nghỉ dưỡng có dịch vụ đưa đón từ sân bay quốc tế Đà Nẵng không?",
    a: "Có, chúng tôi cung cấp dịch vụ xe Limousine riêng đưa đón từ Sân bay Quốc tế Đà Nẵng (thời gian di chuyển khoảng 25 phút). Miễn phí đưa đón 2 chiều cho khách đặt phòng hạng Executive Suite và Villa trở lên.",
  },
  {
    q: "Chính sách hủy phòng và đổi ngày lưu trú có linh hoạt không?",
    a: "Tất cả đặt phòng trực tiếp qua website của chúng tôi đều được hưởng chính sách hủy phòng miễn phí trước 7 ngày so với ngày nhận phòng tiêu chuẩn, và hỗ trợ đổi ngày lưu trú trong vòng 6 tháng.",
  },
  {
    q: "Resort có phù hợp cho gia đình có trẻ nhỏ không?",
    a: "Aurora là không gian tĩnh tại hướng đến thiên nhiên nhưng chúng tôi luôn chào đón các gia đình. Chúng tôi có các hoạt động khám phá thiên nhiên, lớp làm gốm và dịch vụ bảo mẫu chuyên nghiệp theo yêu cầu riêng.",
  },
];

export function ConciergeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="faq">
      <div className="max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="section-eyebrow">HỎI ĐÁP & CHUẨN BỊ KỲ NGHỈ</div>
          <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl text-[var(--text-primary)] mb-6">
            Thông tin chuẩn bị cho kỳ nghỉ của bạn
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            Đội ngũ quản gia Aurora Concierge luôn túc trực 24/7 để đáp ứng mọi yêu cầu riêng biệt từ việc đón tiễn sân bay đến chuẩn bị hoa tươi trong phòng.
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`border rounded-lg overflow-hidden bg-[var(--bg-surface-card)] transition-all duration-300 ${
                  isOpen ? "border-[var(--accent-brass)] shadow-xl" : "border-[var(--brass-hairline)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brass)]"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif-luxury text-lg sm:text-xl text-[var(--text-primary)] font-medium">
                    {faq.q}
                  </span>
                  <span
                    className={`faq-icon inline-flex items-center justify-center w-8 h-8 min-w-8 rounded-full border border-[var(--brass-hairline)] text-[var(--accent-brass)] transition-transform duration-500 ${
                      isOpen ? "rotate-45 bg-[var(--accent-brass)] text-[var(--accent-brass-ink)]" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {/* Zero-Layout-Shift CSS Grid Fraction Height Transition */}
                <div
                  className="transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] grid"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`px-6 pb-6 text-sm text-[var(--text-secondary)] leading-relaxed transition-all duration-300 ${
                        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                      }`}
                    >
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/layout/EditorialFooter.tsx`:
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
              <li><a href="#manifesto" className="hover:text-[var(--text-primary)] transition-colors">Triết lý kiến trúc</a></li>
              <li><a href="#masterplan" className="hover:text-[var(--text-primary)] transition-colors">Sơ đồ phân khu</a></li>
              <li><a href="#suites" className="hover:text-[var(--text-primary)] transition-colors">Suites & Dinh thự</a></li>
              <li><a href="#gastronomy" className="hover:text-[var(--text-primary)] transition-colors">Ẩm thực vách đá</a></li>
              <li><a href="#wellness" className="hover:text-[var(--text-primary)] transition-colors">Spa & Trị liệu</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] font-semibold mb-4">
              THÔNG TIN
            </h5>
            <ul className="space-y-3 text-xs">
              <li><a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">Chính sách đặt phòng</a></li>
              <li><a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">Đón tiễn sân bay</a></li>
              <li><a href="#packages" className="hover:text-[var(--text-primary)] transition-colors">Đặc quyền theo mùa</a></li>
              <li><a href="#expeditions" className="hover:text-[var(--text-primary)] transition-colors">Quỹ bảo tồn Sơn Trà</a></li>
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
                  Cổng đăng nhập nội bộ ↗
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

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && npm run ui:contract-check`
Expected: PASS with 0 violations

- [ ] **Step 5: Commit**

```bash
git add src/components/home/CuratedJourneys.tsx src/components/home/AccoladesRow.tsx src/components/home/ConciergeFaq.tsx src/components/layout/EditorialFooter.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): add CuratedJourneys, AccoladesRow, ConciergeFaq, and EditorialFooter"
```

---

### Task 9: Assemble the Master 8-Chapter Experience in `src/app/page.tsx`

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `tests/unit/homepage-redesign.test.ts`

- [ ] **Step 1: Write test for master homepage assembly**

Append to `tests/unit/homepage-redesign.test.ts`:
```typescript
describe("Master Homepage Assembly in src/app/page.tsx", () => {
  it("assembles all 8 narrative chapters with EditorialHeader and EditorialFooter", async () => {
    const page = await readFile("src/app/page.tsx", "utf8");
    assert.match(page, /EditorialHeader/);
    assert.match(page, /EditorialHero/);
    assert.match(page, /ManifestoScrub/);
    assert.match(page, /SpatialMasterplan/);
    assert.match(page, /KineticRoomAccordion/);
    assert.match(page, /OceanGastronomy/);
    assert.match(page, /WellnessSanctuary/);
    assert.match(page, /EcoExpeditions/);
    assert.match(page, /CuratedJourneys/);
    assert.match(page, /AccoladesRow/);
    assert.match(page, /ConciergeFaq/);
    assert.match(page, /EditorialFooter/);
    assert.doesNotMatch(page, /href="#"/, "Dead link violation forbidden");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts`
Expected: FAIL with "AssertionError: Expected values to match: /EditorialHeader/"

- [ ] **Step 3: Update `src/app/page.tsx` to assemble all 8 chapters**

Edit `src/app/page.tsx`:
```tsx
import { EditorialHeader } from "@/components/layout/EditorialHeader";
import { EditorialFooter } from "@/components/layout/EditorialFooter";
import { EditorialHero } from "@/components/home/EditorialHero";
import { ManifestoScrub } from "@/components/home/ManifestoScrub";
import { SpatialMasterplan } from "@/components/home/SpatialMasterplan";
import { KineticRoomAccordion } from "@/components/home/KineticRoomAccordion";
import { OceanGastronomy } from "@/components/home/OceanGastronomy";
import { WellnessSanctuary } from "@/components/home/WellnessSanctuary";
import { EcoExpeditions } from "@/components/home/EcoExpeditions";
import { CuratedJourneys } from "@/components/home/CuratedJourneys";
import { AccoladesRow } from "@/components/home/AccoladesRow";
import { ConciergeFaq } from "@/components/home/ConciergeFaq";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="page-shell bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors duration-500 min-h-screen">
      <a className="skip-link" href="#main-content">
        Chuyển đến nội dung chính
      </a>

      {/* Chapter 0: Refined Fixed Editorial Navigation */}
      <EditorialHeader />

      <main id="main-content">
        {/* Chapter 1: Hero Parallax & Booking Ribbon */}
        <EditorialHero />

        {/* Chapter 2: Architectural Manifesto Scroll Scrub */}
        <ManifestoScrub />

        {/* Chapter 3: Spatial Masterplan with Google Maps Lenis Isolation */}
        <SpatialMasterplan />

        {/* Chapter 4: Kinetic Accordion Suites Showcase */}
        <KineticRoomAccordion />

        {/* Chapter 5: Oceanfront Gastronomy & Wine Cellar */}
        <OceanGastronomy />

        {/* Chapter 6: Holistic Wellness & Botanical Spa */}
        <WellnessSanctuary />

        {/* Chapter 7: Eco-Expeditions & Curated Seasonal Journeys */}
        <EcoExpeditions />
        <CuratedJourneys />

        {/* Chapter 8: Accolades, Arrival Concierge FAQ & Giant Watermark Colophon */}
        <AccoladesRow />
        <ConciergeFaq />
      </main>

      <EditorialFooter />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/unit/homepage-redesign.test.ts && npm run ui:contract-check`
Expected: PASS with 0 violations

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx tests/unit/homepage-redesign.test.ts
git commit -m "feat(homepage): assemble complete 8-chapter architectural flagship experience"
```

---

### Task 10: Full System Verification & Quality Gates

**Files:**
- Run project-wide verification checks

- [ ] **Step 1: Run UI Affordance Contract check**

Run: `npm run ui:contract-check`
Expected: "All UI Affordance Contracts verified cleanly! 0 dead controls detected."

- [ ] **Step 2: Run TypeScript Typecheck**

Run: `npm run typecheck`
Expected: Exit code 0 with 0 errors

- [ ] **Step 3: Run Design Lock Verification**

Run: `npm run design:check`
Expected: "Aurora design lock: verified"

- [ ] **Step 4: Run Full Test Suite**

Run: `npm run test`
Expected: All tests pass cleanly

- [ ] **Step 5: Run Production Next.js Build**

Run: `npm run build`
Expected: Successful Next.js build (`✓ Compiled successfully`, routes generated cleanly)

- [ ] **Step 6: Final Commit & Tag**

```bash
git commit --allow-empty -m "chore(homepage): verify all quality gates, contracts, and production build"
```
