# Code Review Template

- Reviewer: <reviewer>
- Status: <status>
- Findings: <findings>

## Review scope

- Revision and files:
- Acceptance criteria:

## Correctness and contracts

- [ ] Inputs, errors, state transitions, retries, and concurrency are correct.
- [ ] API/schema/type contracts and backward compatibility are preserved.
- [ ] Tests prove success and meaningful failure cases.

## Security and operations

- [ ] Authentication, authorization, scope, secrets, logs, and audit reviewed.
- [ ] Migration, rollback, observability, performance, and accessibility reviewed.

## Evidence and disposition

List findings by severity with file/line, impact, reproduction, and remediation.
Record exact gates run and whether the change is approved, blocked, or needs
follow-up.
