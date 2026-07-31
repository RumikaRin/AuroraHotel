# Agent OS v2 release evidence

- Source revision: `cf72f353ffd56db3779c1dd9fe4e734d10a1bd06`
- Node: `v24.16.0`
- npm: `11.13.0`
- OS: `Windows_NT`
- Required gates recorded: 19
- Required gates skipped: none

| Gate | Duration (ms) | Status |
|---|---:|---|
| root-ci | 27550 | passed |
| root-audit | 1020 | passed |
| root-lint | 5310 | passed |
| root-typecheck | 2317 | passed |
| root-test | 2866 | passed |
| root-build | 18142 | passed |
| root-e2e | 82902 | passed |
| catalog-drift | 1447 | passed |
| diagram-validation | 34875 | passed |
| doctor | 2095 | passed |
| converge | 1969 | passed |
| golden-next | 111850 | passed |
| starter-ci | 0 | passed |
| starter-audit | 0 | passed |
| starter-lint | 0 | passed |
| starter-typecheck | 0 | passed |
| starter-test | 0 | passed |
| starter-build | 0 | passed |
| starter-e2e | 0 | passed |

Local verification does not prove production CDN behavior, live provider callbacks, backup restoration, or production observability.
