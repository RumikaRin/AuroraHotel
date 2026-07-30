# Aurora Hotel Booking Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first complete guest journey from availability search through atomic booking, verified mock payment, and database-backed confirmation, with no overselling or duplicate booking under replay.

**Architecture:** Pure availability and pricing services create server-owned quotes. A single Prisma transaction claims idempotency, conditionally reserves every stay night, writes immutable booking snapshots, creates a payment attempt, and records evidence; only a verified payment event can convert held inventory to booked inventory.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, PostgreSQL, Prisma 6, Zod, Tailwind CSS, Vitest, Playwright, HMAC-SHA256.

---

## Public contract

```text
POST /api/quotes
  request: stay dates, occupancy, room count, optional promotion code
  response: available room/rate options and server-owned totals

POST /api/bookings
  header: Idempotency-Key
  request: quoteId, selected option, guest data, service IDs, payment method
  response: booking reference, payment attempt, next action

GET /api/booking-intents/:key
  response: processing, completed booking, or generic not found

POST /api/webhooks/mock-payment
  input: raw provider body plus x-mock-signature
  response: verified processing acknowledgement

GET /api/bookings/:reference/status
  response: booking and payment state without sensitive guest fields
```

### Task 1: Define bounded booking, quote, and payment contracts

**Files:**
- Create: `src/modules/booking/contracts.ts`
- Create: `src/modules/pricing/contracts.ts`
- Create: `src/modules/payment/contracts.ts`
- Modify: `src/lib/api-error.ts`
- Create: `tests/unit/booking-contracts.test.ts`

- [ ] **Step 1: Write schema boundary tests**

```ts
const validSearch = {
  checkIn: "2026-08-10",
  checkOut: "2026-08-12",
  rooms: 1,
  adults: 2,
  children: 0,
};
assert.equal(searchSchema.safeParse(validSearch).success, true);
assert.equal(searchSchema.safeParse({ ...validSearch, checkOut: "2026-08-10" }).success, false);
assert.equal(searchSchema.safeParse({ ...validSearch, rooms: 6 }).success, false);
assert.equal(searchSchema.safeParse({ ...validSearch, promotionCode: "X".repeat(33) }).success, false);
```

Test guest names, email, phone, special-request length, service quantity,
payment method, UUID/CUID identifiers, and a maximum 30-night stay.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/booking-contracts.test.ts
```

Expected: FAIL with missing contracts.

- [ ] **Step 3: Implement the schemas and types**

```ts
export const searchSchema = z.object({
  checkIn: businessDateSchema,
  checkOut: businessDateSchema,
  rooms: z.coerce.number().int().min(1).max(5),
  adults: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(12),
  promotionCode: z.string().trim().toUpperCase().max(32).optional(),
}).superRefine(validateForwardStayOfAtMost30Nights);

export const createBookingSchema = z.object({
  quoteId: z.string().cuid(),
  optionId: z.string().min(16).max(200),
  guests: z.array(guestSchema).min(1).max(20),
  services: z.array(z.object({
    serviceId: z.string().cuid(),
    quantity: z.number().int().min(1).max(10),
  })).max(10),
  paymentMethod: z.enum(["MOCK", "PAY_AT_HOTEL"]),
  specialRequest: z.string().trim().max(1000).optional(),
  locale: z.enum(["vi", "en"]),
});
```

Add stable API error codes:

```ts
"AVAILABILITY_CHANGED" | "PRICE_CHANGED" | "QUOTE_EXPIRED" |
"IDEMPOTENCY_KEY_REUSED" | "OPERATION_PROCESSING" |
"PAYMENT_PENDING" | "INVALID_PAYMENT_SIGNATURE" | "PAYMENT_MISMATCH" |
"INVALID_STATE_TRANSITION"
```

- [ ] **Step 4: Run test and typecheck**

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/booking src/modules/pricing src/modules/payment src/lib/api-error.ts tests/unit/booking-contracts.test.ts
git commit -m "feat: define bounded booking contracts"
```

### Task 2: Implement day-level availability

**Files:**
- Create: `src/modules/inventory/availability.service.ts`
- Create: `src/modules/inventory/prisma-inventory.repository.ts`
- Create: `tests/unit/availability.test.ts`
- Create: `tests/integration/availability.test.ts`

- [ ] **Step 1: Write unit tests**

Test this public contract:

```ts
export type AvailabilityRequest = {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
};

export type AvailableRoomType = {
  roomTypeId: string;
  minimumAvailable: number;
  requestedRooms: number;
};
```

Fixtures must prove:

- the minimum availability across all nights controls the result;
- a missing inventory night makes the room type unavailable;
- capacity is checked against rooms/adults/children;
- check-out day inventory is not consumed.

- [ ] **Step 2: Run unit test and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/availability.test.ts
```

Expected: FAIL with missing service.

- [ ] **Step 3: Implement availability**

The repository fetches room types and all `InventoryDay` rows in one bounded
query. The pure service groups by room type, requires exactly one row per stay
night, computes `minimumAvailable`, and returns only room types where:

```ts
minimumAvailable >= request.rooms &&
roomType.maxAdults * request.rooms >= request.adults &&
roomType.maxChildren * request.rooms >= request.children
```

No availability result is cached across a booking transaction.

- [ ] **Step 4: Add PostgreSQL integration coverage**

Seed two nights with one available room. Assert that:

- search for one room succeeds;
- search for two rooms returns no option;
- a missing second night returns no option.

Run:

```powershell
node --experimental-strip-types --test tests/unit/availability.test.ts
npx vitest run tests/integration/availability.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/inventory tests/unit/availability.test.ts tests/integration/availability.test.ts
git commit -m "feat: add day-level availability service"
```

### Task 3: Implement pricing and persisted quotes

**Files:**
- Create: `src/modules/pricing/calculate-price.ts`
- Create: `src/modules/pricing/quote.service.ts`
- Create: `src/modules/pricing/prisma-pricing.repository.ts`
- Create: `tests/unit/pricing.test.ts`
- Create: `tests/integration/quote.test.ts`

- [ ] **Step 1: Write pricing tests**

Use this deterministic case:

```ts
const nights = [
  { date: "2026-08-10", base: 2_000_000 },
  { date: "2026-08-11", base: 2_500_000 },
];
const result = calculatePrice({
  nights,
  rooms: 1,
  promotion: { kind: "PERCENT", value: 10, maxDiscount: 500_000 },
  taxPercent: 8,
  serviceFee: 100_000,
});
assert.deepEqual(result, {
  subtotal: 4_500_000,
  discount: 450_000,
  taxes: 324_000,
  fees: 100_000,
  services: 0,
  amountDueToday: 4_474_000,
  total: 4_474_000,
});
```

Also test rounding, inactive promotion, minimum-stay restriction, closed-to-
arrival, coupon usage cap, and no negative total.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/pricing.test.ts
```

Expected: FAIL with missing calculator.

- [ ] **Step 3: Implement pure price calculation**

- Apply restrictions before price calculation.
- Snapshot one breakdown row per night.
- Apply promotion/coupon exactly once to eligible room subtotal.
- Compute tax from the discounted taxable amount using integer arithmetic.
- Add fees and selected services explicitly.
- Create `priceHash = sha256(canonicalJson(breakdown))`.
- Never accept a price, tax, fee, discount, or total from the browser.

- [ ] **Step 4: Persist a 15-minute quote**

`createQuote` combines availability and pricing, stores the normalized request,
option snapshots, request hash, price hash, and `expiresAt`. `optionId` is a
server-generated stable identifier inside the quote JSON.

Integration test asserts that changing `DailyRate` after quote creation does
not mutate the persisted quote, while booking creation later detects the new
price hash.

Run unit and integration tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/pricing tests/unit/pricing.test.ts tests/integration/quote.test.ts
git commit -m "feat: create server-owned hotel quotes"
```

### Task 4: Implement database-backed idempotency claims

**Files:**
- Replace: `src/server/idempotency/claim.ts`
- Create: `src/modules/booking/idempotency.service.ts`
- Create: `tests/unit/idempotency-decision.test.ts`
- Create: `tests/integration/idempotency-claim.test.ts`

- [ ] **Step 1: Write decision tests**

```ts
assert.deepEqual(decideIdempotency(null, "hash-a"), { kind: "CLAIM" });
assert.deepEqual(
  decideIdempotency({ requestHash: "hash-a", state: "COMPLETED", response: { bookingId: "b1" } }, "hash-a"),
  { kind: "REPLAY", response: { bookingId: "b1" } },
);
assert.deepEqual(
  decideIdempotency({ requestHash: "hash-a", state: "PROCESSING", response: null }, "hash-a"),
  { kind: "PROCESSING" },
);
assert.deepEqual(
  decideIdempotency({ requestHash: "hash-a", state: "COMPLETED", response: {} }, "hash-b"),
  { kind: "CONFLICT" },
);
```

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL because the starter claim is read-then-create and keyed only by
`key`.

- [ ] **Step 3: Implement atomic claim behavior**

Use unique `(scope,key)` and a canonical request SHA-256. The booking service
attempts the insert inside its transaction. On Prisma `P2002`, it retries by
reading the existing committed row:

- same hash + completed → return stored response;
- same hash + processing → return typed `409 OPERATION_PROCESSING` with
  `Retry-After: 1`;
- different hash → `409 IDEMPOTENCY_KEY_REUSED`.

The response snapshot contains only booking reference, status, payment attempt
reference, and next action.

- [ ] **Step 4: Add a two-caller integration test**

Run two concurrent claims for `scope=booking:create` and the same key. Assert
one owner and one replay/processing result, never two rows.

Run focused tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/server/idempotency src/modules/booking/idempotency.service.ts tests
git commit -m "feat: claim booking intents atomically"
```

### Task 5: Implement atomic hold and booking creation

**Files:**
- Create: `src/modules/booking/create-booking.service.ts`
- Create: `src/modules/booking/booking-number.ts`
- Create: `src/modules/booking/prisma-booking.repository.ts`
- Create: `tests/unit/booking-number.test.ts`
- Create: `tests/integration/create-booking.test.ts`
- Create: `tests/integration/booking-concurrency.test.ts`

- [ ] **Step 1: Write booking transaction tests**

Required assertions:

```ts
expect(result.booking.reference).toMatch(/^AH-\d{8}-[A-Z0-9]{6}$/);
expect(await countBookingsByCheckoutKey(key)).toBe(1);
expect(await countHoldsForBooking(result.booking.id)).toBe(1);
expect(await countPaymentAttempts(result.booking.id)).toBe(1);
expect(await inventoryForStay()).toMatchObject({
  available: initialAvailable - rooms,
  held: initialHeld + rooms,
});
```

Force the second night update to affect zero rows and assert the first-night
inventory, booking, hold, and payment attempt all roll back.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/integration/create-booking.test.ts tests/integration/booking-concurrency.test.ts
```

Expected: FAIL with missing booking service.

- [ ] **Step 3: Implement the single transaction**

Within one `db.$transaction`:

1. claim `(booking:create, Idempotency-Key)`;
2. load quote `FOR UPDATE` semantics through the transaction and require it
   unexpired;
3. recompute current price and compare `priceHash`;
4. for each night call:

```ts
tx.inventoryDay.updateMany({
  where: {
    hotelId,
    roomTypeId,
    stayDate,
    available: { gte: requestedRooms },
  },
  data: {
    available: { decrement: requestedRooms },
    held: { increment: requestedRooms },
    version: { increment: 1 },
  },
});
```

5. require `count === 1` for every night;
6. create booking, hold, room/night/guest/service snapshots;
7. create exactly one first payment attempt when method is `MOCK`;
8. for `PAY_AT_HOTEL`, consume the hold in the same transaction, move the
   reserved count from `held` to `booked`, mark the booking `CONFIRMED`, create
   no PaymentAttempt, and write the confirmation outbox intent;
9. complete the idempotency response snapshot;
10. commit.

`Booking.checkoutKey` remains a second uniqueness barrier. Never call an
external provider inside this transaction.

- [ ] **Step 4: Prove replay and last-room behavior**

Integration tests:

- 30 concurrent same-key calls → one booking, one hold, one first attempt;
- same key and different normalized body → `IDEMPOTENCY_KEY_REUSED`;
- 20 distinct-key calls for the final available room → one success and 19
  `AVAILABILITY_CHANGED` results;
- every inventory row preserves non-negative counts and the inventory sum
  invariant.

Run the tests three times to expose timing assumptions.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/booking tests/unit/booking-number.test.ts tests/integration/create-booking.test.ts tests/integration/booking-concurrency.test.ts
git commit -m "feat: create bookings with atomic holds"
```

### Task 6: Implement verified mock-payment finalization

**Files:**
- Create: `src/modules/payment/verify-signature.ts`
- Create: `src/modules/payment/process-payment-event.service.ts`
- Create: `src/modules/payment/payment-state.ts`
- Create: `src/app/api/webhooks/mock-payment/route.ts`
- Create: `src/app/api/mock-provider/payments/[attemptId]/route.ts`
- Create: `src/app/[locale]/(booking)/mock-payment/[attemptId]/page.tsx`
- Create: `tests/unit/payment-state.test.ts`
- Create: `tests/security/mock-webhook.test.ts`
- Create: `tests/integration/payment-finalization.test.ts`

- [ ] **Step 1: Write state and signature tests**

Test:

```ts
assert.equal(canTransitionPayment("PENDING", "SUCCEEDED"), true);
assert.equal(canTransitionPayment("SUCCEEDED", "SUCCEEDED"), false);
assert.equal(canTransitionPayment("FAILED", "PENDING"), false);
assert.equal(verifyHmac(raw, validSignature, secret), true);
assert.equal(verifyHmac(raw + "x", validSignature, secret), false);
```

The route test sends invalid signature, valid signature with wrong amount,
valid signature with wrong currency, and a replayed event.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing payment processor.

- [ ] **Step 3: Implement fail-closed verification**

`verifyHmac` decodes equal-length hex buffers and uses
`timingSafeEqual`. The webhook route:

1. reads `request.text()` once;
2. obtains `x-mock-signature`;
3. verifies signature before parsing trusted fields;
4. Zod-parses the event;
5. calls one payment event service;
6. returns a generic acknowledgement.

Never log the signature or raw payment evidence.

- [ ] **Step 4: Implement conditional finalization**

Inside one transaction:

- claim unique `providerEventId`;
- verify internal reference, provider reference, amount, and currency;
- if a verified success arrives after the hold or booking is no longer
  finalizable, commit the WebhookEvent result `REQUIRES_RECONCILIATION`, create
  audit/dead-letter evidence, acknowledge it, and do not mark the payment or
  booking successful;
- update `PaymentAttempt` only where status is `PENDING`;
- on success update `Booking` only from `PENDING_PAYMENT` to `CONFIRMED`;
- on success conditionally increment `Booking.paidAmount` by the verified
  captured amount;
- convert inventory for each night using `held >= rooms`, decrement held, and
  increment booked;
- mark hold `CONSUMED` only from `ACTIVE`;
- write audit and booking-confirmation outbox evidence;
- acknowledge a valid duplicate without executing transitions again.

The mock provider page may generate a signed provider event in local/E2E mode.
The return page only polls booking status and cannot call the transition
service directly.

Run all focused tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/payment src/app/api/webhooks src/app/api/mock-provider src/app/[locale] tests
git commit -m "feat: finalize verified mock payments"
```

### Task 7: Implement replay-safe hold expiry

**Files:**
- Create: `src/modules/booking/expire-holds.service.ts`
- Create: `src/modules/jobs/run-job.service.ts`
- Create: `src/app/api/internal/jobs/expire-holds/route.ts`
- Create: `scripts/run-job.mjs`
- Create: `tests/integration/hold-expiry.test.ts`

- [ ] **Step 1: Write replay test**

Create one expired active hold. Run expiry twice and assert:

```ts
expect(first).toMatchObject({ released: 1 });
expect(second).toMatchObject({ released: 0 });
expect(inventory.available).toBe(initialAvailable);
expect(inventory.held).toBe(0);
expect(hold.status).toBe("EXPIRED");
```

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing expiry service.

- [ ] **Step 3: Implement conditional release**

For each candidate, use one transaction:

- update hold only where `status=ACTIVE` and `expiresAt <= now`;
- if `count=0`, return replay/no-op;
- update every stay inventory row where `held >= rooms`, increment available,
  decrement held, and require one affected row;
- cancel a `PENDING_PAYMENT` booking with reason `HOLD_EXPIRED`;
- cancel pending payment attempts;
- write outbox and audit evidence.

The job execution key uses the form `expire-holds:2026-08-01T10:42Z`. Retries are bounded to
three, then create `DeadLetterRecord`.

- [ ] **Step 4: Secure the internal route**

Require the `Authorization` value `Bearer ${JOB_SECRET}` using constant-time comparison.
Production without a valid `JOB_SECRET` returns 503. `scripts/run-job.mjs`
invokes the service locally without exposing the secret in command output.

Run the integration test twice.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/booking src/modules/jobs src/app/api/internal scripts/run-job.mjs tests/integration/hold-expiry.test.ts
git commit -m "feat: expire booking holds exactly once"
```

### Task 8: Add thin quote, booking-intent, and status APIs

**Files:**
- Create: `src/app/api/quotes/route.ts`
- Create: `src/app/api/bookings/route.ts`
- Create: `src/app/api/booking-intents/[key]/route.ts`
- Create: `src/app/api/bookings/[reference]/status/route.ts`
- Modify: `src/lib/rate-limit-policy.ts`
- Create: `tests/security/booking-routes.test.ts`

- [ ] **Step 1: Write route contract tests**

Assert:

- malformed JSON → 400 stable error envelope;
- invalid dates → 400 with bounded field details;
- missing/short idempotency key → 400;
- same key/different body → 409;
- unknown intent and unknown reference use generic 404 responses;
- public write limiter policy applies to quote and booking POST routes;
- response contains `x-request-id`.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx vitest run tests/security/booking-routes.test.ts
```

Expected: FAIL with absent routes.

- [ ] **Step 3: Implement route handlers**

Each route follows:

```ts
export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const result = await service(input);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
```

Booking creation also reads and validates `Idempotency-Key`. Routes do not
calculate price, mutate inventory, or transition payment.

- [ ] **Step 4: Verify**

Run route security tests, unit tests, lint, and typecheck.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/app/api src/lib/rate-limit-policy.ts tests/security/booking-routes.test.ts
git commit -m "feat: expose safe booking APIs"
```

### Task 9: Build the approved luxury homepage

**Files:**
- Modify: `src/app/[locale]/(public)/page.tsx`
- Create: `src/components/public/hero-slider.tsx`
- Create: `src/components/public/booking-console.tsx`
- Create: `src/components/public/prologue.tsx`
- Create: `src/components/public/atmosphere-passage.tsx`
- Create: `src/components/public/suite-spotlight.tsx`
- Create: `src/components/public/rate-story.tsx`
- Create: `src/components/public/destination.tsx`
- Create: `src/components/public/final-booking-cta.tsx`
- Create: `public/images/aurora/hero-01.webp`
- Create: `public/images/aurora/hero-02.webp`
- Create: `public/images/aurora/hero-03.webp`
- Create: `public/images/aurora/deluxe-king.webp`
- Create: `public/images/aurora/premier-garden.webp`
- Create: `public/images/aurora/family-retreat.webp`
- Create: `public/images/aurora/IMAGE_PROVENANCE.md`
- Create: `e2e/homepage.spec.ts`

- [ ] **Step 1: Write homepage E2E assertions**

Assert the v1 header layout, one visible hero slide, manual next/previous,
pause/resume, three position indicators, booking console, nine narrative
chapters, Suite Spotlight selector, starting-price label, and a booking CTA.

Emulate reduced motion and assert that auto-advance stops. Press `Home` and
`End` and assert native document scroll reaches both boundaries without a
fixed pin spacer.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
npx playwright test e2e/homepage.spec.ts
```

Expected: FAIL because the approved homepage is not implemented.

- [ ] **Step 3: Produce and record original demo imagery**

Create six original, non-branded hospitality images at the exact paths above.
Export hero images at 2400×1600 WebP and room images at 1800×1200 WebP with
quality chosen to keep each file below 450KB. Record generation source, date,
dimensions, SHA-256, and allowed project use in `IMAGE_PROVENANCE.md`.

Do not copy imagery from the architecture reference or hotel/OTA brands.

- [ ] **Step 4: Implement the approved composition**

- First hero image uses `priority` and `fetchPriority="high"`; later slides are
  lazy.
- Slides remain 7–8 seconds, transition about 1.2 seconds right-to-left.
- Pause on hover/focus, manual navigation, visible pause button, and reduced-
  motion static first slide are required.
- No Lenis, Locomotive Scroll, GSAP pinning, scroll interception, or runtime
  inline styles.
- Booking console overlaps the hero boundary and becomes an accessible compact
  trigger on mobile.
- Suite Spotlight shows one room with 60–70% image width, co-located facts,
  price, policies, and CTA. It never renders table-like room rows.
- Starting prices come from the database. Search results replace them with
  date-aware prices.

Run homepage E2E, axe checks, lint, and typecheck.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/app/[locale] src/components/public public/images/aurora e2e/homepage.spec.ts
git commit -m "feat: build Aurora luxury booking homepage"
```

### Task 10: Build the three-step booking UI with stable client intent

**Files:**
- Create: `src/app/[locale]/(booking)/book/page.tsx`
- Create: `src/app/[locale]/(booking)/book/loading.tsx`
- Create: `src/app/[locale]/(booking)/book/error.tsx`
- Create: `src/app/[locale]/(booking)/booking/[reference]/page.tsx`
- Create: `src/components/booking/booking-flow.tsx`
- Create: `src/components/booking/room-rate-step.tsx`
- Create: `src/components/booking/guest-service-step.tsx`
- Create: `src/components/booking/payment-step.tsx`
- Create: `src/components/booking/booking-summary.tsx`
- Create: `src/components/booking/hold-timer.tsx`
- Create: `src/lib/client/checkout-intent.ts`
- Create: `tests/unit/checkout-intent.test.ts`
- Create: `e2e/public-booking.spec.ts`

- [ ] **Step 1: Write stable-key tests**

```ts
class MapStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const storage = new MapStorage();
const first = getOrCreateCheckoutKey(storage, "quote-1", () => "stable-key-00000001");
const second = getOrCreateCheckoutKey(storage, "quote-1", () => "different-key-0002");
assert.equal(first, second);
clearTerminalCheckoutKey(storage, "quote-1");
assert.equal(storage.getItem("aurora:checkout:quote-1"), null);
```

Playwright double-clicks final confirmation, intercepts/delays the first
response, clicks again, reloads, and asserts one booking reference.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL because checkout intent and booking pages are absent.

- [ ] **Step 3: Implement the state machine**

```ts
type BookingStep = "ROOM_RATE" | "GUEST_SERVICES" | "PAYMENT";
type SubmissionState =
  | { kind: "IDLE" }
  | { kind: "SUBMITTING"; key: string }
  | { kind: "PROCESSING"; key: string }
  | { kind: "COMPLETED"; reference: string }
  | { kind: "FAILED"; key: string; recoverable: boolean };
```

- The key is generated once per quote and stored in `sessionStorage`.
- Repeated clicks and automatic retries reuse it.
- Timeout polls `/api/booking-intents/:key`.
- A new key is created only after a terminal result and explicit new booking.
- Disable controls while submitting, but never rely on that for correctness.
- Preserve non-sensitive guest input across an expired hold.

- [ ] **Step 4: Implement transparent booking presentation**

Persistent summary shows dates, room count, nightly price, discount, taxes,
fees, services, due today, total, cancellation policy, and hold expiry.
Mobile has one sticky action and a collapsible summary. Changed price shows old
and new totals and requires confirmation. Pending payment never uses success
styling.

Run unit and E2E tests.

Expected: PASS with pay-at-hotel and successful mock-payment journeys.

- [ ] **Step 5: Commit**

```powershell
git add src/app/[locale] src/components/booking src/lib/client tests/unit/checkout-intent.test.ts e2e/public-booking.spec.ts
git commit -m "feat: deliver resilient three-step booking flow"
```

### Task 11: Converge booking diagrams, traceability, and slice evidence

**Files:**
- Modify: `docs/architecture/API_CATALOG.md`
- Modify: `docs/product/REQUIREMENTS_TRACEABILITY.md`
- Modify: `docs/security/THREAT_MODEL.md`
- Modify: `docs/architecture/diagrams/checkout-sequence.mmd`
- Modify: `docs/architecture/diagrams/payment-state-machine.mmd`
- Modify: `docs/architecture/diagrams/verification-idempotency-sequence.mmd`
- Modify: `docs/architecture/diagrams/job-retry-flow.mmd`
- Create: `operations/release-evidence/aurora-p0-slice-02/README.md`
- Create: `operations/release-evidence/aurora-p0-slice-02/commands.jsonl`
- Create: `operations/release-evidence/aurora-p0-slice-02/artifacts.sha256`

- [ ] **Step 1: Map requirements**

Mark REQ-002, REQ-003, REQ-004, and REQ-010 implemented only after their
listed unit, integration, concurrency, security, E2E, and diagram files exist.

- [ ] **Step 2: Run focused adversarial proof**

```powershell
npx vitest run tests/integration/booking-concurrency.test.ts tests/integration/payment-finalization.test.ts tests/integration/hold-expiry.test.ts
npx vitest run tests/security/mock-webhook.test.ts tests/security/booking-routes.test.ts
npx playwright test e2e/public-booking.spec.ts e2e/homepage.spec.ts
```

Expected: all pass, including 30-call same-key and last-room races.

- [ ] **Step 3: Run all five application gates**

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Expected: all exit 0.

- [ ] **Step 4: Run Agent OS checks**

From `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

Record actual findings and verified diagram output. Create and verify the
artifact hashes.

- [ ] **Step 5: Commit**

```powershell
git add docs operations/release-evidence/aurora-p0-slice-02
git commit -m "docs: attest Aurora booking core"
git status --short
```

Expected: working tree empty.
