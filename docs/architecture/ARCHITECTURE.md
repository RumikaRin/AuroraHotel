# Architecture Overview: Aurora Hotel

## Profile: next-monolith
- **Stack:** typescript / node / next 15.5.22
- **Package manager:** npm
- **Hosting:** Vercel for the graduation-demo application with a managed PostgreSQL provider plan available without paid infrastructure at implementation time. External services remain behind adapters and the project runs locally without Docker. Production use requires a reviewed upgrade plan, custom domain, capacity checks, backups, and paid-service decisions where no-cost quotas are insufficient.

## Capability Packs
- accessibility
- authentication
- background-jobs
- backup-restore
- billing
- commerce
- database
- email
- file-upload
- i18n
- observability
- privacy
- rbac
- seo
- session-registry
- web-experience
- webhooks

## External Interfaces and Trust Boundaries
- Public bilingual web interface
- Authenticated customer account interface
- Receptionist, housekeeping, manager, and admin interfaces
- Validated Next.js route handlers or server actions
- Auth.js credential and future OAuth callbacks
- Signed payment callback or webhook boundary
- Transactional email provider API
- Managed media storage API
- Scheduled booking-hold expiration and notification jobs
- Future channel-manager adapter interface

## Required Diagrams
- auth-flow
- authz-flow
- containers
- data-lifecycle
- deployment
- erd
- migration-flow
- modules
- release-flow
- request-flow
- role-permission-map
- session-lifecycle
- system-context
- verification-idempotency-sequence

## Quality Gates
- A guest can search real day-level availability, select rooms and rate plans, add services, complete a mock or sandbox payment, and receive a clear booking confirmation
- Concurrent requests cannot confirm more rooms than inventory permits
- All booking, inventory, coupon, payment, refund, and status transitions are atomic and idempotent where required
- Guest, Customer, Receptionist, Housekeeping, Manager, and Admin permissions are enforced server-side with audit logs
- Prices, taxes, fees, deposits, and cancellation terms remain transparent throughout the booking journey
- Vietnamese and English public experiences meet WCAG 2.2 AA and good Core Web Vitals targets
- The system includes normalized PostgreSQL migrations, repeatable realistic demo seed data, ERD and required architecture diagrams
- Unit, integration, concurrency, security, and Playwright E2E gates pass in the documented order
- The graduation demo uses provider plans available without paid infrastructure wherever feasible, monitors their quotas, and introduces no paid service without explicit owner approval
- The demo never stores real secrets or raw card data
