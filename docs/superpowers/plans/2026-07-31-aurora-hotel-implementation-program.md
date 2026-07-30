# Aurora Hotel P0 Implementation Program

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved Aurora Hotel graduation-demo as a database-backed, bilingual direct-booking platform that remains safe under concurrency and runs without paid services.

**Architecture:** Build a Next.js modular monolith in five ordered release slices. Every slice owns its Prisma migration, domain services, thin HTTP boundary, UI, tests, diagrams, traceability updates, and evidence; provider SDKs remain behind ports and are not imported by domain services.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, PostgreSQL, Prisma 6, Auth.js v5, Zod, Tailwind CSS, Node test runner, Vitest, Playwright, Mermaid.

---

## Source of truth

- Approved design: `docs/superpowers/specs/2026-07-31-aurora-hotel-system-design.md`
- Project contract: `project-blueprint.yml`
- Experience contract: `experience-blueprint.yml`
- Capability contract: `project-manifest.yml`
- Locked public design system after Program 01 Task 1: `design.md`
- Requirement mapping: `docs/product/REQUIREMENTS_TRACEABILITY.md`

When the implementation and one of these documents disagree, stop the affected
task and resolve the contract in a separate documentation commit. Never silently
change money, inventory, payment, authorization, or cancellation behavior.

## Release slices

| Order | Detailed plan | Working result | P0 requirements |
| --- | --- | --- | --- |
| 1 | `2026-07-31-aurora-hotel-01-foundation.md` | PostgreSQL foundation, locked design system, bilingual shell, identity, RBAC, audit, provider ports, deterministic seed | REQ-001, REQ-012, REQ-014, foundation work for REQ-015 and REQ-016 |
| 2 | `2026-07-31-aurora-hotel-02-booking-core.md` | Search → quote → atomic hold → booking → mock payment → verified confirmation | REQ-002, REQ-003, REQ-004, REQ-010, booking proof for REQ-015 and REQ-016 |
| 3 | `2026-07-31-aurora-hotel-03-recovery-account.md` | Lookup, cancellation, payment recovery, customer account and stay history | REQ-005, REQ-006, recovery proof for REQ-015 and REQ-016 |
| 4 | `2026-07-31-aurora-hotel-04-operations-admin.md` | Reception, housekeeping, inventory/rate/promotion/service administration, refunds, reports | REQ-007, REQ-008, REQ-009, REQ-013, operations proof for REQ-015 and REQ-016 |
| 5 | `2026-07-31-aurora-hotel-05-platform-release.md` | Email, media, jobs, privacy, observability, backup/restore, accessibility, performance and release evidence | REQ-011 and final proof for REQ-015 and REQ-016 |

P1 requirements REQ-017 through REQ-022 and P2 requirements REQ-023 through
REQ-028 are not part of this program. Their database extension points may be
preserved, but no P1/P2 screen, table, route, job, or provider is added.

## Locked module map

```text
src/
  app/
    [locale]/
      (public)/
      (booking)/
      account/
      operations/
      admin/
    api/
      availability/
      quotes/
      bookings/
      payments/
      webhooks/
      internal/jobs/
  modules/
    audit/
    authorization/
    booking/
    hotel/
    identity/
    inventory/
    jobs/
    media/
    notification/
    operations/
    payment/
    pricing/
    reporting/
    shared/
  components/
    public/
    booking/
    operations/
    admin/
    ui/
tests/
  unit/
  integration/
  security/
  helpers/
e2e/
  public-booking.spec.ts
  booking-recovery.spec.ts
  customer-account.spec.ts
  operations.spec.ts
  admin.spec.ts
  accessibility.spec.ts
```

Rules for every module:

1. `contracts.ts` owns public types, Zod schemas, and stable error codes.
2. `service.ts` or focused `*.service.ts` files own business rules.
3. `repository.ts` defines the port when persistence must be replaceable.
4. `prisma-*.repository.ts` implements persistence and imports `@/lib/db`.
5. React and route handlers may import contracts and application services.
6. Domain services do not import React, Next.js, Auth.js, or provider SDKs.
7. A route authenticates, parses, invokes one service, and maps the result.

## Cross-cutting invariants

```ts
export const BOOKING_INVARIANTS = {
  stayRange: "check-in inclusive, check-out exclusive",
  money: "integer minor units; VND minor unit is one đồng",
  inventory: "available + held + booked + blocked = sellable",
  checkout: "one Booking.checkoutKey per user intent",
  payment: "browser return URLs never finalize payment",
  webhook: "verify raw signature before parsing trusted fields",
  audit: "privileged mutation and audit record share one transaction",
} as const;
```

- Every date persisted for a stay is normalized to the hotel business date.
- Every state transition uses a conditional `updateMany` guard and treats
  `count !== 1` as a typed conflict.
- Every public write has bounded Zod validation and an explicit rate-limit
  policy.
- Every money-adjacent write has a stable idempotency scope and key.
- Every provider is executable through a local adapter in development and E2E.
- Every release keeps native browser scrolling and honors reduced motion.

## Gate protocol

At the end of every detailed plan, run in this exact order:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Then run the Template-owned contract checks from `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

Record the command, exit code, relevant counts, current commit, Node/npm
versions, and SHA-256 evidence in:

```text
operations/release-evidence/aurora-p0-slice-01/
operations/release-evidence/aurora-p0-slice-02/
operations/release-evidence/aurora-p0-slice-03/
operations/release-evidence/aurora-p0-slice-04/
operations/release-evidence/aurora-p0-final/
```

No slice proceeds while one of its five application gates is red. A contract
check that reports a generated-file ownership issue is recorded and resolved
without bypassing Agent OS file protection.

## Commit discipline

- One failing test plus its minimal implementation per commit.
- Migration and matching Prisma schema stay in the same commit.
- Diagram and traceability changes stay with the feature they document.
- Generated screenshots, test databases, traces, and provider preview mail are
  ignored; deterministic fixtures and evidence manifests are committed.
- Commit messages use `feat:`, `fix:`, `test:`, `docs:`, or `chore:` and name
  one coherent change.

## Program completion

The P0 program is complete only when all five detailed plans are checked,
`git status --short` is empty, the release manifest verifies hashes on disk,
and the following acceptance run succeeds:

```text
Vietnamese mobile guest
  → searches two nights
  → selects a room and visible cancellation policy
  → creates one booking despite repeated clicks
  → completes verified mock payment
  → receives a confirmation preview
  → looks up the booking

Receptionist
  → checks the guest in and out

Housekeeping
  → marks the physical room clean and ready

Manager
  → changes a future daily rate and inventory
  → sees audited occupancy and revenue output
```
