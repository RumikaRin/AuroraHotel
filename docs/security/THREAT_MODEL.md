# Threat Model: Aurora Hotel

## Data Classification: confidential

## Declared Trust Boundaries
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

## Baseline Controls
- Validate every external input and deny by default.
- Keep secrets outside discovery state and generated documents.
- Enforce revocable sessions and authorization at every protected boundary.
- Enforce idempotent money-adjacent writes and verified provider callbacks.
- Enforce file type, size, storage, and malware-scanning policy.

## Known Risks
- Overbooking or lost inventory under concurrent reservation and cancellation flows
- Payment callback replay, amount mismatch, stale browser success URLs, and double refund
- PII leakage through logs, booking lookup, media metadata, exports, or broken authorization
- Graduation scope is large and must be delivered in vertical slices with the booking path first
- No-cost provider quotas, cold starts, email deliverability, media bandwidth, and database limits may constrain the demo
- Large admin calendars and reports may require pagination or virtualization
- Demo imagery requires internal license and provenance records plus a replacement inventory before commercial reuse
- Vietnamese data-protection, accounting, tax, payment, and hospitality obligations require review before real commercial launch

## Open Security Decisions
- Final public domain and DNS ownership
- Final managed PostgreSQL provider within the no-cost demo constraint
- Final licensed Vietnamese-capable serif and sans-serif font pair after visual review
- Final demo image sources, internal provenance records, and future replacement inventory
- Production VNPay onboarding, real email domain, paid capacity plan, and legal review are deferred until commercial launch or verified need
