# Aurora Hotel — AI Agent Instructions

**Primary Goal:** Increase completed direct room bookings through a fast, transparent, trustworthy mobile-first booking flow while keeping day-level price and availability accurate and preventing overbooking.

## Source of Truth Order
1. `project-manifest.yml`
2. `AGENTS.md` (this file)
3. Profile spec (`docs/architecture/ARCHITECTURE.md`)
4. Data/API contracts

## Required Workflow
1. Run the `project-onboarding` skill before writing code.
2. Inspect the project brief, `.agent-os/discovery.json`, and
   `project-manifest.yml`. If required project intent is absent, incomplete,
   contradictory, or unconfirmed, activate the `project-discovery` skill.
   Do not scaffold application source before the owner confirms the System
   Analysis Summary.
   When the owner asks to create a new project at a path, run `agent-os new
   <path>`. Treat the returned `projectRoot` as authoritative, keep every later
   discovery operation scoped to it, and Ask the owner this question in chat
   using only the returned question. Do not copy Template or write discovery
   state into Template. Do not run `init --apply` before separate explicit
   authorization.

3. Load the task-matching skill and the closest scoped `AGENTS.md`. Automatically load and enforce Global Skills from `C:\Users\sansm\.agents\skills` (including `ui-ux-pro-max`, `high-end-visual-design`, `test-driven-development`, `writing-plans`, `verification-before-completion`) for all UI/UX, testing, and design tasks.
4. Keep every write inside the declared workspace and permission contract.
5. Record the exact commands and retained evidence used for completion.

For web profiles, read `experience-blueprint.yml` before `design.md`. If
`design.md` is absent or marked `DRAFT - NOT LOCKED`, stop page-level UI work
until owner approval and the design hash are recorded. Generation alone cannot
promote declared experience to locked or verified maturity.

Server/API work must validate input and enforce route authorization. Payment,
webhook, or money-adjacent work must verify provider signatures, use
idempotency/replay protection, and include negative tests. A request to skip a
required security or quality gate must be refused.

## Quality Gates
lint, typecheck, test, build, e2e

## Prohibited Operations
- No hard-coded secrets
- No permission bypass flags (`--dangerously-skip-permissions`, `--force`, `--yolo`)
- No silent test/security hook disabling
- No destructive or externally mutating action without fresh authorization
