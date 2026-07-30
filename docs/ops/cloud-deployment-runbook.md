# Aurora Hotel — Cloud Deployment Runbook

## Overview
This runbook documents production and preview deployment operations for Aurora Hotel on Vercel Hobby hosting, Neon Free PostgreSQL database, and Vercel Blob stores (`aurora-media-private` and `aurora-media-public`).

## Infrastructure Topology
- **Web App**: Next.js 15 (App Router) on Vercel Hobby target.
- **Database**: Neon Serverless PostgreSQL with Pooled runtime (`DATABASE_URL`) and Direct CLI endpoint (`DIRECT_URL`).
- **Storage**:
  - `aurora-media-private`: Unattached and temporary file uploads (`BLOB_PRIVATE_READ_WRITE_TOKEN`).
  - `aurora-media-public`: Verified public room photos and assets (`BLOB_PUBLIC_READ_WRITE_TOKEN`).

## Deployment Checklist
1. Verify environment identity variables:
   - `DATABASE_ENVIRONMENT`: `production` (or `preview`)
   - `DATABASE_URL`: Pooled Neon connection string (`...-pooler.us-east-2.aws.neon.tech/aurora_production?sslmode=require`)
   - `DIRECT_URL`: Direct Neon connection string (`...-direct.us-east-2.aws.neon.tech/aurora_production?sslmode=require`)
2. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Deploy web application:
   ```bash
   vercel --prod
   ```
4. Verify deployment health:
   - Check `/api/cron/cleanup` with valid `CRON_SECRET`.
   - Verify room availability search on homepage.

## Rollback Procedure
1. Revert Vercel deployment:
   ```bash
   vercel rollback <previous-deployment-id>
   ```
2. In case of database migration rollback:
   - Run restore drill from latest backup using `npm run db:restore`.
