# Quality Gates for Aurora Hotel

Required order: **lint, typecheck, test, build, e2e**.

| Gate | Minimum proof | Failure rule |
|---|---|---|
| lint | zero errors and zero warnings | stop |
| typecheck | zero type errors | stop |
| unit/test | passed unit, integration, security tests | stop |
| build | production artifact built successfully | stop |
| e2e | critical journeys passed in a real runtime/browser | stop |

Commands are resolved from `.agent-os/commands.json`. Evidence must retain argv,
cwd, timestamps, exit code, bounded/redacted stdout and stderr, SHA-256 hashes,
environment, and source revision. Pending, skipped, empty, stale, truncated
without disclosure, or manually asserted output cannot satisfy a gate.
