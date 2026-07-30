# Contributing Guidelines for Aurora Hotel

## Before coding

- Read `AGENTS.md`, the manifest, active task, and nearest scoped instructions.
- Confirm acceptance criteria, intended files, security impact, and test plan.
- Do not invent unresolved product, provider, data, or deployment decisions.

## Change discipline

- Keep changes scoped and preserve project-owned work.
- Validate every external input and authorize at server boundaries.
- Never commit secrets or bypass hooks, sandbox policy, or required gates.
- Update affected contracts, diagrams, traceability, and threat model.

## Completion

Run lint, typecheck, test, build, e2e in the declared order. Attach exact commands, exit codes,
test counts, build result, and remaining risks to the handoff or review.
