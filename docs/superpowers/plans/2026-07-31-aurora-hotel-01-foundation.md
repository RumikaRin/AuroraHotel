# Aurora Hotel Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic commerce starter with a locked Aurora design contract, Neon PostgreSQL hotel schema, deterministic data, bilingual application shell, identity/RBAC/audit foundation, and provider ports for Vercel deployment.

**Architecture:** Establish the modular-monolith boundaries before business UI. Neon PostgreSQL and Prisma own persistence, pure module contracts own policy, Auth.js owns credential sessions, and every provider is selected through an application-owned port.

**Tech Stack:** Next.js 15, React 19, TypeScript, Neon PostgreSQL, Prisma 6, Auth.js v5, Zod, Tailwind CSS, Vercel, Node test runner, Vitest, Playwright.

---

## File responsibility map

```text
design.md                                      approved visual rules
scripts/verify-design-lock.mjs                 verify design/spec binding
scripts/reset-test-db.mjs                      guarded PostgreSQL test reset
prisma/schema.prisma                           complete P0 persistence model
prisma/seed.ts                                 repeatable Aurora demo data
src/modules/shared/                            money/date/result primitives
src/modules/authorization/                     roles, permissions and guards
src/modules/audit/                             redaction and transactional audit
src/modules/identity/                          session registry policy
src/modules/payment/payment-provider.ts        payment port
src/modules/notification/email-provider.ts     email port
src/modules/media/media-provider.ts            media port
src/modules/jobs/job-runner.ts                 job port
src/i18n/                                      locale routing and messages
src/app/[locale]/                              bilingual route shell
src/components/ui/                             accessible design primitives
tests/unit/                                    pure policy tests
tests/integration/                             PostgreSQL behavior tests
tests/helpers/                                 deterministic test utilities
```

### Task 1: Record and enforce the approved design lock

**Files:**
- Modify: `design.md`
- Modify: `docs/superpowers/specs/2026-07-31-aurora-hotel-system-design.md`
- Create: `scripts/verify-design-lock.mjs`
- Create: `tests/design-lock.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing design-lock test**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import { verifyDesignLock } from "../scripts/verify-design-lock.mjs";

describe("Aurora design lock", () => {
  it("binds locked design.md to the approved system spec", async () => {
    const result = await verifyDesignLock(process.cwd());
    assert.equal(result.status, "locked");
    assert.match(result.approvalSha256, /^[a-f0-9]{64}$/);
    assert.equal(result.actualSpecSha256, result.approvalSha256);
    const design = await readFile("design.md", "utf8");
    assert.match(design, /Cormorant Garamond/);
    assert.match(design, /Manrope/);
    assert.doesNotMatch(design, /Status: DRAFT/);
    assert.doesNotMatch(design, /Unresolved/);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/design-lock.test.ts
```

Expected: FAIL because `scripts/verify-design-lock.mjs` does not exist.

- [ ] **Step 3: Add the verifier**

`scripts/verify-design-lock.mjs` must export this exact interface:

```js
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SPEC =
  "docs/superpowers/specs/2026-07-31-aurora-hotel-system-design.md";

const canonicalText = (value) => value.replace(/\r\n/g, "\n");
const sha256 = (value) =>
  createHash("sha256").update(canonicalText(value), "utf8").digest("hex");

export async function verifyDesignLock(root) {
  const [design, spec] = await Promise.all([
    readFile(path.join(root, "design.md"), "utf8"),
    readFile(path.join(root, SPEC), "utf8"),
  ]);
  const status = design.match(/^> Status: (locked)$/m)?.[1];
  const approvalSha256 =
    design.match(/^> Approval-Spec-SHA256: ([a-f0-9]{64})$/m)?.[1];
  if (status !== "locked" || !approvalSha256) {
    throw new Error("design.md is not locked to an approved spec");
  }
  const actualSpecSha256 = sha256(spec);
  if (actualSpecSha256 !== approvalSha256) {
    throw new Error("design.md approval hash does not match the system spec");
  }
  return { status, approvalSha256, actualSpecSha256 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifyDesignLock(process.cwd());
  console.log("Aurora design lock: verified");
}
```

- [ ] **Step 4: Lock `design.md`**

Replace the draft status and unresolved sections with:

```markdown
> Status: locked
> Approved: 2026-07-31
> Approval-Spec-SHA256: 1545d99b2c484b36cb8c29d90b0ded609810914b52714be3ad369d34091c3900

## Typography
- Display: Cormorant Garamond, weights 400/500/600.
- Interface: Manrope, weights 400/500/600/700.

## Semantic tokens
- aurora-midnight: #17211D
- warm-ivory: #F7F4ED
- paper: #FFFDF8
- champagne-gold: #C5A46D
- forest-green: #355B4B
- terracotta: #B97857
- mist-gray: #DADDD8
- charcoal: #242826
- success: #2E7D5A
- warning: #C48138
- error: #B84A4A
- information: #3F6D8C

## Component rules
- Header uses left wordmark, centered navigation, and right utilities/booking CTA.
- Hero uses three right-to-left slides with manual controls and a reduced-motion static state.
- Booking console overlaps the hero boundary without consuming the mobile viewport.
- Room showcase uses Suite Spotlight and never uses the rejected Stay Atlas rows.
- Vertical scrolling remains native; Lenis, Locomotive Scroll, and pinned scroll narratives are prohibited.
```

Retain the approved scale, grid, spacing, shape, motion, accessibility,
anti-pattern, and shared/page-specific rules from sections 9 and 10 of the
approved spec. Do not modify `experience-blueprint.yml`; it is an Agent
OS-managed declaration while `design.md` is project-owned.

Add this script:

```json
"design:check": "node scripts/verify-design-lock.mjs"
```

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm run design:check
node --experimental-strip-types --test tests/design-lock.test.ts
```

Expected: both exit 0 and print `Aurora design lock: verified`.

Commit:

```powershell
git add design.md docs/superpowers/specs/2026-07-31-aurora-hotel-system-design.md scripts/verify-design-lock.mjs tests/design-lock.test.ts package.json package-lock.json
git commit -m "docs: lock Aurora design system"
```

### Task 2: Switch the runtime and test harness to PostgreSQL

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `.env.example`
- Modify: `package.json`
- Modify: `playwright.config.ts`
- Delete: `scripts/reset-e2e-db.mjs`
- Delete: `tests/reset-e2e-db.test.ts`
- Create: `scripts/reset-test-db.mjs`
- Create: `tests/reset-test-db.test.ts`
- Create: `tests/helpers/database.ts`

- [ ] **Step 1: Write reset guard tests**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertSafeTestDatabaseUrl } from "../scripts/reset-test-db.mjs";

describe("PostgreSQL test reset guard", () => {
  it("accepts only a localhost database ending in _test", () => {
    assert.doesNotThrow(() =>
      assertSafeTestDatabaseUrl(
        "postgresql://postgres:postgres@127.0.0.1:5432/aurora_test?schema=public",
      ),
    );
  });

  for (const url of [
    "postgresql://host.example/aurora_test",
    "postgresql://127.0.0.1/aurora",
    "file:./e2e.db",
  ]) {
    it(`rejects ${url}`, () => {
      assert.throws(() => assertSafeTestDatabaseUrl(url));
    });
  }
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/reset-test-db.test.ts
```

Expected: FAIL because the guarded reset script is absent.

- [ ] **Step 3: Implement the guarded reset**

`scripts/reset-test-db.mjs` must:

```js
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function assertSafeTestDatabaseUrl(source) {
  const url = new URL(source);
  const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  const database = url.pathname.slice(1);
  if (url.protocol !== "postgresql:" || !local || !database.endsWith("_test")) {
    throw new Error(
      "Refusing reset: TEST_DATABASE_URL must target the isolated Neon aurora_test database and runner role",
    );
  }
}

export function resetTestDatabase(databaseUrl, root = process.cwd()) {
  assertSafeTestDatabaseUrl(databaseUrl);
  const env = { ...process.env, DATABASE_URL: databaseUrl };
  const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
  execFileSync(process.execPath, [prismaCli, "migrate", "reset", "--force", "--skip-seed"], {
    stdio: "inherit",
    env,
    shell: false,
  });
  execFileSync(process.execPath, [prismaCli, "db", "seed"], {
    stdio: "inherit",
    env: { ...env, SEED_PROFILE: "e2e" },
    shell: false,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is required");
  resetTestDatabase(url);
}
```

- [ ] **Step 4: Configure PostgreSQL and scripts**

Use:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

`.env.example` must declare non-secret examples:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/aurora_dev?schema=public"
TEST_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/aurora_test?schema=public"
AUTH_SECRET="replace-with-at-least-32-random-characters"
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"
HOTEL_TIME_ZONE="Asia/Ho_Chi_Minh"
MOCK_PAYMENT_SECRET="local-test-secret-with-at-least-32-characters"
JOB_SECRET="local-job-secret-with-at-least-32-characters"
EMAIL_PROVIDER="preview"
MEDIA_PROVIDER="local"
PAYMENT_PROVIDER="mock"
```

Set scripts:

```json
"test:unit": "node --experimental-strip-types --test tests/*.test.ts tests/unit/*.test.ts",
"test:capabilities": "node --test tests/capabilities/*.test.mjs",
"test:integration": "vitest run tests/integration --passWithNoTests",
"test:security": "vitest run tests/security --passWithNoTests",
"test": "npm run test:unit && npm run test:capabilities && npm run test:integration && npm run test:security",
"db:test:reset": "node scripts/reset-test-db.mjs",
"e2e:db": "node scripts/reset-test-db.mjs",
"check": "npm run design:check && npm run lint && npm run typecheck && npm run test && npm run build"
```

Update Playwright to read `TEST_DATABASE_URL`, pass it to the app as
`DATABASE_URL`, and keep one worker for stateful hotel journeys.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm install
npm run typecheck
node --experimental-strip-types --test tests/reset-test-db.test.ts
```

Expected: all exit 0. Database reset is not run until a safe local PostgreSQL
test database is available.

Commit:

```powershell
git add prisma/schema.prisma .env.example package.json package-lock.json playwright.config.ts scripts tests/reset-test-db.test.ts
git commit -m "chore: establish PostgreSQL test harness"
```

### Task 3: Add shared money, business-date, clock, and result contracts

**Files:**
- Create: `src/modules/shared/money.ts`
- Create: `src/modules/shared/business-date.ts`
- Create: `src/modules/shared/clock.ts`
- Create: `src/modules/shared/result.ts`
- Create: `tests/unit/shared-contracts.test.ts`

- [ ] **Step 1: Write pure contract tests**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addBusinessDays, enumerateStayNights } from "../../src/modules/shared/business-date.ts";
import { addMoney, money } from "../../src/modules/shared/money.ts";

describe("shared hotel contracts", () => {
  it("uses check-in inclusive and check-out exclusive nights", () => {
    assert.deepEqual(
      enumerateStayNights("2026-08-01", "2026-08-04"),
      ["2026-08-01", "2026-08-02", "2026-08-03"],
    );
  });

  it("rejects invalid or non-forward stay ranges", () => {
    assert.throws(() => enumerateStayNights("2026-08-04", "2026-08-04"));
    assert.throws(() => enumerateStayNights("2026-02-30", "2026-03-02"));
  });

  it("adds integer VND without floating-point values", () => {
    assert.equal(addMoney(money(2_450_000), money(300_000)), 2_750_000);
    assert.throws(() => money(10.5));
  });

  it("adds calendar business dates without local-time drift", () => {
    assert.equal(addBusinessDays("2026-12-31", 1), "2027-01-01");
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/shared-contracts.test.ts
```

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement exact public contracts**

```ts
// src/modules/shared/money.ts
export type Money = number & { readonly __money: unique symbol };
export function money(value: number): Money {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("Money must be a non-negative safe integer");
  }
  return value as Money;
}
export const addMoney = (a: Money, b: Money) => money(a + b);
export const subtractMoney = (a: Money, b: Money) => {
  if (b > a) throw new RangeError("Money result cannot be negative");
  return money(a - b);
};

// src/modules/shared/clock.ts
export interface Clock { now(): Date }
export const systemClock: Clock = { now: () => new Date() };
export class FixedClock implements Clock {
  constructor(private readonly value: Date) {}
  now() { return new Date(this.value); }
}

// src/modules/shared/result.ts
export type DomainError<C extends string = string, D = unknown> = {
  code: C; message: string; details?: D;
};
export type Result<T, E extends DomainError = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

`business-date.ts` must parse only `YYYY-MM-DD`, round-trip through
`Date.UTC`, reject impossible dates, enumerate check-in inclusive/check-out
exclusive nights, and cap ranges in the calling Zod schema.

- [ ] **Step 4: Verify**

Run:

```powershell
node --experimental-strip-types --test tests/unit/shared-contracts.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/shared tests/unit/shared-contracts.test.ts
git commit -m "feat: add hotel domain primitives"
```

### Task 4: Replace the commerce schema with the complete Aurora P0 schema

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `src/app/page.tsx`
- Delete: `src/app/api/products/route.ts`
- Delete: `src/app/api/checkout/route.ts`
- Delete: `src/services/checkout.service.ts`
- Delete: `src/server/commerce/stock.ts`
- Delete: `src/lib/validation.ts`
- Delete: `src/lib/idempotency.ts`
- Delete: `tests/idempotency.test.ts`
- Delete: `prisma/migrations/20260726183448_init/migration.sql`
- Create: `prisma/migrations/20260731010000_aurora_baseline/migration.sql`
- Modify: `docs/architecture/DATA_MODEL.md`
- Modify: `docs/architecture/DATA_DICTIONARY.md`
- Modify: `docs/architecture/diagrams/erd.mmd`
- Create: `tests/unit/schema-contract.test.ts`

- [ ] **Step 1: Write a schema contract test**

The test reads `prisma/schema.prisma` and requires these exact models:

```ts
const requiredModels = [
  "Role", "Permission", "RolePermission", "User", "AuthSession",
  "Hotel", "HotelPolicy", "Amenity", "RoomType", "RoomTypeAmenity",
  "PhysicalRoom", "RoomStatusHistory", "MediaAsset",
  "InventoryDay", "RatePlan", "DailyRate", "Restriction",
  "Promotion", "Coupon", "CouponRedemption", "Service",
  "Quote", "BookingHold", "Booking", "BookingRoom", "BookingNight",
  "BookingGuest", "BookingService", "Cancellation",
  "PaymentAttempt", "Refund", "IdempotencyRecord", "WebhookEvent",
  "OutboxMessage", "JobExecution", "DeadLetterRecord", "AuditLog",
] as const;
```

It must also assert:

```ts
assert.match(schema, /@@unique\(\[hotelId, roomTypeId, stayDate\]\)/);
assert.match(schema, /@@unique\(\[scope, key\]\)/);
assert.match(schema, /checkoutKey\s+String\s+@unique/);
assert.match(schema, /providerReference\s+String\?/);
assert.match(schema, /providerEventId\s+String\s+@unique/);
```

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/schema-contract.test.ts
```

Expected: FAIL because the starter still contains Product/Order.

- [ ] **Step 3: Define exact schema invariants**

Use PostgreSQL native enums for:

```prisma
enum UserRoleCode { CUSTOMER HOUSEKEEPING RECEPTIONIST MANAGER ADMIN }
enum RoomOperationalStatus { READY DIRTY CLEANING INSPECTING OCCUPIED OUT_OF_SERVICE }
enum HoldStatus { ACTIVE CONSUMED RELEASED EXPIRED }
enum BookingStatus { PENDING_PAYMENT CONFIRMED CANCELLED CHECKED_IN CHECKED_OUT NO_SHOW }
enum PaymentStatus { PENDING SUCCEEDED FAILED CANCELLED REFUNDED }
enum CancellationStatus { COMPLETED REJECTED }
enum RefundStatus { PENDING SUCCEEDED FAILED CANCELLED }
enum IdempotencyState { PROCESSING COMPLETED }
enum OutboxStatus { PENDING SENDING SENT FAILED DEAD }
enum JobStatus { RUNNING SUCCEEDED FAILED DEAD }
enum MediaStatus { PRIVATE READY TRASHED PURGED }
```

Required field and constraint contract:

- All money fields are `Int`; all currency fields default to `VND`.
- `InventoryDay` owns `sellable`, `available`, `held`, `booked`, `blocked`,
  a `version`, and unique `(hotelId, roomTypeId, stayDate)`.
- `DailyRate` owns unique `(ratePlanId, roomTypeId, stayDate)`.
- `Quote` stores `requestHash`, `priceHash`, `breakdown Json`, and `expiresAt`.
- `BookingHold` owns unique `bookingId`, status, quantity, and expiry.
- `Booking.checkoutKey` is unique and snapshots currency, timezone, subtotal,
  discount, taxes, fees, amountDueToday, total, and cancellation policy.
- `Booking` owns integer `paidAmount` and `refundedAmount` counters for
  conditional refund-limit enforcement.
- `BookingNight` snapshots stay date, base price, discount, taxes, fees, total,
  rate plan name, inclusions, and cancellation policy.
- `IdempotencyRecord` has unique `(scope,key)`, request hash, state,
  resource identifiers, response JSON, and expiry.
- `WebhookEvent.providerEventId` is unique and stores payload digest, verified
  time, processing time, and result.
- `Refund` stores amount and reason; refund totals are never inferred from a
  mutable PaymentAttempt field.
- Every hotel-scoped table has `hotelId` and an index beginning with it.
- Cascade deletes are allowed only for owned snapshots and join rows; bookings,
  payments, refunds, audit logs, webhook events, and outbox evidence use
  restrictive relations.

Run:

```powershell
npx prisma format
npx prisma validate
npx prisma migrate dev --name aurora_baseline --create-only
```

Rename the single newly generated migration directory to
`prisma/migrations/20260731010000_aurora_baseline`, then run:

```powershell
npx prisma migrate deploy
```

Replace the old Product/Order seed with a compiling baseline that upserts the
five role codes and the `AURORA-HCM` Hotel record. Task 5 adds the full 120-day
demo horizon. Replace the root Product page with a static Aurora foundation
status page until Task 9 installs locale routing. Remove the listed
Product/Order checkout routes, service, validation, stock helper, and their
obsolete idempotency test so no deleted Prisma model remains referenced.

- [ ] **Step 4: Update model documentation and ERD**

`DATA_MODEL.md` and `DATA_DICTIONARY.md` must document every model, enum,
unique key, sensitive field, retention rule, and state owner. `erd.mmd` must
use the same model and relation names as Prisma and must not include deleted
commerce entities.

Run:

```powershell
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

from `D:\ProjectZ\Template`.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
node --experimental-strip-types --test tests/unit/schema-contract.test.ts
npx prisma validate
npm run typecheck
```

Expected: PASS.

Commit:

```powershell
git add prisma docs/architecture tests/unit/schema-contract.test.ts
git commit -m "feat: define Aurora PostgreSQL domain schema"
```

### Task 5: Create deterministic Aurora seed data

**Files:**
- Modify: `prisma/seed.ts`
- Create: `tests/integration/seed.test.ts`
- Create: `tests/helpers/fixtures.ts`
- Modify: `README.md`

- [ ] **Step 1: Write the seed integration test**

```ts
import { afterAll, describe, expect, it } from "vitest";
import { db } from "../../src/lib/db";

describe("Aurora seed", () => {
  afterAll(() => db.$disconnect());

  it("is repeatable and creates a bookable 120-day horizon", async () => {
    const hotel = await db.hotel.findUnique({ where: { code: "AURORA-HCM" } });
    const roomTypes = await db.roomType.count({ where: { hotelId: hotel!.id } });
    const inventory = await db.inventoryDay.count({ where: { hotelId: hotel!.id } });
    const roles = await db.role.findMany({ orderBy: { code: "asc" } });
    expect(roomTypes).toBe(3);
    expect(inventory).toBe(3 * 120);
    expect(roles.map((role) => role.code)).toEqual([
      "ADMIN", "CUSTOMER", "HOUSEKEEPING", "MANAGER", "RECEPTIONIST",
    ]);
  });
});
```

- [ ] **Step 2: Reset twice and confirm the test fails before seed replacement**

Run:

```powershell
$env:DATABASE_URL=$env:TEST_DATABASE_URL
npm run db:test:reset
npm run db:seed
npm run db:seed
npx vitest run tests/integration/seed.test.ts
```

Expected: FAIL because Aurora hotel data is absent.

- [ ] **Step 3: Implement deterministic seed**

Seed exact stable codes:

```ts
const hotelCode = "AURORA-HCM";
const roomTypes = [
  { code: "DELUXE-KING", slug: "deluxe-king", rooms: 12, areaSqm: 36, maxAdults: 2, maxChildren: 1, baseRate: 2_450_000 },
  { code: "PREMIER-GARDEN", slug: "premier-garden-suite", rooms: 8, areaSqm: 48, maxAdults: 2, maxChildren: 2, baseRate: 3_250_000 },
  { code: "FAMILY-RETREAT", slug: "family-retreat", rooms: 6, areaSqm: 62, maxAdults: 4, maxChildren: 2, baseRate: 4_100_000 },
] as const;
```

- Create 120 inventory and daily-rate rows per room type from a fixed
  `SEED_START_DATE` in E2E and from the current hotel business date in dev.
- Create `FLEXIBLE` and `SAVER` rate plans with explicit cancellation snapshots.
- Create breakfast and airport-transfer services.
- Create all five roles and their permission joins.
- Create verified demo users for Customer, Housekeeping, Receptionist, Manager,
  and Admin; hash passwords with cost 12.
- Upsert by stable codes/keys and use `createMany({ skipDuplicates: true })`
  for day rows, so running the seed twice does not change counts.
- Print credentials only for local/demo mode and never print password hashes.

- [ ] **Step 4: Verify repeatability**

Run the reset, seed twice, and integration test from Step 2.

Expected: PASS with 3 room types, 360 inventory days, and five roles.

- [ ] **Step 5: Commit**

```powershell
git add prisma/seed.ts tests/integration/seed.test.ts tests/helpers/fixtures.ts README.md
git commit -m "feat: seed repeatable Aurora hotel data"
```

### Task 6: Implement the Aurora role-permission ladder and session revocation

**Files:**
- Modify: `src/auth.config.ts`
- Modify: `src/auth.ts`
- Modify: `src/types/next-auth.d.ts`
- Modify: `src/middleware.ts`
- Replace: `src/server/auth/policies.ts`
- Replace: `src/server/auth/guards.ts`
- Replace: `src/server/auth/session-registry.ts`
- Create: `src/modules/authorization/contracts.ts`
- Create: `src/modules/authorization/policy.ts`
- Create: `src/modules/identity/session.service.ts`
- Modify: `tests/auth-guards.test.ts`
- Create: `tests/unit/authorization-policy.test.ts`
- Create: `tests/integration/session-revocation.test.ts`

- [ ] **Step 1: Write role and revocation tests**

Define and test:

```ts
expectPermission("HOUSEKEEPING", "room-status:update", true);
expectPermission("HOUSEKEEPING", "booking:check-in", false);
expectPermission("RECEPTIONIST", "booking:check-in", true);
expectPermission("RECEPTIONIST", "rate:update", false);
expectPermission("MANAGER", "rate:update", true);
expectPermission("MANAGER", "user:admin", false);
expectPermission("ADMIN", "user:admin", true);
```

The integration test signs a session record, increments the user's
`sessionVersion`, and expects `assertSessionActive` to reject the stale token.

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/auth-guards.test.ts tests/unit/authorization-policy.test.ts
npx vitest run tests/integration/session-revocation.test.ts
```

Expected: FAIL because hotel roles and database-backed revocation are absent.

- [ ] **Step 3: Implement the policy map**

```ts
export const rolePermissions = {
  CUSTOMER: ["booking:self:read", "booking:self:cancel"],
  HOUSEKEEPING: ["room-status:read", "room-status:update"],
  RECEPTIONIST: [
    "booking:read", "booking:create", "booking:check-in", "booking:check-out",
    "room-status:read", "payment:record",
  ],
  MANAGER: [
    "booking:read", "booking:create", "booking:check-in", "booking:check-out",
    "room-status:read", "room-status:update", "catalog:update", "rate:update",
    "inventory:update", "promotion:update", "service:update", "payment:refund",
    "report:read", "media:publish", "audit:read",
  ],
  ADMIN: ["*"],
} as const;
```

`requirePermission(session, permission)` first calls `requireUser`, then checks
the central map. It returns only `{id, role, email, name}` and throws 401/403
without disclosing the required role.

- [ ] **Step 4: Wire Auth.js and middleware**

- JWT stores `id`, `role`, and `sessionVersion`.
- Session validation reads the user and AuthSession record on protected
  server operations; stale/revoked sessions fail.
- Middleware remains Edge-safe and performs coarse route protection only.
- `auth.config.ts` and middleware both normalize an optional leading `/vi` or
  `/en` segment before matching protected route prefixes.
- Service guards remain authoritative for every mutation.
- Locale prefixes are stripped before policy matching; `/api` is never given a
  locale prefix.
- Open redirects accept only same-origin relative return paths.

Run all focused tests from Step 2.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/auth* src/middleware.ts src/types src/server/auth src/modules/authorization src/modules/identity tests
git commit -m "feat: enforce Aurora roles and revocable sessions"
```

### Task 7: Implement transactional audit redaction

**Files:**
- Create: `src/modules/audit/redact.ts`
- Create: `src/modules/audit/audit.service.ts`
- Create: `tests/unit/audit-redaction.test.ts`
- Create: `tests/integration/audit-transaction.test.ts`

- [ ] **Step 1: Write redaction and rollback tests**

```ts
assert.deepEqual(
  redactSensitive({
    email: "guest@example.com",
    nested: { password: "x", apiKey: "y", value: 2 },
  }),
  { email: "guest@example.com", nested: { value: 2 } },
);
```

The integration test performs a mutation and audit insert through the same
Prisma transaction, forces an exception after the audit insert, and asserts
that neither row committed.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/audit-redaction.test.ts
npx vitest run tests/integration/audit-transaction.test.ts
```

Expected: FAIL with missing audit module.

- [ ] **Step 3: Implement the audit contract**

```ts
export type AuditInput = {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  requestId?: string;
  ipHash?: string;
};

export interface AuditWriter {
  write(tx: Prisma.TransactionClient, input: AuditInput): Promise<void>;
}
```

Redact keys matching:

```ts
/(password|token|secret|credential|authorization|cookie|api[_-]?key|signature|paymentEvidence)/i
```

Redaction is recursive, cycle-safe, converts non-finite numbers to `null`, and
stores bounded JSON. `write` accepts only a transaction client; exporting a
global-client overload is prohibited.

- [ ] **Step 4: Verify**

Run both tests from Step 2 and `npm run typecheck`.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/audit tests/unit/audit-redaction.test.ts tests/integration/audit-transaction.test.ts
git commit -m "feat: add transactional audit evidence"
```

### Task 8: Define local-first payment, email, media, and job ports

**Files:**
- Create: `src/modules/payment/payment-provider.ts`
- Create: `src/modules/payment/mock-payment.provider.ts`
- Create: `src/modules/notification/email-provider.ts`
- Create: `src/modules/notification/preview-email.provider.ts`
- Create: `src/modules/media/media-provider.ts`
- Create: `src/modules/media/local-media.provider.ts`
- Create: `src/modules/jobs/job-runner.ts`
- Create: `src/modules/providers.ts`
- Create: `tests/unit/provider-selection.test.ts`

- [ ] **Step 1: Write provider selection tests**

```ts
assert.equal(createProviders({ payment: "mock", email: "preview", media: "local" }).payment.name, "mock");
assert.throws(() =>
  createProviders({ payment: "vnpay", email: "preview", media: "local" }),
  /not configured/,
);
```

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/provider-selection.test.ts
```

Expected: FAIL because the provider composition root is absent.

- [ ] **Step 3: Define exact ports**

```ts
export interface PaymentProvider {
  readonly name: "mock" | "vnpay";
  createAttempt(input: {
    internalReference: string;
    amount: number;
    currency: "VND";
    returnUrl: string;
  }): Promise<{ providerReference: string; redirectUrl: string }>;
  verifyWebhook(input: {
    rawBody: string;
    signature: string;
  }): Promise<VerifiedPaymentEvent>;
}

export type VerifiedPaymentEvent = {
  providerEventId: string;
  providerReference: string;
  internalReference: string;
  outcome: "SUCCEEDED" | "FAILED" | "PENDING";
  amount: number;
  currency: "VND";
  occurredAt: string;
  payloadDigest: string;
};

export interface EmailProvider {
  send(message: { messageId: string; to: string; template: string; variables: Record<string, string> }): Promise<{ providerId: string }>;
}

export interface MediaProvider {
  put(input: { key: string; bytes: Uint8Array; contentType: "image/jpeg" | "image/png" | "image/webp" | "image/avif" }): Promise<{ key: string }>;
  remove(key: string): Promise<void>;
}
```

The local composition root selects only `mock`, `preview`, and `local`.
Selecting VNPay, Resend, or Cloudinary without their required secret set throws
at startup; it never silently falls back.

- [ ] **Step 4: Implement deterministic local adapters**

- Mock payment signs webhook bodies with HMAC-SHA256 and supports explicit
  test outcomes `success`, `pending`, and `failed`.
- Preview email writes redacted JSON to `.local/email-preview/{messageId}.json`
  using exclusive creation.
- Local media writes beneath `.local/media/` after canonical path validation
  and rejects symlinks.
- Job runner accepts a stable job key and returns an existing successful
  execution on replay.
- Add `.local/` to `.gitignore`.

Run the provider test and `npm run typecheck`.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules .gitignore tests/unit/provider-selection.test.ts
git commit -m "feat: add local-first provider ports"
```

### Task 9: Build the bilingual Aurora application shell and design primitives

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Delete: `src/app/page.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/(public)/page.tsx`
- Create: `src/i18n/locales.ts`
- Create: `src/i18n/messages/vi.ts`
- Create: `src/i18n/messages/en.ts`
- Create: `src/i18n/get-messages.ts`
- Create: `src/components/public/site-header.tsx`
- Create: `src/components/public/site-footer.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/field.tsx`
- Create: `src/components/ui/status-message.tsx`
- Create: `tests/unit/i18n.test.ts`
- Create: `e2e/foundation.spec.ts`

- [ ] **Step 1: Write locale and shell tests**

```ts
assert.equal(isLocale("vi"), true);
assert.equal(isLocale("en"), true);
assert.equal(isLocale("api"), false);
assert.equal(localePath("en", "/rooms"), "/en/rooms");
assert.equal(localePath("vi", "/rooms"), "/vi/rooms");
```

Playwright must assert:

```ts
await expect(page.locator("html")).toHaveAttribute("lang", "vi");
await expect(page.getByRole("link", { name: /đặt phòng/i })).toBeVisible();
await page.getByRole("link", { name: /english/i }).click();
await expect(page).toHaveURL(/\/en$/);
await expect(page.locator("html")).toHaveAttribute("lang", "en");
```

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/i18n.test.ts
npx playwright test e2e/foundation.spec.ts
```

Expected: FAIL because locale routes and Aurora shell are absent.

- [ ] **Step 3: Implement locale routing**

```ts
export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";
export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);
export const localePath = (locale: Locale, path: `/${string}` | "/") =>
  `/${locale}${path === "/" ? "" : path}`;
```

`/` redirects to `/vi`. Unknown locale segments call `notFound()`. Each message
catalog exports the same typed keys; the test compares recursive key paths.
Locale switching preserves the route path but does not copy query values that
contain sensitive guest or booking data.

- [ ] **Step 4: Implement the design shell**

- Install `@fontsource/cormorant-garamond` and
  `@fontsource-variable/manrope`. Import Cormorant Garamond weights 400, 500,
  and 600 plus Manrope variable CSS in the root layout; these packages bundle
  font bytes into the build so no remote font request occurs at runtime.
- Define CSS custom properties for every locked token.
- Add a skip link, visible focus style, 44×44px minimum target, and semantic
  status component with `role="status"` or `role="alert"`.
- Header uses wordmark left, centered navigation, and right language/account/
  booking controls on desktop; mobile uses wordmark, booking CTA, and an
  accessible disclosure menu.
- The foundation homepage is an intentionally minimal Aurora welcome surface.
  It does not implement hero animation or Suite Spotlight before Program 02.

Run unit test, Playwright test, `npm run lint`, and `npm run typecheck`.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json src/app src/i18n src/components tests/unit/i18n.test.ts e2e/foundation.spec.ts
git commit -m "feat: add bilingual Aurora application shell"
```

### Task 10: Converge foundation documentation, diagrams, and gates

**Files:**
- Modify: `docs/architecture/ARCHITECTURE.md`
- Modify: `docs/architecture/API_CATALOG.md`
- Modify: `docs/security/AUTHORIZATION_MATRIX.md`
- Modify: `docs/security/THREAT_MODEL.md`
- Modify: `docs/product/REQUIREMENTS_TRACEABILITY.md`
- Modify: `docs/architecture/diagrams/modules.mmd`
- Modify: `docs/architecture/diagrams/auth-flow.mmd`
- Modify: `docs/architecture/diagrams/authz-flow.mmd`
- Modify: `docs/architecture/diagrams/role-permission-map.mmd`
- Modify: `docs/architecture/diagrams/session-lifecycle.mmd`
- Create: `operations/release-evidence/aurora-p0-slice-01/README.md`
- Create: `operations/release-evidence/aurora-p0-slice-01/commands.jsonl`
- Create: `operations/release-evidence/aurora-p0-slice-01/artifacts.sha256`

- [ ] **Step 1: Update traceability**

Map REQ-001, REQ-012, REQ-014, and the foundation portions of REQ-015/016 to
the exact implementation, test, and diagram files. Leave later P0 requirements
as `Approved / scheduled in slice 02–05`; do not mark them implemented.

- [ ] **Step 2: Validate diagrams**

From `D:\ProjectZ\Template`, run:

```powershell
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

Expected: exit 0 with every changed diagram source verified.

- [ ] **Step 3: Run the five application gates**

From `D:\ProjectZ\AuroraHotel`, run in order:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Expected: all exit 0. Record real test counts and build output; do not write a
green status before each command has finished.

- [ ] **Step 4: Run Agent OS checks and create evidence hashes**

From `D:\ProjectZ\Template`, run:

```powershell
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
```

Record every finding. If a project-owned file is intentionally changed,
document it. If a managed artifact drifted, restore it or use a supported Agent
OS lifecycle command; never edit `.agent-os/lock.json` by hand.

Create `artifacts.sha256` from the committed files named in the traceability
rows and verify each hash immediately.

- [ ] **Step 5: Commit the slice evidence**

```powershell
git add docs operations/release-evidence/aurora-p0-slice-01
git commit -m "docs: attest Aurora foundation slice"
git status --short
```

Expected: commit succeeds and working tree is empty.
