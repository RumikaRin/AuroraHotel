# Changelog — Aurora Hotel

All notable changes are recorded here. Entries must link to the task/evidence
that proves them and must not claim an unreleased or unverified behavior.

## [1.0.0] - 2026-08-01

### Added
- Created `docs/superpowers/plans/2026-08-01-aurora-hotel-p0-completion-master-plan.md` for P0 graduation demo release.
- Added 13 high-resolution local hospitality images under `public/images/aurora/`.
- Implemented multi-room booking support with `BookingRoom`, `BookingNight`, `BookingGuest` snapshots.
- Added server-authoritative pricing quote engine (`src/services/pricing.service.ts`) with taxes and fees.
- Added add-on hotel services catalog (`Service`, `BookingService`) and API endpoint `/api/services`.
- Added Promotion and Coupon code validation (`src/services/coupon.service.ts`), usage caps, and `/api/coupons/verify` endpoint.
- Implemented payment event log (`PaymentEvent`) and payment recovery (`retryPayment`).
- Implemented refund state machine (`Refund`) and `/api/refunds` API with idempotency and anti-double refund guards.
- Expanded RBAC to 6 roles (added `CUSTOMER` role for registered customer self-service).
- Enhanced revenue and occupancy reporting in `/admin/reports` with DB aggregation for ADR, RevPAR, and total revenue.
- Added negative security test suite `tests/security/negative-rules.test.ts`.

### Changed
- Stabilized luxury UI redesign across homepage, rooms, room detail, and booking components.
- Configured explicit `dynamic = "force-dynamic"` on authenticated admin pages to ensure clean production builds.

### Fixed
- Fixed broken image references on `/rooms` and `/rooms/[slug]` pages.
- Corrected import paths across Next.js app pages and Node ESM test suites.

### Security
- Verified RBAC guards, Content Security Policy, static security headers, coupon replay protection, and refund balance bounds.

