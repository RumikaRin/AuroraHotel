# Agent OS v2 release evidence

- Source revision: `9bc72d96a57deb79cda12db26c0089d62f1557ae`
- Node: `v24.16.0`
- npm: `11.13.0`
- OS: `Windows_NT`
- Required gates recorded: 19
- Required gates skipped: none

| Gate | Duration (ms) | Status |
|---|---:|---|
| root-ci | 28897 | passed |
| root-audit | 1020 | passed |
| root-lint | 5225 | passed |
| root-typecheck | 2474 | passed |
| root-test | 2947 | passed |
| root-build | 18317 | passed |
| root-e2e | 83113 | passed |
| catalog-drift | 1353 | passed |
| diagram-validation | 34249 | passed |
| doctor | 1907 | passed |
| converge | 1897 | passed |
| golden-next | 110453 | passed |
| starter-ci | 0 | passed |
| starter-audit | 0 | passed |
| starter-lint | 0 | passed |
| starter-typecheck | 0 | passed |
| starter-test | 0 | passed |
| starter-build | 0 | passed |
| starter-e2e | 0 | passed |

Local verification does not prove production CDN behavior, live provider callbacks, backup restoration, or production observability.
