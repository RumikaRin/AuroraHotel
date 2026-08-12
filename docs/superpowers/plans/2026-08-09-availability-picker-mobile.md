# Aurora Availability Picker Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Homepage booking console's browser-native date and guest controls with an accessible Aurora picker that feels deliberate on both mobile and desktop without changing booking inputs or API contracts.

**Architecture:** Add one client-only `AvailabilityPicker` presentation component. It owns open/close, range-selection, focus-return, Escape and outside-click behavior; `HeroCarousel` remains the owner of `checkIn`, `checkOut`, `guests`, availability lookup, query-string construction, redirect, notices, and validation boundaries. Desktop renders anchored popovers; mobile renders a modal bottom sheet from the same state, so no endpoint, payload, authentication, payment, or database layer changes.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS keyframes/transitions, Playwright.

---

### Task 1: Lock the customer-facing behavior with a failing browser test

**Files:**
- Modify: `e2e/aurora-customer-redesign.spec.ts`

- [x] **Step 1: Add the failing desktop assertion**

```ts
test("homepage guest picker uses a custom accessible listbox", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.booking-key select')).toHaveCount(0);
  await page.getByRole("button", { name: /số khách/i }).click();
  await expect(page.getByRole("listbox", { name: /chọn số khách/i })).toBeVisible();
  await page.getByRole("option", { name: /3 khách.*1 phòng/i }).click();
  await expect(page.getByRole("button", { name: /số khách/i })).toContainText("3 khách");
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts --grep "custom accessible listbox" --reporter=line`

Expected: FAIL because the homepage still exposes `.booking-key select` and no accessible listbox trigger exists.

- [x] **Step 3: Add the failing mobile sheet assertion**

```ts
test("homepage date picker becomes a mobile bottom sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator('.booking-key input[type="date"]')).toHaveCount(0);
  await page.getByRole("button", { name: /ngày nhận phòng/i }).click();
  await expect(page.getByRole("dialog", { name: /chọn ngày lưu trú/i })).toBeVisible();
});
```

- [x] **Step 4: Run the focused test and verify RED**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts --grep "mobile bottom sheet" --reporter=line`

Expected: FAIL because the page still renders `input[type="date"]` and no dialog exists.

### Task 2: Build the custom picker without moving booking business logic

**Files:**
- Create: `src/components/booking/AvailabilityPicker.tsx`
- Modify: `src/components/home/HeroCarousel.tsx`

- [x] **Step 1: Create the controlled presentation boundary**

```ts
export interface AvailabilityPickerProps {
  checkIn: string;
  checkOut: string;
  guests: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: string) => void;
}
```

Render field buttons instead of `input[type="date"]` and `select`; keep values as ISO `YYYY-MM-DD` strings. Use local-date helpers for calendar math and `Intl.DateTimeFormat("vi-VN")` for labels, never mutate the input contract.

- [x] **Step 2: Implement selection and dismissal semantics**

```ts
// Date sequence: select check-in -> select a later check-out -> close.
// Guest sequence: select one of the existing 1..4 values -> close.
// Escape, the dismiss button, and backdrop/outside click close without changing values.
// Restore focus to the originating field; render visible focus rings.
```

Use `role="dialog"` for the date picker, `role="listbox"`/`role="option"` for guests, `aria-expanded`, `aria-controls`, `aria-selected`, and a live selected-range summary. On mobile the dialog becomes a bottom sheet; at desktop it stays an anchored panel below its trigger.

- [x] **Step 3: Preserve HeroCarousel's request path exactly**

```tsx
<AvailabilityPicker
  checkIn={checkIn}
  checkOut={checkOut}
  guests={guests}
  onCheckInChange={setCheckIn}
  onCheckOutChange={setCheckOut}
  onGuestsChange={setGuests}
/>
```

Do not modify `handleBookingSearch`, `/api/availability`, the `router.push` query keys, timeouts, notice text, backend validation, or any administrative/operations file.

- [x] **Step 4: Add the responsive motion layer**

```css
/* desktop: opacity + translateY + tiny scale from the trigger;
   mobile: opacity + translateY from the safe-area bottom;
   reduced motion: no transform animation; only immediate state change. */
@media (prefers-reduced-motion: reduce) { .availability-picker-panel { animation: none; } }
```

Use warm-ivory surfaces, espresso text, and antique-brass only for the selected state and focus accent. Keep the light, non-glass editorial surface in the locked Aurora system.

### Task 3: Turn both tests green and verify the responsive interaction

**Files:**
- Modify: `e2e/aurora-customer-redesign.spec.ts`
- Modify: `src/components/booking/AvailabilityPicker.tsx`
- Modify: `src/components/home/HeroCarousel.tsx`

- [x] **Step 1: Run focused picker tests after implementation**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts --grep "custom accessible listbox|mobile bottom sheet" --reporter=line`

Expected: both tests PASS.

- [x] **Step 2: Exercise the existing availability handoff**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts --grep "homepage" --reporter=line`

Expected: homepage retains its existing availability-search behavior and no native picker regressions are reported.

- [x] **Step 3: Check mobile and desktop visual bounds manually**

At `390x844` confirm no horizontal overflow, 44px or larger touch targets, a compact trigger in the booking console, and a non-clipped bottom sheet. At `1440x900` confirm the popover is anchored, not clipped by the hero, and the call-to-action remains visible.

### Task 4: Run the project quality gates

**Files:**
- Verify only

- [x] **Step 1: Run static and contract checks**

Run: `npm run ui:contract-check && npm run lint && npm run typecheck && npm run design:check`

Expected: exit code 0.

- [x] **Step 2: Run test and production build**

Run: `npm test && npm run build`

Expected: exit code 0.

- [x] **Step 3: Run all redesigned customer E2E coverage**

Run: `npx playwright test e2e/aurora-customer-redesign.spec.ts --reporter=line`

Expected: exit code 0; report any environment-only blocker separately from UI results.
