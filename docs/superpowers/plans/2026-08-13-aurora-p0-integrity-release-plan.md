# Aurora Hotel P0 Integrity and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Aurora Hotel from a visually complete graduation demo into a demonstrably safe P0 direct-booking system: atomic booking/coupon/refund behaviour, six-role authorization, database-backed hotel operations, truthful mock-payment scope, and reproducible release evidence.

**Architecture:** Preserve the Next.js monolith, Prisma/Neon adapter, and existing customer booking contracts. Close gaps at service and API boundaries first, then replace operations-only browser state with permission-checked endpoints, and only then reconcile UI/release evidence. Every money, inventory, role, and state-transition write is made inside a database transaction and produces a redacted audit record.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma 6 with Neon PostgreSQL, Zod, NextAuth v5 credentials/JWT, Node test runner, Vitest, Playwright, GitHub Actions, Vercel.

**Implementation baseline:** `2ea3c4e74f26828ec97eb3b286274b59f780843d` (`antigravity/aurora-p0-implementation`). The 54 uncommitted owner-owned paths observed on 2026-08-13 are intentionally excluded from this integrity branch until they are reviewed and committed separately.

---

## Scope and delivery rules

- P0 supports **one real mode only: `MOCK_PAYMENT`**. The product may display that it is a graduation demo. `CREDIT_CARD`, `BANK_TRANSFER`, and `CASH` are not selectable until a real adapter and verified provider callback exist.
- VNPay remains a later integration, not a claimed capability. Set the manifest and documentation to `mock` for this release.
- The existing 54 dirty paths belong to the owner. Do not reset, checkout, clean, or fold them into this work. The implementation must begin from a new clean worktree after the owner has either committed the current UI work or selected a committed baseline.
- Admin/reception/housekeeping are not customer-editorial surfaces. Their quality bar is authorization, persistence, auditability, and fast usable controls.
- The remote Neon test reset is destructive to `aurora_test`; run it only after explicit owner approval at the E2E task.
- A green lint/typecheck/build is not release approval. This plan ends only when `release:verify`, E2E, and deployment smoke evidence match the exact release commit.

## File and responsibility map

| Area | Files | Responsibility |
| --- | --- | --- |
| Work isolation | `.gitignore`, `vitest.config.ts`, `package.json`, `docs/superpowers/*` | Keep generated worktrees/tests from contaminating gates; make one release command authoritative. |
| Authentication and authorization | `src/auth.config.ts`, `src/auth.ts`, `src/types/next-auth.d.ts`, `src/server/auth/{policies,guards,rbac}.ts`, `src/middleware.ts` | Carry all six roles from database to session, guard routes, and check action-level permissions. |
| Secret and audit boundaries | `src/server/auth/tokens.ts`, `src/services/audit.service.ts` | Fail fast without signing secret and recursively redact audit payloads. |
| Inventory and coupon integrity | `src/services/{availability,coupon,booking}.ts`, `prisma/schema.prisma`, migration, tests | Preserve version-based inventory invariants and atomically cap coupon redemption. |
| Refund integrity | `src/services/payment.service.ts`, `prisma/schema.prisma`, migration, `src/app/api/refunds/route.ts`, tests | Claim idempotency, atomically reserve refundable balance, then record refund/audit/event in one transaction. |
| Operations | `src/services/operations.service.ts`, `src/app/api/operations/**`, `src/app/operations/**`, `src/components/operations/**` | Replace browser-only check-in/out and housekeeping state with persisted authorized actions. |
| Customer contracts | `src/app/api/availability/route.ts`, `src/services/availability.service.ts`, `src/lib/validation.ts`, booking UI/tests | Ensure claimed query/filter/payment behaviour equals server behaviour. |
| Test/release | `vitest.config.ts`, `playwright.config.ts`, `scripts/release-manifest.mjs`, `operations/release-evidence/aurora-p0-final/**`, `.github/workflows/ci.yml` | Test only the current worktree and attach evidence to the exact clean commit. |

## Delivery order

`isolate baseline → gate hygiene → secrets/audit → roles → booking integrity → coupon/refund integrity → operations APIs/UI → truthful payment/config → customer contract fixes → E2E/CI/release → Vercel smoke`

### Task 1: Freeze the owner-owned baseline and create an isolated implementation worktree

**Files:**
- Modify: `docs/superpowers/plans/2026-08-13-aurora-p0-integrity-release-plan.md` (mark the chosen baseline commit only)
- Verify: `D:\ProjectZ\AuroraHotel` and a new worktree

- [ ] **Step 1: Record the preflight state without modifying it**

Run:

```powershell
git -C D:\ProjectZ\AuroraHotel status --short
git -C D:\ProjectZ\AuroraHotel rev-parse HEAD
git -C D:\ProjectZ\AuroraHotel worktree list --porcelain
```

Expected: retain the complete dirty-path list and current `2ea3c4e...` head as evidence; do not run `git reset`, `git clean`, or `git checkout --`.

- [ ] **Step 2: Use the recorded immutable baseline**

Use `2ea3c4e74f26828ec97eb3b286274b59f780843d`. Do not copy uncommitted paths into this integrity branch. The current UI work remains intact in the owner checkout and can be reviewed as a separate integration proposal after P0 is green.

- [ ] **Step 3: Create the isolated branch/worktree from that SHA**

Run:

```powershell
git -C D:\ProjectZ\AuroraHotel worktree add -b codex/aurora-p0-integrity D:\ProjectZ\AuroraHotel\.worktrees\aurora-p0-integrity 2ea3c4e74f26828ec97eb3b286274b59f780843d
git -C D:\ProjectZ\AuroraHotel\.worktrees\aurora-p0-integrity status --short --branch
```

Expected: branch `codex/aurora-p0-integrity`, empty worktree status, and no edits to the owner’s primary checkout.

- [ ] **Step 4: Commit the baseline reference only**

```powershell
git add docs/superpowers/plans/2026-08-13-aurora-p0-integrity-release-plan.md
git commit -m "docs: lock Aurora P0 integrity baseline"
```

### Task 2: Make test and release commands reflect only the current worktree

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `tests/playwright-config.test.ts`
- Modify: `tests/release-manifest.test.ts`
- Test: `tests/vitest-worktree-isolation.test.ts`

- [ ] **Step 1: Write failing isolation tests**

Create `tests/vitest-worktree-isolation.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Vitest excludes nested Git worktrees", async () => {
  const config = await readFile("vitest.config.ts", "utf8");
  assert.match(config, /\.worktrees\/\*\*/);
});

test("release verify targets the Aurora manifest through a relative path", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(
    pkg.scripts["release:verify"],
    "node scripts/release-manifest.mjs --verify operations/release-evidence/aurora-p0-final/manifest.json",
  );
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --experimental-strip-types --test tests/vitest-worktree-isolation.test.ts`

Expected: fail because no Vitest exclusion exists and `release:verify` points to `D:/ProjectZ/Template/agent-os`.

- [ ] **Step 3: Add the current-worktree Vitest boundary**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/.worktrees/**", "**/node_modules/**", "**/.next/**"],
  },
});
```

Update package scripts:

```json
{
  "test": "node --experimental-strip-types --test tests/*.test.ts && vitest run tests/security --passWithNoTests",
  "release:verify": "node scripts/release-manifest.mjs --verify operations/release-evidence/aurora-p0-final/manifest.json"
}
```

- [ ] **Step 4: Update release-manifest test expectations**

Keep `tests/release-manifest.test.ts` exercising `scripts/release-manifest.mjs`; remove no safety assertions. Add a test that a manifest in another project cannot be selected by the package script.

- [ ] **Step 5: Verify test isolation**

Run:

```powershell
node --experimental-strip-types --test tests/vitest-worktree-isolation.test.ts
npx vitest run tests/security --passWithNoTests
```

Expected: focused tests pass; Vitest output lists only `tests/security/**` from the active worktree.

- [ ] **Step 6: Commit**

```powershell
git add vitest.config.ts package.json tests/vitest-worktree-isolation.test.ts tests/playwright-config.test.ts tests/release-manifest.test.ts
git commit -m "test: isolate Aurora verification from nested worktrees"
```

### Task 3: Fail closed for signing secrets and redact audit payloads

**Files:**
- Modify: `src/server/auth/tokens.ts`
- Modify: `src/services/audit.service.ts`
- Test: `tests/unit/lookup-tokens.test.ts`
- Test: `tests/audit-outbox.test.ts`

- [ ] **Step 1: Add failing security tests**

Add to `tests/unit/lookup-tokens.test.ts`:

```ts
test("refuses to sign lookup tokens when AUTH_SECRET is missing outside test", () => {
  assert.throws(() => getLookupTokenSecret({ NODE_ENV: "production" }), /AUTH_SECRET is required/);
});
```

Add to `tests/audit-outbox.test.ts`:

```ts
assert.deepEqual(redactAuditPayload({ password: "x", nested: { token: "y", safe: 1 } }), {
  password: "[REDACTED]",
  nested: { token: "[REDACTED]", safe: 1 },
});
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `node --experimental-strip-types --test tests/unit/lookup-tokens.test.ts tests/audit-outbox.test.ts`

Expected: fail because lookup tokens use a source fallback and audit payloads are copied unredacted.

- [ ] **Step 3: Implement explicit secret resolution**

In `src/server/auth/tokens.ts`, replace the module fallback constant with:

```ts
export function getLookupTokenSecret(env = process.env): string {
  const secret = env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (env.NODE_ENV === "test") return "test-only-lookup-signing-secret-32ch";
  throw new Error("AUTH_SECRET is required and must be at least 32 characters");
}
```

Use `getLookupTokenSecret()` only while signing/verifying; no production default is permitted.

- [ ] **Step 4: Implement recursive audit redaction**

Export `redactAuditPayload` from `src/services/audit.service.ts`. It must redact keys matching `/password|token|secret|credential|api[_-]?key|authorization|card|cvv/i`, preserve arrays and primitive safe values, and use `"[REDACTED]"`. Pass its result to `auditLog.create`.

- [ ] **Step 5: Verify focused and security suites**

Run:

```powershell
node --experimental-strip-types --test tests/unit/lookup-tokens.test.ts tests/audit-outbox.test.ts
npx vitest run tests/security/negative-rules.test.ts --passWithNoTests
```

Expected: all pass; no source fallback secret remains.

- [ ] **Step 6: Commit**

```powershell
git add src/server/auth/tokens.ts src/services/audit.service.ts tests/unit/lookup-tokens.test.ts tests/audit-outbox.test.ts
git commit -m "fix(security): fail closed for lookup secrets and redact audits"
```

### Task 4: Unify six-role authorization from sign-in to route boundary

**Files:**
- Modify: `src/auth.config.ts`
- Modify: `src/auth.ts`
- Modify: `src/types/next-auth.d.ts`
- Modify: `src/server/auth/policies.ts`
- Modify: `src/server/auth/guards.ts`
- Modify: `src/middleware.ts`
- Test: `tests/auth-guards.test.ts`
- Test: `tests/rbac.test.ts`

- [ ] **Step 1: Add role propagation and guard tests**

Add cases proving: `RECEPTIONIST` can reach reception but not housekeeping; `HOUSEKEEPER` can reach housekeeping but not reception; `MANAGER` can read reports but cannot obtain admin-only access; `GUEST` and `CUSTOMER` cannot enter `/operations/**`.

- [ ] **Step 2: Run tests and confirm RED**

Run: `node --experimental-strip-types --test tests/auth-guards.test.ts tests/rbac.test.ts`

Expected: fail because NextAuth reduces unknown staff roles to `CUSTOMER`, and `STAFF_ROLES` only contains `ADMIN`/`STAFF`.

- [ ] **Step 3: Define a single role vocabulary**

In `src/server/auth/policies.ts`:

```ts
export const USER_ROLES = ["GUEST", "CUSTOMER", "RECEPTIONIST", "HOUSEKEEPER", "MANAGER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const RECEPTION_ROLES = new Set<UserRole>(["RECEPTIONIST", "MANAGER", "ADMIN"]);
export const HOUSEKEEPING_ROLES = new Set<UserRole>(["HOUSEKEEPER", "MANAGER", "ADMIN"]);
export const ADMIN_ROLES = new Set<UserRole>(["ADMIN"]);
```

Update NextAuth session/JWT types and callbacks to preserve only this exact union. Remove the fictitious `STAFF` role unless a migration/seed explicitly creates it.

- [ ] **Step 4: Add permission-aware guards and middleware route guards**

Implement `requirePermission(session, permission)` using `assertPermission` from `rbac.ts`. In `middleware.ts`, guard `/operations/reception` with `RECEPTION_ROLES`, `/operations/housekeeping` with `HOUSEKEEPING_ROLES`, `/admin/**` with `ADMIN_ROLES`, and `/profile`/`/account`/`/my-bookings` with authentication.

- [ ] **Step 5: Verify behavior**

Run:

```powershell
node --experimental-strip-types --test tests/auth-guards.test.ts tests/rbac.test.ts
npm run typecheck
```

Expected: pass; the role in DB, JWT, middleware and server guard remains identical.

- [ ] **Step 6: Commit**

```powershell
git add src/auth.config.ts src/auth.ts src/types/next-auth.d.ts src/server/auth/policies.ts src/server/auth/guards.ts src/middleware.ts tests/auth-guards.test.ts tests/rbac.test.ts
git commit -m "fix(auth): enforce Aurora six-role authorization"
```

### Task 5: Make availability and category filtering truthful under concurrency

**Files:**
- Modify: `src/services/availability.service.ts`
- Modify: `src/app/api/availability/route.ts`
- Test: `tests/availability.service.test.ts`
- Create: `tests/availability-filter.test.ts`
- Test: `e2e/aurora-business-real-db.spec.ts`

- [ ] **Step 1: Add failing inventory tests**

Cover all conditions below:

```ts
// remaining = totalInventory - bookedCount - holdCount - blockedCount
// a category with blockedCount consuming the final unit cannot be reserved
// roomCategoryId returns only that category, never all categories
// a second update with the stale version returns ConflictError
```

Add a real-Neon E2E case with two parallel bookings for the final unit after a block/hold update; exactly one must succeed.

- [ ] **Step 2: Run focused unit tests and confirm RED**

Run: `node --experimental-strip-types --test tests/availability.service.test.ts tests/availability-filter.test.ts`

Expected: the route ignores `roomCategoryId`, and the new blocked/concurrency assertion fails until version use is made universal.

- [ ] **Step 3: Apply category filter at the service boundary**

Change the service signature and API call:

```ts
export async function searchAvailableCategories(
  checkIn: string | Date,
  checkOut: string | Date,
  numGuests = 1,
  roomCategoryId?: string,
  client = defaultDb,
) {
  const where = { isActive: true, maxOccupancy: { gte: numGuests }, ...(roomCategoryId ? { id: roomCategoryId } : {}) };
  // use where in roomCategory.findMany
}
```

The API must pass `parsed.roomCategoryId`; invalid ranges still return the existing structured 400 response.

- [ ] **Step 4: Preserve the complete inventory invariant in every write**

Keep the current precondition `total - booked - hold - blocked > 0`, and retain `id + version` in `updateMany`. Add/modify all hold, release and inventory-block mutation paths so each changes `version`; no mutation may change `bookedCount`, `holdCount`, or `blockedCount` without incrementing `version` in the same transaction.

- [ ] **Step 5: Verify unit tests**

Run: `node --experimental-strip-types --test tests/availability.service.test.ts tests/availability-filter.test.ts`

Expected: pass with explicit tests for block/hold availability and category filtering.

- [ ] **Step 6: Commit**

```powershell
git add src/services/availability.service.ts src/app/api/availability/route.ts tests/availability.service.test.ts tests/availability-filter.test.ts e2e/aurora-business-real-db.spec.ts
git commit -m "fix(inventory): honor filters and version all availability mutations"
```

### Task 6: Cap coupon redemption atomically and enforce per-user uniqueness

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/202608130001_coupon_integrity/migration.sql`
- Modify: `src/services/coupon.service.ts`
- Modify: `src/services/booking.service.ts`
- Create: `tests/coupon.service.test.ts`
- Modify: `tests/security/negative-rules.test.ts`

- [ ] **Step 1: Write failing coupon race tests**

Create tests proving:

```ts
// redeemCoupon does not increment when currentUsageCount equals maxUsageTotal
// two different bookings for one user and one coupon produce one CouponUsage only
// a unique-constraint collision is normalized to ConflictError, not 500
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --experimental-strip-types --test tests/coupon.service.test.ts`

Expected: fail because the update has no `currentUsageCount < maxUsageTotal` condition and schema has no compound user/coupon unique key.

- [ ] **Step 3: Add the database constraint**

In `CouponUsage` add:

```prisma
@@unique([couponId, userId])
```

Create a forward-only migration. Before applying it to Neon, inspect existing duplicate non-null `(couponId, userId)` rows; fail the migration with a clear report rather than deleting booking history automatically.

- [ ] **Step 4: Make redemption conditional**

Change the function to accept `maxUsageTotal` obtained from the verified quote coupon and perform:

```ts
const updated = await client.coupon.updateMany({
  where: { id: couponId, isActive: true, currentUsageCount: { lt: maxUsageTotal } },
  data: { currentUsageCount: { increment: 1 } },
});
if (updated.count !== 1) throw new ConflictError("Coupon limit reached during checkout");
```

Create `CouponUsage` in the same checkout transaction. Convert Prisma `P2002` for the compound key to `ConflictError`; transaction rollback must restore the increment.

- [ ] **Step 5: Verify**

Run:

```powershell
node --experimental-strip-types --test tests/coupon.service.test.ts tests/security/negative-rules.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 6: Commit**

```powershell
git add prisma/schema.prisma prisma/migrations src/services/coupon.service.ts src/services/booking.service.ts tests/coupon.service.test.ts tests/security/negative-rules.test.ts
git commit -m "fix(coupons): enforce atomic total and per-user limits"
```

### Task 7: Make refunds idempotent and concurrency-safe

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/202608130002_payment_refunded_amount/migration.sql`
- Modify: `src/services/payment.service.ts`
- Modify: `src/app/api/refunds/route.ts`
- Create: `tests/payment.service.test.ts`
- Modify: `tests/security/negative-rules.test.ts`

- [ ] **Step 1: Add failing refund tests**

Add tests for identical-key replay, two distinct concurrent partial refunds that exceed balance, exactly-full refund, invalid/missing idempotency key, and no audit record when the monetary reservation fails.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --experimental-strip-types --test tests/payment.service.test.ts tests/security/negative-rules.test.ts`

Expected: fail because the existing service calculates refunded total outside a guarded write and the route manufactures a deterministic fallback idempotency key.

- [ ] **Step 3: Add durable refunded balance**

Add this field:

```prisma
model Payment {
  // existing fields
  refundedAmount Int @default(0)
}
```

The SQL migration must backfill `refundedAmount` from existing `PROCESSED` refunds using `COALESCE(SUM(amount), 0)` before making the column non-null.

- [ ] **Step 4: Require client idempotency and reserve balance atomically**

`POST /api/refunds` must reject an absent/invalid key with 400; remove its generated fallback. In `processRefund`, inside `db.$transaction`:

```ts
const reserved = await tx.payment.updateMany({
  where: {
    id: params.paymentId,
    status: { in: ["PAID"] },
    refundedAmount: { lte: payment.amount - params.amount },
  },
  data: { refundedAmount: { increment: params.amount } },
});
if (reserved.count !== 1) throw new ConflictError("Refund exceeds remaining refundable balance");
```

Then create the `Refund`, `PaymentEvent`, and redacted audit log in the same transaction. On `P2002` for `idempotencyKey`, return the already-created refund after the aborted transaction; never create a second refund.

- [ ] **Step 5: Verify and commit**

Run: `node --experimental-strip-types --test tests/payment.service.test.ts tests/security/negative-rules.test.ts`

Expected: pass.

```powershell
git add prisma/schema.prisma prisma/migrations src/services/payment.service.ts src/app/api/refunds/route.ts tests/payment.service.test.ts tests/security/negative-rules.test.ts
git commit -m "fix(payments): make refunds atomic and idempotent"
```

### Task 8: Replace browser-only reception and housekeeping workflows with real operations APIs

**Files:**
- Modify: `src/services/operations.service.ts`
- Create: `src/app/api/operations/reception/route.ts`
- Create: `src/app/api/operations/housekeeping/route.ts`
- Create: `src/app/operations/reception/ReceptionDeskClient.tsx`
- Create: `src/app/operations/housekeeping/HousekeepingBoardClient.tsx`
- Modify: `src/app/operations/reception/page.tsx`
- Modify: `src/app/operations/housekeeping/page.tsx`
- Modify: `src/components/operations/RoomMatrixGrid.tsx`
- Create: `tests/operations-api.test.ts`
- Modify: `tests/operations.service.test.ts`

- [ ] **Step 1: Define and test endpoint contracts first**

Use these exact payloads:

```ts
// POST /api/operations/reception
z.discriminatedUnion("action", [
  z.object({ action: z.literal("ASSIGN_ROOM"), bookingId: z.string().cuid(), roomId: z.string().cuid(), notes: z.string().trim().max(500).optional() }),
  z.object({ action: z.literal("CHECK_IN"), bookingId: z.string().cuid() }),
  z.object({ action: z.literal("CHECK_OUT"), bookingId: z.string().cuid() }),
]);

// POST /api/operations/housekeeping
z.object({ roomId: z.string().cuid(), status: z.enum(["CLEAN", "DIRTY", "INSPECTING", "MAINTENANCE"]), notes: z.string().trim().max(500).optional() });
```

Test 401/403, invalid payload 400, unavailable transition 409, successful persistence, and one matching audit row.

- [ ] **Step 2: Run tests and confirm RED**

Run: `node --experimental-strip-types --test tests/operations-api.test.ts tests/operations.service.test.ts`

Expected: fail because no operations routes exist and UI actions only mutate React state.

- [ ] **Step 3: Harden service transitions**

Wrap assignment, check-in/out and housekeeping mutation plus audit creation in `client.$transaction`. Use `updateMany` status guards for check-in/out. For housekeeping use a documented transition matrix and a `version`-style conditional guard if a room status version is added; otherwise add a `updatedAt` optimistic concurrency precondition from client state.

- [ ] **Step 4: Implement permission-checked APIs**

Reception calls `requirePermission(session, "room:assign" | "checkin:perform" | "checkout:perform")`. Housekeeping calls `requirePermission(session, "room:update_cleaning")`. API responses use the project `jsonApiError` / `toApiErrorResponse` helpers and do not leak raw Prisma errors.

- [ ] **Step 5: Convert pages into guarded server shells plus client adapters**

Each `page.tsx` becomes an async server component that calls the matching permission guard, queries real rooms/bookings, and passes serializable DTOs to its client component. Delete `INITIAL_ROOM_MATRIX`, `INITIAL_HOUSEKEEPING_ROOMS`, `mockBookings`, and all local fake transition success messages. `RoomMatrixGrid` calls an async mutation callback and only updates optimistic state after server success; on 409 it re-fetches and renders the server error.

- [ ] **Step 6: Verify persistence and role boundaries**

Run:

```powershell
node --experimental-strip-types --test tests/operations-api.test.ts tests/operations.service.test.ts tests/auth-guards.test.ts
npm run typecheck
```

Expected: all pass; reception and housekeeping persist only permitted actions.

- [ ] **Step 7: Commit**

```powershell
git add src/services/operations.service.ts src/app/api/operations src/app/operations src/components/operations tests/operations-api.test.ts tests/operations.service.test.ts
git commit -m "feat(operations): persist authorized hotel workflows"
```

### Task 9: Make payment scope, media claims, and configuration truthful for the graduation release

**Files:**
- Modify: `project-manifest.yml`
- Modify: `.env.example`
- Modify: `src/lib/validation.ts`
- Modify: `src/app/booking/page.tsx`
- Modify: `src/app/admin/media/page.tsx`
- Modify: `docs/superpowers/specs/2026-07-31-aurora-hotel-system-design.md`
- Test: `tests/environment.test.ts`
- Create: `tests/payment-scope.test.ts`

- [ ] **Step 1: Write truthful-scope tests**

Assert the P0 checkout schema accepts only `MOCK_PAYMENT`, the checkout UI offers only that mode, and project manifest billing is `mock`/`sandbox` rather than VNPay.

- [ ] **Step 2: Run test and confirm RED**

Run: `node --experimental-strip-types --test tests/payment-scope.test.ts tests/environment.test.ts`

Expected: fail because validation/UI permit unimplemented payment methods and manifest claims VNPay.

- [ ] **Step 3: Align configuration and UI**

Set the manifest billing provider to `mock` and explain the P1 VNPay activation requirements: authenticated initiation, signed raw-body callback, event deduplication, amount/currency/order match, and no browser-return success assumption. Limit P0 `paymentMethod` to `z.literal("MOCK_PAYMENT")`; the UI has one clear demo-payment option.

- [ ] **Step 4: Remove false media-manager data**

Until a database-backed media listing and upload route exists, replace the hard-coded `files` table with an explicit empty state: “Media management is not enabled in this graduation release.” Do not display sample private guest-ID files as real data.

- [ ] **Step 5: Verify and commit**

Run: `node --experimental-strip-types --test tests/payment-scope.test.ts tests/environment.test.ts && npm run typecheck`

```powershell
git add project-manifest.yml .env.example src/lib/validation.ts src/app/booking/page.tsx src/app/admin/media/page.tsx docs/superpowers/specs/2026-07-31-aurora-hotel-system-design.md tests/payment-scope.test.ts tests/environment.test.ts
git commit -m "docs(scope): align Aurora P0 with verified mock payment"
```

### Task 10: Reconcile design/implementation status and customer contract verification

**Files:**
- Modify: `docs/superpowers/specs/2026-08-02-aurora-customer-frontend-redesign-design.md`
- Modify: `docs/superpowers/plans/2026-08-02-aurora-customer-frontend-redesign.md`
- Modify: `scripts/check-ui-contracts.mjs`
- Modify: `e2e/aurora-customer-redesign.spec.ts`
- Modify: `e2e/aurora-business-real-db.spec.ts`
- Test: `tests/design-lock.test.ts`

- [ ] **Step 1: Add failing contract assertions**

Add browser coverage that records and validates these requests, not just visible controls:

```ts
await page.route("**/api/availability**", route => { /* capture query then continue */ });
await page.route("**/api/quote", route => { /* capture body then continue */ });
await page.route("**/api/checkout", route => { /* assert Idempotency-Key and MOCK_PAYMENT */ });
```

Assert that customer category filter produces one `roomCategoryId`, quote uses dates/rooms/services unchanged, and checkout sends `Idempotency-Key` plus only valid P0 payment mode.

- [ ] **Step 2: Update documentation source-of-truth**

Update the redesign spec from `Implementation status: not started` to a factual status containing the implementation baseline SHA, current open P0 security dependencies, and explicit separation of customer UI from operations. Mark only actually executed checklist steps complete; do not convert unchecked work to completion by prose.

- [ ] **Step 3: Upgrade UI contract checker minimally**

Keep its dead-link checks. Add static failures for `mockBookings`, `INITIAL_ROOM_MATRIX`, `INITIAL_HOUSEKEEPING_ROOMS`, and a UI payment value outside the P0 allowed list. This remains a guardrail; browser/API assertions above remain the contract proof.

- [ ] **Step 4: Verify customer contracts**

Run:

```powershell
npm run ui:contract-check
node --experimental-strip-types --test tests/design-lock.test.ts
npx playwright test e2e/aurora-customer-redesign.spec.ts --reporter=line
```

Expected: no false status statements, no prohibited fake operations data, and browser requests match server contracts.

- [ ] **Step 5: Commit**

```powershell
git add docs/superpowers/specs/2026-08-02-aurora-customer-frontend-redesign-design.md docs/superpowers/plans/2026-08-02-aurora-customer-frontend-redesign.md scripts/check-ui-contracts.mjs e2e/aurora-customer-redesign.spec.ts e2e/aurora-business-real-db.spec.ts tests/design-lock.test.ts
git commit -m "test(contracts): reconcile Aurora UI with server boundaries"
```

### Task 11: Run migrations and real Neon concurrency E2E under explicit approval

**Files:**
- Modify: `prisma/seed.ts` only if migration requires fixture changes
- Modify: `e2e/aurora-business-real-db.spec.ts`
- Create: `operations/release-evidence/aurora-p0-final/e2e-neon-result.json`

- [ ] **Step 1: Perform remote-reset preflight**

Run only after owner authorization:

```powershell
node --experimental-strip-types scripts/verify-ci-environment.mjs
```

Expected: `DATABASE_ENVIRONMENT=test`, both URLs identify `aurora_test` / `aurora_test_runner`, and neither URL equals `PRODUCTION_DATABASE_URL`.

- [ ] **Step 2: Apply the disposable test migration and deterministic seed**

Run: `npm run e2e:db`

Expected: reset `aurora_test`, apply only forward migrations, seed e2e roles/data, exit 0. If any identity guard blocks, stop and report it; never alter production credentials to bypass it.

- [ ] **Step 3: Run real database business E2E**

Run:

```powershell
npx playwright test e2e/aurora-business-real-db.spec.ts --reporter=line
```

Required cases: duplicate checkout same key, duplicate checkout different payload, final inventory race, blocked inventory race, coupon quota race, refund balance race, cancellation release, invalid webhook signature/replay, reception and housekeeping authorization.

- [ ] **Step 4: Save sanitized evidence**

Store exit code, test counts, commit SHA, Node/npm versions, and test database name only. Do not store URLs, tokens, email addresses, or customer/seed passwords.

- [ ] **Step 5: Commit evidence separately**

```powershell
git add e2e prisma/seed.ts operations/release-evidence/aurora-p0-final/e2e-neon-result.json
git commit -m "test(e2e): verify Aurora P0 against Neon test database"
```

### Task 12: Rebuild release evidence and CI around the final clean commit

**Files:**
- Modify: `operations/release-evidence/aurora-p0-final/manifest.json`
- Modify: `operations/release-evidence/aurora-p0-final/commands.jsonl`
- Modify: `operations/release-evidence/aurora-p0-final/README.md`
- Modify: `operations/release-evidence/aurora-p0-final/artifacts.sha256`
- Modify: `.github/workflows/ci.yml`
- Test: `tests/release-manifest.test.ts`

- [ ] **Step 1: Write failing evidence assertions**

Add a test that rejects an evidence manifest with a source commit different from the current implementation commit, any dirty path, omitted new operations/coupon/refund files, or a command record whose exit code is nonzero.

- [ ] **Step 2: Run test and confirm RED against the old manifest**

Run: `node --experimental-strip-types --test tests/release-manifest.test.ts`

Expected: old evidence cannot claim the final P0 commit.

- [ ] **Step 3: Execute the ordered gates from a clean worktree**

Run:

```powershell
npm run ui:contract-check
npm run lint
npm run typecheck
npm run test
npm run design:check
npm run build
npm run e2e
npm run release:verify
```

Expected: every command exit 0. `npm run e2e` requires the approved Task 11 test DB reset. Any failure blocks the release manifest update.

- [ ] **Step 4: Generate manifest hashes from the final source commit**

List every changed implementation/test/diagram/evidence file as `{ path, sha256 }`; set all required gates `passed: true`; include command evidence for each command above; set `gatesSkipped: false`. The evidence commit may only contain release evidence files and must follow the source commit exactly as enforced by `tests/release-manifest.test.ts`.

- [ ] **Step 5: Make CI report truthful gates**

Use `npm run check` for local static checks, then run `npm run e2e` only when Neon test secrets are present. Add a CI step for `npm run release:verify` after evidence is committed; do not mark an absent-secret E2E as pass—report it as skipped in GitHub Actions.

- [ ] **Step 6: Verify release evidence**

Run:

```powershell
node --experimental-strip-types --test tests/release-manifest.test.ts
npm run release:verify
git status --short
```

Expected: tests pass, verifier reports zero errors, and working tree is clean.

- [ ] **Step 7: Commit**

```powershell
git add .github/workflows/ci.yml operations/release-evidence/aurora-p0-final tests/release-manifest.test.ts
git commit -m "docs(release): attest Aurora P0 integrity baseline"
```

### Task 13: Verify Vercel deployment prerequisites and perform manual smoke acceptance

**Files:**
- Modify: `docs/ops/cloud-deployment-runbook.md`
- Modify: `docs/ops/neon-backup-restore-runbook.md`
- Create: `operations/release-evidence/aurora-p0-final/vercel-smoke-result.json`

- [ ] **Step 1: Add an environment matrix to the runbook**

Document the exact non-secret requirements by Vercel environment:

| Environment | Database | Required additions |
| --- | --- | --- |
| Development | `aurora_development` | local values; demo only |
| Preview | `aurora_preview` | distinct Neon role, AUTH_SECRET, Blob only if media enabled |
| Production | `aurora_production` | distinct Neon role, AUTH_SECRET, CRON_SECRET, JOB_SECRET, Redis credentials for fail-closed auth/checkout limiter |
| E2E | `aurora_test` | TEST URLs and `ALLOW_REMOTE_TEST_RESET=aurora_test` only |

- [ ] **Step 2: Add a production limiter smoke check**

Extend `scripts/check-cloud-env.mjs` and its test to require both Upstash variables when `NODE_ENV=production`; preview/development may omit them. This prevents a production checkout from silently deploying into guaranteed 503 protection failures.

- [ ] **Step 3: Deploy a Vercel Preview, never production first**

Use the owner’s Vercel project/account. Verify preview health endpoints, room listing, authenticated mock checkout, duplicate-submit handling, receptionist/housekeeper denial for wrong roles, and no PII in logs. Do not create or rotate external secrets without owner authority.

- [ ] **Step 4: Record sanitized smoke result and commit**

```powershell
git add docs/ops/cloud-deployment-runbook.md docs/ops/neon-backup-restore-runbook.md scripts/check-cloud-env.mjs tests/environment.test.ts operations/release-evidence/aurora-p0-final/vercel-smoke-result.json
git commit -m "docs(ops): record Aurora preview deployment acceptance"
```

## P1 after P0 release

Do not start these before Task 13 passes:

1. VNPay adapter and signed callback route; include provider event idempotency, amount/currency/order matching, reconciliation and refund-provider workflow.
2. Real media domain: database model, upload route, malware/image validation, private-to-public lifecycle, pagination and deletion audit.
3. Outbox worker deployment with leases, retries, dead-letter visibility, and real transactional-email provider.
4. Observability: Sentry/structured logs, request IDs across API/webhook/jobs, metrics for checkout conflicts and availability contention.
5. Production performance proof: Core Web Vitals p75 data; local builds and Lighthouse are not field evidence.

## Final acceptance checklist

- [ ] Current release branch is clean, isolated, and based on an owner-approved SHA.
- [ ] All six roles survive login/session and have least-privilege route/action access.
- [ ] No customer/admin/operations screen displays runtime data presented as real when it is fixture-only.
- [ ] Inventory, coupon and refund concurrent writes are protected by database conditions and real-Neon E2E.
- [ ] Lookup cancellation cannot use a source fallback secret; audit payloads are redacted.
- [ ] P0 payment UI, validation, manifest and documentation all say mock/sandbox only.
- [ ] `npm run ui:contract-check`, lint, typecheck, test, design check, build, E2E and `release:verify` pass from the same final source commit.
- [ ] Release manifest, hashes, command evidence and Vercel preview smoke result correspond to that commit.
