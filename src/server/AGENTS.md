# Server scope

Follow the repository root `AGENTS.md` first. For every server boundary:

- validate body, query, and path inputs before business logic;
- authenticate and authorize in the route as well as shared middleware;
- scope data access to the current tenant or owner;
- use atomic guarded state transitions and idempotency where applicable;
- redact secrets and write audit evidence for privileged mutations;
- add negative tests for denied, replayed, malformed, and cross-scope requests.
