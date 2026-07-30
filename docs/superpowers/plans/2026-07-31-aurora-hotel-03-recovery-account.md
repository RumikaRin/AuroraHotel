# Aurora Hotel Recovery and Customer Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let guests safely recover, view, pay, and cancel bookings while giving authenticated customers a private stay history without leaking whether another booking exists.

**Architecture:** Guest lookup issues a short-lived, single-purpose access link through the preview-email outbox; authenticated customers use ownership checks. Cancellation and payment retry are separate conditional transactions against the existing booking and never create a second booking.

**Tech Stack:** Next.js 15, TypeScript, PostgreSQL, Prisma 6, Auth.js v5, Zod, HMAC-SHA256, Vitest, Playwright.

---

### Task 1: Implement enumeration-resistant guest lookup tokens

**Files:**
- Create: `src/modules/booking/lookup-token.ts`
- Create: `src/modules/booking/request-booking-access.service.ts`
- Create: `src/modules/booking/consume-booking-access.service.ts`
- Create: `src/app/api/booking-access/route.ts`
- Create: `src/app/api/booking-access/consume/route.ts`
- Create: `tests/unit/lookup-token.test.ts`
- Create: `tests/security/booking-lookup.test.ts`

- [ ] **Step 1: Write token and response tests**

```ts
const token = signLookupToken({
  bookingId: "booking-1",
  emailHash: sha256("guest@example.com"),
  expiresAt: 1_786_000_000,
}, secret);
assert.deepEqual(verifyLookupToken(token, secret, 1_785_999_999), {
  bookingId: "booking-1",
  emailHash: sha256("guest@example.com"),
  expiresAt: 1_786_000_000,
});
assert.throws(() => verifyLookupToken(`${token}x`, secret, 1_785_999_999));
assert.throws(() => verifyLookupToken(token, secret, 1_786_000_001));
```

Security tests compare matching and non-matching lookup responses and require
the same status, stable public body, cache policy, and no booking identifier.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/lookup-token.test.ts
npx vitest run tests/security/booking-lookup.test.ts
```

Expected: FAIL with missing lookup module and route.

- [ ] **Step 3: Implement token signing**

- Normalize email to lowercase and trim.
- Sign base64url canonical JSON with HMAC-SHA256.
- Verify equal-length signatures with `timingSafeEqual`.
- Include booking ID, email hash, purpose `booking-access`, random nonce,
  issued time, and 15-minute expiry.
- Never include email, guest name, price, or booking reference in the token.
- Hash the nonce in a one-use `IdempotencyRecord` scope
  `booking-access:consume`.

- [ ] **Step 4: Implement the request/consume flow**

`POST /api/booking-access` accepts bounded `reference` and `email`, applies the
public-write limiter, and always returns:

```json
{
  "accepted": true,
  "message": "If the booking details match, an access link will be sent."
}
```

When a match exists, write a `BOOKING_ACCESS_LINK` outbox message. The preview
email provider exposes the message only in local development through an
authenticated local preview page. Consuming a valid token sets a 15-minute,
HTTP-only, secure-in-production, same-site-lax cookie scoped to the booking
management route and invalidates the nonce.

Run focused tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/booking src/app/api/booking-access tests
git commit -m "feat: add safe guest booking access"
```

### Task 2: Add ownership-safe booking detail and status recovery

**Files:**
- Create: `src/modules/booking/get-booking.service.ts`
- Create: `src/modules/booking/booking-access.policy.ts`
- Create: `src/app/api/bookings/[reference]/route.ts`
- Create: `src/app/[locale]/(booking)/manage-booking/page.tsx`
- Create: `src/app/[locale]/(booking)/booking/[reference]/manage/page.tsx`
- Create: `src/components/booking/booking-status.tsx`
- Create: `tests/unit/booking-access-policy.test.ts`
- Create: `tests/security/booking-detail.test.ts`

- [ ] **Step 1: Write access-policy tests**

```ts
assert.equal(canReadBooking({ customerId: "c1" }, { userId: "c1" }), true);
assert.equal(canReadBooking({ customerId: "c1" }, { userId: "c2" }), false);
assert.equal(canReadBooking({ customerId: null }, { lookupBookingId: "b1", bookingId: "b1" }), true);
assert.equal(canReadBooking({ customerId: null }, { lookupBookingId: "b2", bookingId: "b1" }), false);
```

Test that a staff role does not gain booking detail through the public route;
staff uses the operations service and receives an audit trail.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing policy.

- [ ] **Step 3: Implement the read model**

Return:

```ts
type BookingDetailView = {
  reference: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
  paymentStatus: "NOT_REQUIRED" | "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";
  checkIn: string;
  checkOut: string;
  rooms: Array<{ roomTypeName: string; quantity: number; ratePlanName: string }>;
  totals: { subtotal: number; discount: number; taxes: number; fees: number; services: number; total: number };
  cancellationPolicy: string;
  nextActions: Array<"PAY" | "CANCEL" | "CONTACT_HOTEL">;
};
```

Exclude password data, session data, payment evidence, provider payloads,
internal IDs, audit records, and other guests' sensitive details.

- [ ] **Step 4: Implement explicit recovery states**

- `PENDING_PAYMENT`: poll verified server state and show pay-again only after
  an attempt is terminal or timed out by policy.
- `FAILED`: explain failure and offer new attempt for the same booking.
- `CONFIRMED`: show confirmation, policies, and permitted cancellation.
- `CANCELLED`: show refund status when applicable.
- Never map pending, missing callback, or browser return to success.

Run unit/security tests and typecheck.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/booking src/app/api/bookings src/app/[locale] src/components/booking tests
git commit -m "feat: add secure booking recovery views"
```

### Task 3: Implement policy-based cancellation and inventory release

**Files:**
- Create: `src/modules/booking/cancellation-policy.ts`
- Create: `src/modules/booking/cancel-booking.service.ts`
- Create: `src/app/api/bookings/[reference]/cancel/route.ts`
- Create: `tests/unit/cancellation-policy.test.ts`
- Create: `tests/integration/cancellation.test.ts`

- [ ] **Step 1: Write cancellation rule tests**

Use hotel timezone `Asia/Ho_Chi_Minh` and immutable booking snapshots:

```ts
assert.deepEqual(
  evaluateCancellation({
    status: "CONFIRMED",
    checkIn: "2026-08-10",
    now: new Date("2026-08-07T17:00:00.000Z"),
    freeUntilHours: 48,
    totalPaid: 4_000_000,
  }),
  { allowed: true, fee: 0, refundDue: 4_000_000 },
);
```

Test cancellation inside penalty window, after check-in boundary, already
cancelled, checked-in, and pay-at-hotel.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with absent policy.

- [ ] **Step 3: Implement the cancellation transaction**

Inside one transaction:

1. authorize owner or valid lookup cookie;
2. evaluate the snapshotted cancellation policy;
3. conditionally update booking from `CONFIRMED` or `PENDING_PAYMENT` to
   `CANCELLED`;
4. conditionally release `booked` or `held` inventory exactly once;
5. transition active hold or pending attempts to terminal states;
6. create `Cancellation` with fee/refund snapshot;
7. create one `Refund` in `PENDING` when `refundDue > 0`;
8. write audit and cancellation outbox evidence.

Use an `Idempotency-Key` scope `booking:cancel:{bookingId}`. A replay returns the
same cancellation. A different payload with the same key returns 409.

- [ ] **Step 4: Prove rollback and replay**

Force one inventory-night release to fail and assert booking, cancellation,
refund, and all inventory remain unchanged. Submit 20 same-key cancellations
and assert one cancellation and one refund request.

Run focused tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/booking src/app/api/bookings tests/unit/cancellation-policy.test.ts tests/integration/cancellation.test.ts
git commit -m "feat: cancel bookings and release inventory atomically"
```

### Task 4: Retry payment without creating a booking

**Files:**
- Create: `src/modules/payment/create-payment-attempt.service.ts`
- Create: `src/app/api/bookings/[reference]/payment-attempts/route.ts`
- Create: `tests/integration/payment-retry.test.ts`
- Modify: `src/components/booking/booking-status.tsx`

- [ ] **Step 1: Write retry tests**

Assert:

- failed attempt + confirmed ownership creates one new pending attempt;
- pending attempt returns the existing attempt;
- succeeded attempt rejects retry;
- cancelled/expired booking rejects retry;
- 20 same-key retries create one new attempt;
- booking count remains one.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing retry service.

- [ ] **Step 3: Implement retry transaction**

- Use idempotency scope `payment-attempt:create:{bookingId}`.
- Lock the booking intent through a conditional state check.
- Require booking `PENDING_PAYMENT`, non-expired active hold, and outstanding
  amount greater than zero.
- Return an existing pending attempt instead of opening another.
- Create a unique internal reference and provider transaction reference.
- Commit before calling `PaymentProvider.createAttempt`.
- If provider creation fails, conditionally mark that attempt `FAILED`; do not
  cancel the booking until its hold policy expires.

- [ ] **Step 4: Verify and update UI**

The UI reuses the stable retry idempotency key during network retries and
returns to status polling. It never returns to room selection or creates a new
booking unless the hold expired.

Run integration tests and E2E payment failure/pending cases.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/payment src/app/api/bookings src/components/booking tests/integration/payment-retry.test.ts
git commit -m "feat: retry payment on the existing booking"
```

### Task 5: Build the authenticated customer account

**Files:**
- Delete: `src/app/profile/page.tsx`
- Create: `src/app/[locale]/account/layout.tsx`
- Create: `src/app/[locale]/account/page.tsx`
- Create: `src/app/[locale]/account/bookings/page.tsx`
- Create: `src/app/[locale]/account/bookings/[reference]/page.tsx`
- Create: `src/modules/booking/list-customer-bookings.service.ts`
- Create: `src/components/booking/customer-booking-list.tsx`
- Create: `tests/security/customer-account.test.ts`
- Create: `e2e/customer-account.spec.ts`

- [ ] **Step 1: Write authorization and journey tests**

Security tests require 401 for anonymous access, generic 404 for another
customer's reference, and a bounded cursor page size of at most 20.

Playwright signs in as the seeded customer, views upcoming and past stays,
opens one booking, and signs out. It then confirms the protected route redirects
to the locale-correct login path.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL because account routes and customer query are absent.

- [ ] **Step 3: Implement account queries**

- Use `requireUser` and filter every query by `customerId=user.id`.
- Split upcoming (`checkOut >= today` and not cancelled) and past/cancelled.
- Use cursor pagination ordered by `createdAt desc, id desc`.
- Select only list fields; do not load payment evidence or guest PII into list
  pages.
- Customer booking detail reuses `getBooking` with owner authorization.

- [ ] **Step 4: Implement accessible account UI**

Use the public tokens but a quieter transactional layout. Include visible
status text, dates, total, payment state, and allowed next actions. Restore
focus after pagination and announce updated result counts.

Run security and E2E tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/app/[locale]/account src/app/profile src/modules/booking src/components/booking tests/security/customer-account.test.ts e2e/customer-account.spec.ts
git commit -m "feat: add private customer stay history"
```

### Task 6: Add guest lookup, cancellation, and recovery E2E

**Files:**
- Create: `e2e/booking-recovery.spec.ts`
- Modify: `tests/helpers/fixtures.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Add deterministic fixtures**

Seed these independent bookings:

```text
AH-E2E-PENDING   pending mock payment, active hold
AH-E2E-FAILED    failed payment, active hold
AH-E2E-CONFIRMED paid and cancellable
AH-E2E-PENALTY   paid and inside cancellation penalty
AH-E2E-PAST      checked out
```

Each fixture uses a distinct room/date window so tests cannot affect each
other.

- [ ] **Step 2: Write browser journeys**

Cover:

1. unmatched lookup returns generic accepted message;
2. matched lookup produces a preview access email and valid management link;
3. pending payment remains pending after return-page reload;
4. failed payment retry confirms the same booking reference;
5. cancellable booking releases inventory and displays refund pending;
6. repeated cancel click returns the same cancellation;
7. another customer cannot open the booking.

- [ ] **Step 3: Run recovery E2E**

```powershell
npx playwright test e2e/booking-recovery.spec.ts e2e/customer-account.spec.ts
```

Expected: all pass with one Playwright worker.

- [ ] **Step 4: Run accessibility assertions**

Add axe scans at lookup, management, cancellation confirmation, account list,
and account detail. Exercise keyboard-only dialog confirmation and focus return.

Run the same E2E files.

Expected: no serious or critical violations.

- [ ] **Step 5: Commit**

```powershell
git add e2e tests/helpers/fixtures.ts playwright.config.ts
git commit -m "test: cover booking recovery and accounts"
```

### Task 7: Converge recovery documentation and evidence

**Files:**
- Modify: `docs/architecture/API_CATALOG.md`
- Modify: `docs/product/REQUIREMENTS_TRACEABILITY.md`
- Modify: `docs/security/THREAT_MODEL.md`
- Modify: `docs/architecture/diagrams/request-flow.mmd`
- Modify: `docs/architecture/diagrams/data-lifecycle.mmd`
- Create: `operations/release-evidence/aurora-p0-slice-03/README.md`
- Create: `operations/release-evidence/aurora-p0-slice-03/commands.jsonl`
- Create: `operations/release-evidence/aurora-p0-slice-03/artifacts.sha256`

- [ ] **Step 1: Update API and traceability contracts**

Map REQ-005 and REQ-006 to exact services, routes, security tests, E2E tests,
and diagrams. Document lookup token purpose, expiry, one-use nonce, cookie
scope, generic response, cancellation idempotency, and payment retry behavior.

- [ ] **Step 2: Run adversarial tests**

```powershell
npx vitest run tests/security/booking-lookup.test.ts tests/security/booking-detail.test.ts tests/security/customer-account.test.ts
npx vitest run tests/integration/cancellation.test.ts tests/integration/payment-retry.test.ts
npx playwright test e2e/booking-recovery.spec.ts e2e/customer-account.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Run all five application gates**

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Expected: all exit 0.

- [ ] **Step 4: Run Agent OS checks and hash evidence**

From `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

Record real output and verify `artifacts.sha256`.

- [ ] **Step 5: Commit**

```powershell
git add docs operations/release-evidence/aurora-p0-slice-03
git commit -m "docs: attest Aurora recovery slice"
git status --short
```

Expected: working tree empty.
