# Aurora Customer Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Image-led Editorial V9/V10 customer experience for Aurora Hotel & Resort while preserving all existing backend contracts and leaving admin, reception, and housekeeping unchanged.

**Architecture:** Keep the existing Next.js App Router and component boundaries. Replace customer presentation through shared design tokens, customer layout components, image-led public sections, and quiet utility states for search, room selection, checkout, and booking management. Hotel Rooms and Resort Suites remain frontend groupings over the existing room-category inventory; no API route, schema, validation, authentication, payment, or business-rule change is allowed.

**Tech Stack:** Next.js 15.5.22, React 19, TypeScript, existing CSS/Tailwind styles, Next Image, Playwright, Vitest, existing API routes and Prisma-backed services.

---

## Scope guard and current-state baseline

The worktree already contains unrelated or pre-existing source changes. Before
each task, inspect `git status --short` and stage only the files named by that
task. Do not reset, discard, or reformat unrelated admin/operations changes.

The design lock is already recorded in `design.md` and points to
`docs/superpowers/specs/2026-08-02-aurora-customer-frontend-redesign-design.md`.
The temporary browser mockup is not a production asset.

Customer scope:

- `src/app/page.tsx`
- `src/app/rooms/page.tsx`
- `src/app/rooms/RoomsClient.tsx`
- `src/app/rooms/[slug]/page.tsx`
- `src/app/search/page.tsx`
- `src/app/booking/page.tsx`
- `src/app/experiences/page.tsx`
- `src/app/offers/page.tsx`
- `src/app/account/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/my-bookings/page.tsx`
- `src/app/login/page.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/home/HeroCarousel.tsx`
- `src/components/home/OptionCRoomReel.tsx`
- `src/components/public/SanctuaryExperiences.tsx`
- `src/components/rooms/*`
- `src/components/booking/*`
- `src/app/globals.css`

Explicitly out of scope: `src/app/admin/**`, `src/app/operations/**`, and
`src/components/admin/**`/`src/components/operations/**`.

## Contract invariants used by every task

The implementation must preserve these exact request shapes and server-owned
facts:

```text
GET  /api/availability?checkIn&checkOut&guests&roomCategoryId?
GET  /api/rooms
POST /api/quote       { checkIn, checkOut, rooms[], couponCode?, services[]? }
GET  /api/services
POST /api/coupons/verify
POST /api/checkout    authenticated request + idempotency-key header
POST /api/bookings/lookup
```

`/api/availability` is the only availability source, `/api/quote` is the only
final price source, `/api/services` is the only source for purchasable service
add-ons, and checkout may use only `CREDIT_CARD`, `BANK_TRANSFER`, `CASH`, or
`MOCK_PAYMENT`. The client must not submit `PAY_AT_HOTEL`, invent a booking
number, show a fake hold/QR, or turn a pending payment into success.

---

### Task 1: Establish customer design tokens and a protected visual shell

**Files:**
- Modify: `src/app/globals.css`
- Test: `e2e/aurora-customer-redesign.spec.ts`

- [ ] **Step 1: Write the failing token and shell assertions**

Create `e2e/aurora-customer-redesign.spec.ts` with a first test that visits `/`
and asserts the customer document exposes the V10 tokens and customer landmarks:

```ts
import { test, expect } from "@playwright/test";

test("customer shell exposes the approved warm image-led tokens", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", /rgb/);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("#booking")).toBeVisible();
  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      espresso: styles.getPropertyValue("--espresso").trim(),
      linen: styles.getPropertyValue("--linen").trim(),
      brass: styles.getPropertyValue("--antique-brass").trim(),
      navy: styles.getPropertyValue("--aurora-midnight").trim(),
    };
  });
  expect(tokens.espresso).toBe("#261E1A");
  expect(tokens.linen).toBe("#F3EEE7");
  expect(tokens.brass).toBe("#B59A6B");
  expect(tokens.navy).not.toBe("#17211D");
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts -g "warm image-led"`

Expected: FAIL because the new semantic tokens and/or customer shell are not
yet present.

- [ ] **Step 3: Add the semantic token layer without removing operational aliases**

In `src/app/globals.css`, add the approved customer tokens:

```css
:root {
  --espresso: #261e1a;
  --warm-carbon: #191512;
  --linen: #f3eee7;
  --warm-ivory: #fbf8f2;
  --antique-brass: #b59a6b;
  --walnut: #665044;
  --muted-terracotta: #a76d55;
  --taupe: #887a70;
}
```

Keep the existing semantic success, warning, error, and information tokens and
keep legacy operational aliases available to admin/operations screens. Do not
replace all global colors with an unscoped customer-only value.

- [ ] **Step 4: Add focus, reduced-motion, and media defaults**

Ensure the shared CSS has visible `:focus-visible`, a reduced-motion rule that
sets transition/animation duration to zero, and stable image containers with
explicit aspect ratios where the customer pages load above the fold.

- [ ] **Step 5: Run the focused test and inspect the diff**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts -g "warm image-led"`

Expected: PASS. Run `git diff --check -- src/app/globals.css` and commit only
the token/shell test changes:
`git commit -m "feat(customer): add warm editorial design tokens"`.

---

### Task 2: Rebuild the shared customer header and footer

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Test: `e2e/aurora-customer-redesign.spec.ts`

- [ ] **Step 1: Add navigation and accessibility tests**

Add tests that assert desktop links resolve to `/rooms`, `/experiences`,
`/offers`, and `/my-bookings`; the mobile menu has a unique accessible name;
the skip link targets `#main-content`; and the booking CTA resolves to the
existing booking/search entry point.

- [ ] **Step 2: Run the tests to capture the current behavior**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts -g "navigation"`

Record any existing failures separately from failures introduced by this task;
do not alter admin navigation to make the customer test pass.

- [ ] **Step 3: Implement the shared shell**

Keep the existing locale state, routes, and menu behavior. Change only the
presentation to:

- transparent/over-image desktop header that becomes a warm material surface
  when required for contrast;
- centered customer links with active-route treatment;
- right-side language, booking lookup/account, and primary booking CTA;
- mobile wordmark, booking CTA, and an accessible menu drawer;
- footer with the existing contact/legal destinations and no dead `#` links.

Do not add a property selector or a second Aurora brand.

- [ ] **Step 4: Verify keyboard interaction**

Run the navigation test plus a keyboard walkthrough using Playwright: focus the
skip link, open/close the mobile menu with Enter/Escape, and confirm focus does
not move into hidden menu content.

- [ ] **Step 5: Commit the shared shell**

Run `git diff --check -- src/components/layout/Header.tsx src/components/layout/Footer.tsx`
and commit only these files and their focused test changes:
`git commit -m "feat(customer): refine shared editorial navigation"`.

---

### Task 3: Implement the image-led homepage and room reel

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/home/HeroCarousel.tsx`
- Modify: `src/components/home/OptionCRoomReel.tsx`
- Modify: `src/components/public/SanctuaryExperiences.tsx`
- Test: `e2e/aurora-customer-redesign.spec.ts`

- [ ] **Step 1: Write homepage structure and contract tests**

Add assertions for:

- hero copy is a descendant of the hero image section and has no opaque white
  copy card behind it;
- `#booking` contains date, date, guests, and the existing search submit;
- the homepage room reel links to real `/rooms/:slug` destinations;
- no visible text says `PAY_AT_HOTEL`, `hold`, or fake QR;
- reduced motion makes the hero static.

- [ ] **Step 2: Run the tests and record the baseline**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts -g "homepage"`

- [ ] **Step 3: Implement the desktop hero**

Keep the existing carousel data, controls, image priority, and route handling.
Change presentation to:

- one dominant photo with functional Warm Carbon contrast overlay;
- headline directly on the image, white with one Antique Brass italic phrase;
- no white/ivory copy panel, chromatic gradient, particle, glow orbit, or fog;
- controls and counter at the edge of the image;
- the existing booking console overlapping the hero boundary.

Use only transform/opacity for transitions and preserve a static
`prefers-reduced-motion` state.

- [ ] **Step 4: Implement the room reel and editorial experience section**

Use the existing room category objects and media. The room reel has one large
image, a short adjacent list, a room counter, and real links. The experience
section uses asymmetrical image/text composition and never presents editorial
copy as a purchasable service unless `/api/services` contains it.

- [ ] **Step 5: Verify desktop and mobile homepage behavior**

Run the homepage test at 1440px and 390px. Confirm the booking console remains
usable, no hero text is covered, and the mobile layout uses a separate crop and
does not show the desktop secondary image.

- [ ] **Step 6: Commit the homepage phase**

Run `git diff --check` for the four homepage files and commit:
`git commit -m "feat(customer): implement image-led homepage"`.

---

### Task 4: Recompose rooms search, compare, lightbox, and room detail

**Files:**
- Modify: `src/app/rooms/page.tsx`
- Modify: `src/app/rooms/RoomsClient.tsx`
- Modify: `src/app/rooms/[slug]/page.tsx`
- Modify: `src/components/rooms/RoomFilterBar.tsx`
- Modify: `src/components/rooms/RoomLightbox.tsx`
- Modify: `src/components/rooms/RoomCompareModal.tsx`
- Modify: `src/app/search/page.tsx`
- Test: `e2e/aurora-customer-redesign.spec.ts`

- [ ] **Step 1: Write rooms contract tests**

Cover the following exact behaviors:

- search parameters are preserved when navigating from homepage to rooms;
- room cards use existing IDs/slugs and have unique accessible links;
- filters update client presentation without inventing server availability;
- lightbox opens/closes with an accessible name and Escape;
- compare selection never submits a new room category;
- detail rate-plan selection changes the displayed selection but final price is
  labeled server-owned until `/api/quote` returns.

- [ ] **Step 2: Run focused room tests and inspect failures**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts -g "rooms|room detail"`

- [ ] **Step 3: Implement the Rooms page**

Use a warm editorial page head, a compact existing search form, restrained
filter controls, and large image-led room result rows. Keep the existing
`GET /api/rooms` data path and do not claim category-level availability when
the current service ignores the optional `roomCategoryId`.

- [ ] **Step 4: Implement room detail**

Use the approved gallery/metadata/rate-plan layout. Keep current room IDs,
rate-plan IDs, cancellation text, capacity, and links. When the current detail
source is hardcoded, present it as a display adapter only; do not introduce a
new inventory record or pretend it is a property selector.

- [ ] **Step 5: Implement lightbox and compare states**

Use semantic buttons, visible focus, Escape close, no scroll hijacking, and
mobile full-width presentation. Compare is a visual aid only and routes to an
existing room/booking path.

- [ ] **Step 6: Verify and commit rooms**

Run focused room tests at desktop and mobile widths, then:
`git commit -m "feat(customer): redesign room discovery and detail"`.

---

### Task 5: Recompose the three-step booking flow without changing contracts

**Files:**
- Modify: `src/app/booking/page.tsx`
- Modify: `src/components/booking/StickyBookingDrawer.tsx`
- Modify: `src/components/booking/RoomHoldTimer.tsx`
- Modify: `src/components/booking/DigitalPassbook.tsx`
- Test: `e2e/aurora-customer-redesign.spec.ts`
- Test: existing booking/security tests under `tests/` and `e2e/`

- [ ] **Step 1: Write negative-first booking tests**

Add tests for:

- unauthenticated checkout follows the existing auth requirement;
- invalid `PAY_AT_HOTEL` is never sent;
- one submit creates one stable `idempotency-key` for the intent;
- quote conflict/availability conflict stays an inline error state;
- pending or incomplete checkout response is not rendered as confirmed;
- the confirmation screen tolerates a replay response without inventing fields.

- [ ] **Step 2: Run booking tests and record baseline failures**

Run the existing booking test subset and:
`npx playwright test e2e/aurora-customer-redesign.spec.ts -g "booking|checkout"`.

- [ ] **Step 3: Implement the quiet utility layout**

Keep the existing state machine, query parameters, fetch calls, JSON payloads,
validation, auth redirects, and payment enum mapping. Recompose the page as:

1. visible three-step progress;
2. date/category/rate selection;
3. guest contact form with inline errors;
4. valid payment controls only;
5. server quote summary with tax/fee/cancellation text;
6. confirmation/recovery state that uses real response fields only.

The booking page must not show a fake hold timer, fake QR, fake booking number,
or decorative animation that delays action. If a legacy hold component remains
needed for a real backend state, it must be labeled from actual server state and
must not create urgency.

- [ ] **Step 4: Verify request payloads in the browser**

Use Playwright request listeners to assert the unchanged query/body/header
contracts for `/api/rooms`, `/api/quote`, `/api/coupons/verify`, and
`/api/checkout`. Redact credentials and payment details from retained evidence.

- [ ] **Step 5: Verify mobile checkout**

At 390px, confirm the summary does not cover inputs, payment choices remain
reachable, errors are inline, and the primary action stays visible without
scroll hijacking.

- [ ] **Step 6: Commit booking**

Run the focused booking tests plus existing security tests and commit:
`git commit -m "feat(customer): recompose contract-safe booking flow"`.

---

### Task 6: Recompose experiences and offers pages

**Files:**
- Modify: `src/app/experiences/page.tsx`
- Modify: `src/app/offers/page.tsx`
- Test: `e2e/aurora-customer-redesign.spec.ts`

- [ ] **Step 1: Write content and navigation tests**

Assert that both pages have one descriptive H1, real room/booking links, image
alt text, no marketplace/property selector, and no unsupported service checkout
claim.

- [ ] **Step 2: Implement Experiences**

Use image-led hero copy directly over the image, an asymmetrical editorial story,
and a sparse dining/wellness/resort-life rail. Keep content factual and route
customers back to rooms or existing service selection.

- [ ] **Step 3: Implement Offers**

Use two editorial offer rows for the existing offer/rate-plan concepts, with
terms, cancellation, and server-owned pricing placed beside the CTA. Preserve
the existing offer IDs and booking query parameters.

- [ ] **Step 4: Verify responsive behavior and commit**

Run the focused test at 1440px and 390px, inspect screenshot evidence, and
commit:
`git commit -m "feat(customer): redesign experiences and offers"`.

---

### Task 7: Recompose account, profile, login, and booking lookup

**Files:**
- Modify: `src/app/account/page.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/my-bookings/page.tsx`
- Modify: `src/components/booking/DigitalPassbook.tsx`
- Test: `e2e/aurora-customer-redesign.spec.ts`

- [ ] **Step 1: Write lookup/auth regression tests**

Assert that:

- lookup submits `{ bookingNumber, email }` to the existing route;
- cancellation uses the returned booking ID/token and existing authorization;
- confirmed/cancelled/check-out statuses render distinct states;
- login and profile remain within the existing auth flow;
- no dummy booking is presented as a live server result.

- [ ] **Step 2: Implement the account shell**

Use a warm passbook-style layout for real account/booking fields. Preserve
existing authentication and navigation. Do not add saved stays or preference
features without an API contract.

- [ ] **Step 3: Implement lookup and cancellation states**

Keep the existing request body and cancellation token behavior. Render loading,
not found, network error, confirmed, cancelled, and checked-out states inline
with actionable recovery. Never expose stack traces or secrets.

- [ ] **Step 4: Verify and commit**

Run focused account/lookup tests at desktop and mobile widths, then commit:
`git commit -m "feat(customer): refine account and booking lookup"`.

---

### Task 8: Full quality, visual, and contract verification

**Files:**
- Modify only if a test exposes a customer regression: the customer files in
  Tasks 1–7.
- Test evidence: `operations/ui-audit/` or the existing release evidence path.

- [ ] **Step 1: Run the contract checker**

Run: `npm run ui:contract-check`

Expected: PASS with no admin/operations contract regressions.

- [ ] **Step 2: Run all quality gates in the required order**

Run:

```text
npm run lint
npm run typecheck
npm run test
npm run design:check
npm run build
npm run e2e
```

If the full lint is memory-bound, use the repository's scoped customer lint
command and retain the exact command/output; do not disable lint rules.

- [ ] **Step 3: Run visual evidence at desktop and mobile sizes**

Capture homepage, rooms, room detail, booking steps, experiences, offers,
lookup, and mobile homepage/checkout at 1440px and 390px. Confirm:

- headline is directly on hero imagery;
- no dark navy/forest-green customer theme remains;
- no chromatic/AI gradient, particle, fog, or overdecorated halo exists;
- room photography remains the dominant content;
- booking console and checkout inputs are not obscured;
- reduced motion produces stable screenshots.

- [ ] **Step 4: Run request/payload comparison**

Record request method, route, query/body key names, and idempotency behavior for
availability, quote, services, coupon, checkout, lookup, and cancellation.
Compare against the contract table in the design spec. Do not retain secret
values, auth cookies, or payment data.

- [ ] **Step 5: Verify the operational boundary**

Use `git diff --name-only` and route smoke tests to prove no admin, reception,
or housekeeping source was changed by the customer redesign commits.

- [ ] **Step 6: Prepare the final handoff**

Report the exact quality commands, retained visual evidence paths, customer
routes covered, contract checks, and any pre-existing unrelated worktree
failures. Do not claim release readiness while a required gate is red.

---

## Plan self-review

- Spec coverage: homepage, rooms/detail, booking, experiences, offers,
  account/lookup, mobile composition, motion, accessibility, performance,
  contract preservation, and operational boundaries all map to Tasks 1–8.
- Placeholder scan: no unresolved placeholder or unspecified implementation
  step is used as a requirement; every task names files, commands, and expected
  checks.
- Type/contract consistency: the plan uses the existing query/body/header names
  and valid payment enum values from the approved design spec.
- Scope check: this is one customer-frontend subsystem; admin/operations remain
  explicitly excluded.
