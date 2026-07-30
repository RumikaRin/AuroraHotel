# Security Policy for Aurora Hotel

## Reporting

Do not publish suspected vulnerabilities in public issues. Report them through
the project owner's approved private channel with reproduction steps, impact,
affected revision, and suggested containment. Never include live credentials or
personal data.

## Baseline

The active controls are defined in `docs/security/SECURITY_BASELINE.md` and
`docs/security/THREAT_MODEL.md`. Capability-specific security contracts live
under `docs/security/capabilities/`.

## Required response

1. Triage severity and affected trust boundary.
2. Revoke or rotate exposed credentials immediately.
3. Add a failing regression test before the fix where practical.
4. Verify authorization, validation, audit, concurrency, and replay behavior.
5. Record remediation evidence and residual risk.
