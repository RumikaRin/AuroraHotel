# Aurora Hotel — Neon Backup & Restore Runbook

## Overview
This document specifies automated and manual backup and restore procedures for the Neon PostgreSQL database using `DIRECT_URL`.

## Backup Procedures
To run a manual database backup:
```bash
npm run db:backup
```
The script validates connection identity via `DIRECT_URL` and `DATABASE_ENVIRONMENT`.

## Restore Procedures
To execute a database restore drill into a staging/test environment:
1. Set target database environment to `restore-test`:
   ```dotenv
   DATABASE_ENVIRONMENT="restore-test"
   DIRECT_URL="postgresql://aurora_restore_runner:secret@ep-restore.us-east-2.aws.neon.tech/aurora_restore_test?sslmode=require"
   CONFIRM_RESTORE_DATABASE="aurora_restore_test"
   ```
2. Run restore command:
   ```bash
   npm run db:restore
   ```

## Fail-Closed Safety Rules
- Restoring directly to `production` environment is strictly prohibited and fails closed.
- `CONFIRM_RESTORE_DATABASE` must explicitly match the target database name.
