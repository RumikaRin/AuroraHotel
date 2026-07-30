# Execution Plans — Aurora Hotel

> Note: ExecPlan is an Agent OS project convention, not a guaranteed native host feature.

Use an ExecPlan for multi-step, risky, cross-boundary, migration, security, or
release work. Each plan records:

- goal, scope, non-goals, source-of-truth inputs, and assumptions;
- ordered steps with acceptance criteria and test/evidence commands;
- affected files/owners and coordination leases;
- security, data, migration, rollback, and operational effects;
- decisions and deviations discovered during execution;
- final evidence, residual risks, and handoff.

Canonical task/lease state lives in `.agent-os/state/tasks.json`; this document
must not become a conflicting task registry.
