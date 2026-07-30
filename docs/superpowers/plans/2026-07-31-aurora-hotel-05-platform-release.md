# Aurora Hotel Platform Hardening and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Aurora P0 with reliable notifications, safe media, replayable jobs, privacy controls, observability, backup/restore, SEO, accessibility, performance budgets, and cryptographically verifiable release evidence.

**Architecture:** Transactional outbox and leased workers provide at-least-once side effects; adapters remain local by default. Operational scripts fail closed on unsafe targets, observability redacts before output, and the final manifest binds implementation, tests, diagrams, environment, and evidence by SHA-256.

**Tech Stack:** Next.js 15, TypeScript, Neon PostgreSQL, Prisma 6, Vercel Blob, Vercel, Node.js, Sharp, Playwright, axe-core, Mermaid.

---

### Task 1: Deliver transactional email through a leased outbox worker

**Files:**
- Create: `src/modules/notification/outbox.service.ts`
- Modify: `src/modules/notification/preview-email.provider.ts`
- Create: `src/modules/notification/templates/booking-confirmation.ts`
- Create: `src/modules/notification/templates/booking-cancellation.ts`
- Create: `src/modules/notification/templates/booking-access.ts`
- Create: `src/app/api/internal/jobs/deliver-email/route.ts`
- Create: `src/app/[locale]/dev/email-preview/page.tsx`
- Create: `tests/unit/email-template.test.ts`
- Create: `tests/integration/outbox-delivery.test.ts`

- [ ] **Step 1: Write template and replay tests**

Template tests require both `vi` and `en`, escaped user content, absolute
same-origin links, visible booking reference, dates, total, policy, and no raw
payment evidence.

Integration test runs two workers against one pending message and asserts one
provider delivery and one `SENT` transition.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/unit/email-template.test.ts
npx vitest run tests/integration/outbox-delivery.test.ts
```

Expected: FAIL with missing worker/templates.

- [ ] **Step 3: Implement lease and retry behavior**

Claim one row with a conditional update:

```ts
updateMany({
  where: {
    id,
    status: "PENDING",
    nextAttemptAt: { lte: now },
  },
  data: {
    status: "SENDING",
    leaseOwner,
    leaseExpiresAt,
    attempts: { increment: 1 },
  },
});
```

On success transition `SENDING → SENT` only for the lease owner. On failure
return to `PENDING` with backoff 1 minute, 5 minutes, 30 minutes, 2 hours, then
move to `DEAD` and create a DeadLetterRecord. A worker may recover an expired
lease. Provider `messageId` is stable across retries.

- [ ] **Step 4: Implement safe preview**

Preview files contain rendered subject/HTML/text and redacted delivery
metadata. The preview route exists only when `NODE_ENV !== "production"`,
requires a signed local dev session, rejects path input, and lists files from a
fixed directory. Production returns 404.

Run focused tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/notification src/app/api/internal/jobs/deliver-email src/app/[locale]/dev tests
git commit -m "feat: deliver transactional email from outbox"
```

### Task 2: Implement validated private-first hotel media

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/modules/media/media-policy.ts`
- Modify: `src/modules/media/local-media.provider.ts`
- Create: `src/modules/media/media.service.ts`
- Create: `src/app/api/admin/media/route.ts`
- Create: `src/app/api/admin/media/[mediaId]/publish/route.ts`
- Create: `src/app/api/admin/media/[mediaId]/trash/route.ts`
- Create: `src/app/[locale]/admin/media/page.tsx`
- Create: `tests/unit/media-policy.test.ts`
- Create: `tests/security/media-upload.test.ts`
- Create: `tests/integration/media-lifecycle.test.ts`

- [ ] **Step 1: Write policy tests**

Test exact allowlist:

```ts
["image/jpeg", "image/png", "image/webp", "image/avif"]
```

Reject SVG, GIF, PDF, MIME/bytes mismatch, more than 10MB, width/height above
6000, decode failure, symlink destination, and non-Manager/Admin publish.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing media policy.

- [ ] **Step 3: Implement validation and normalization**

Add `sharp` as a direct dependency. Stream to a randomly named private staging
file under `.local/media/private`, enforce byte count while streaming, decode
with Sharp, enforce dimensions, auto-rotate, strip metadata, and output WebP.
Do not trust filename or browser MIME. Reject SVG before decode by signature
and text prefix.

The local scanner records checks for file signature, successful decode,
dimension/size limits, metadata stripping, and normalized output digest. A
future antivirus adapter may add another scan, but `READY` is never set before
all configured checks pass.

- [ ] **Step 4: Implement lifecycle**

- Upload creates `MediaAsset(PRIVATE)`.
- Manager/Admin publish conditionally moves `PRIVATE → READY`.
- Delete conditionally moves `READY|PRIVATE → TRASHED` with `purgeAfter=+30d`.
- Purge job moves `TRASHED → PURGED` and removes the provider object exactly
  once.
- Public room queries select only `READY` media.
- Every publish/trash action shares a transaction with audit evidence.

Run tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json src/modules/media src/app/api/admin/media src/app/[locale]/admin/media tests
git commit -m "feat: validate and manage hotel media"
```

### Task 3: Generalize leased job execution and dead-letter recovery

**Files:**
- Modify: `src/modules/jobs/run-job.service.ts`
- Create: `src/modules/jobs/job-registry.ts`
- Create: `src/modules/jobs/retry-policy.ts`
- Create: `src/app/api/internal/jobs/[jobName]/route.ts`
- Modify: `scripts/run-job.mjs`
- Create: `src/app/[locale]/admin/jobs/page.tsx`
- Create: `tests/unit/retry-policy.test.ts`
- Create: `tests/integration/job-replay.test.ts`

- [ ] **Step 1: Write retry and deduplication tests**

```ts
assert.deepEqual(retryDelayMs(1), 60_000);
assert.deepEqual(retryDelayMs(2), 300_000);
assert.deepEqual(retryDelayMs(3), 1_800_000);
assert.equal(shouldDeadLetter(5), true);
```

Replay each registered job twice with the same key and assert no duplicate
inventory, email, media purge, or audit side effect.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL until registry and common execution are added.

- [ ] **Step 3: Implement an explicit registry**

```ts
export type JobHandler = (input: {
  key: string;
  now: Date;
  leaseOwner: string;
}) => Promise<{ processed: number }>;

export const jobRegistry = {
  "expire-holds": expireHoldsJob,
  "deliver-email": deliverEmailJob,
  "purge-media": purgeMediaJob,
} satisfies Record<string, JobHandler>;
```

Unknown names return 404. Every invocation has a caller-supplied stable key,
lease owner, lease expiry, attempts, timestamps, redacted error summary, and
terminal status. The internal route uses the existing constant-time JOB_SECRET
guard.

- [ ] **Step 4: Add dead-letter operations**

Manager/Admin can view dead letters. Only Admin may request a retry, which
creates a new JobExecution linked to the dead letter and an audit record; it
does not edit the original evidence.

Run tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/jobs src/app/api/internal/jobs src/app/[locale]/admin/jobs scripts/run-job.mjs tests
git commit -m "feat: run replay-safe hotel jobs"
```

### Task 4: Add redacted structured observability

**Files:**
- Create: `src/modules/shared/logger.ts`
- Create: `src/modules/shared/request-context.ts`
- Create: `src/modules/shared/metrics.ts`
- Modify: `src/lib/api-error.ts`
- Modify: `src/middleware.ts`
- Create: `src/app/api/health/live/route.ts`
- Create: `src/app/api/health/ready/route.ts`
- Create: `tests/unit/logger-redaction.test.ts`
- Create: `tests/security/health-routes.test.ts`

- [ ] **Step 1: Write logger redaction tests**

Given nested credentials, guest phone/email, webhook signature, cookies, raw
body, and payment evidence, assert none appears in serialized log output.
Allow booking reference, request ID, module, event name, duration, status code,
and irreversible keyed hashes used for correlation.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing logger.

- [ ] **Step 3: Implement structured events**

```ts
type LogEvent = {
  level: "debug" | "info" | "warn" | "error";
  event: string;
  module: string;
  requestId?: string;
  durationMs?: number;
  status?: number;
  fields?: Record<string, unknown>;
};
```

Redact before serialization. Production emits one JSON object per line.
Development uses readable formatting after the same redaction. Never pass raw
Error objects directly; extract name, approved code, and a server-only stack in
development.

- [ ] **Step 4: Add health and metrics contracts**

- `/api/health/live` proves the process responds and exposes no dependency
  detail.
- `/api/health/ready` performs a bounded database `SELECT 1`; failure returns
  503 and a generic body.
- Metrics count quote, booking, conflict, payment, webhook replay, job, email,
  and HTTP outcomes without PII or unbounded labels.
- Request IDs are accepted only if they match `[A-Za-z0-9_-]{8,100}`;
  otherwise generate a UUID.

Run tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/shared src/lib/api-error.ts src/middleware.ts src/app/api/health tests
git commit -m "feat: add redacted Aurora observability"
```

### Task 5: Implement consent and data-subject workflows

**Files:**
- Create: `src/modules/privacy/consent.ts`
- Create: `src/modules/privacy/export-customer-data.service.ts`
- Create: `src/modules/privacy/delete-customer-data.service.ts`
- Create: `src/app/api/account/privacy/export/route.ts`
- Create: `src/app/api/account/privacy/delete/route.ts`
- Create: `src/app/[locale]/account/privacy/page.tsx`
- Create: `src/components/public/cookie-consent.tsx`
- Create: `tests/unit/consent.test.ts`
- Create: `tests/integration/privacy-workflow.test.ts`
- Modify: `docs/security/PRIVACY_DATA_POLICY.md`

- [ ] **Step 1: Write consent and minimization tests**

Test default consent:

```ts
assert.deepEqual(defaultConsent(), {
  necessary: true,
  analytics: false,
  marketing: false,
  version: "aurora-consent-v1",
});
```

Test that export contains customer profile, consents, bookings, guests,
services, cancellations, payment summaries, and audit actions concerning the
user, but excludes secrets, other users, provider evidence, and internal
security telemetry.

Also test a guest with a valid booking-access cookie: export is limited to that
booking, and a cookie for another booking cannot export or delete it.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing privacy module.

- [ ] **Step 3: Implement consent**

Consent is locale-aware, keyboard accessible, reversible, and versioned.
Necessary cookies do not require opt-in. Analytics and marketing scripts are
not present in P0; choosing those categories records preference only and loads
nothing.

- [ ] **Step 4: Implement export and deletion**

- Require recent authentication and customer ownership, or a valid one-use
  guest booking-access grant scoped to one booking.
- Export as a streamed JSON file with request ID and generated timestamp.
- Deletion revokes sessions, removes credentials and optional profile fields,
  replaces email/name/phone with deterministic non-reversible aliases, and
  keeps minimized booking/payment/audit evidence required for system integrity.
- Do not delete another guest's data embedded in a shared booking.
- Create audit evidence without storing the exported content.
- State clearly in the policy that commercial retention periods and legal
  review must be decided before a real launch.

Run tests.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/modules/privacy src/app/api/account/privacy src/app/[locale]/account/privacy src/components/public/cookie-consent.tsx tests docs/security/PRIVACY_DATA_POLICY.md
git commit -m "feat: add consent and privacy workflows"
```

### Task 6: Add guarded PostgreSQL backup and restore drills

**Files:**
- Create: `scripts/backup-postgres.mjs`
- Create: `scripts/restore-postgres.mjs`
- Create: `tests/backup-restore.test.ts`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `docs/operations/BACKUP_RESTORE.md`

- [ ] **Step 1: Write command-construction and guard tests**

Inject the command runner and assert:

```ts
buildBackupArgs("operations/backups/aurora.dump")
// ["--format=custom", "--no-owner", "--no-privileges", "--file", absolutePath, databaseUrl]
```

Restore must reject production hosts, database names not ending
`_restore_test`, destinations outside `operations/backups`, symlink paths, and
missing `CONFIRM_RESTORE=aurora_restore_test`.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL with missing scripts.

- [ ] **Step 3: Implement backup**

Use `execFile` with `shell:false`, resolve `pg_dump` from PATH, create a
timestamped custom-format dump under `operations/backups`, write an adjacent
SHA-256 file, and print no connection credentials. Add
`operations/backups/*` to `.gitignore` except `.gitkeep`.

- [ ] **Step 4: Implement restore drill**

Verify dump SHA-256 before invoking `pg_restore`. Restore only into a local
database ending `_restore_test`, run `prisma migrate status`, execute a
read-only integrity script that checks model counts and inventory invariants,
and record the drill result without committing the dump.

Add scripts:

```json
"db:backup": "node scripts/backup-postgres.mjs",
"db:restore:drill": "node scripts/restore-postgres.mjs"
```

Run tests with a mocked runner, then one real local restore drill before final
release.

- [ ] **Step 5: Commit**

```powershell
git add scripts tests/backup-restore.test.ts .gitignore package.json package-lock.json docs/operations/BACKUP_RESTORE.md operations/backups/.gitkeep
git commit -m "chore: add guarded database recovery drills"
```

### Task 7: Complete bilingual SEO and crawl contracts

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/[locale]/(public)/rooms/[slug]/page.tsx`
- Create: `src/app/[locale]/(public)/booking-policies/page.tsx`
- Create: `src/modules/hotel/public-hotel.service.ts`
- Create: `tests/unit/seo.test.ts`
- Create: `e2e/seo.spec.ts`

- [ ] **Step 1: Write metadata tests**

Require locale-specific title/description, canonical URL, reciprocal
`vi-VN`/`en` alternates, hotel structured data, room structured data, and no
indexing of account, booking management, operations, admin, API, mock provider,
or dev preview routes.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL because current metadata identifies Starter.

- [ ] **Step 3: Implement metadata and structured data**

- Production `metadataBase` comes from validated `PUBLIC_APP_URL`.
- Public pages use database-backed Aurora content.
- Structured data contains only real seeded/project content and actual prices
  labeled as starting rates.
- No fabricated rating, review count, award, or availability claim.
- Sitemap contains public localized routes and active room types only.
- Robots disallow private/operational paths without treating robots as access
  control.

- [ ] **Step 4: Verify output**

Playwright checks head tags, canonical/alternate links, JSON-LD parsing,
sitemap, and robots in both locales.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/app src/modules/hotel tests/unit/seo.test.ts e2e/seo.spec.ts
git commit -m "feat: publish bilingual Aurora SEO contracts"
```

### Task 8: Enforce accessibility, visual, and performance budgets

**Files:**
- Modify: `e2e/layout-safety.spec.ts`
- Create: `e2e/accessibility.spec.ts`
- Create: `e2e/visual-regression.spec.ts`
- Create: `e2e/native-scroll.spec.ts`
- Create: `scripts/check-bundle-budget.mjs`
- Create: `tests/bundle-budget.test.ts`
- Modify: `package.json`
- Modify: `docs/quality/ACCESSIBILITY.md`
- Modify: `docs/quality/PERFORMANCE_BUDGET.md`

- [ ] **Step 1: Add deterministic experience tests**

Cover desktop and mobile snapshots for header, first hero frame, booking
console, Suite Spotlight, checkout summary, front desk, housekeeping, and rate
calendar. Disable time/animation and seed fixed data before screenshots.

Accessibility scans cover every primary journey and require no serious or
critical axe violations plus manual checklist evidence for screen-reader labels,
focus order, focus restoration, and status announcements.

- [ ] **Step 2: Add native-scroll regression**

At a page taller than four viewports:

```ts
await page.keyboard.press("End");
expect(await page.evaluate(() => Math.round(scrollY + innerHeight))).toBeGreaterThanOrEqual(
  await page.evaluate(() => document.documentElement.scrollHeight - 2),
);
await page.keyboard.press("Home");
expect(await page.evaluate(() => scrollY)).toBe(0);
```

Also test scrollbar dragging, anchor links, back/forward restoration, and
reduced motion. Assert there is no Lenis global, `.pin-spacer`, or wheel/touch
prevent-default listener.

- [ ] **Step 3: Add bundle and asset budgets**

Fail when:

- a hero image exceeds 450KB;
- a room image exceeds 350KB;
- route-specific client JavaScript for the homepage exceeds the recorded
  baseline by 20KB without an approved budget change;
- more than the first hero image is eagerly loaded;
- font files include unused families/weights.

Add:

```json
"test:visual": "playwright test e2e/visual-regression.spec.ts",
"performance:check": "node scripts/check-bundle-budget.mjs"
```

- [ ] **Step 4: Measure Core Web Vitals**

Use a production build and throttled mobile Lighthouse runs for `/vi`,
availability results, and checkout. Record median of three local runs and
target LCP ≤2.5s, CLS ≤0.1, and no long interaction task indicating INP above
200ms. Label these as lab results; do not call them production p75 field data.

Run all experience tests.

Expected: tests and documented budgets pass.

- [ ] **Step 5: Commit**

```powershell
git add e2e scripts/check-bundle-budget.mjs tests/bundle-budget.test.ts package.json package-lock.json docs/quality
git commit -m "test: enforce Aurora experience budgets"
```

### Task 9: Harden deployment configuration and CI

**Files:**
- Modify: `next.config.ts`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/security.yml`
- Modify: `.github/workflows/diagrams.yml`
- Create: `.github/workflows/backup-drill.yml`
- Modify: `docs/operations/ENVIRONMENTS.md`
- Modify: `docs/operations/MONITORING.md`
- Modify: `docs/operations/RELEASE_CHECKLIST.md`
- Create: `docs/operations/DEMO_RUNBOOK.md`
- Modify: `README.md`
- Modify: `SECURITY.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/architecture/diagrams/system-context.mmd`
- Modify: `docs/architecture/diagrams/containers.mmd`
- Modify: `docs/architecture/diagrams/modules.mmd`
- Modify: `docs/architecture/diagrams/erd.mmd`
- Modify: `docs/architecture/diagrams/request-flow.mmd`
- Modify: `docs/architecture/diagrams/auth-flow.mmd`
- Modify: `docs/architecture/diagrams/authz-flow.mmd`
- Modify: `docs/architecture/diagrams/role-permission-map.mmd`
- Modify: `docs/architecture/diagrams/session-lifecycle.mmd`
- Modify: `docs/architecture/diagrams/data-lifecycle.mmd`
- Modify: `docs/architecture/diagrams/verification-idempotency-sequence.mmd`
- Modify: `docs/architecture/diagrams/migration-flow.mmd`
- Modify: `docs/architecture/diagrams/deployment.mmd`
- Modify: `docs/architecture/diagrams/release-flow.mmd`
- Modify: `docs/architecture/diagrams/email-outbox-flow.mmd`
- Modify: `docs/architecture/diagrams/upload-flow.mmd`
- Modify: `docs/architecture/diagrams/monitoring-architecture.mmd`
- Modify: `docs/architecture/diagrams/backup-restore-pipeline.mmd`
- Create: `tests/security/production-config.test.ts`

- [ ] **Step 1: Write production-config tests**

Require:

- secure headers and CSP;
- no wildcard provider origins;
- required production env validation;
- mock/dev/preview routes unavailable in production;
- auth/public-write limiter fail-closed without distributed backend;
- source maps and logs do not expose secrets;
- image remote patterns are absent for local-only P0 media.

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL until deployment contracts are explicit.

- [ ] **Step 3: Harden CI**

CI uses the project Node engine, `npm ci`, a PostgreSQL service with a dedicated
test database, deterministic migrations/seed, and gates in this order:

```text
lint → typecheck → unit/integration/security → build → Playwright E2E
```

Security workflow runs root audit at high severity, secret scanning, dependency
review where available, and production-config tests. Diagram workflow validates
Mermaid and ERD convergence. Backup drill runs only against an ephemeral CI
database.

- [ ] **Step 4: Document environment and rollback**

Document local, test, preview, and production variables; provider selection;
migration order; health checks; rollback decision; job pausing; database backup;
restore drill; payment reconciliation; and incident contact ownership. Live
VNPay, Resend, Vercel Blob paid upgrades, domain, and paid capacity remain disabled until
explicit owner approval.

`README.md` and `DEMO_RUNBOOK.md` must give copy-paste commands for clean
installation, PostgreSQL creation, environment setup, migration, seed, dev
server, seeded role sign-in, mock-payment success/failure/pending, email
preview, job execution, tests, and release verification. `SECURITY.md` records
private vulnerability reporting and demo limitations; `CHANGELOG.md` records
the P0 release without claiming live-provider readiness.

Bring every required and capability diagram listed in this task in sync with
the implemented modules, trust boundaries, Prisma model names, deployment
shape, release gates, and local-first providers. Update
`diagram-manifest.yml` fingerprints and validate them through the supported
Agent OS diagram command.

Run tests and lint.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add next.config.ts .github docs README.md SECURITY.md CHANGELOG.md tests/security/production-config.test.ts
git commit -m "chore: harden Aurora deployment gates"
```

### Task 10: Build and verify the final release manifest

**Files:**
- Create: `scripts/release-manifest.mjs`
- Create: `tests/release-manifest.test.ts`
- Create: `operations/release-evidence/aurora-p0-final/manifest.json`
- Create: `operations/release-evidence/aurora-p0-final/commands.jsonl`
- Create: `operations/release-evidence/aurora-p0-final/README.md`
- Create: `operations/release-evidence/aurora-p0-final/artifacts.sha256`
- Modify: `docs/product/REQUIREMENTS_TRACEABILITY.md`
- Modify: `docs/architecture/diagrams/diagram-manifest.yml`
- Modify: `docs/operations/RELEASE_CHECKLIST.md`
- Modify: `package.json`

- [ ] **Step 1: Write negative verifier tests**

The verifier must exit non-zero for:

- missing implementation/test/diagram/evidence file;
- any SHA-256 mismatch;
- environment Node/npm/OS mismatch;
- a skipped required gate;
- catalog or project drift;
- diagram failure;
- dirty Git tree;
- current commit different from the manifest commit.

Each test edits an isolated temporary manifest, never project evidence.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --experimental-strip-types --test tests/release-manifest.test.ts
```

Expected: FAIL because the verifier is absent.

- [ ] **Step 3: Implement the manifest contract**

```ts
type HashedArtifact = { path: string; sha256: string };
type ReleaseManifest = {
  version: "aurora-p0-1.0.0";
  commit: string;
  environment: { nodeVersion: string; npmVersion: string; os: string };
  implementationFiles: HashedArtifact[];
  testFiles: HashedArtifact[];
  diagramFiles: HashedArtifact[];
  evidenceFiles: HashedArtifact[];
  gates: Array<{ id: "lint" | "typecheck" | "test" | "build" | "e2e" | "doctor" | "converge" | "diagrams"; passed: true; command: string }>;
  gatesSkipped: false;
};
```

Resolve every path canonically beneath the repository, reject symlinks, hash
actual bytes, compare runtime environment, run Git status/commit checks with
`execFile` and `shell:false`, and call supported Agent OS commands from
`D:\ProjectZ\Template`.

Add:

```json
"release:verify": "node scripts/release-manifest.mjs --verify operations/release-evidence/aurora-p0-final/manifest.json"
```

- [ ] **Step 4: Run the complete clean-install release**

From a clean Git checkout with safe test database variables:

```powershell
npm ci
npm audit --audit-level=high
npm run design:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
npm run performance:check
npm run release:verify
```

From `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

Perform and record one real restore drill against the local database ending
`_restore_test`. Record exact exit codes/counts; failed gates remain failed.

- [ ] **Step 5: Finalize evidence and commit**

Map all P0 requirements REQ-001 through REQ-016 to existing implementation,
test, and diagram files. Generate the final manifest only after the evidence
files are complete, then verify `artifacts.sha256` and the manifest.

```powershell
git add scripts/release-manifest.mjs tests/release-manifest.test.ts operations/release-evidence/aurora-p0-final docs package.json package-lock.json
git commit -m "chore: attest Aurora Hotel P0 release"
npm run release:verify
git status --short
```

Expected: verifier exits 0 and working tree is empty.
