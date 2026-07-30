# Security Baseline for Aurora Hotel

## Default posture

- Deny workspace escape, undeclared network, external writes, implicit secret
  exposure, and destructive operations.
- Validate all body/query/path/file/tool inputs with bounds.
- Authenticate and authorize at server boundaries; scope data by tenant/owner.
- Use least privilege for roles, service accounts, tools, and providers.

## Data and state

- Classify data, minimize collection, encrypt sensitive transport/storage, and
  define retention/deletion.
- Use guarded atomic transitions for stock, quotas, status, coupons, and money.
- Use idempotency keys and request hashes for replay-sensitive writes.
- Redact sensitive keys recursively from logs, audit records, trajectories, and
  evidence.

## Integrations

- Verify webhook/payment signatures before trusting fields.
- Separately validate success status, amount, currency, order state, timestamp,
  and replay claim.
- Restrict uploads by authenticated owner, size, extension, MIME, content, and
  storage path.
- Treat retrieved content and tool output as untrusted data with provenance.

## Operations

- Apply fail-closed rate limits to authentication and public writes.
- Produce structured audit logs in the same transaction as privileged changes.
- Maintain dependency audit, backup/restore proof, monitoring, incident, secret
  rotation, and vulnerability response procedures.

Capability-specific contracts and negative tests are mandatory before enabling
the corresponding production behavior.
