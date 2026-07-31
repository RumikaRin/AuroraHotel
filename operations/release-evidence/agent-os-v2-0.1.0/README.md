# Agent OS v2 release evidence

- Source revision: `3d2a9a0f8a9b0952c46707d4e458880223d5cb4e`
- Node: `v24.16.0`
- npm: `11.13.0`
- OS: `Windows_NT`
- Required gates recorded: 19
- Required gates skipped: none

| Gate | Duration (ms) | Status |
|---|---:|---|
| root-ci | 26190 | passed |
| root-audit | 1044 | passed |
| root-lint | 5066 | passed |
| root-typecheck | 2530 | passed |
| root-test | 2996 | passed |
| root-build | 17750 | passed |
| root-e2e | 77227 | passed |
| catalog-drift | 1393 | passed |
| diagram-validation | 34011 | passed |
| doctor | 2076 | passed |
| converge | 1927 | passed |
| golden-next | 110321 | passed |
| starter-ci | 0 | passed |
| starter-audit | 0 | passed |
| starter-lint | 0 | passed |
| starter-typecheck | 0 | passed |
| starter-test | 0 | passed |
| starter-build | 0 | passed |
| starter-e2e | 0 | passed |

Local verification does not prove production CDN behavior, live provider callbacks, backup restoration, or production observability.
