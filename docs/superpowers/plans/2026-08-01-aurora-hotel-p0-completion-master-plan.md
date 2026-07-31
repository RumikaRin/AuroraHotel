# Aurora Hotel P0 Completion Master Plan

> Date: 2026-08-01  
> Target: Graduation-Demo Release (P0 Final Baseline)  
> Status: Phase 0 Audit Complete & Plan Locked  
> Target Repository: `D:\ProjectZ\AuroraHotel`  

---

## 1. Executive Summary & Audit Baseline (Phase 0 Evidence)

Antigravity has performed a non-destructive audit of the repository. All current uncommitted changes belong to the **Aurora Luxury UI Redesign baseline** and verified image/import fixes.

### 1.1 Repository & Workspace Environment
- **Active Branch:** `antigravity/aurora-p0-implementation`
- **Node.js Runtime:** `v24.16.0` | **npm:** `11.13.0`
- **Working Tree State:** Clean baseline diff (UI luxury styling, local aurora image assets, Next.js dynamic exports, Node ESM import compatibility).
- **Recent Git Log:**
  - `5fc9379` `merge: incorporate codex/aurora-ui-redesign luxury styling`
  - `573d532` `feat(public): add interactive public UI components and booking modal`
  - `6dfd578` `feat(ui): complete luxury UI redesign with dynamic header contrast and responsive hero font`
  - `3defd85` `chore: ignore .worktrees directory in eslint config`
  - `e11256c` `docs(evidence): record Aurora Hotel P0 release verification evidence`

### 1.2 Quality Gates Status Baseline

| Quality Gate | Command | Result | Evidence |
|---|---|---|---|
| **Lint** | `npm run lint` | ✅ **PASS** | 0 ESLint errors |
| **Typecheck** | `npm run typecheck` | ✅ **PASS** | 0 TypeScript errors |
| **Unit & Security** | `npm run test` | ✅ **PASS** | 91/91 unit/integration & Vitest security tests passed |
| **Design Lock** | `npm run design:check` | ✅ **PASS** | Design lock status verified |
| **Build** | `npm run build` | ✅ **PASS** | 16/16 static/dynamic pages compiled without errors |

---

## 2. Master Requirements Traceability Matrix (16 P0 Requirements)

| ID | Requirement Area | P0 Scope & Contract | Code Target | Test Contract | Status |
|---|---|---|---|---|---|
| **REQ-01** | Multi-room Booking | One booking owns 1..N rooms with per-room guest allocation. | `src/services/booking.service.ts`, `prisma/schema.prisma` | `tests/booking.service.test.ts` | 🔄 In Progress (Phase 2 & 3) |
| **REQ-02** | Day-level Price & Inventory | Price & inventory snapshot per stay date `[checkIn, checkOut)`. | `src/services/availability.service.ts`, `src/services/pricing.service.ts` | `tests/availability.service.test.ts` | ✅ Verified |
| **REQ-03** | Atomic Overbooking Protection | Transactional reservation with optimistic `version` check. | `src/services/availability.service.ts` | `tests/concurrency.test.ts` | ✅ Verified |
| **REQ-04** | Multi-room All-or-Nothing Hold | Rollback all rooms/nights if any single date/category unavailable. | `src/services/availability.service.ts` | `tests/availability.service.test.ts` | 🔄 In Progress (Phase 3) |
| **REQ-05** | Add-on Services & Pricing | Per-stay or per-night optional services included in quote & checkout. | `src/services/pricing.service.ts`, `src/app/booking/page.tsx` | `tests/pricing.service.test.ts` | 🔄 In Progress (Phase 2 & 3) |
| **REQ-06** | Promotions & Coupons | Code verification, expiration, total/per-user caps, non-stackable rules. | `src/services/coupon.service.ts` | `tests/coupon.service.test.ts` | 🔄 In Progress (Phase 2 & 3) |
| **REQ-07** | Idempotent Checkout & Anti-Replay | Client `idempotency-key` & `requestHash` in database transaction. | `src/services/checkout.service.ts` | `tests/checkout.service.test.ts` | ✅ Verified |
| **REQ-08** | Payment Events & Recovery | Audit log of payment state transitions, retry pending/failed payments. | `src/services/payment.service.ts` | `tests/payment.service.test.ts` | 🔄 In Progress (Phase 3) |
| **REQ-09** | Refunds & Anti-Double Refund | Refund state machine preventing over-refund or double refund. | `src/services/payment.service.ts` | `tests/payment.service.test.ts` | 🔄 In Progress (Phase 2 & 3) |
| **REQ-10** | Customer Stays & Profile | Authenticated view of upcoming/past stays, cancellation & recovery. | `src/app/account/page.tsx`, `src/app/my-bookings/page.tsx` | `tests/account.test.ts` | 🔄 In Progress (Phase 5) |
| **REQ-11** | Reception Operations | Check-in, check-out, room assignment, valid state transitions. | `src/services/operations.service.ts`, `src/app/operations/reception/page.tsx` | `tests/operations.service.test.ts` | ✅ Verified |
| **REQ-12** | Housekeeping Operations | Room status transitions (CLEAN -> DIRTY -> INSPECTING -> MAINTENANCE). | `src/services/operations.service.ts`, `src/app/operations/housekeeping/page.tsx` | `tests/operations.service.test.ts` | ✅ Verified |
| **REQ-13** | Admin Catalog & Inventory Blocks | Management of room categories, rate plans, inventory blocks, promotions. | `src/app/admin/*` | `tests/admin.test.ts` | 🔄 In Progress (Phase 6) |
| **REQ-14** | Occupancy & Revenue Reporting | Aggregated reports by stay date, booking date, room category. | `src/app/admin/reports/page.tsx` | `tests/reports.test.ts` | 🔄 In Progress (Phase 7) |
| **REQ-15** | Server-side RBAC & Audit Logs | 6 Roles (GUEST, CUSTOMER, RECEPTIONIST, HOUSEKEEPER, MANAGER, ADMIN), audit logs. | `src/server/auth/rbac.ts`, `src/services/audit.service.ts` | `tests/rbac.test.ts` | ✅ Verified |
| **REQ-16** | Media Upload & Quarantine Lifecycle | Manager/Admin upload, JPEG/PNG/WebP/AVIF, max 10MB/6000x6000, trash state. | `src/server/storage/blob-adapter.ts` | `tests/blob-adapter.test.ts` | ✅ Verified |

---

## 3. 12-Phase Implementation Roadmap

### Phase 1: Stabilize & Commit UI Redesign Baseline
- Commit current luxury UI redesign baseline & image fixes cleanly.
- Verify `npm run design:check` and responsive layouts across mobile, tablet, desktop.

### Phase 2: Complete P0 Data Schema Extensions
- Extend Prisma schema for `BookingRoom`, `BookingNight`, `BookingGuest`, `Service`, `BookingService`, `Promotion`, `Coupon`, `CouponUsage`, `InventoryBlock`, `PaymentEvent`, `Refund`.
- Resolve `CUSTOMER` vs `GUEST` role alignment across schema, RBAC, and seed.
- Generate clean forward Prisma migration and update deterministic seed.

### Phase 3: Domain Services Completion
- **Pricing & Quote Service:** Server-authoritative calculation of nightly breakdown, services, promos, taxes, fees.
- **Multi-room Hold & Inventory:** All-or-nothing transactional reservation.
- **Promotions & Coupons:** Validate scope, expiration, limits, concurrent redemption.
- **Payment Events & Refund State Machine:** Replay-proof payment transitions and idempotency for refunds.

### Phase 4: API Catalog & Boundary Hardening
- Synchronize `docs/architecture/API_CATALOG.md`.
- Enforce Zod validation, RBAC guards, rate limits, and audit logs on all route handlers and server actions.

### Phase 5: Three-Step Public Booking UX & Customer Account
- Step 1 (Search & Select), Step 2 (Guest Details & Services), Step 3 (Review & Payment).
- Secure booking lookup, customer stay history, payment recovery, and bilingual VI/EN support.

### Phase 6: Operations & Admin Dashboards
- Receptionist check-in/out & room assignment.
- Housekeeper room status queue.
- Manager/Admin category, rate plan, promotion, coupon, inventory block, and refund management with pagination.

### Phase 7: Occupancy & Revenue Reporting
- Exact SQL/Prisma aggregation queries by stay date, booking date, and category.
- Metrics for occupied nights, revenue, ADR, RevPAR, cancellations.

### Phase 8 & 9: Security Hardening & Negative Tests
- Add negative tests for concurrent overbooking, stale versions, duplicate checkouts, coupon replay, unsigned webhooks, amount mismatch, double refunds, and unauthorized cross-role access.

### Phase 10 & 11: Documentation, Release Evidence & Quality Gates
- Update `CHANGELOG.md`, diagrams, runbooks.
- Execute full quality gates sequence (`lint`, `typecheck`, `test`, `build`, `e2e`, Agent OS doctor/converge/diagrams, release verify).

### Phase 12: Cloud Deployment Verification
- Verify Neon PostgreSQL, Vercel Blob, NextAuth secrets, and cloud health checks. Mark owner blockers accurately if credentials are missing.

---

## 4. Immediate Action Plan

1. Execute Git commit for Phase 1 UI redesign baseline (`chore(ui): stabilize and commit luxury redesign baseline`).
2. Create baseline release evidence in `operations/release-evidence/aurora-p0-completion/baseline/`.
3. Proceed with Phase 2 Schema & Migration updates.
