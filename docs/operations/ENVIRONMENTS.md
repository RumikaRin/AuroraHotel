# Environments for Aurora Hotel

| Environment | Purpose | Data policy | Deploy authority | Observability | Destructive actions |
|---|---|---|---|---|---|
| local | development | synthetic/local only | developer | console/local | scoped and reviewed |
| test | automated verification | isolated fixture data | CI | retained test output | reset fixture only |
| staging | production-like validation | masked/synthetic preferred | release role | logs/metrics/traces | explicit approval |
| production | live service | classified data | restricted release role | alerts/SLO/audit | break-glass approval |

Document domain, hosting region, runtime, database, storage, queue, email,
payment, analytics, secrets, backup, retention, and rollback differences without
putting credential values in this file.
