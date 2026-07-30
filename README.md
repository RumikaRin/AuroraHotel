# Aurora Hotel

**Primary goal:** Increase completed direct room bookings through a fast, transparent, trustworthy mobile-first booking flow while keeping day-level price and availability accurate and preventing overbooking.

## Start here

1. Read `AGENTS.md` and `project-manifest.yml`.
2. Review the product, architecture, security, and quality contracts in
   [docs/INDEX.md](docs/INDEX.md).
3. Use `.agent-os/commands.json` for the profile's exact commands.
4. Select work from `tasks/ACTIVE.md`; record evidence before completion.

## Required verification

Run the declared gates in order: lint, typecheck, test, build, e2e. A pending, skipped, stale,
or manually asserted result is not green evidence.

## Ownership

Agent OS managed files are protected by `.agent-os/lock.json`. Project-owned
files may be edited after generation. Regeneration must stop on a managed-file
hash conflict.
