# Aurora Cloud Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run Aurora Hotel on Vercel Hobby with isolated Neon databases and a
private-to-public Vercel Blob media lifecycle, without requiring local
PostgreSQL or Docker.

**Architecture:** Application traffic uses a pooled Neon URL through the Prisma
Neon adapter while migrations, backup, and restore use a direct URL. Test reset
is allowed only after static and live database-identity checks. Administrator
uploads enter a private Blob store, are decoded and normalized by a server-owned
workflow, and are copied as new bytes into a public Blob store only after
validation.

**Tech Stack:** Next.js 15.5.22, Node.js >=22.6, TypeScript 5.7, Prisma 6.19.3,
Neon serverless driver 1.1.0, Vercel Blob 2.6.1, Sharp 0.35.3, Zod 3, Vitest 3,
Playwright, Mermaid.

---

## Execution order and supersession

This plan implements the approved
`docs/superpowers/specs/2026-07-31-aurora-cloud-deployment-design.md` and changes
specific provider decisions in the previously approved Aurora P0 program.

Execute in this order:

1. Run Tasks 1 through 4 of this plan in place of the localhost-specific parts
   of Task 2 in `2026-07-31-aurora-hotel-01-foundation.md`.
2. Continue Foundation Tasks 3 and 4.
3. Run Task 5 of this plan immediately after Foundation Task 4 defines the full
   Aurora schema.
4. Continue the remainder of plans 01 through 04.
5. Run Tasks 6 and 7 of this plan in place of the provider-specific parts of
   Platform Task 2.
6. Run Task 8 alongside Platform Task 3.
7. Run Task 9 in place of the local-only parts of Platform Task 6.
8. Run Tasks 10 through 12 in place of the provider-specific parts of Platform
   Tasks 9 and 10.

The following old instructions are superseded:

- localhost-only PostgreSQL reset;
- SQLite E2E database;
- local PostgreSQL as a required development or test service;
- Cloudinary as the deployed media adapter;
- `.local/media` as the deployed media store;
- CI PostgreSQL service containers;
- local-only restore targets;
- absence of remote image origins in production.

No other P0 requirement, security invariant, test gate, or business behavior is
weakened.

## File responsibility map

```text
prisma.config.ts                              direct Prisma CLI connection
prisma/schema.prisma                          PostgreSQL schema and media states
src/lib/db.ts                                 pooled Neon Prisma singleton
src/server/config/database-identity.ts        URL and environment identity checks
src/server/config/environment.ts              fail-closed server env parsing
scripts/reset-test-db.mjs                     guarded Neon test reset
scripts/check-cloud-env.mjs                   secret-safe configuration preflight
tests/database-identity.test.ts                pure database guard tests
tests/reset-test-db.test.ts                    destructive runner contract tests
playwright.config.ts                           isolated Neon E2E configuration
src/modules/media/media-provider.ts            provider-neutral object-store port
src/modules/media/vercel-blob.provider.ts      private/public Blob adapter
src/modules/media/media-policy.ts              byte, format, size and state policy
src/modules/media/media.service.ts             upload, validation, publication lifecycle
src/modules/media/vercel-upload-handler.ts     short-lived direct-upload tokens
src/app/api/admin/media/intents/route.ts       authenticated upload-intent API
src/app/api/admin/media/upload/route.ts        Vercel token/callback endpoint
src/app/api/admin/media/[mediaId]/complete/route.ts
                                                idempotent local/deployed completion
src/app/api/admin/media/[mediaId]/publish/route.ts
                                                audited READY to PUBLISHED transition
src/app/api/admin/media/[mediaId]/trash/route.ts
                                                recoverable deletion
src/modules/jobs/daily-maintenance.service.ts  bounded idempotent maintenance
src/app/api/internal/jobs/daily-maintenance/route.ts
                                                CRON_SECRET-protected trigger
vercel.json                                   once-daily Hobby cron
scripts/backup-postgres.mjs                   direct Neon pg_dump
scripts/restore-postgres.mjs                  guarded isolated restore drill
scripts/verify-cloud-deployment.mjs           preview/production identity smoke checks
next.config.ts                                exact Blob image origin
src/lib/security-headers.ts                   exact Blob CSP origins
docs/architecture/diagrams/*.mmd              cloud trust and data flows
docs/operations/*.md                          setup, deploy, backup and recovery runbooks
```

## Provider provisioning checkpoint

Before a command connects to Neon or Vercel, the owner must be signed in to
those providers and authorize creation of:

- one Neon project named `aurora-hotel`;
- Neon branches `development`, `test`, `preview`, and `production`;
- databases and roles matching the table in the approved cloud design;
- one private Blob store named `aurora-media-private`;
- one public Blob store named `aurora-media-public`;
- one Vercel project linked to this repository.

Credentials are generated in provider dashboards and stored only in `.env.local`,
Vercel Environment Variables, or GitHub Actions secrets. Do not paste their
values into Git, plan checkboxes, command evidence, issue text, or chat output.

Required server variable names:

```dotenv
DATABASE_ENVIRONMENT=development
DATABASE_URL=postgresql://runtime-role:secret@ep-runtime-pooler.region.aws.neon.tech/aurora_development?sslmode=require
DIRECT_URL=postgresql://migration-role:secret@ep-runtime.region.aws.neon.tech/aurora_development?sslmode=require
TEST_DATABASE_URL=postgresql://aurora_test_runner:secret@ep-test-pooler.region.aws.neon.tech/aurora_test?sslmode=require
TEST_DIRECT_URL=postgresql://aurora_test_runner:secret@ep-test.region.aws.neon.tech/aurora_test?sslmode=require
ALLOW_REMOTE_TEST_RESET=aurora_test
MEDIA_PROVIDER=vercel-blob
BLOB_PRIVATE_READ_WRITE_TOKEN=
BLOB_PUBLIC_READ_WRITE_TOKEN=
NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN=https://exact-private-store.private.blob.vercel-storage.com
NEXT_PUBLIC_MEDIA_ORIGIN=https://exact-public-store.public.blob.vercel-storage.com
CRON_SECRET=
```

The examples above are syntax examples, not working credentials. Actual secrets
must never be committed.

### Task 1: Align the P0 program with the approved cloud design

**Files:**
- Modify: `docs/superpowers/plans/2026-07-31-aurora-hotel-implementation-program.md`
- Modify: `docs/superpowers/plans/2026-07-31-aurora-hotel-01-foundation.md`
- Modify: `docs/superpowers/plans/2026-07-31-aurora-hotel-05-platform-release.md`
- Modify: `project-manifest.yml`
- Modify: `project-blueprint.yml`
- Test: `tests/unit/cloud-contract-docs.test.ts`

- [ ] **Step 1: Write the failing document-contract test**

Create `tests/unit/cloud-contract-docs.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const read = (path: string) => readFile(path, "utf8");

describe("approved cloud contracts", () => {
  it("names Neon, Vercel, and both Blob trust zones", async () => {
    const [manifest, blueprint, program, foundation, platform] =
      await Promise.all([
        read("project-manifest.yml"),
        read("project-blueprint.yml"),
        read("docs/superpowers/plans/2026-07-31-aurora-hotel-implementation-program.md"),
        read("docs/superpowers/plans/2026-07-31-aurora-hotel-01-foundation.md"),
        read("docs/superpowers/plans/2026-07-31-aurora-hotel-05-platform-release.md"),
      ]);

    for (const text of [manifest, blueprint, program, foundation, platform]) {
      assert.match(text, /Neon/);
      assert.match(text, /Vercel/);
    }
    assert.match(blueprint, /aurora-media-private/);
    assert.match(blueprint, /aurora-media-public/);
    assert.doesNotMatch(foundation, /must target localhost/);
    assert.doesNotMatch(platform, /Cloudinary/);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --experimental-strip-types --test tests/unit/cloud-contract-docs.test.ts
```

Expected: FAIL because the old plans still require localhost and Cloudinary.

- [ ] **Step 3: Amend only the superseded decisions**

Make these exact semantic changes:

Keep the existing manifest schema and replace `hosting.target` with one folded
string that names Vercel Hobby, Neon Free, the private/public Vercel Blob
stores, and the owner-approval-required paid-upgrade rule.

In `project-blueprint.yml`, replace the existing `file-upload` provider entry
with the same provider-list shape:

```yaml
- id: file-upload-vercel-blob-private-quarantine-public-delivery
  capabilityId: file-upload
  provider: Vercel Blob with aurora-media-private for quarantine and
    aurora-media-public for validated delivery. Domain logic depends on the
    provider-neutral MediaProvider interface. Paid upgrades require explicit
    owner approval.
  status: selected
  sourceRefs:
    - discovery:file-storage
```

Add this plan to the program's execution table. In plans 01 and 05, mark only
the superseded provider paragraphs and point to this plan; retain all unaffected
tasks and acceptance criteria.

- [x] **Step 4: Regenerate manifest bindings and verify GREEN**

Recompute blueprint SHA-256 values through the supported Agent OS workflow.
Do not edit `.agent-os/lock.json` manually.

Run from `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- check-drift --catalog
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
```

Then run from Aurora:

```powershell
node --experimental-strip-types --test tests/unit/cloud-contract-docs.test.ts
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```powershell
git add docs/superpowers/plans project-manifest.yml project-blueprint.yml tests/unit/cloud-contract-docs.test.ts
git commit -m "docs: bind Aurora P0 to Neon and Vercel"
```

### Task 2: Pin cloud dependencies and validate environment identity

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`
- Create: `src/server/config/database-identity.ts`
- Create: `src/server/config/environment.ts`
- Create: `tests/database-identity.test.ts`
- Create: `tests/environment.test.ts`

- [ ] **Step 1: Write failing identity and environment tests**

`tests/database-identity.test.ts` must contain:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertNeonPair,
  parseDatabaseIdentity,
} from "../src/server/config/database-identity.ts";

const pooled =
  "postgresql://aurora_test_runner:s@ep-test-pooler.us-east-2.aws.neon.tech/aurora_test?sslmode=require";
const direct =
  "postgresql://aurora_test_runner:s@ep-test.us-east-2.aws.neon.tech/aurora_test?sslmode=require";

describe("Neon connection identity", () => {
  it("accepts one pooled/direct pair for the same database and role", () => {
    assert.deepEqual(assertNeonPair(pooled, direct, "test"), {
      environment: "test",
      database: "aurora_test",
      role: "aurora_test_runner",
      pooledHost: "ep-test-pooler.us-east-2.aws.neon.tech",
      directHost: "ep-test.us-east-2.aws.neon.tech",
    });
  });

  for (const source of [
    "file:./e2e.db",
    "postgresql://aurora_test_runner:s@evil-neon.tech/aurora_test?sslmode=require",
    "postgresql://aurora_test_runner:s@ep-test.neon.tech/aurora_test",
  ]) {
    it(`rejects ${source}`, () => {
      assert.throws(() => parseDatabaseIdentity(source));
    });
  }

  it("rejects a production URL in the test environment", () => {
    assert.throws(() =>
      assertNeonPair(
        pooled.replace("aurora_test", "aurora_production"),
        direct.replace("aurora_test", "aurora_production"),
        "test",
      ),
    );
  });
});
```

`tests/environment.test.ts` asserts:

```ts
const validDevelopmentEnv = {
  NODE_ENV: "development",
  DATABASE_ENVIRONMENT: "development",
  DATABASE_URL:
    "postgresql://aurora_development_app:s@ep-dev-pooler.us-east-2.aws.neon.tech/aurora_development?sslmode=require",
  DIRECT_URL:
    "postgresql://aurora_development_app:s@ep-dev.us-east-2.aws.neon.tech/aurora_development?sslmode=require",
};

assert.equal(
  readRuntimeEnvironment(validDevelopmentEnv).databaseEnvironment,
  "development",
);
assert.throws(() =>
  readRuntimeEnvironment({
    ...validDevelopmentEnv,
    DATABASE_ENVIRONMENT: "production",
  }),
);
assert.throws(() =>
  readMediaEnvironment({
    MEDIA_PROVIDER: "vercel-blob",
    BLOB_PRIVATE_READ_WRITE_TOKEN: "",
    BLOB_PUBLIC_READ_WRITE_TOKEN: "",
    NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN:
      "https://private.private.blob.vercel-storage.com",
    NEXT_PUBLIC_MEDIA_ORIGIN:
      "https://public.public.blob.vercel-storage.com",
  }),
);
```

- [ ] **Step 2: Run and verify RED**

```powershell
node --experimental-strip-types --test tests/database-identity.test.ts tests/environment.test.ts
```

Expected: FAIL with missing configuration modules.

- [ ] **Step 3: Install exact compatible dependencies**

Run:

```powershell
npm install --save-exact @prisma/adapter-neon@6.19.3 @neondatabase/serverless@1.1.0 @vercel/blob@2.6.1 sharp@0.35.3
npm install --save-dev --save-exact vercel@58.4.0
```

Keep `prisma` and `@prisma/client` aligned at `6.19.3`. Do not upgrade Prisma
major versions in this work.

- [ ] **Step 4: Implement the pure identity contract**

`src/server/config/database-identity.ts`:

```ts
export type DatabaseEnvironment =
  | "development"
  | "test"
  | "preview"
  | "production"
  | "restore-test";

const expected = {
  development: {
    database: "aurora_development",
    role: "aurora_development_app",
  },
  test: { database: "aurora_test", role: "aurora_test_runner" },
  preview: { database: "aurora_preview", role: "aurora_preview_app" },
  production: {
    database: "aurora_production",
    role: "aurora_production_app",
  },
  "restore-test": {
    database: "aurora_restore_test",
    role: "aurora_restore_runner",
  },
} as const;

export function parseDatabaseIdentity(source: string) {
  const url = new URL(source);
  const database = decodeURIComponent(url.pathname.replace(/^\/+/u, ""));
  const role = decodeURIComponent(url.username);
  if (
    url.protocol !== "postgresql:" ||
    !url.hostname.endsWith(".neon.tech") ||
    url.hostname === "neon.tech" ||
    url.searchParams.get("sslmode") !== "require" ||
    !database ||
    !role
  ) {
    throw new Error("Invalid Neon PostgreSQL identity");
  }
  return {
    database,
    role,
    hostname: url.hostname.toLowerCase(),
    pooled: url.hostname.includes("-pooler."),
  };
}

export function assertNeonPair(
  pooledSource: string,
  directSource: string,
  environment: DatabaseEnvironment,
) {
  const pooled = parseDatabaseIdentity(pooledSource);
  const direct = parseDatabaseIdentity(directSource);
  const contract = expected[environment];
  if (
    !pooled.pooled ||
    direct.pooled ||
    pooled.database !== contract.database ||
    direct.database !== contract.database ||
    pooled.role !== contract.role ||
    direct.role !== contract.role
  ) {
    throw new Error(`Neon identity mismatch for ${environment}`);
  }
  return {
    environment,
    database: contract.database,
    role: contract.role,
    pooledHost: pooled.hostname,
    directHost: direct.hostname,
  };
}
```

Implement `environment.ts` with Zod and separate
`readRuntimeEnvironment(source)` and `readMediaEnvironment(source)` functions.
The runtime reader calls `assertNeonPair`; the media reader requires both Blob
tokens and exact HTTPS origins ending in their respective
`.private.blob.vercel-storage.com` and
`.public.blob.vercel-storage.com` suffixes. It returns no unknown keys and never
serializes secret values.

- [ ] **Step 5: Replace `.env.example` with non-secret Neon/Blob contracts**

Document every variable from the provisioning checkpoint. Use clearly invalid
syntax-example credentials and state that `.env.local` is Git-ignored.
`DATABASE_ENVIRONMENT` defaults nowhere; its absence is an error.

- [ ] **Step 6: Verify and commit**

```powershell
node --experimental-strip-types --test tests/database-identity.test.ts tests/environment.test.ts
npm run typecheck
npm audit --audit-level=high
git add package.json package-lock.json .env.example src/server/config tests/database-identity.test.ts tests/environment.test.ts
git commit -m "chore: define Aurora cloud environment contracts"
```

Expected: tests and typecheck pass; audit reports zero high-or-higher
vulnerabilities.

### Task 3: Switch Prisma runtime and CLI to Neon

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma.config.ts`
- Modify: `src/lib/db.ts`
- Create: `tests/neon-prisma-config.test.ts`

- [ ] **Step 1: Write the failing Prisma configuration test**

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Neon Prisma configuration", () => {
  it("uses PostgreSQL, a JS driver adapter, pooled runtime and direct CLI URLs", async () => {
    const [schema, config, db] = await Promise.all([
      readFile("prisma/schema.prisma", "utf8"),
      readFile("prisma.config.ts", "utf8"),
      readFile("src/lib/db.ts", "utf8"),
    ]);
    assert.match(schema, /provider\s*=\s*"postgresql"/);
    assert.match(schema, /engineType\s*=\s*"client"/);
    assert.match(config, /DIRECT_URL/);
    assert.match(db, /PrismaNeon/);
    assert.match(db, /DATABASE_URL/);
    assert.doesNotMatch(schema, /provider\s*=\s*"sqlite"/);
  });
});
```

- [ ] **Step 2: Run and verify RED**

```powershell
node --experimental-strip-types --test tests/neon-prisma-config.test.ts
```

Expected: FAIL because the starter still uses SQLite.

- [ ] **Step 3: Configure Prisma CLI and generated client**

Use:

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider   = "prisma-client-js"
  engineType = "client"
}
```

Use this `prisma.config.ts` shape:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

- [ ] **Step 4: Use the pooled URL at runtime**

`src/lib/db.ts` must construct one adapter and one client:

```ts
import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { readRuntimeEnvironment } from "@/server/config/environment";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const environment = readRuntimeEnvironment(process.env);
  const adapter = new PrismaNeon({
    connectionString: environment.databaseUrl,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

Do not instantiate a direct-url Prisma client in application code.

- [ ] **Step 5: Verify and commit**

With authorized Neon development variables loaded:

```powershell
npx prisma generate
npx prisma format
npx prisma validate
node --experimental-strip-types --test tests/neon-prisma-config.test.ts
npm run typecheck
git add prisma/schema.prisma prisma.config.ts src/lib/db.ts tests/neon-prisma-config.test.ts
git commit -m "chore: connect Prisma runtime to Neon"
```

Expected: all commands exit 0. No migration is created until Foundation Task 4
defines the complete Aurora schema.

### Task 4: Replace SQLite reset with a fail-closed Neon test reset

**Files:**
- Delete: `scripts/reset-e2e-db.mjs`
- Delete: `tests/reset-e2e-db.test.ts`
- Create: `scripts/reset-test-db.mjs`
- Create: `tests/reset-test-db.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing reset tests**

Tests inject `queryIdentity`, `resetSchema`, and `runPrisma` and assert this
exact successful sequence:

```ts
assert.deepEqual(events, [
  ["identity", "aurora_test", "aurora_test_runner"],
  ["drop-create-schema", "aurora_test"],
  ["prisma", ["migrate", "deploy"]],
  ["prisma", ["db", "seed"]],
]);
```

Add negative cases for:

```ts
[
  { DATABASE_ENVIRONMENT: "production" },
  { ALLOW_REMOTE_TEST_RESET: "" },
  { ALLOW_REMOTE_TEST_RESET: "aurora_production" },
  { database: "aurora_production" },
  { role: "aurora_production_app" },
  { liveDatabase: "aurora_preview" },
  { liveRole: "aurora_preview_app" },
  { sameAsProductionUrl: true },
]
```

Every negative case must assert that no schema or Prisma operation ran.

- [ ] **Step 2: Run and verify RED**

```powershell
node --experimental-strip-types --test tests/reset-test-db.test.ts
```

Expected: FAIL because `scripts/reset-test-db.mjs` is absent.

- [ ] **Step 3: Implement the guarded reset without shell or bypass flags**

The exported API and orchestration body are:

```js
export function canonicalConnection(source) {
  const url = new URL(source);
  url.password = "";
  url.searchParams.sort();
  return url.toString();
}

export async function resetTestDatabase({
  pooledUrl,
  directUrl,
  environment,
  confirmation,
  productionUrl,
  queryIdentity,
  resetSchema,
  runPrisma,
}) {
  const expected = assertNeonPair(pooledUrl, directUrl, "test");
  if (
    environment !== "test" ||
    confirmation !== "aurora_test" ||
    (productionUrl &&
      canonicalConnection(productionUrl) ===
        canonicalConnection(directUrl))
  ) {
    throw new Error("Refusing remote test reset");
  }

  const live = await queryIdentity(directUrl);
  if (
    live.database !== expected.database ||
    live.role !== expected.role
  ) {
    throw new Error("Live Neon identity mismatch");
  }

  await resetSchema(directUrl, expected);
  const childEnvironment = {
    ...process.env,
    NODE_ENV: "test",
    DATABASE_ENVIRONMENT: "test",
    DATABASE_URL: pooledUrl,
    DIRECT_URL: directUrl,
    SEED_PROFILE: "e2e",
  };
  await runPrisma(["migrate", "deploy"], childEnvironment);
  await runPrisma(["db", "seed"], childEnvironment);
}
```

Before mutation:

```js
const expected = assertNeonPair(pooledUrl, directUrl, "test");
if (
  environment !== "test" ||
  confirmation !== "aurora_test" ||
  (productionUrl && canonicalConnection(productionUrl) === canonicalConnection(directUrl))
) {
  throw new Error("Refusing remote test reset");
}
const live = await queryIdentity(directUrl);
if (
  live.database !== expected.database ||
  live.role !== expected.role
) {
  throw new Error("Live Neon identity mismatch");
}
```

`queryIdentity` executes only:

```sql
SELECT current_database() AS database, current_user AS role
```

`resetSchema` executes constant SQL against the already verified direct URL:

```sql
DROP SCHEMA IF EXISTS public CASCADE
CREATE SCHEMA public AUTHORIZATION aurora_test_runner
```

Then call the local Prisma CLI with `execFileSync(process.execPath, args, {
shell: false })` for `migrate deploy` and `db seed`. Pass the pooled URL as
`DATABASE_URL`, direct URL as `DIRECT_URL`, and `SEED_PROFILE=e2e`. Do not use
`--force`, a shell command string, or print either URL.

- [ ] **Step 4: Update scripts**

Use:

```json
{
  "db:test:reset": "node --experimental-strip-types scripts/reset-test-db.mjs",
  "e2e:db": "node --experimental-strip-types scripts/reset-test-db.mjs"
}
```

The executable path requires `TEST_DATABASE_URL`, `TEST_DIRECT_URL`,
`DATABASE_ENVIRONMENT=test`, and
`ALLOW_REMOTE_TEST_RESET=aurora_test`.

- [ ] **Step 5: Verify and commit**

```powershell
node --experimental-strip-types --test tests/reset-test-db.test.ts
npm run typecheck
git add package.json package-lock.json scripts tests/reset-test-db.test.ts
git commit -m "test: guard remote Neon database reset"
```

Expected: pure and mocked-runner tests pass without touching a database.

### Task 5: Create and prove the Aurora PostgreSQL baseline

**Insertion point:** Immediately after Foundation Task 4 replaces the commerce
schema with the complete Aurora schema.

**Files:**
- Delete: `prisma/migrations/20260726183448_init/migration.sql`
- Create: `prisma/migrations/20260731010000_aurora_baseline/migration.sql`
- Modify: `prisma/migrations/migration_lock.toml`
- Modify: `prisma/seed.ts`
- Modify: `playwright.config.ts`
- Create: `tests/integration/neon-baseline.test.ts`

- [ ] **Step 1: Extend the schema contract before migration**

In addition to the Foundation Task 4 assertions, require:

```ts
assert.match(schema, /enum MediaStatus\s*\{[^}]*UPLOADING[^}]*VALIDATING[^}]*READY[^}]*PUBLISHED[^}]*REJECTED[^}]*TRASHED[^}]*PURGED[^}]*\}/s);
assert.match(schema, /quarantineUrl\s+String\?/);
assert.match(schema, /publicUrl\s+String\?/);
assert.match(schema, /sha256\s+String\?/);
assert.match(schema, /providerEtag\s+String\?/);
```

Run the schema contract and verify RED until these media lifecycle fields are
present.

- [ ] **Step 2: Create the migration only on Neon development**

Load the authorized development pair into `DATABASE_URL` and `DIRECT_URL`.
Confirm `DATABASE_ENVIRONMENT=development`, then run:

```powershell
npx prisma format
npx prisma validate
npx prisma migrate dev --name aurora_baseline --create-only
```

Inspect the generated SQL. It must use PostgreSQL enums, foreign keys, unique
constraints, and indexes from the schema and must contain no SQLite syntax.

- [ ] **Step 3: Deploy to development and isolated test**

Development:

```powershell
npx prisma migrate deploy
npx prisma db seed
```

Test:

```powershell
npm run db:test:reset
```

Neither command may target preview or production.

- [ ] **Step 4: Add a real integration identity test**

`tests/integration/neon-baseline.test.ts` connects through
`TEST_DATABASE_URL` and asserts:

```ts
expect(identity).toEqual({
  database: "aurora_test",
  role: "aurora_test_runner",
});
expect(await prisma.hotel.count()).toBe(1);
expect(await prisma.role.count()).toBe(5);
```

It also checks the migration table contains exactly the committed Aurora
baseline.

- [ ] **Step 5: Configure Playwright**

At config load, require `TEST_DATABASE_URL` and `TEST_DIRECT_URL`. Pass:

```ts
export const e2eEnv = {
  NODE_ENV: "test",
  DATABASE_ENVIRONMENT: "test",
  DATABASE_URL: process.env.TEST_DATABASE_URL,
  DIRECT_URL: process.env.TEST_DIRECT_URL,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  TEST_DIRECT_URL: process.env.TEST_DIRECT_URL,
  ALLOW_REMOTE_TEST_RESET: "aurora_test",
  AUTH_SECRET: "e2e-only-secret-do-not-use-in-production-0123456789",
  AUTH_TRUST_HOST: "true",
  AUTH_URL: baseUrl,
  PORT: String(port),
};
```

Keep `workers: 1` and run `npm run e2e:db && npm run dev`.

- [ ] **Step 6: Verify and commit**

```powershell
npx vitest run tests/integration/neon-baseline.test.ts
npm run e2e
npm run typecheck
git add prisma playwright.config.ts tests/integration/neon-baseline.test.ts
git commit -m "feat: establish Aurora schema on Neon"
```

Expected: integration test passes and Playwright uses only `aurora_test`.

### Task 6: Implement the dual-store Vercel Blob adapter

**Insertion point:** Replace the deployment-adapter portion of Platform Task 2.

**Files:**
- Modify: `src/modules/media/media-provider.ts`
- Delete: `src/modules/media/local-media.provider.ts`
- Create: `src/modules/media/in-memory-media.provider.ts`
- Create: `src/modules/media/vercel-blob.provider.ts`
- Modify: `src/modules/providers/provider-factory.ts`
- Create: `tests/unit/vercel-blob-provider.test.ts`
- Modify: `tests/unit/provider-factory.test.ts`

- [ ] **Step 1: Write failing provider tests**

Define the port:

```ts
export type PrivateMediaObject = {
  pathname: string;
  url: string;
  etag: string;
  size: number;
  contentType: string;
  bytes: Uint8Array;
};

export type PublishedMediaObject = Omit<PrivateMediaObject, "bytes">;

export interface MediaProvider {
  readPrivate(urlOrPathname: string): Promise<PrivateMediaObject>;
  putPublic(input: {
    pathname: string;
    bytes: Uint8Array;
    contentType: "image/webp";
  }): Promise<PublishedMediaObject>;
  removePrivate(urlOrPathname: string, etag?: string): Promise<void>;
  removePublic(urlOrPathname: string, etag?: string): Promise<void>;
}
```

Tests assert private reads use only the private token, public puts use only the
public token, access values are exact, and delete forwards `ifMatch` when an
ETag is known.

- [ ] **Step 2: Run and verify RED**

```powershell
node --experimental-strip-types --test tests/unit/vercel-blob-provider.test.ts tests/unit/provider-factory.test.ts
```

Expected: FAIL because the provider does not exist.

- [ ] **Step 3: Implement the adapter with injectable SDK calls**

Use `get`, `put`, and `del` from `@vercel/blob`. The concrete calls are:

```ts
const result = await get(urlOrPathname, {
  access: "private",
  token: privateToken,
});

const published = await put(pathname, bytes, {
  access: "public",
  token: publicToken,
  contentType: "image/webp",
  addRandomSuffix: false,
  allowOverwrite: false,
  cacheControlMaxAge: 31_536_000,
});

await del(urlOrPathname, {
  token,
  ...(etag ? { ifMatch: etag } : {}),
});
```

Reject a missing result, null stream, size above 10 MB, a private URL passed to
`removePublic`, or a public URL passed to `removePrivate`. Convert the private
stream with `new Response(result.stream).arrayBuffer()`. The adapter never logs
tokens or signed URLs.

- [ ] **Step 4: Keep only an in-memory test adapter**

`InMemoryMediaProvider` implements the same interface using two maps. It is
selected only when `NODE_ENV=test`. `MEDIA_PROVIDER=vercel-blob` is required in
development, preview, and production. Missing Blob variables fail startup; no
filesystem fallback is allowed.

- [ ] **Step 5: Verify and commit**

```powershell
node --experimental-strip-types --test tests/unit/vercel-blob-provider.test.ts tests/unit/provider-factory.test.ts
npm run typecheck
git add src/modules/media src/modules/providers tests/unit
git commit -m "feat: add private and public Vercel Blob stores"
```

### Task 7: Implement private upload, validation, and publication

**Files:**
- Modify: `src/modules/media/media-policy.ts`
- Modify: `src/modules/media/media.service.ts`
- Create: `src/modules/media/vercel-upload-handler.ts`
- Create: `src/app/api/admin/media/intents/route.ts`
- Create: `src/app/api/admin/media/upload/route.ts`
- Create: `src/app/api/admin/media/[mediaId]/complete/route.ts`
- Modify: `src/app/api/admin/media/[mediaId]/publish/route.ts`
- Modify: `src/app/api/admin/media/[mediaId]/trash/route.ts`
- Modify: `src/app/[locale]/admin/media/page.tsx`
- Modify: `next.config.ts`
- Modify: `src/lib/security-headers.ts`
- Create: `tests/security/media-upload.test.ts`
- Create: `tests/integration/media-lifecycle.test.ts`

- [ ] **Step 1: Write failing security and lifecycle tests**

Require this state sequence:

```text
UPLOADING -> VALIDATING -> READY -> PUBLISHED -> TRASHED -> PURGED
             \-> REJECTED
```

Test:

- only `media:publish` holders can create intents or publish;
- token paths are exactly
  `quarantine/{hotelId}/{mediaId}/{safeFilename}`;
- token lifetime is at most 10 minutes;
- allowed types are JPEG, PNG, WebP, and AVIF;
- maximum upload size is 10 MB;
- SVG, PDF, MIME spoofing, decode failure, polyglot input, and dimensions above
  6000 by 6000 become `REJECTED`;
- callbacks and explicit completion may replay without duplicate public objects;
- only normalized WebP bytes enter the public store;
- only `PUBLISHED` media appears in public room queries;
- failed public put leaves the record recoverable and unpublished;
- publish and trash share a transaction with redacted audit evidence.

- [ ] **Step 2: Run and verify RED**

```powershell
npx vitest run tests/security/media-upload.test.ts tests/integration/media-lifecycle.test.ts
```

Expected: FAIL with missing routes and Vercel handler.

- [ ] **Step 3: Create the upload intent and client-token handler**

The intent body is:

```ts
const createMediaIntentSchema = z.object({
  hotelId: z.string().cuid(),
  originalName: z.string().trim().min(1).max(160),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]),
  size: z.number().int().min(1).max(10 * 1024 * 1024),
  altVi: z.string().trim().min(1).max(240),
  altEn: z.string().trim().min(1).max(240),
});
```

The route calls `requirePermission(session, "media:publish")`, creates one
`UPLOADING` record, and returns its ID and server-owned pathname.

Use `handleUpload`:

```ts
return handleUpload({
  body,
  request,
  token: environment.privateBlobToken,
  onBeforeGenerateToken: async (pathname, clientPayload) => {
    const intent = await authorizeUploadIntent({
      pathname,
      clientPayload,
      session,
    });
    return {
      allowedContentTypes: [intent.contentType],
      maximumSizeInBytes: intent.size,
      validUntil: Date.now() + 10 * 60 * 1000,
      addRandomSuffix: false,
      allowOverwrite: false,
      tokenPayload: JSON.stringify({
        mediaId: intent.mediaId,
        actorUserId: intent.actorUserId,
      }),
    };
  },
  onUploadCompleted: async ({ blob, tokenPayload }) => {
    await completeMediaUpload({ blob, tokenPayload });
  },
});
```

The admin page uploads directly to the private store:

```ts
const blob = await upload(intent.pathname, file, {
  access: "private",
  handleUploadUrl: "/api/admin/media/upload",
  clientPayload: JSON.stringify({ mediaId: intent.mediaId }),
  multipart: file.size > 4.5 * 1024 * 1024,
});
const completion = await fetch(
  `/api/admin/media/${intent.mediaId}/complete`,
  {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    url: blob.url,
    pathname: blob.pathname,
    etag: blob.etag,
  }),
  },
);
if (!completion.ok) {
  throw new Error("Media upload completion failed");
}
```

Validate `clientPayload` with Zod and re-read the intent from PostgreSQL. Never
trust role, hotel, expected size, or status from the browser payload.
Do not require a browser session before calling `handleUpload` for every request:
the completion callback comes from Vercel. Authenticate inside
`onBeforeGenerateToken`; let `handleUpload` authenticate its callback and then
validate the signed `tokenPayload`, exact object identity, and database state.

- [ ] **Step 4: Make completion idempotent**

Both the Vercel callback and the authenticated completion route call one
service. It verifies private-store hostname, exact pathname, ETag, provider
size, content type, record ownership, and current status. A conditional update
claims `UPLOADING -> VALIDATING`. Replays in `VALIDATING`, `READY`, or
`PUBLISHED` return the current record; conflicting object identity returns 409.

The explicit completion route exists because Vercel cannot call localhost. It
does not weaken validation and may not set `READY` directly.

- [ ] **Step 5: Validate, normalize, and publish new bytes**

Read private bytes through `MediaProvider`, enforce the byte limit again, and
use Sharp:

```ts
const input = sharp(bytes, {
  failOn: "error",
  limitInputPixels: 6000 * 6000,
});
const metadata = await input.metadata();
if (
  !metadata.width ||
  !metadata.height ||
  metadata.width > 6000 ||
  metadata.height > 6000 ||
  !["jpeg", "png", "webp", "avif"].includes(metadata.format ?? "")
) {
  throw new MediaValidationError("Unsupported image content");
}
const normalized = await input
  .rotate()
  .webp({ quality: 84, effort: 5 })
  .toBuffer();
const sha256 = createHash("sha256").update(normalized).digest("hex");
```

Put `normalized` at `media/{hotelId}/{mediaId}-{sha256}.webp` in the public
store. Conditionally update `VALIDATING -> READY` with URL, pathname, ETag,
digest, dimensions, and byte size. Delete the quarantine object after commit.
If deletion fails, enqueue deduplicated orphan cleanup.

Validation failure conditionally writes `REJECTED`, stores a bounded redacted
reason code, and schedules quarantine deletion.

- [ ] **Step 6: Publish and trash transactionally**

`publish` performs `READY -> PUBLISHED` and writes the audit row in the same
Prisma transaction. `trash` performs
`READY|PUBLISHED -> TRASHED`, sets `purgeAfter=now+30 days`, and writes audit
evidence in the same transaction. Public queries require
`status: "PUBLISHED"`.

Configure exact origins:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: new URL(process.env.NEXT_PUBLIC_MEDIA_ORIGIN!).hostname,
    },
  ],
}
```

CSP `img-src` adds only `NEXT_PUBLIC_MEDIA_ORIGIN`; `connect-src` adds only
`NEXT_PUBLIC_BLOB_UPLOAD_ORIGIN`. Reject missing, HTTP, wildcard, or
wrong-suffix origins during production build.

- [ ] **Step 7: Verify and commit**

```powershell
npx vitest run tests/security/media-upload.test.ts tests/integration/media-lifecycle.test.ts
npm run lint
npm run typecheck
git add src/modules/media src/app/api/admin/media src/app/[locale]/admin/media next.config.ts src/lib/security-headers.ts tests
git commit -m "feat: validate and publish Vercel Blob media"
```

### Task 8: Add request-driven cleanup and a Hobby-safe daily sweep

**Files:**
- Create: `src/modules/jobs/daily-maintenance.service.ts`
- Create: `src/modules/jobs/cron-auth.ts`
- Create: `src/app/api/internal/jobs/daily-maintenance/route.ts`
- Create: `vercel.json`
- Modify: `src/modules/inventory/availability.service.ts`
- Modify: `src/modules/booking/create-booking.service.ts`
- Create: `tests/unit/cron-auth.test.ts`
- Create: `tests/integration/daily-maintenance.test.ts`

- [ ] **Step 1: Write failing replay and authorization tests**

Assert:

```ts
assert.equal(
  authorizeCron(`Bearer ${secret}`, secret),
  true,
);
assert.equal(authorizeCron("Bearer wrong", secret), false);
assert.equal(authorizeCron(null, secret), false);
```

Run two maintenance workers with the same deduplication key. Assert expired
holds release inventory once, orphan private blobs delete once, trashed public
media purge once, and outbox retry does not duplicate delivery.

- [ ] **Step 2: Run and verify RED**

```powershell
node --experimental-strip-types --test tests/unit/cron-auth.test.ts
npx vitest run tests/integration/daily-maintenance.test.ts
```

- [ ] **Step 3: Implement constant-time cron authentication**

Reject missing secrets and compare equal-length SHA-256 digests with
`timingSafeEqual`:

```ts
export function authorizeCron(header: string | null, secret: string | undefined) {
  if (!header || !secret || secret.length < 32) return false;
  const actual = createHash("sha256").update(header).digest();
  const expected = createHash("sha256")
    .update(`Bearer ${secret}`)
    .digest();
  return timingSafeEqual(actual, expected);
}
```

The route returns 401 before any database call when authentication fails.

- [ ] **Step 4: Implement bounded idempotent maintenance**

One invocation processes bounded batches:

```ts
await releaseExpiredHolds({ now, limit: 100 });
await deliverOutbox({ now, limit: 50 });
await validatePendingMedia({ now, limit: 20 });
await deleteOrphanedPrivateMedia({ now, limit: 50 });
await purgeTrashedMedia({ now, limit: 50 });
```

Every worker uses conditional state ownership and stable deduplication keys.
Failures are recorded and retried; one failed category does not falsify success
for another category.

Availability and booking creation call `releaseExpiredHolds({ now, limit: 50 })`
before calculating sellable inventory. Correctness still comes from expiry
predicates and conditional inventory updates, not from the cleanup schedule.

- [ ] **Step 5: Configure one daily Hobby cron**

Create:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/internal/jobs/daily-maintenance",
      "schedule": "0 3 * * *"
    }
  ]
}
```

The schedule is daily because Vercel Hobby rejects more frequent cron
expressions and does not promise minute-level precision.

- [ ] **Step 6: Verify and commit**

```powershell
node --experimental-strip-types --test tests/unit/cron-auth.test.ts
npx vitest run tests/integration/daily-maintenance.test.ts
git add src/modules/jobs src/modules/inventory src/modules/booking src/app/api/internal/jobs vercel.json tests
git commit -m "feat: add idempotent cloud maintenance"
```

### Task 9: Adapt backup and restore drills to Neon direct connections

**Files:**
- Create: `scripts/backup-postgres.mjs`
- Create: `scripts/restore-postgres.mjs`
- Create: `scripts/lib/postgres-command.mjs`
- Create: `tests/backup-restore.test.ts`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `docs/operations/BACKUP_RESTORE.md`
- Create: `operations/backups/.gitkeep`

- [ ] **Step 1: Write failing argument and safety tests**

Expected backup arguments:

```ts
assert.deepEqual(buildPgDumpArgs(outputPath), [
  "--format=custom",
  "--no-owner",
  "--no-privileges",
  "--file",
  outputPath,
]);
```

The URL is passed through `PGDATABASE`, never as an argv item. Restore rejects:

- pooled URLs;
- any database except `aurora_restore_test`;
- any role except `aurora_restore_runner`;
- `CONFIRM_RESTORE` other than `aurora_restore_test`;
- a dump or output path outside `operations/backups`;
- symlinks or junctions;
- a mismatched SHA-256 sidecar;
- a restore URL equal to development, test, preview, or production.

- [ ] **Step 2: Run and verify RED**

```powershell
node --experimental-strip-types --test tests/backup-restore.test.ts
```

- [ ] **Step 3: Implement backup**

Resolve `pg_dump` with `where.exe pg_dump` on Windows and fail with a clear
missing-client-tools message if absent. Use `execFile` with `shell:false`,
`DIRECT_URL` through the child environment, a timestamped custom-format dump,
and an adjacent `.sha256` file. Redact stderr before persistence or display.

Use scripts:

```json
{
  "db:backup": "node --experimental-strip-types scripts/backup-postgres.mjs",
  "db:restore:drill": "node --experimental-strip-types scripts/restore-postgres.mjs"
}
```

- [ ] **Step 4: Implement isolated restore**

Verify the live database and role before invoking `pg_restore`. Use:

```text
pg_restore --clean --if-exists --no-owner --no-privileges --exit-on-error
```

Pass the restore URL only through `PGDATABASE`. After restore, run
`prisma migrate status` with restore `DIRECT_URL`, then execute read-only
integrity checks for hotel, role, inventory, booking-total, and foreign-key
invariants.

- [ ] **Step 5: Run a real restore rehearsal and commit**

After the owner supplies the isolated restore credentials:

```powershell
npm run db:backup
npm run db:restore:drill
node --experimental-strip-types --test tests/backup-restore.test.ts
git add scripts tests/backup-restore.test.ts .gitignore package.json package-lock.json docs/operations/BACKUP_RESTORE.md operations/backups/.gitkeep
git commit -m "chore: rehearse Neon backup and restore"
```

Expected: backup checksum verifies, restore target identity is
`aurora_restore_test`/`aurora_restore_runner`, and integrity checks pass. Do not
commit the dump.

### Task 10: Harden Vercel build, environment, and CI contracts

**Files:**
- Create: `scripts/check-cloud-env.mjs`
- Create: `tests/security/cloud-production-config.test.ts`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/security.yml`
- Modify: `.github/workflows/diagrams.yml`
- Modify: `.github/workflows/backup-drill.yml`
- Modify: `package.json`
- Modify: `docs/operations/ENVIRONMENTS.md`

- [ ] **Step 1: Write failing production-config tests**

Assert:

- production uses `aurora_production` and `aurora_production_app`;
- preview uses `aurora_preview` and `aurora_preview_app`;
- both URL pairs are Neon, SSL-required, and pooled/direct as declared;
- production and preview canonical URLs differ;
- Blob private/public origins are exact HTTPS origins with no path, query,
  fragment, userinfo, port, or wildcard;
- private and public tokens differ;
- `CRON_SECRET` is at least 32 characters;
- browser-exposed variables contain no token, password, direct URL, or
  connection string;
- `MEDIA_PROVIDER=vercel-blob`;
- mock payment remains selected for the graduation deployment.

- [ ] **Step 2: Run and verify RED**

```powershell
npx vitest run tests/security/cloud-production-config.test.ts
```

- [ ] **Step 3: Implement secret-safe preflight**

`check-cloud-env.mjs` imports the pure parsers and prints only:

```json
{
  "databaseEnvironment": "preview",
  "database": "aurora_preview",
  "role": "aurora_preview_app",
  "pooledHost": "redacted-host-digest",
  "directHost": "redacted-host-digest",
  "privateBlobOriginConfigured": true,
  "publicBlobOriginConfigured": true,
  "cronSecretConfigured": true
}
```

Host digests are the first 12 hexadecimal characters of SHA-256. The script
returns non-zero for every missing or contradictory requirement.

Add:

```json
{
  "cloud:check": "node --experimental-strip-types scripts/check-cloud-env.mjs"
}
```

- [ ] **Step 4: Replace CI service databases with Neon test secrets**

GitHub Actions uses encrypted secrets:

```yaml
env:
  NODE_ENV: test
  DATABASE_ENVIRONMENT: test
  DATABASE_URL: ${{ secrets.NEON_TEST_DATABASE_URL }}
  DIRECT_URL: ${{ secrets.NEON_TEST_DIRECT_URL }}
  TEST_DATABASE_URL: ${{ secrets.NEON_TEST_DATABASE_URL }}
  TEST_DIRECT_URL: ${{ secrets.NEON_TEST_DIRECT_URL }}
  ALLOW_REMOTE_TEST_RESET: aurora_test
  MEDIA_PROVIDER: test
```

Use a concurrency group so two workflows cannot reset the same Neon test
database:

```yaml
concurrency:
  group: aurora-neon-test
  cancel-in-progress: false
```

Run `npm ci`, `npm run db:test:reset`, then gates in the required order. Never
run a reset job from forks where secrets are unavailable; report the integration
gate as not executed rather than replacing it with SQLite.

- [ ] **Step 5: Verify and commit**

```powershell
npx vitest run tests/security/cloud-production-config.test.ts
npm run lint
npm run typecheck
git add scripts/check-cloud-env.mjs tests/security/cloud-production-config.test.ts .github package.json package-lock.json docs/operations/ENVIRONMENTS.md
git commit -m "ci: enforce isolated Neon cloud environments"
```

### Task 11: Update cloud diagrams, runbooks, and traceability

**Files:**
- Modify: `docs/architecture/ARCHITECTURE.md`
- Modify: `docs/architecture/DATA_MODEL.md`
- Modify: `docs/architecture/DATA_DICTIONARY.md`
- Modify: `docs/architecture/diagrams/system-context.mmd`
- Modify: `docs/architecture/diagrams/containers.mmd`
- Modify: `docs/architecture/diagrams/data-lifecycle.mmd`
- Modify: `docs/architecture/diagrams/upload-flow.mmd`
- Modify: `docs/architecture/diagrams/migration-flow.mmd`
- Modify: `docs/architecture/diagrams/deployment.mmd`
- Modify: `docs/architecture/diagrams/release-flow.mmd`
- Modify: `docs/architecture/diagrams/monitoring-architecture.mmd`
- Modify: `docs/architecture/diagrams/backup-restore-pipeline.mmd`
- Modify: `docs/architecture/diagrams/diagram-manifest.yml`
- Modify: `docs/operations/MONITORING.md`
- Modify: `docs/operations/RELEASE_CHECKLIST.md`
- Modify: `docs/operations/DEMO_RUNBOOK.md`
- Modify: `docs/product/REQUIREMENTS_TRACEABILITY.md`
- Modify: `README.md`

- [ ] **Step 1: Add diagram contract assertions**

Extend diagram tests to require exact nodes and edges for:

```text
Vercel Next.js -> Neon pooled endpoint
Migration runner -> Neon direct endpoint
Browser -> private Blob upload
Private Blob -> validation worker
Validation worker -> public Blob
Public Blob -> public room image
Daily Vercel Cron -> maintenance endpoint
Backup runner -> isolated restore database
```

Assert no diagram shows browser access to a Blob token, application requests
using the direct database URL, or test reset reaching production.

- [ ] **Step 2: Update Mermaid sources and ERD**

The ERD includes every MediaAsset field and status implemented in Task 7.
Deployment and upload diagrams show separate private and public Blob stores.
Migration and backup diagrams distinguish pooled and direct endpoints.

- [ ] **Step 3: Write copy-paste runbooks**

Runbooks must cover:

- initial Neon and Vercel dashboard setup;
- environment mapping and secret ownership;
- `vercel env pull` into ignored `.env.local`;
- development, test reset, migration, seed, and E2E commands;
- private/public Blob setup and exact-origin configuration;
- preview promotion and production smoke tests;
- daily maintenance and manual retry;
- free-quota monitoring and owner-approved upgrade rule;
- backup and isolated restore rehearsal;
- incident response for database, Blob, migration, and quota failure.

Never include a real credential or provider-generated URL containing userinfo.

- [ ] **Step 4: Validate diagrams and traceability**

From `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
```

Expected: every command exits 0 and all required SVGs match their Mermaid
sources.

- [ ] **Step 5: Commit**

```powershell
git add docs README.md
git commit -m "docs: document Aurora cloud operations"
```

### Task 12: Verify preview, production, and release evidence

**Files:**
- Create: `scripts/verify-cloud-deployment.mjs`
- Create: `tests/verify-cloud-deployment.test.ts`
- Modify: `operations/release-evidence/aurora-p0-1.0.0/manifest.json`
- Modify: `operations/release-evidence/aurora-p0-1.0.0/commands.jsonl`
- Modify: `operations/release-evidence/aurora-p0-1.0.0/README.md`
- Modify: `operations/release-evidence/aurora-p0-1.0.0/artifacts.sha256`

- [ ] **Step 1: Write failing deployment-verifier tests**

Use an injected HTTP client and assert failure for:

- preview reports a production database identity;
- production reports a preview database identity;
- health response exposes a URL, role password, token, or raw hostname;
- application cannot reach Neon;
- production media origin is private or unexpected;
- unauthorized admin route does not return 401/403;
- booking smoke replay creates two booking IDs;
- required release gate is absent or skipped.

- [ ] **Step 2: Run and verify RED**

```powershell
node --experimental-strip-types --test tests/verify-cloud-deployment.test.ts
```

- [ ] **Step 3: Implement a sanitized verifier**

The verifier requires `--environment preview|production` and a `--base-url`
value that parses as an exact HTTPS origin with no path, query, fragment, or
userinfo.
It calls:

```text
GET /api/health/live
GET /api/health/ready
GET /api/public/availability with fixed safe demo dates
POST /api/bookings with one stable smoke idempotency key
GET /api/bookings/by-idempotency-key/{key}
GET /api/admin with no session
```

The health response exposes only environment, database-name allowlist result,
connectivity boolean, migration fingerprint, and provider readiness booleans.
It never exposes URLs, hostnames, usernames, tokens, guest data, or payment
evidence.

The booking smoke uses mock payment and asserts replay returns the same booking
ID. Production smoke records use a dedicated non-PII marker and are cancelled
through the normal audited workflow after verification.

- [ ] **Step 4: Run all release gates in order**

With test credentials:

```powershell
npm ci
npm audit --audit-level=high
npm run db:test:reset
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

With preview credentials:

```powershell
npm run cloud:check
node scripts/verify-cloud-deployment.mjs --environment preview --base-url $env:AURORA_PREVIEW_URL
```

After controlled migration and production deployment:

```powershell
npm run cloud:check
node scripts/verify-cloud-deployment.mjs --environment production --base-url $env:AURORA_PRODUCTION_URL
```

From `D:\ProjectZ\Template`:

```powershell
npm run agent-os -- check-drift --catalog
npm run agent-os -- doctor --target D:\ProjectZ\AuroraHotel
npm run agent-os -- converge --target D:\ProjectZ\AuroraHotel
npm run agent-os -- diagrams --check --target D:\ProjectZ\AuroraHotel
```

Every command must have an actual exit code and retained sanitized output.

- [ ] **Step 5: Generate and verify release evidence**

Hash actual implementation, test, diagram, and evidence files. The manifest
records:

```ts
type CloudEnvironmentEvidence = {
  environment: "preview" | "production";
  databaseName: "aurora_preview" | "aurora_production";
  databaseIdentityVerified: true;
  pooledRuntimeVerified: true;
  directMigrationVerified: true;
  privateBlobVerified: true;
  publicBlobVerified: true;
  restoreDrillVerified: true;
  paidUpgradeEnabled: false;
};
```

The evidence must not contain secrets, raw provider URLs, personal data, or
signed Blob URLs.

- [ ] **Step 6: Final verification and commit**

Run the release-manifest verifier defined by Platform Task 10, confirm
`git status --short` is empty except the evidence being finalized, then:

```powershell
git add scripts/verify-cloud-deployment.mjs tests/verify-cloud-deployment.test.ts operations/release-evidence
git commit -m "release: attest Aurora Neon and Vercel deployment"
```

Re-run the manifest verifier against the final commit. Expected: exit 0,
`gatesSkipped=false`, clean Git tree, and every declared hash matches disk.

## Final acceptance checklist

- [ ] Development runs on Neon without a local PostgreSQL server or Docker.
- [ ] Test, preview, production, and restore use different database/role pairs.
- [ ] Negative tests prove reset cannot reach non-test data.
- [ ] Prisma runtime uses the pooled URL; CLI operations use the direct URL.
- [ ] The complete Aurora PostgreSQL baseline is migrated and seeded.
- [ ] Upload authorization is short-lived and permission checked.
- [ ] Unvalidated media remains in the private Blob store.
- [ ] Only normalized WebP bytes enter the public Blob store.
- [ ] Public room queries select only `PUBLISHED` media.
- [ ] Request-driven hold expiry preserves booking correctness without cron.
- [ ] Daily Vercel Hobby maintenance is authenticated and replay safe.
- [ ] Backup and isolated restore rehearsal pass.
- [ ] Preview and production environment identity checks pass.
- [ ] Lint, typecheck, test, build, and E2E pass in order.
- [ ] Doctor, drift, convergence, diagrams, and release manifest pass.
- [ ] Release evidence contains no secret, personal data, or signed provider URL.
- [ ] No paid upgrade is enabled.

## Official implementation references

- Prisma ORM v6 with Neon:
  https://docs.prisma.io/docs/orm/v6/overview/databases/neon
- Neon connection pooling:
  https://neon.com/docs/connect/connection-pooling
- Vercel Blob SDK:
  https://vercel.com/docs/vercel-blob/using-blob-sdk
- Vercel Blob client uploads:
  https://vercel.com/docs/vercel-blob/client-upload
- Vercel Blob private storage:
  https://vercel.com/docs/vercel-blob/private-storage
- Vercel Cron Hobby limits:
  https://vercel.com/docs/cron-jobs/usage-and-pricing
- Securing Vercel Cron:
  https://vercel.com/docs/cron-jobs/manage-cron-jobs
