# Antigravity Execution Handoff — Aurora Hotel

You are the sole implementation agent for this handoff. Work directly in:

`D:\ProjectZ\AuroraHotel\.worktrees\aurora-cloud-deployment`

Branch:

`codex/aurora-cloud-deployment`

Do not edit the parent checkout at `D:\ProjectZ\AuroraHotel`. Do not create
subagents. Do not use permission-bypass flags, `--force`, SQLite fallbacks, or
unapproved paid services.

## Required reading

Read completely before editing:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/superpowers/specs/2026-07-31-aurora-hotel-system-design.md`
4. `docs/superpowers/specs/2026-07-31-aurora-cloud-deployment-design.md`
5. `docs/superpowers/plans/2026-07-31-aurora-cloud-deployment-implementation-plan.md`
6. `docs/superpowers/plans/2026-07-31-aurora-hotel-implementation-program.md`
7. All five detailed Aurora plans `01-foundation` through
   `05-platform-release`.

Use the `executing-plans`, `test-driven-development`,
`systematic-debugging`, and `verification-before-completion` workflows when
applicable.

## Current verified state

- Worktree baseline commit: `d6ad103`
- Parent planning commits already included:
  - `adad93d docs: define Aurora cloud deployment architecture`
  - `a37be3f docs: plan Aurora Neon and Vercel deployment`
- `npm ci`: passed, 451 packages audited, 0 vulnerabilities.
- Baseline `npm test`: passed, 24 Node tests and 2 Vitest files.
- One uncommitted RED test exists:
  `tests/unit/cloud-contract-docs.test.ts`
- That test has already failed for the correct reason: the old manifest/plans
  do not yet name Neon and both Vercel Blob trust zones.

Preserve the RED test and continue Task 1 from the GREEN implementation step.

## Correct global execution order

The cloud plan has one sequencing clarification:

1. Finish Cloud Task 1 (contract alignment) using the existing RED test.
2. Execute Foundation Task 1 (design-lock verification).
3. Execute Cloud Tasks 2–4 in place of the old localhost-specific Foundation
   Task 2.
4. Execute Foundation Tasks 3–4.
5. Execute Cloud Task 5 immediately after the complete Aurora Prisma schema
   exists.
6. Complete Foundation Tasks 5–10 and Booking/Recovery/Operations plans 02–04.
7. In Platform plan 05, replace provider-specific portions with Cloud Tasks
   6–12 according to the cloud plan.

Record this clarification in the implementation-program documents during Cloud
Task 1 so future agents cannot execute source work before the design lock.

## Execution rules

- Follow strict RED → verify RED → minimal GREEN → verify GREEN → refactor.
- Commit at every task boundary with the plan’s commit message.
- Keep the working tree scoped; preserve unrelated user work.
- Use pooled Neon `DATABASE_URL` only at runtime.
- Use direct `DIRECT_URL` only for Prisma CLI, backup, and restore.
- Never print, persist, or commit credentials or provider URLs containing
  userinfo.
- Remote database reset must remain impossible until all static and live
  `aurora_test`/`aurora_test_runner` guards pass.
- Do not run migrations, seed, reset, backup, restore, Vercel deployment, or
  Blob mutations against a real provider until the owner supplies/authorizes
  the required environment credentials.
- If credentials are unavailable, complete every offline-testable code,
  contract, documentation, and negative-test step. Stop at the first genuinely
  live-only gate and report:
  - completed commits;
  - exact blocked command;
  - exact missing variable/resource names;
  - tests and gates actually run;
  - remaining task/step numbers.
- Never claim a live Neon, Blob, preview, production, backup, or release gate
  passed without real output.
- Do not silently switch back to SQLite, local PostgreSQL, Docker, Cloudinary,
  Supabase, or another provider.

## Required quality gates

At each task boundary run the focused commands in the plan. Before any
completion claim, run and retain real output for:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Run Agent OS commands from `D:\ProjectZ\Template` exactly as specified in the
plan. A missing secret or live service is a blocked gate, not a passing or
skipped gate.

## Final report format

Report:

1. Commits created, one line each.
2. Tasks and steps completed.
3. Exact verification commands, exit codes, and test counts.
4. Live provider resources actually verified.
5. Blockers and missing environment variables.
6. Remaining task/step numbers.
7. Final `git status --short`.
