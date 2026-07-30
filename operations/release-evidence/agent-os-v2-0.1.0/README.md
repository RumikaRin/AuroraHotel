# Agent OS v2 release evidence

- Source revision: `24c4a7b8331b4a7d30c7b4b6f3e41df60bda9998`
- Node: `v24.16.0`
- npm: `11.13.0`
- OS: `Windows_NT`
- Required gates recorded: 19
- Required gates skipped: none

| Gate | Duration (ms) | Status |
|---|---:|---|
| root-ci | 38695 | passed |
| root-audit | 1630 | passed |
| root-lint | 6733 | passed |
| root-typecheck | 2402 | passed |
| root-test | 3237 | passed |
| root-build | 20375 | passed |
| root-e2e | 29835 | passed |
| catalog-drift | 705 | passed |
| diagram-validation | 36625 | passed |
| doctor | 1034 | passed |
| converge | 982 | passed |
| golden-next | 131986 | passed |
| starter-ci | 0 | passed |
| starter-audit | 0 | passed |
| starter-lint | 0 | passed |
| starter-typecheck | 0 | passed |
| starter-test | 0 | passed |
| starter-build | 0 | passed |
| starter-e2e | 0 | passed |

Local verification does not prove production CDN behavior, live provider callbacks, backup restoration, or production observability.
