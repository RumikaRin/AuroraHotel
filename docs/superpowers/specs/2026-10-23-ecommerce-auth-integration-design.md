# Aurora Hotel — E-Commerce & Authentication Integration Design Specification

**Date:** 2026-10-23  
**Status:** Approved  
**Author:** Claude (Architecture & UX Engineering)  
**Topic:** Reconnecting Full E-Commerce, Booking Engine, Auth, and I18n into Flagship Awwwards Homepage

---

## 1. Problem Statement & Motivation

During the transformation of the Aurora Hotel homepage into an 8-chapter architectural flagship experience, navigation links were temporarily replaced with in-page anchor hashes (`#manifesto`, `#masterplan`, etc.). While this achieved a cohesive single-page narrative presentation, it caused several severe functional regressions:
1. **Isolated Landing Page Feel:** Users and testers could not access the hotel's existing full-stack features: room catalog (`/rooms`), dining & activities (`/experiences`), seasonal offers (`/offers`), reservation lookup (`/my-bookings`), or authentication (`/login`).
2. **Native Datepicker Aesthetic Clash (Image #17):** Clicking the date inputs inside the redesigned `EditorialHero` ribbon triggered the bright white Windows/Chromium native `<input type="date">` popup, breaking the dark luxury visual language. Furthermore, the search button only scrolled to `#suites` instead of validating dates, checking availability, and routing to the catalog.
3. **Missing Authentication & Language Controls:** Customers and staff had no visible login entry points in the header, and international visitors had no way to switch between Vietnamese (`VI`) and English (`EN`).
4. **Mobile Navigation Vacuum:** The header had no mobile hamburger button or drawer menu, making navigation impossible on small viewports.

The entire backend and frontend checkout infrastructure (`/booking`, `/api/availability`, `/api/quote`, `/api/checkout`, `/my-bookings`) remains 100% intact and functional in the repository. This specification documents the architecture to reconnect these systems seamlessly into the flagship aesthetic.

---

## 2. Architectural Design & Component Specifications

### 2.1 `EditorialHeader.tsx` (Flagship Hybrid Navigation)

**File:** `src/components/layout/EditorialHeader.tsx`

**Key Responsibilities:**
- Provide clear, accessible navigation to primary resort routes while preserving the luxury editorial aesthetic.
- Support both desktop row navigation and an atmospheric mobile slide-out drawer.
- Support multi-language toggle (`VI | EN`) integrated with `useLanguage()`.
- Support theme switching (`Dusk ☾ / Dawn ☼`).
- Provide immediate access to customer & staff login (`/login`) and reservation lookup (`/my-bookings`).
- Provide an assertive "Đặt kỳ nghỉ" CTA button navigating to `/rooms`.

**Desktop Navigation Structure:**
- **Brand Mark (Left):** `A U R O R A` linking to `/`.
- **Primary Routes (Center):**
  - `01 · Suites & Villas` (`/rooms`)
  - `02 · Trải nghiệm` (`/experiences`)
  - `03 · Đặc quyền` (`/offers`)
  - `04 · Tra cứu đặt phòng` (`/my-bookings`)
- **Action Group (Right):**
  - **Language Toggle:** Button toggling between `VI` and `EN` via `toggleLanguage()`.
  - **Theme Switcher:** Segmented Dusk/Dawn pill toggle.
  - **Customer Login:** Subtle luxury link `Đăng nhập` leading to `/login`.
  - **Primary CTA:** Brass button `Đặt kỳ nghỉ` linking to `/rooms`.
  - **Mobile Hamburger Button:** Minimalist animated SVG button visible on `<lg` viewports (`lg:hidden`).

**Mobile Drawer Navigation:**
- Accessible overlay dialog triggered by hamburger button.
- Smooth backdrop blur with slide-down/fade-in animation.
- Direct links to `/rooms`, `/experiences`, `/offers`, `/my-bookings`, and `/login`.
- Mobile language toggle and theme switcher.
- Escape key listener, backdrop click dismiss, and body scroll locking while open.

---

### 2.2 `EditorialHero.tsx` (Atmospheric Availability Picker & Search Flow)

**File:** `src/components/home/EditorialHero.tsx`

**Key Responsibilities:**
- Eliminate raw native `<input type="date">` and native `<select>` controls causing the stark white Windows popup (Image #17).
- Integrate the project's existing custom `AvailabilityPicker` (`src/components/booking/AvailabilityPicker.tsx`).
- Manage check-in, check-out, and guest count state with sensible defaults (Check-in = today, Check-out = today + 3 days, Guests = 2).
- Execute availability pre-checks against `/api/availability` when the user submits the search form.
- Provide a smooth transition to `/rooms?checkIn=...&checkOut=...&guests=...` upon search submission.
- Display transparent booking guarantees ("Giá trực tiếp tốt nhất", "Chính sách hủy minh bạch").

**Component Details:**
```tsx
const [checkIn, setCheckIn] = useState("");
const [checkOut, setCheckOut] = useState("");
const [guests, setGuests] = useState("2");
const [isSearching, setIsSearching] = useState(false);
const [notice, setNotice] = useState<string | null>(null);
const [noticeType, setNoticeType] = useState<"success" | "error">("success");
```
- The custom `AvailabilityPicker` renders inside the hero's frosted glass ribbon (`bg-[rgba(20,16,14,0.72)] backdrop-blur-xl border border-[rgba(226,199,153,0.32)]`).
- Date picker opens a luxury dark-mode calendar popover attached to `document.body` via React Portal, completely immune to container overflow clipping or native OS styling.

---

### 2.3 `KineticRoomAccordion.tsx` (Deep Booking Integration)

**File:** `src/components/home/KineticRoomAccordion.tsx`

**Key Responsibilities:**
- Ensure the accordion's "Đặt phòng này →" buttons link directly to individual room pages (`/rooms/deluxe-king`, `/rooms/executive-suite`, `/rooms/presidential-suite`, `/rooms/reserve-penthouse`).
- Preserve the anti-jitter typography container (`w-[540px] min-w-[540px] lg:max-w-none`) and hover debouncing established in previous bug fixes.

---

### 2.4 `EditorialFooter.tsx` (Route Parity & Compliance Reconciliation)

**File:** `src/components/layout/EditorialFooter.tsx`

**Key Responsibilities:**
- Reconcile footer navigation columns with real routes:
  - **Khám phá:** Links to `/rooms` (Suites & Dinh thự), `/experiences` (Ẩm thực & Trải nghiệm), `/offers` (Đặc quyền theo mùa).
  - **Thông tin & Pháp lý:** Links to `/my-bookings` (Tra cứu đặt phòng), `/privacy` (Chính sách bảo mật), `/terms` (Điều khoản lưu trú).
  - **Quản gia:** Link to `/login` (Cổng đăng nhập tài khoản & nội bộ).

---

## 3. End-to-End User Flow & Data Contracts

```
[Homepage EditorialHero]
       │
       ▼ (User interacts with AvailabilityPicker: select check-in, check-out, guest count)
[Submit: "Tìm phòng trống →"]
       │
       ├─► [Optional Pre-fetch API: GET /api/availability?checkIn=...&checkOut=...&guests=...]
       │
       ▼
[Redirect: /rooms?checkIn=2026-10-25&checkOut=2026-10-28&guests=2]
       │
       ▼ (Catalog displays available suites matching dates & occupancy)
[Click: "Xem chi tiết & Đặt phòng" -> /rooms/[slug]]
       │
       ▼ (Select rate plan: Standard / Breakfast Included / Non-refundable)
[Proceed: /booking?roomId=...&checkIn=...&checkOut=...&guests=...&ratePlanId=...]
       │
       ▼ (Step 1: Guest Information & Special Requests)
       ▼ (Step 2: Add-on Experiences — Airport transfer, Spa package)
       ▼ (Step 3: Summary, Coupon Code, Dynamic Quote via POST /api/quote)
[Confirm & Pay: POST /api/checkout with Idempotency-Key]
       │
       ▼
[Booking Confirmed: Code AUR-XXXXXX generated & saved to DB]
       │
       ▼
[Self-Service Verification: User looks up reservation at /my-bookings anytime]
```

---

## 4. Error Handling & Edge Cases

1. **Invalid Date Sequences:**
   - `AvailabilityPicker` strictly prevents selecting a check-out date prior to check-in date. If check-in is modified to a date after check-out, check-out is automatically cleared and prompts the user to pick a new departure date.
   - Dates in the past are disabled and non-clickable.
2. **Empty or Missing Query Parameters:**
   - If a user navigates to `/rooms` directly without query parameters, sensible defaults (today to today + 3 days, 2 guests) are applied.
3. **Network Failure on Availability Pre-check:**
   - If `/api/availability` fails or returns 500, the search button gracefully falls back to direct navigation to `/rooms?checkIn=...&checkOut=...` so the user is never blocked from browsing rooms.
4. **Mobile Overflow & Portal Layering:**
   - The date picker modal uses `createPortal(..., document.body)` with `z-index: 9999` and disables body scrolling while open, preventing double-scroll jitter or clipping inside Lenis smooth-scroll containers.

---

## 5. Verification Plan

1. **Visual & Interaction Check:**
   - Open homepage, click "NHẬN PHÒNG" — verify luxury dark calendar appears with NO native Windows white popups.
   - Pick dates, select guests, click "Tìm phòng trống →" — verify redirection to `/rooms?checkIn=...&checkOut=...&guests=...`.
2. **Navigation Parity Check:**
   - Click "Suites & Villas" -> navigates to `/rooms`.
   - Click "Trải nghiệm" -> navigates to `/experiences`.
   - Click "Ưu đãi" -> navigates to `/offers`.
   - Click "Tra cứu đặt phòng" -> navigates to `/my-bookings`.
   - Click "Đăng nhập" -> navigates to `/login`.
   - Click language toggle -> toggles between `VI` and `EN`.
   - Switch to mobile viewport (375px) -> click hamburger button -> verify drawer opens cleanly and all links function.
3. **Quality Gates:**
   - Run `npm run check` (TypeScript typecheck, ESLint, UI contract tests, Next.js production build).
   - Ensure 0 errors and 0 warnings.
