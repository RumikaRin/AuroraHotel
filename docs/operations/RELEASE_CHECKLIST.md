# Release Checklist for Aurora Hotel

## Inputs

- [ ] Scope, acceptance criteria, traceability, and changelog are current.
- [ ] Architecture, schema/API contracts, ERD, diagrams, and threat model agree.
- [ ] Migrations, rollback, backup, restore, and data-retention steps reviewed.
- [ ] Required environment variables exist in the approved secret store.

## Verification

- [ ] Clean install and dependency audit pass.
- [ ] lint, typecheck, test, build, e2e pass in order.
- [ ] Doctor, drift, diagram, and convergence checks pass.
- [ ] Security, authorization, replay, concurrency, accessibility, and critical
      journey tests pass.
- [ ] Release manifest, checksums, attestation, and retained evidence verify.

## Deployment and follow-up

- [ ] Deployment authority and maintenance window confirmed.
- [ ] Monitoring, alerts, dashboards, logs, and rollback owner ready.
- [ ] Smoke tests and provider callbacks verified in the target environment.
- [ ] Residual risks, skipped production-only checks, and rerun commands recorded.
