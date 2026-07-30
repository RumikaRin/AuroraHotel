# Aurora Hotel Operations and Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver auditable receptionist, housekeeping, manager, and administrator workflows for stays, room readiness, catalog, rates, inventory, promotions, services, refunds, and basic reports.

**Architecture:** Operational routes use the same module services as public flows but apply staff permissions and transactional audit. Every workflow is a guarded state machine, every concurrent edit uses a version or expected-state condition, and admin pages remain compact operational tools rather than public editorial layouts.

**Tech Stack:** Next.js 15, TypeScript, PostgreSQL, Prisma 6, Auth.js v5, Zod, TOTP MFA, Vitest, Playwright.

---

### Task 1: Require MFA for Manager and Admin sessions

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260731040000_add_privileged_mfa/migration.sql`
- Modify: `.env.example`
- Modify: `src/auth.ts`
- Modify: `src/types/next-auth.d.ts`
- Create: `src/modules/identity/totp.ts`
- Create: `src/modules/identity/mfa.service.ts`
- Create: `src/app/[locale]/admin/mfa/page.tsx`
- Create: `src/app/api/auth/mfa/verify/route.ts`
- Create: `tests/unit/totp.test.ts`
- Create: `tests/security/privileged-mfa.test.ts`

- [ ] **Step 1: Write RFC 6238 and access tests**

Use published RFC 6238 SHA-1 vectors to test six-digit generation with a
30-second step. Security tests require:

- Manager/Admin password login without MFA verification redirects to MFA.
- Customer, Housekeeping, and Receptionist are not sent to privileged MFA.
- An expired or replayed code fails.
- Five failed codes lock the challenge for 15 minutes.
- A verified challenge stamps the specific AuthSession.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/totp.test.ts
npx vitest run tests/security/privileged-mfa.test.ts
```

Expected: FAIL because privileged MFA is absent.

- [ ] **Step 3: Add the persistence and crypto contract**

Add:

```prisma
model MfaChallenge {
  id             String   @id @default(cuid())
  userId         String
  sessionId      String
  failedAttempts Int      @default(0)
  lockedUntil    DateTime?
  verifiedAt     DateTime?
  expiresAt      DateTime
  createdAt      DateTime @default(now())
  @@index([userId, expiresAt])
}
```

Add encrypted TOTP secret fields to `User` and `mfaVerifiedAt` to
`AuthSession`. `MFA_ENCRYPTION_KEY` is a 32-byte base64 key. Encrypt secrets
with AES-256-GCM using a unique random 12-byte IV and authenticated tag. Hash
one-time recovery codes with bcrypt cost 12 and never store plaintext codes
after initial display.

- [ ] **Step 4: Implement the MFA gate**

- Require MFA for `MANAGER` and `ADMIN`.
- Compare TOTP codes across current, previous, and next time steps.
- Store the last accepted time counter per user and reject replay.
- Rotate the AuthSession identifier after successful MFA.
- Audit enrollment, disablement, recovery-code use, and lockout.
- Never log TOTP secrets, codes, recovery codes, or encryption material.

Run focused tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add prisma .env.example src/auth.ts src/types src/modules/identity src/app tests
git commit -m "feat: require MFA for privileged hotel roles"
```

### Task 2: Implement receptionist booking and stay transitions

**Files:**
- Create: `src/modules/operations/stay-state.ts`
- Create: `src/modules/operations/front-desk.service.ts`
- Create: `src/app/api/operations/bookings/route.ts`
- Create: `src/app/api/operations/bookings/[reference]/check-in/route.ts`
- Create: `src/app/api/operations/bookings/[reference]/check-out/route.ts`
- Create: `src/app/[locale]/operations/front-desk/page.tsx`
- Create: `src/app/[locale]/operations/front-desk/bookings/[reference]/page.tsx`
- Create: `src/components/operations/front-desk-board.tsx`
- Create: `tests/unit/stay-state.test.ts`
- Create: `tests/integration/front-desk.test.ts`

- [ ] **Step 1: Write transition tests**

```ts
assert.equal(canCheckIn({ booking: "CONFIRMED", room: "READY" }), true);
assert.equal(canCheckIn({ booking: "PENDING_PAYMENT", room: "READY" }), false);
assert.equal(canCheckIn({ booking: "CONFIRMED", room: "DIRTY" }), false);
assert.equal(canCheckOut({ booking: "CHECKED_IN", room: "OCCUPIED" }), true);
assert.equal(canCheckOut({ booking: "CONFIRMED", room: "READY" }), false);
```

Integration tests require room-type match, business-date window, payment policy,
permission, conditional updates, and audit rollback.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing operations module.

- [ ] **Step 3: Implement check-in**

In one transaction:

1. `requirePermission("booking:check-in")`;
2. load booking and selected physical rooms;
3. require booking `CONFIRMED`, check-in date allowed by policy, and every room
   type/quantity match;
4. update each physical room only from `READY` to `OCCUPIED`;
5. update booking only from `CONFIRMED` to `CHECKED_IN`;
6. attach physical rooms to BookingRoom;
7. append RoomStatusHistory and audit evidence.

Any failed room update rolls back the entire check-in.

- [ ] **Step 4: Implement check-out and staff-created bookings**

Check-out conditionally moves booking `CHECKED_IN → CHECKED_OUT` and each room
`OCCUPIED → DIRTY`, records history, and emits a housekeeping outbox event.
Staff-created bookings call the same quote and booking services with actor
evidence and idempotency scope `staff-booking:create`; no alternate inventory
path is allowed.

Run unit and integration tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/operations src/app/api/operations src/app/[locale]/operations src/components/operations tests
git commit -m "feat: add auditable front desk workflow"
```

### Task 3: Implement the housekeeping room-readiness state machine

**Files:**
- Create: `src/modules/operations/room-status.ts`
- Create: `src/modules/operations/housekeeping.service.ts`
- Create: `src/app/api/operations/rooms/[roomId]/status/route.ts`
- Create: `src/app/[locale]/operations/housekeeping/page.tsx`
- Create: `src/components/operations/housekeeping-board.tsx`
- Create: `tests/unit/room-status.test.ts`
- Create: `tests/integration/housekeeping.test.ts`

- [ ] **Step 1: Write allowed-transition tests**

```ts
const allowed = [
  ["DIRTY", "CLEANING"],
  ["CLEANING", "INSPECTING"],
  ["INSPECTING", "READY"],
] as const;
const denied = [
  ["DIRTY", "READY"],
  ["OCCUPIED", "READY"],
  ["OUT_OF_SERVICE", "READY"],
] as const;
```

Housekeeping may perform the allowed chain. Manager/Admin may also move a
non-occupied room to `OUT_OF_SERVICE` and return it to `DIRTY`.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with absent state machine.

- [ ] **Step 3: Implement conditional status updates**

The request includes `expectedStatus`, `nextStatus`, and `version`. Use:

```ts
tx.physicalRoom.updateMany({
  where: { id: roomId, status: expectedStatus, version },
  data: { status: nextStatus, version: { increment: 1 } },
});
```

Require `count === 1`, append RoomStatusHistory, and write audit in the same
transaction. Two staff updates from the same version produce one success and
one `409 INVALID_STATE_TRANSITION`.

- [ ] **Step 4: Build the mobile operational board**

Group rooms by floor and status; filters have text labels and counts. The main
action is keyboard accessible, has a confirmation when entering
`OUT_OF_SERVICE`, and shows version conflicts inline with refresh action.
No decorative animation delays status work.

Run unit/integration tests and Playwright mobile viewport coverage.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/operations src/app/api/operations/rooms src/app/[locale]/operations/housekeeping src/components/operations tests
git commit -m "feat: add housekeeping readiness workflow"
```

### Task 4: Add hotel, room type, physical room, and amenity administration

**Files:**
- Create: `src/modules/hotel/contracts.ts`
- Create: `src/modules/hotel/hotel-admin.service.ts`
- Create: `src/app/api/admin/hotel/route.ts`
- Create: `src/app/api/admin/room-types/route.ts`
- Create: `src/app/api/admin/room-types/[roomTypeId]/route.ts`
- Create: `src/app/api/admin/rooms/route.ts`
- Create: `src/app/api/admin/amenities/route.ts`
- Create: `src/app/[locale]/admin/hotel/page.tsx`
- Create: `src/app/[locale]/admin/room-types/page.tsx`
- Create: `src/app/[locale]/admin/rooms/page.tsx`
- Create: `tests/security/hotel-admin.test.ts`
- Create: `tests/integration/hotel-admin.test.ts`

- [ ] **Step 1: Write validation and authorization tests**

Test unique code/slug, bounded localized names/descriptions, capacity, area,
bed text, room number, floor, display order, and active status. Manager can
edit catalog; Receptionist and Housekeeping receive 403; only Admin may change
hotel-wide security/contact settings.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing hotel administration.

- [ ] **Step 3: Implement versioned catalog mutations**

Every mutation carries `version`. Update with `where: {id, version}` and
increment version. Soft-deactivate room types referenced by bookings; do not
delete historical relations. Physical rooms referenced by a stay may be moved
out of service but not deleted. Write before/after audit snapshots in the same
transaction.

- [ ] **Step 4: Build operational forms**

Forms use Manrope, compact field groups, visible validation, keyboard order,
and explicit save state. Public preview links open the localized room page.
Do not reuse the editorial Suite Spotlight as an admin editing surface.

Run tests, lint, and typecheck.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/hotel src/app/api/admin src/app/[locale]/admin src/components/admin tests
git commit -m "feat: manage Aurora hotel catalog"
```

### Task 5: Add rate, restriction, and inventory administration

**Files:**
- Create: `src/modules/pricing/rate-admin.service.ts`
- Create: `src/modules/inventory/inventory-admin.service.ts`
- Create: `src/app/api/admin/rates/route.ts`
- Create: `src/app/api/admin/restrictions/route.ts`
- Create: `src/app/api/admin/inventory/route.ts`
- Create: `src/app/[locale]/admin/rates/page.tsx`
- Create: `src/app/[locale]/admin/inventory/page.tsx`
- Create: `src/components/admin/rate-calendar.tsx`
- Create: `tests/unit/inventory-invariant.test.ts`
- Create: `tests/integration/rate-inventory-admin.test.ts`

- [ ] **Step 1: Write invariant and lost-update tests**

```ts
assert.equal(validateInventory({ sellable: 10, available: 6, held: 1, booked: 2, blocked: 1 }), true);
assert.equal(validateInventory({ sellable: 10, available: 7, held: 1, booked: 2, blocked: 1 }), false);
```

Run two changes from the same version and assert one success, one 409, and one
audit row. Test maximum 366-day bulk range, non-negative rate, minimum/maximum
stay consistency, and no inventory reduction below held+booked.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing admin services.

- [ ] **Step 3: Implement safe bulk updates**

- Parse and enumerate a maximum 366 business dates.
- Rate updates use upsert with expected version when a row exists.
- Inventory uses expected version and recomputes:

```ts
available = newSellable - held - booked - blocked;
```

- Reject when result is negative.
- Restrictions support min stay, max stay, closed-to-arrival, and
  closed-to-departure.
- One bulk request has one idempotency key and creates one parent audit record
  plus bounded affected-date metadata.
- A failure on any date rolls back the whole requested batch.

- [ ] **Step 4: Build the accessible calendar editor**

Use semantic table/grid navigation, sticky date/room headers, direct keyboard
entry, pagination by date window, and an explicit review screen before bulk
save. Do not render 365 days at once. Conflict response preserves edits and
shows server values for comparison.

Run focused tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/pricing src/modules/inventory src/app/api/admin src/app/[locale]/admin src/components/admin tests
git commit -m "feat: manage rates and inventory safely"
```

### Task 6: Add promotion, coupon, and service administration

**Files:**
- Create: `src/modules/pricing/promotion-admin.service.ts`
- Create: `src/modules/booking/service-admin.service.ts`
- Create: `src/app/api/admin/promotions/route.ts`
- Create: `src/app/api/admin/coupons/route.ts`
- Create: `src/app/api/admin/services/route.ts`
- Create: `src/app/[locale]/admin/promotions/page.tsx`
- Create: `src/app/[locale]/admin/services/page.tsx`
- Create: `tests/unit/promotion-rules.test.ts`
- Create: `tests/integration/promotion-admin.test.ts`

- [ ] **Step 1: Write rule tests**

Test percent 1–100, fixed amount positive, validity range, booking/stay windows,
minimum nights, eligible room/rate sets, exclusive stacking, coupon cap, and
inactive service. Two concurrent redemptions for the final coupon use permit
one winner.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing services.

- [ ] **Step 3: Implement audited mutations**

Manager/Admin can create and version-update promotions, coupons, and services.
Coupon redemption remains in booking transaction and conditionally increments
usage only where `usageCount < usageLimit`. Historical booking snapshots never
change when an offer is edited or deactivated.

- [ ] **Step 4: Build admin pages and public consistency test**

After changing an offer, create a fresh quote and assert it uses the new rule;
load an older booking and assert its snapshot remains unchanged. Admin forms
display stacking and validity rules before save.

Run tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/pricing src/modules/booking src/app/api/admin src/app/[locale]/admin tests
git commit -m "feat: manage promotions and hotel services"
```

### Task 7: Implement refund authorization and amount caps

**Files:**
- Create: `src/modules/payment/refund.service.ts`
- Create: `src/modules/payment/refund-provider.ts`
- Create: `src/app/api/admin/bookings/[reference]/refunds/route.ts`
- Create: `src/app/[locale]/admin/bookings/[reference]/refund/page.tsx`
- Create: `tests/unit/refund-policy.test.ts`
- Create: `tests/integration/refund-concurrency.test.ts`

- [ ] **Step 1: Write cap and permission tests**

Test:

- Receptionist cannot refund.
- Manager/Admin can refund only a succeeded payment.
- Amount is positive and does not exceed `paidAmount - refundedAmount`.
- 20 concurrent full-refund requests create one accepted refund.
- Same idempotency key returns the same refund.
- Provider failure leaves a retryable failed refund without incrementing the
  succeeded refunded amount.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing refund service.

- [ ] **Step 3: Implement conditional refund reservation**

Read current `paidAmount` and `refundedAmount`, then:

```ts
tx.booking.updateMany({
  where: {
    id: bookingId,
    paidAmount: { gte: currentRefunded + requestedAmount },
    refundedAmount: currentRefunded,
  },
  data: { refundedAmount: { increment: requestedAmount } },
});
```

Require `count === 1`, create a pending refund and audit record, then commit.
When cancellation already created a pending Refund, execute that row instead
of creating another refund.
Call the local refund provider after commit. On provider failure, conditionally
mark refund failed and decrement the reserved amount exactly once in a
compensating transaction. On success, conditionally mark it succeeded and add
outbox evidence.

- [ ] **Step 4: Build the confirmation UI**

Require reason, show paid/refunded/refundable totals, require explicit
confirmation, and display provider result as a page-level status. The UI never
accepts raw card/bank details.

Run tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/payment src/app/api/admin src/app/[locale]/admin tests
git commit -m "feat: cap and audit hotel refunds"
```

### Task 8: Add occupancy and net-revenue reports

**Files:**
- Create: `src/modules/reporting/reporting.service.ts`
- Create: `src/app/api/admin/reports/occupancy/route.ts`
- Create: `src/app/api/admin/reports/revenue/route.ts`
- Create: `src/app/[locale]/admin/reports/page.tsx`
- Create: `src/components/admin/report-table.tsx`
- Create: `tests/unit/reporting.test.ts`
- Create: `tests/integration/reporting.test.ts`

- [ ] **Step 1: Write report definition tests**

Definitions:

```text
available room nights = sum sellable - blocked
occupied room nights  = sum booked for CONFIRMED/CHECKED_IN/CHECKED_OUT stays
occupancy percent     = occupied / available * 100, zero when denominator is zero
gross revenue         = succeeded captured amount in range
net revenue           = gross revenue - succeeded refunds in range
```

Test cancelled bookings, pending/failed payments, refunds, blocked inventory,
timezone date edges, and zero denominators.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing reporting service.

- [ ] **Step 3: Implement bounded reporting queries**

Manager/Admin only. Accept a maximum 366-day range. Use database aggregation
and return daily plus total rows. Money remains integer VND. Each response
includes definition version `aurora-report-v1`, timezone, generated timestamp,
and filters so screenshots are auditable.

- [ ] **Step 4: Build accessible report tables**

Provide table-first output, summary metrics, date filters, and CSV generated
from the same server result. Charts are optional and cannot be the only data
representation. Prevent spreadsheet formula injection by prefixing exported
cells beginning `=`, `+`, `-`, or `@` with an apostrophe.

Run tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/reporting src/app/api/admin/reports src/app/[locale]/admin/reports src/components/admin tests
git commit -m "feat: report hotel occupancy and net revenue"
```

### Task 9: Run operational E2E and attest the slice

**Files:**
- Create: `e2e/operations.spec.ts`
- Create: `e2e/admin.spec.ts`
- Modify: `docs/architecture/API_CATALOG.md`
- Modify: `docs/security/AUTHORIZATION_MATRIX.md`
- Modify: `docs/product/REQUIREMENTS_TRACEABILITY.md`
- Modify: `docs/architecture/diagrams/role-permission-map.mmd`
- Modify: `docs/architecture/diagrams/modules.mmd`
- Create: `operations/release-evidence/aurora-p0-slice-04/README.md`
- Create: `operations/release-evidence/aurora-p0-slice-04/commands.jsonl`
- Create: `operations/release-evidence/aurora-p0-slice-04/artifacts.sha256`

- [ ] **Step 1: Write role E2E journeys**

Cover:

1. unauthorized admin denial;
2. privileged MFA challenge;
3. receptionist check-in and check-out;
4. housekeeping dirty → cleaning → inspecting → ready;
5. manager rate and inventory version update;
6. manager promotion/service update;
7. manager refund with replayed click;
8. Admin-only access-management denial for Manager;
9. occupancy and revenue output after the stay.

- [ ] **Step 2: Run focused tests**

```powershell
npx vitest run tests/integration/front-desk.test.ts tests/integration/housekeeping.test.ts tests/integration/rate-inventory-admin.test.ts tests/integration/refund-concurrency.test.ts tests/integration/reporting.test.ts
npx playwright test e2e/operations.spec.ts e2e/admin.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Update requirement mapping and diagrams**

Mark REQ-007, REQ-008, REQ-009, and REQ-013 implemented with exact
implementation/test/diagram references. Validate all diagram sources.

- [ ] **Step 4: Run full gates and Agent OS checks**

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Then from `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

Record real output and verify artifact hashes.

- [ ] **Step 5: Commit**

```powershell
git add e2e docs operations/release-evidence/aurora-p0-slice-04
git commit -m "docs: attest Aurora operations slice"
git status --short
```

Expected: working tree empty.
