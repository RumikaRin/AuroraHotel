# System Analysis Summary: Aurora Hotel

## Intent and Primary Goal
- **Idea:** A production-ready, mobile-first direct hotel booking platform for Aurora Hotel in Vietnam, combining a public bilingual website, real booking engine, customer accounts, hotel operations, day-level inventory and pricing, sandbox payments, transactional notifications, reporting, and foundations for future multi-hotel and OTA integrations.
- **Problem:** Aurora Hotel needs to receive direct reservations without phone calls, show accurate daily availability and prices, prevent overbooking, sell add-on services, coordinate reception and housekeeping operations, and reduce dependence on OTAs while measuring revenue and occupancy.
- **Target Users:** Guest, Customer, Receptionist, Housekeeping staff, Manager, Admin
- **Primary Outcome:** Increase completed direct room bookings through a fast, transparent, trustworthy mobile-first booking flow while keeping day-level price and availability accurate and preventing overbooking.

## Primary Journeys
- Search availability from the homepage
- Select rooms and rate plans
- Enter guest details and add services
- Choose payment and confirm booking
- Look up, manage, pay, or cancel a booking
- Customer reviews upcoming and past stays
- Receptionist creates bookings and completes check-in/check-out
- Manager updates rates, restrictions, promotions, and inventory
- Housekeeping updates room readiness
- Admin manages access, integrations, settings, audit logs, and reports

## Prioritized Scope
### P0 — launch
- Bilingual public hotel website
- Availability search with day-level pricing and inventory
- Atomic booking engine with expiring holds and overbooking protection
- Three-step multi-room booking flow
- Guest checkout and booking lookup
- Customer accounts
- Receptionist and manager operations
- Room, rate plan, inventory, promotion, service, payment, and refund management
- Housekeeping status workflow
- Mock or sandbox payments with provider abstraction
- Transactional email
- RBAC and audit logs
- Basic occupancy and revenue reports
- PostgreSQL migrations and repeatable demo seed
- Automated unit, integration, concurrency, and E2E tests
- Architecture, ERD, API, security, operations, and deployment documentation
### P1 — initial release
- Google OAuth-ready account structure
- Wishlists and verified post-stay reviews
- Advanced room rack and bulk rate/inventory editing
- Partial deposits and remaining-balance payments
- Invoice and printable booking confirmation
- Newsletter and basic marketing content management
### P2 — later
- Real OTA and channel-manager integration
- Multi-hotel chain operations
- Loyalty and membership program
- Advanced revenue management
- Native mobile application
- Production AI capabilities
### Explicit exclusions
- Real Booking.com, Agoda, SiteMinder, or other channel-manager connection in MVP
- Mandatory Docker dependency
- Storage of raw card data
- Unverified production payment provider activation
- Copied branding, content, imagery, or visual identity from other hotel and OTA websites

## Architecture and Trust Boundaries
- **Profile:** next-monolith
- **Stack:** typescript / node / next 15.5.22 / npm
- **Data Classification:** confidential
- **Database:** postgresql
- **Hosting:** Vercel for the graduation-demo application with a managed PostgreSQL provider plan available without paid infrastructure at implementation time. External services remain behind adapters and the project runs locally without Docker. Production use requires a reviewed upgrade plan, custom domain, capacity checks, backups, and paid-service decisions where no-cost quotas are insufficient.

## Resolved Capabilities
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

## Acceptance Criteria
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

## Assumptions
- The MVP represents one premium hotel in Vietnam but hotel-scoped entities and adapters preserve a future chain path
- The first release is a graduation demo, not a live hotel production system
- VND and Asia/Ho_Chi_Minh are the default currency and business timezone
- Mock payment is the default; VNPay is the target provider contract and requires separate credentials and production approval later
- Demo imagery may use generated or licensed-stock sources without visible demo labels in the user interface; provenance and replacement status remain internal, and non-production assets are replaced before commercial reuse when required
- All infrastructure and external providers must prefer plans available without paid infrastructure for the graduation demo; any paid upgrade requires a later explicit capacity, cost, and production-readiness decision
- No identity-document upload, live OTA/channel-manager integration, AI runtime, RAG, agent tools, or realtime transport is included in MVP
- Provider no-cost limits will be rechecked during implementation and before deployment

## Risks
- Overbooking or lost inventory under concurrent reservation and cancellation flows
- Payment callback replay, amount mismatch, stale browser success URLs, and double refund
- PII leakage through logs, booking lookup, media metadata, exports, or broken authorization
- Graduation scope is large and must be delivered in vertical slices with the booking path first
- No-cost provider quotas, cold starts, email deliverability, media bandwidth, and database limits may constrain the demo
- Large admin calendars and reports may require pagination or virtualization
- Demo imagery requires internal license and provenance records plus a replacement inventory before commercial reuse
- Vietnamese data-protection, accounting, tax, payment, and hospitality obligations require review before real commercial launch

## Open Decisions
- Final public domain and DNS ownership
- Final managed PostgreSQL provider within the no-cost demo constraint
- Final licensed Vietnamese-capable serif and sans-serif font pair after visual review
- Final demo image sources, internal provenance records, and future replacement inventory
- Production VNPay onboarding, real email domain, paid capacity plan, and legal review are deferred until commercial launch or verified need
