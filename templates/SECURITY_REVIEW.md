# Security Review Template

- Auditor: <auditor>
- Status: <status>
- Audit Findings: <findings>

## Scope and threat model delta

- Revision, features, trust boundaries, roles, and data classifications:
- New providers, network destinations, secrets, tools, or privileged actions:

## Control review

- [ ] Validation, authentication, authorization, tenant/owner scope
- [ ] Atomic transitions, idempotency, replay and race protection
- [ ] Secret handling, redaction, auditability, privacy and retention
- [ ] Webhook/payment/upload/AI-tool/provider-specific controls
- [ ] Rate limits, dependency provenance, backup/restore and incident readiness

## Negative verification

List exact abuse cases, commands, results, residual risk, owner, and required
staging/production follow-up. A skipped external check remains unverified.
