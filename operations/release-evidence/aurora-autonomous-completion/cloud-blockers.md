# Aurora Hotel Cloud Deployment Blockers & Credential Checklist

> Date: 2026-08-01  
> Status: Local graduation-demo release is 100% verified and functional.  
> Cloud Status: Live production deployment requires owner-supplied cloud credentials.  

---

## Required Live Cloud Environment Variables

To deploy to production on **Vercel Hobby + Neon Free PostgreSQL + Vercel Blob**, the project owner must set the following environment variables in Vercel Project Settings:

| Variable Name | Required Scope | Owner Action Required |
|---|---|---|
| `DATABASE_URL` | Neon Production Pooled Connection | Create Neon PostgreSQL database instance and copy pooled connection string with `?sslmode=require`. |
| `DIRECT_URL` | Neon Production Direct Connection | Copy direct non-pooled connection string from Neon dashboard. |
| `AUTH_SECRET` | NextAuth Session Encryption | Generate a random 32-character base64 secret (`openssl rand -base64 32`). |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Production Store | Connect Vercel Blob store to project in Vercel dashboard and export access token. |
| `CRON_SECRET` | Vercel Daily Maintenance Cron | Set random secret token matching header for Vercel Cron invocation. |
| `VNPAY_TMN_CODE` | VNPay Merchant Code | (Optional for live payments) Enter production merchant terminal code. |
| `VNPAY_HASH_SECRET` | VNPay Hash Secret Key | (Optional for live payments) Enter production HMAC SHA-512 secret key. |

---

## Deployment Steps Once Credentials Are Provided

1. Push `antigravity/aurora-p0-implementation` branch to GitHub repository.
2. Link repository to Vercel Project.
3. Configure the environment variables listed above.
4. Execute `npm run db:migrate` or let Vercel Build script apply migrations via Prisma CLI.
5. Verify live endpoints `/api/health/live` and `/api/health/ready`.
