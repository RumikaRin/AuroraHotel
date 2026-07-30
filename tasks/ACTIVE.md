# Active Tasks — Aurora Hotel

> Note: ACTIVE.md is a generated view of canonical state in `.agent-os/state/tasks.json`.

| ID | Goal | Owner/lease | Intended files | Acceptance criteria | Next action | Status |
|---|---|---|---|---|---|---|

Agents must acquire the structured lease with compare-and-swap before work,
renew it while active, and release/expire it on handoff. Two active tasks must
not own the same mutable file without explicit coordination.
