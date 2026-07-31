# Aurora Hotel P0 release evidence

This is the canonical local release-evidence bundle for Aurora Hotel P0.

- Source commit: `9a44482a3b9b585b9bf5fad5ef3d31875133eb98`
- Branch: `codex/aurora-cloud-deployment`
- Verification date: `2026-07-31`
- Runtime: Node `v24.16.0`, npm `11.13.0`, Windows `Windows_NT`
- Required release gates skipped: none
- Production deployment performed: no
- Production database changed: no

## Verified outcome

The source commit passed lint, TypeScript, unit/security tests, production
build, real-database Playwright E2E, Agent OS doctor, convergence, catalog
drift, and all 25 architecture-diagram checks. Playwright is configured with
`reuseExistingServer: false`, so the guarded Neon test reset cannot be bypassed
by an already-running development server.

`commands.jsonl` records the exact command and result summary for the eight
required manifest gates. `audit-report.md` records the remediation scope and
remaining production-only limitations. `artifacts.sha256` covers these
human-readable evidence artifacts. `manifest.json` binds source, tests,
rendered diagrams, evidence, runtime, and required gates to SHA-256 hashes.

## Remaining production-only release condition

A real backup/restore drill against an isolated `aurora_restore_test` database
was not run because this workspace does not have a separate restore-test
connection. Create and authorize that isolated target before a production
release. Do not point the restore runner at development, preview, test, or
production databases.

The historical `../agent-os-v2-0.1.0/` directory is non-canonical Template
runner output and is not part of this Aurora attestation.
