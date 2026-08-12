# Public Customer Polish Implementation Plan

> **For agentic workers:** Execute inline in this workspace. Do not stage or commit because the worktree contains pre-existing user changes.

**Goal:** Make customer-facing room discovery, experience storytelling, language selection, and mobile navigation feel coherent without changing booking APIs or business logic.

**Architecture:** Keep the existing booking state and API calls authoritative. Add a reusable, accessible select control for existing client-side values; use a client locale provider for public customer copy; and keep image-led visual changes in the customer component layer only.

**Tech Stack:** Next.js 15, React 19, TypeScript, existing CSS custom properties, Playwright.

---

### Task 1: Lock interaction contracts with browser tests

**Files:**
- Modify: `e2e/aurora-customer-redesign.spec.ts`

- [ ] Add a failing test that asserts `/rooms` has an image-backed hero and uses a custom listbox instead of native selects in its filter bar.
- [ ] Add a failing test that asserts `/booking` exposes custom guest, room and rate-plan controls while retaining its existing quote request payload.
- [ ] Add a failing mobile test that requires the close control to live inside the navigation overlay.
- [ ] Add a failing test that switches to English and verifies a route-level customer heading changes, not only the header label.
- [ ] Run `npx playwright test e2e/aurora-customer-redesign.spec.ts --grep "customer polish" --reporter=line` and record the expected red failures.

### Task 2: Reusable select and booking controls

**Files:**
- Create: `src/components/controls/AuroraSelect.tsx`
- Modify: `src/components/rooms/RoomFilterBar.tsx`
- Modify: `src/app/booking/page.tsx`

- [ ] Keep `FilterCriteria` values and callbacks unchanged while replacing the two native room filters with labelled buttons and `role="listbox"` options.
- [ ] Keep `checkIn`, `checkOut`, `guests`, `roomCategoryId`, and `ratePlanId` state unchanged while replacing native booking selects with the reusable control.
- [ ] Make desktop use a positioned popover and compact screens use a labelled modal sheet; provide Escape and outside-click dismissal plus a visible selected state.
- [ ] Run the focussed Playwright test and verify it passes.

### Task 3: Locale state and clear mobile exit

**Files:**
- Create: `src/components/i18n/LanguageProvider.tsx`
- Create: `src/components/i18n/LocalizedText.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/domain/i18n.ts`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/app/rooms/RoomsClient.tsx`
- Modify: `src/app/experiences/page.tsx`

- [ ] Persist the chosen locale in the browser and set the document language attribute, with Vietnamese as the initial locale.
- [ ] Convert shared header/footer and the pages changed by this task to real Vietnamese/English copy keys.
- [ ] Add a distinct close button inside the mobile menu overlay, retain Escape and focus restoration, and never overlap it with the fixed header.
- [ ] Run the focussed Playwright language/mobile navigation test and verify it passes.

### Task 4: Photo-led room and experience composition

**Files:**
- Modify: `src/app/rooms/RoomsClient.tsx`
- Modify: `src/app/experiences/page.tsx`

- [ ] Put an existing provenance-safe Aurora resort or hotel image behind the rooms hero with a calm contrast overlay and direct-on-image typography.
- [ ] Turn the experience page into a photo-led sequence with three specific moments, clear route CTAs, and mobile stacking; do not add heavy scroll effects or fabricated promises.
- [ ] Run the focussed visual contract tests, inspect desktop and 390px mobile screenshots, and correct overflow/contrast issues.

### Task 5: Full verification

**Files:**
- Verify only: changed customer UI files and test evidence

- [ ] Run `npm run ui:contract-check && npm run lint && npm run typecheck && npm run design:check`.
- [ ] Run `npm test && npm run build`.
- [ ] Run `npx playwright test e2e/aurora-customer-redesign.spec.ts --reporter=line`.
- [ ] Run `git diff --check` and report only the files changed for this request.
