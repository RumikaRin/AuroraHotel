# Aurora Hotel Homepage Redesign Specification (Aman & Awwwards Standard)

> **Document ID:** SPEC-2026-10-22-HOMEPAGE-REDESIGN  
> **Status:** Draft for Approval  
> **Target Release:** Homepage Experience v2 (Quiet Luxury & Kinetic Craft)  
> **Design Frameworks:** Hallmark Anti-AI-Slop (58-Gate Standard), Impeccable Motion & Typography, Awwwards Site of the Day Standard.

---

## 1. Executive Summary & Core Objective

The Aurora Hotel digital flagship is being redesigned from a standard hospitality template into a world-class architectural resort experience benchmarked against international luxury icons (Aman, Six Senses, Capella, and Cheval Blanc). 

### Key Pillars
1. **Atmospheric Editorial Narrative:** An 8-chapter continuous storytelling experience showcasing the pristine natural beauty of the Sơn Trà Peninsula, Da Nang.
2. **High-Craft Kinetic Fluidity:** Momentum-based smooth scroll (Lenis), word-by-word scroll-driven opacity scrubbing (GSAP ScrollTrigger), and layout-stable flex tweening with zero browser reflow jitter.
3. **Interactive Spatial Masterplan:** An interactive blueprint map with pulsing geographic nodes allowing guests to visually contextualize the cliffside suites, private beach, botanical spa, and yacht marina.
4. **Hallmark 58-Gate Compliance:** 100% elimination of AI-slop tropes (no fake metrics, tokenized color variables, single-column vertical section headers, strict mobile responsiveness, and respect for `prefers-reduced-motion`).

---

## 2. Design System & Visual Foundation

### 2.1 Color Tokens (OKLCH / CSS Custom Properties)
All colors are centrally declared on `:root` and adapt dynamically to the dual atmosphere modes (`dusk` as default, `dawn` for daytime):

| Token Name | Dusk Mode (Default - High Contrast) | Dawn Mode | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `--bg-surface` | `#110E0C` (Obsidian Carbon) | `#FBF8F2` (Warm Ivory) | Base background canvas |
| `--bg-surface-deep`| `#0A0807` (Deep Obsidian) | `#EDE4D8` | Deep footers & map wrappers |
| `--bg-surface-card`| `#1C1613` (Elevated Charcoal) | `#F4ECE1` | Card & modal backgrounds |
| `--bg-canvas` | `#181310` | `#F2EBE1` | Alternating section contrast |
| `--text-primary` | `#FFFFFF` (Pure White, 16.5:1) | `#211915` (Deep Espresso) | Headings, titles & key values |
| `--text-secondary`| `#D4CBC2` (Light Sand, 8.5:1) | `#5A4E44` | Body descriptions & paragraphs |
| `--text-muted` | `#A89C90` (Muted Warm Stone, 5.5:1) | `#7A6E64` | Microcopy, labels & coordinates |
| `--accent-brass` | `#E2C799` (Luminous Champagne Brass) | `#8E6D38` | Accents, active tabs, buttons |
| `--brass-hairline`| `rgba(226,199,153,0.32)` | `rgba(142,109,56,0.30)`| 1px hairline dividers |
| `--brass-glow` | `rgba(226,199,153,0.16)` | `rgba(142,109,56,0.12)`| Subtle ambient glows |

### 2.2 Typography Hierarchy
- **Display Serif:** `Cormorant Garamond` (300 light, 400 regular, 500 medium). Tight leading (`1.05–1.12`), letter-spacing `0.02em–0.06em`. All headings maintain roman upright posture (`font-style: normal` per Gate 38a).
- **Body & Micro Sans:** `Plus Jakarta Sans` (300 light, 400 regular, 600 semibold). Tracking `0.08em–0.22em` on uppercase metadata and buttons.
- **Tabular Figures:** `font-variant-numeric: tabular-nums` applied across all prices, coordinates, square meters, and time indicators.

---

## 3. Structural Macro-Architecture (8 Narrative Chapters)

### Chapter 0: Refined Fixed Editorial Navigation (Zero HUD Clutter)
- **Removal of Telemetry HUD:** Completely eliminated the tech-nerdy top coordinate ticker, live clock, and telemetry bar to maintain pure quiet luxury aesthetic.
- **Integrated Header Navigation:** Positioned directly at `top: 0` with frosted glass backing (`backdrop-filter: blur(24px)` on scroll), elegant brand mark, editorial anchor links, compact Web Audio wave soundscape toggle, Dawn/Dusk atmosphere switch, and direct "Đặt kỳ nghỉ" CTA button.

### Chapter 1: Hero & Integrated Booking Ribbon
- **Hero Image Parallax:** Background scaled to `1.15` and scrubbed via GSAP ScrollTrigger to `y: 22%`.
- **Pure Editorial Headline Typography:** Authentic localized eyebrow (`KHU NGHỈ DƯỠNG BIỆT LẬP · BÁN ĐẢO SƠN TRÀ, ĐÀ NẴNG`) and balanced two-line monumental display headline ("Thành phố ở gần. / Kỳ nghỉ ở rất xa."). Completely eliminates gimmicky inline image pills that disrupt reading flow and create orphan line breaks.
- **Directional Scrim Protection:** Multi-stop linear gradient (`rgba(17,14,12,0.88)` left scrim) and typography text-shadow ensuring maximum contrast against glowing building lights and beach daylight.
- **Hairline Booking Ribbon:** Replaces bulky forms with a clean 4-column hairline bar: Check-in, Check-out, Guests & Rooms, and Search CTA.

### Chapter 2: Architectural Manifesto
- **Typography Scrub:** High-impact editorial statement ("Chúng tôi không đơn thuần xây dựng một khách sạn...") where words scrub from `opacity: 0.18` to `opacity: 1.0` as the viewport reaches 75% scroll threshold.
- **Honest Copywriting:** Strictly localized narrative regarding Sơn Trà Peninsula conservation without fabricated metrics.

### Chapter 3: Interactive Spatial Masterplan (Google Maps Geographic Explorer)
- **Authentic Geographic Context:** Replaces abstract vector blueprint shapes with an authentic Google Maps satellite/terrain embed of Bán Đảo Sơn Trà, Đà Nẵng.
- **Dual Map Modes:** Satellite imagery mode (`t=k`) and Standard vector/terrain mode (`t=m`), plus direct external map link.
- **4 Geographic Hotspots & Exact Coordinates:**
  1. *01 · Vách đá Sơn Trà* (`16.1200, 108.2850` · Cliffside Sanctuary Reserve, alt: 45m)
  2. *02 · Bờ cát riêng* (`16.1020, 108.2630` · Presidential Beachfront Villa / Bãi Bụt)
  3. *03 · Thung lũng Spa* (`16.1080, 108.2700` · Botanical Spa Pavilion & Jungle Springs)
  4. *04 · Bến du thuyền* (`16.0965, 108.2540` · Aurora Marina & Catamaran Fleet)
- **Dynamic Content Transition:** Clicking any zone selector pill smoothly re-centers the Google Map iframe and crossfades the zone card details (tag, title, description, square meters, exclusive perks, and preview photo) via GSAP crossfade.

### Chapter 4: Kinetic Accordion Suites Showcase (Anti-Jitter Architecture)
- **Layout:** 4 expansive vertical panels displaying the resort collection.
- **Zero-Jitter Typography Protection:**
  - Expanded text container locked to fixed `540px` width (`max-width: calc(100% - 40px)`), completely preventing browser text reflow/re-wrapping jumps while the panel width changes.
  - Heading locked to single line (`white-space: nowrap`) eliminating mid-word breaks from `overflow-wrap: anywhere`.
  - Specs and action rows protected with `white-space: nowrap`.
- **Asymmetric Timing Engine:**
  - Collapse: Instant fade-out + slide-down in 140ms before container width shrinks.
  - Expand: Smooth drift-up and opacity fade-in over 450ms with a 220ms delay, arriving only after panel expansion is well underway.
  - Rotated collapsed label: 100ms instant exit, 220ms delayed entrance.
- **Interpolation Engine:**
  - Expanded panel: `flex-grow: 3.5`
  - Collapsed panels: `flex-grow: 1.0`
  - Tweening: GSAP velocity easing (`power2.out`, 0.75s, `overwrite: "auto"`).
  - 100ms debounce on mouse hover to eliminate rapid mouse sweep flutter.
  - Quick-select pill tabs on top allowing keyboard and touch access.
- **Mobile Fallback:** Transitions to stacked cards under 768px with touch-friendly layout.

### Chapter 5: Oceanfront Gastronomy & Wine Cellar
- Two-column split featuring high-end imagery of oceanfront dining alongside a curated menu highlighting local ingredients (Sơn Trà herbs, dry-aged wagyu over charcoal, natural rock cave wine cellar with 450+ curated vintages).

### Chapter 6: Holistic Wellness & Botanical Spa
- 3-column card grid detailing bespoke treatments:
  - 90-min Hot Stone & Tràm Gió Forest Essential Oils
  - 06:00 Sunrise Cliffside Yoga
  - Herbal Hydrotherapy in Wild Cedarwood Tub

### Chapter 7: Bespoke Expeditions & Curated Seasonal Journeys
- **Eco-Safari Spotlight:** Spotlight for the Red-shanked Douc Langur (queen of primates), private catamaran charter, and curated itinerary preview.
- **Asymmetric Editorial Journeys (Anti-SaaS Standard):** Completely eliminates generic 3-column pricing tables, SaaS checkmarks (`✓`), and "Most Popular" floating pill badges. Replaces them with a luxury editorial dossier:
  - *Left Column (Signature Journey Hero):* Panoramic photographic showcase featuring the 4D3N "Hành Trình Tĩnh Tại Sơn Trà & Dạ Tiệc Bờ Sóng" with presidential villa stay, private catamaran cruise, 5-course chef dinner on sand, and forest spa therapy.
  - *Right Column (The Curated Stays Ledger):* Two horizontal editorial cards with photography thumbnails for "Kỳ Nghỉ Trăng Mật Hoàng Hôn" (Honeymoon) and "Đặc Quyền Mùa Tĩnh Lặng" (Early Bird).

### Chapter 8: Accolades, Arrival Concierge & Giant Watermark Colophon
- 4-item awards & sustainability row (Condé Nast nominee, EarthCheck eco-standard).
- FAQ accordion with accessible expandable items.
- Grand typographic watermark footer (`A U R O R A`) with complete resort coordinates and legal colophon.

---

## 4. Technical Architecture in Next.js

### 4.1 Component Decomposition Plan
```
src/
├── components/
│   ├── home/
│   │   ├── AmbientHud.tsx              # Sticky telemetry HUD, clock, audio, theme
│   │   ├── EditorialHero.tsx           # Hero with parallax and booking ribbon
│   │   ├── ManifestoScrub.tsx          # GSAP word-by-word opacity scrub
│   │   ├── SpatialMasterplan.tsx       # Interactive blueprint map with hotspot nodes
│   │   ├── KineticRoomAccordion.tsx    # GSAP flexGrow tweened rooms showcase
│   │   ├── OceanGastronomy.tsx         # Dining & wine cellar split section
│   │   ├── WellnessSanctuary.tsx       # 3-column botanical spa grid
│   │   ├── EcoExpeditions.tsx          # Catamaran & wildlife safari spotlight
│   │   ├── CuratedJourneys.tsx         # Asymmetric luxury editorial seasonal stays
│   │   ├── AccoladesRow.tsx            # Awards and eco-certification
│   │   └── ConciergeFaq.tsx            # Accessible arrival FAQ accordion
│   └── layout/
│       ├── EditorialHeader.tsx         # Scrolled state, nav links, CTA
│       └── EditorialFooter.tsx         # Watermark colophon & directory
```

### 4.2 State Management & Audio API
- **Atmosphere Theme:** Stored in lightweight state / localStorage (`dusk` | `dawn`) via `data-theme` attribute on `document.documentElement`.
- **Procedural Soundscape:** Web Audio API generating pink-noise buffer modulated by a 0.15 Hz oscillator connected to a Biquad lowpass filter. Runs purely client-side on user click without downloading large audio assets.
- **Smooth Scroll (Lenis):** Dynamically initialized inside a client-side `SmoothScrollProvider` or `useEffect` hook, synchronized with `gsap.ticker.lagSmoothing(0)`.

### 4.3 Content Security Policy (CSP) Compliance
- Strict avoidance of inline styles (`style="..."`). All dynamic values (hotspot coordinates, panel heights) will either use predefined utility classes in `globals.css` or CSS custom properties passed via standard React properties compatible with the nonce-based CSP.

### 4.4 Reduced Motion Accessibility (`prefers-reduced-motion`)
- All GSAP animations check `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active:
  - Lenis smooth scroll is disabled.
  - GSAP parallax and scrub triggers are bypassed.
  - Opacity and flex adjustments execute instantly without tweening.

---

## 5. Verification & Testing Strategy

1. **Hallmark 58-Gate Audit:**
   - Verify zero fabricated statistics.
   - Verify `overflow-x: clip` on `html` and `body` without horizontal scroll.
   - Verify `minmax(0, 1fr)` on all CSS grids.
2. **Kinetic Smoothness Test:**
   - Fast sweeping across the 4 accordion panels to verify 0 layout stutter and 60fps frame rate.
3. **Responsive Breakpoint Verification:**
   - Test rendering at 375px (mobile), 768px (tablet), 1024px (laptop), and 1440px+ (desktop).
4. **Build & Quality Gates:**
   - TypeScript compilation (`npm run typecheck` or `next build`).
   - ESLint validation.
   - Local production server verification on `http://localhost:3003`.

---

## 6. Approval & Next Steps

Upon user approval of this specification:
1. Commit this spec document to git repository.
2. Invoke `writing-plans` to generate the step-by-step implementation plan.
3. Execute implementation using subagents or inline execution.
