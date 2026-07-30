# Directory Structure for Aurora Hotel

| Path | Ownership | Purpose |
|---|---|---|
| `src/` | project-owned | runtime source and domain boundaries |
| `tests/` | project-owned | unit, integration, security, and E2E tests |
| `docs/` | mixed | product, architecture, security, quality, operations |
| `tasks/` | managed views | active, backlog, and completed task views |
| `templates/` | project-owned | task, plan, handoff, and review formats |
| `.agent-os/` | managed state | lock, command registry, leases, trajectories |
| `.agents/`, `.claude/`, `.gemini/`, `.github/` | managed adapters | host discovery and skills |

The profile-specific module boundaries and exclusions are recorded in
`.agent-os/commands.json` and `project-manifest.yml`. Generated code must not
create an undeclared second source of truth.
