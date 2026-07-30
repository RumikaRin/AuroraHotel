# Aurora Hotel System and Experience Design

> Date: 2026-07-31  
> Status: Written design awaiting final owner review  
> Delivery strategy: Contract-first vertical slices  
> Source contracts: `project-blueprint.yml`, `experience-blueprint.yml`, `project-manifest.yml`

## 1. Purpose

Aurora Hotel is a graduation-demo direct-booking platform for one premium hotel
in Vietnam. It combines a bilingual public website, a real booking engine,
customer accounts, hotel operations, mock or sandbox payments, transactional
notifications, reporting, and a safe path to future production providers.

The primary outcome is:

> Increase completed direct room bookings through a fast, transparent,
> trustworthy mobile-first booking flow while preserving accurate day-level
> price and availability and preventing overbooking.

The first delivery target is one complete journey:

`availability search → room and rate selection → booking hold → guest details → mock payment → booking confirmation`

This journey must work from the browser to PostgreSQL and back. A visually
complete page backed only by fake data is not considered a completed slice.

## 2. Scope boundaries

### Included in the first release

- Vietnamese and English public website.
- Day-level availability and pricing.
- Atomic booking holds and overbooking protection.
- Three-step, multi-room-capable checkout.
- Guest checkout and booking lookup.
- Customer accounts.
- Receptionist, housekeeping, manager, and administrator workflows.
- Room types, physical rooms, rate plans, daily rates, restrictions,
  promotions, services, payments, refunds, and audit logs.
- Mock payment as the default executable provider.
- VNPay-compatible provider contract for later activation.
- Local email preview and transactional email provider contract.
- Local media adapter and Cloudinary-compatible media contract.
- Basic occupancy and revenue reporting.
- Repeatable demo data.
- Required architecture diagrams, ERD, API catalog, security documentation,
  operations documentation, and release evidence.

### Explicitly excluded

- Live OTA or channel-manager connectivity.
- Multi-hotel chain operations.
- Production AI, RAG, MCP, or agent tools.
- Realtime transport.
- Identity-document upload.
- Raw card-data storage.
- Mandatory Docker dependency.
- Unreviewed live VNPay activation.
- Paid provider activation without explicit owner approval.
- Copied branding, content, imagery, layouts, or motion from another hotel,
  OTA, or reference website.

## 3. Architecture

Aurora uses a modular monolith built with Next.js, TypeScript, Node.js,
PostgreSQL, Prisma, and npm. Public pages, authenticated pages, route handlers,
jobs, and domain services remain in one repository for operational simplicity.
Business rules are isolated behind module interfaces so they can be tested and
changed without coupling them to React or HTTP.

Route handlers and server actions may:

- Authenticate and authorize the caller.
- Parse Zod input.
- Call one application service.
- Translate typed results into HTTP or UI responses.

They must not contain pricing, availability, payment, cancellation, inventory,
or authorization rules.

### 3.1 Modules

| Module | Responsibility | Depends on |
|---|---|---|
| `identity` | Authentication, sessions, credential lifecycle, future OAuth | Database, audit |
| `authorization` | Roles, permissions, policy evaluation, route guards | Identity |
| `hotel` | Hotel, room types, physical rooms, amenities, room media | Database, media |
| `inventory` | Day-level inventory, holds, release, room readiness | Hotel, database |
| `pricing` | Rate plans, daily rates, restrictions, taxes, fees, promotions | Hotel, database |
| `booking` | Quotes, holds, bookings, guests, nights, services, cancellation | Inventory, pricing |
| `payment` | Payment attempts, provider callbacks, refunds, reconciliation | Booking, audit |
| `operations` | Reception, check-in, check-out, housekeeping | Booking, hotel |
| `notification` | Outbox, local previews, provider delivery, retries | Booking, jobs |
| `media` | Media policy, validation, storage adapters, lifecycle | Hotel, audit |
| `jobs` | Hold expiry, notification delivery, retries, dead-letter records | Database |
| `reporting` | Occupancy and revenue projections | Booking, payment |
| `audit` | Immutable evidence for privileged changes | Database |

### 3.2 Trust boundaries

- Unauthenticated public browser.
- Authenticated customer browser.
- Staff and administrator browser.
- Next.js validation and authorization boundary.
- PostgreSQL transaction boundary.
- Payment provider callback or webhook.
- Email provider API.
- Media storage API.
- Background job runner.
- Future channel-manager adapter.

All external providers are accessed through interfaces. Domain services never
import a provider SDK directly.

## 4. Delivery model

Aurora is delivered as vertical slices:

1. Foundation, design system, PostgreSQL baseline, authentication, RBAC, audit,
   provider interfaces, and quality gates.
2. Availability, pricing, hold, booking, mock payment, and confirmation.
3. Booking lookup, cancellation, and payment-status recovery.
4. Customer account and stay history.
5. Reception check-in/check-out and housekeeping status.
6. Room, rate, restriction, promotion, service, and inventory administration.
7. Reporting, email delivery, media upload, observability, backup, privacy, and
   release hardening.

Each slice includes schema, migration, domain logic, API, UI, security, unit
tests, integration tests, E2E tests, diagrams, and documentation.

## 5. Core data model

### 5.1 Hotel catalog

- `Hotel`
- `RoomType`
- `PhysicalRoom`
- `Amenity`
- `RoomTypeAmenity`
- `MediaAsset`

Hotel-scoped identifiers are retained even though the demo contains one hotel.
This preserves a future multi-hotel migration path without implementing
multi-hotel operations now.

### 5.2 Inventory and pricing

- `InventoryDay`
- `RatePlan`
- `DailyRate`
- `Restriction`
- `Promotion`
- `Coupon`
- `CouponRedemption`
- `Service`

`InventoryDay` records sellable quantity per hotel, room type, and stay date.
Date ranges use check-in inclusive and check-out exclusive semantics.

### 5.3 Reservation

- `Quote`
- `BookingHold`
- `Booking`
- `BookingRoom`
- `BookingNight`
- `BookingGuest`
- `BookingService`
- `Cancellation`

A booking owns immutable snapshots for:

- Nightly base price.
- Promotion or coupon discount.
- Tax and fee calculation.
- Selected cancellation policy.
- Rate-plan inclusions.
- Currency and business timezone.

Later edits to a rate plan must not change historical bookings.

### 5.4 Payment and evidence

- `PaymentAttempt`
- `Refund`
- `IdempotencyRecord`
- `WebhookEvent`
- `OutboxMessage`
- `JobExecution`
- `DeadLetterRecord`
- `AuditLog`

The demo does not store raw card data. Payment records contain internal
references, provider references, amounts, currency, status, and verified
evidence only.

## 6. Booking transaction

### 6.1 Search and quote

The search input contains check-in, check-out, room count, adults, children,
and optional promotion code. Zod validates date order, maximum stay length,
occupancy bounds, room count, and code length.

The quote service resolves:

- Availability for every requested night.
- Applicable rate plans and restrictions.
- Nightly rate.
- Promotions and coupon eligibility.
- Taxes and fees.
- Selected services.
- Deposit or amount due today.
- Total amount.
- Quote expiry.

The quote is a server-owned artifact. The client cannot submit an arbitrary
price.

### 6.2 Atomic hold and booking creation

Creating a booking starts one database transaction:

1. Claim the checkout idempotency key.
2. Verify the quote is present, unchanged, and unexpired.
3. Perform a conditional inventory update for every night.
4. Require every update to affect the expected row.
5. Create the hold.
6. Create the booking and booking snapshots.
7. Create the first payment attempt when payment is required.
8. Create outbox and audit evidence where applicable.
9. Commit.

If any night lacks inventory, the entire transaction rolls back and returns a
typed `409 AVAILABILITY_CHANGED` result.

Inventory, coupon caps, booking states, payment states, and refund totals use
conditional updates. Read-then-write state transitions are forbidden.

### 6.3 Hold expiry

Hold expiry is an at-least-once job with deduplication:

- It conditionally transitions an active, expired hold to released.
- It returns inventory exactly once.
- Replaying the same job produces no additional inventory.
- Failure retries are bounded and then recorded in the dead-letter store.

The UI may show the real hold expiry time. It must not create fake urgency.

## 7. Network lag, double-click, and duplicate-payment protection

Frontend button disabling is a convenience, not a security control. The server
remains safe when requests arrive concurrently or are replayed.

### 7.1 Stable checkout intent

- Starting a checkout intent creates one client idempotency key.
- Repeated clicks and automatic retries reuse that key.
- A network timeout triggers status lookup by the original key.
- The client does not generate a new booking intent unless the user explicitly
  starts a new booking after the previous intent has reached a terminal state.

### 7.2 Idempotency record

`IdempotencyRecord` has a unique `(scope, key)` constraint and stores:

- Request hash.
- Processing state.
- Resource identifier.
- Response snapshot.
- Creation and expiry time.

Behavior:

- Same key and same request returns the stored result.
- Same key and different request returns `409 IDEMPOTENCY_KEY_REUSED`.
- Concurrent requests permit one owner; other callers receive processing
  status or the completed result.
- Booking creation uses a unique `Booking.checkoutKey`.

### 7.3 Payment attempts

- Each attempt has a unique internal reference.
- Provider idempotency is used when supported.
- A VNPay merchant transaction reference must be unique.
- Retrying a failed payment creates a new payment attempt for the existing
  booking, not a new booking.
- The browser success URL cannot mark a booking paid.
- Only a verified provider callback or webhook can finalize payment.

The MVP permits one successful full capture for a booking. Future deposit and
remaining-balance support must use a payment ledger and a conditional
outstanding-balance update so successful captures cannot exceed the booking
total.

### 7.4 Webhook replay protection

`WebhookEvent` has a unique provider event identifier or verified payload
digest. Processing order:

1. Read the raw body.
2. Verify signature in constant time.
3. Validate event structure.
4. Claim the provider event.
5. Verify booking reference, amount, and currency.
6. Conditionally transition the payment.
7. Conditionally transition the booking.
8. Write audit and outbox evidence in the transaction.
9. Acknowledge duplicate valid events without reprocessing.

## 8. Provider strategy

All demo behavior must run without paid infrastructure.

| Capability | Local or demo default | Later adapter |
|---|---|---|
| Payment | `MockPaymentProvider` | `VnPayPaymentProvider` |
| Email | `PreviewEmailProvider` | `ResendEmailProvider` |
| Media | Local filesystem adapter | `CloudinaryMediaProvider` |
| Jobs | In-process or scheduled runner | Managed job provider |
| Database | Local PostgreSQL or approved demo provider | Reviewed managed PostgreSQL |

Provider no-cost quotas are checked at implementation and again before
deployment. A paid upgrade requires explicit owner approval.

## 9. Public experience design

### 9.1 Direction

The approved public direction is **Aurora Chaptered Stay**:

- Contemporary Vietnamese luxury.
- Cinematic hospitality photography.
- Editorial storytelling organized into chapters.
- Warm negative space.
- Premium booking behavior integrated into the narrative.
- Clear prices, policies, trust signals, and recovery actions.

The design may learn general principles from editorial architecture and premium
hospitality websites. It must not copy their identity, layout sequence, assets,
copy, or motion.

### 9.2 Typography

- Display: **Cormorant Garamond**.
- Interface: **Manrope**.
- Both fonts use free, project-approved sources and Vietnamese subsets.
- Serif is reserved for hero, section titles, room names, and short evocative
  copy.
- Navigation, forms, prices, policy text, buttons, admin UI, and tables use
  Manrope.

Type scale:

- Hero: `clamp(3.4rem, 8.5vw, 8.1rem)`.
- Public H1: `clamp(3rem, 6.5vw, 6rem)`.
- Public H2: `clamp(2.6rem, 5.5vw, 5.2rem)`.
- H3: 1.625–2rem.
- Body large: 1.125rem.
- Body: 1rem.
- Caption: 0.8125–0.875rem.
- Control text: 0.875–1rem.

Line lengths and responsive clamps must prevent narrow multi-line headline
stacks that obscure imagery or controls.

### 9.3 Color

| Token | Value | Use |
|---|---|---|
| `aurora-midnight` | `#17211D` | Header, footer, dark chapters, primary CTA |
| `warm-ivory` | `#F7F4ED` | Primary background |
| `paper` | `#FFFDF8` | Forms, booking panels |
| `champagne-gold` | `#C5A46D` | Controlled accent, active state, divider |
| `forest-green` | `#355B4B` | Trust, selection, secondary CTA |
| `terracotta` | `#B97857` | Warm editorial accent |
| `mist-gray` | `#DADDD8` | Borders and quiet surfaces |
| `charcoal` | `#242826` | Main body text |
| `success` | `#2E7D5A` | Success state |
| `warning` | `#C48138` | Warning state |
| `error` | `#B84A4A` | Error state |
| `information` | `#3F6D8C` | Informational state |

Champagne gold is never used as a large background. Status cannot rely on color
alone.

### 9.4 Grid, spacing, shape, and shadow

- Desktop content width: 1280–1440px.
- Desktop grid: 12 columns.
- Tablet grid: 8 columns.
- Mobile grid: 4 columns.
- Public section spacing: 96–144px desktop and 64–88px mobile.
- Mobile horizontal padding: 20px.
- Tablet horizontal padding: 32px.
- Desktop horizontal padding: 48–80px.
- Large public surfaces: 20–24px radius where a radius is used.
- Inputs: 12–14px.
- Buttons: 10–12px.
- Modal: 24px.
- Shadows remain diffuse and low contrast.

Editorial image passages may use square edges to contrast with transactional
components.

## 10. Homepage interaction and composition

### 10.1 Header

The approved header follows the first reviewed direction:

- Wordmark on the left.
- Public navigation centered.
- Language, booking lookup/account, and booking CTA on the right.
- Transparent over the hero.
- Becomes a restrained solid or high-contrast surface after leaving the hero.
- Mobile uses wordmark, booking CTA, and accessible menu.

### 10.2 Hero

The hero contains three curated images. Images move from right to left
independently of vertical scroll:

- Display duration: 7–8 seconds.
- Transition duration: approximately 1.2 seconds.
- Manual previous/next controls.
- Position indicators.
- Pause/resume control.
- Pause on pointer hover or keyboard focus.
- Static first slide under `prefers-reduced-motion`.
- First image is the LCP candidate and receives loading priority.
- Later images do not compete with the LCP image.
- Text contrast uses a controlled overlay, not text shadow.

Vertical scrolling remains native. Aurora must not use Lenis, Locomotive
Scroll, or a long GSAP-pinned hero. Scroll position, browser scrollbar,
keyboard Home/End, anchor links, browser restoration, and reduced motion must
remain reliable.

### 10.3 Booking console

The booking console overlaps the hero boundary and includes:

- Check-in.
- Check-out.
- Guests and rooms.
- Optional promotion code where space permits.
- Availability CTA.
- Booking lookup entry.
- Trust messages for transparent pricing and cancellation terms.

On mobile it becomes a compact booking trigger that opens an accessible
date-and-guest flow. It must not consume most of the initial viewport.

### 10.4 Chapter composition

The homepage uses the following narrative:

1. Hero and booking console.
2. Aurora prologue.
3. Architecture and atmosphere passage.
4. Room showcase.
5. Transparent rate-plan story.
6. Dining or wellness interlude.
7. Location and destination.
8. Final availability CTA.
9. Footer.

This is a hotel-specific narrative, not the section sequence of the reviewed
architecture reference.

### 10.5 Room showcase

The approved room pattern is **Suite Spotlight**:

- One selected room occupies the full section.
- Image takes approximately 60–70% of the desktop width.
- The information panel keeps room name, description, capacity, area, bed,
  rate-plan count, price, and CTA together.
- A visible selector switches between room types.
- Manual selection is always available.
- Auto-rotation is not required.
- The selected room has a stable URL or link to its detail page.
- Price is labeled as a starting price until dates are selected.
- Date-aware price and cancellation details replace the starting price after an
  availability search.

The rejected Stay Atlas pattern must not be implemented. It created table-like
repetition, excessive empty space, undersized images, detached prices, and weak
CTAs.

### 10.6 Booking and rate-plan UI

- Checkout contains three primary steps: room/rate, guest/services,
  confirmation/payment.
- A persistent summary shows dates, room count, nightly price, discounts,
  taxes, fees, amount due today, and total.
- Rate cards expose cancellation terms and inclusions before selection.
- Policy details are not hidden behind hover.
- Mobile uses a dedicated sticky action and collapsible summary.
- Critical status is never presented only as a toast.

### 10.7 Public motion

Allowed primitives:

- Hero horizontal slide.
- Opacity and short vertical reveal.
- Subtle image scale on intentional hover.
- Button, input, and selection feedback.
- Progress and state transitions.

Disallowed:

- Scroll hijacking.
- Long pinned scroll narratives.
- Heavy parallax.
- Continuous decorative motion.
- Autoplaying fast carousels.
- Animation that blocks booking controls.

## 11. Admin experience

Admin shares typography, semantic colors, spacing, and accessibility primitives
but does not reuse the public editorial composition.

Admin priorities:

- Clear route hierarchy.
- Moderate information density.
- Fast keyboard operation.
- Role-aware actions.
- Pagination or virtualization for large calendars and tables.
- Persistent audit and status context.
- No decorative motion that delays operations.

## 12. Error and recovery design

Typed outcomes include:

| Status | Meaning | Recovery |
|---|---|---|
| `400` | Invalid bounded input | Inline field error |
| `401` | Authentication required | Safe sign-in return |
| `403` | Permission denied | No privilege details disclosed |
| `409` | Availability, price, coupon, idempotency, or state conflict | Refresh relevant state |
| `429` | Request limit reached | Explicit retry guidance |
| `503` | Critical dependency cannot fail open | Preserve user state and retry later |
| `PAYMENT_PENDING` | Provider outcome not final | Poll verified status |
| `500` | Internal failure | Generic message and request ID |

Booking recovery:

- An expired hold preserves non-sensitive guest input and returns to room
  selection.
- A changed price shows old and new totals and requires confirmation.
- A network timeout queries the idempotency record.
- A pending payment never displays success.
- A failed payment can create another attempt for the same booking.
- Booking lookup uses generic responses to resist enumeration.

Logs and client errors must not expose stack traces, credentials, payment
evidence, or PII.

## 13. Security

- Zod validates every body, query, and route parameter with bounds.
- RBAC is enforced in middleware and again in server services.
- Privileged mutations write audit evidence in the same transaction.
- Auth and public-write rate limits fail closed in production.
- Webhooks verify raw-body signatures before trusting fields.
- Signature checks use constant-time comparison.
- Amount, currency, booking reference, and replay evidence are verified.
- Secure, HTTP-only, same-site cookies and session revocation are required.
- CSP and security headers ship with the first slice.
- Redirect destinations are allowlisted.
- Uploads allow JPEG, PNG, WebP, and AVIF only.
- SVG and identity documents are rejected.
- Upload maximum is 10MB and 6000×6000 pixels.
- Only Manager and Admin can publish hotel media.
- Media remains private until validation and scanning complete.
- Deleted media enters a 30-day recoverable trash state before purge.
- Sensitive log keys are recursively redacted.

## 14. Testing

Quality gates run in this order:

`lint → typecheck → unit/integration → build → Playwright E2E`

### 14.1 Unit

- Nightly pricing.
- Taxes and fees.
- Promotions and coupons.
- Cancellation and refund rules.
- Booking state machine.
- Payment state machine.
- Idempotency decisions.
- Authorization policies.

### 14.2 Integration with PostgreSQL

- Atomic inventory.
- Hold creation and expiry.
- Booking creation.
- Payment transition.
- Webhook verification and replay.
- Refund limits.
- Outbox delivery.
- Audit transaction behavior.

### 14.3 Concurrency and replay

- 20–50 concurrent checkout calls with the same key create one booking, one
  hold, and one first payment attempt.
- Same key with different payload returns `409`.
- Timeout and retry return the original booking.
- Concurrent requests for the last room permit one winner.
- Replayed webhook changes state once.
- Browser callback cannot mark a booking paid.
- Duplicate provider success cannot record more than the booking total.

### 14.4 E2E

- Public search and pay-at-hotel booking.
- Public search and successful mock payment.
- Failed and pending payment recovery.
- Booking lookup and cancellation.
- Customer account journey.
- Receptionist check-in and check-out.
- Housekeeping room-status update.
- Manager daily rate and inventory update.
- Administrator promotion management.
- Unauthorized admin access denial.
- Mobile booking journey.

### 14.5 Experience quality

- WCAG 2.2 AA automated and manual checks.
- Keyboard and screen-reader flow.
- Focus restoration.
- Reduced-motion behavior.
- Visual regression for header, hero, booking console, Suite Spotlight, and
  checkout.
- Target p75 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

Tests use deterministic clocks, repeatable seeds, mock providers, and isolated
databases.

## 15. Documentation and diagrams

The implementation maintains:

- System context.
- Containers.
- Modules.
- ERD.
- Request flow.
- Authentication and authorization flows.
- Role-permission map.
- Session lifecycle.
- Data lifecycle.
- Booking and payment idempotency sequence.
- Migration flow.
- Deployment.
- Release flow.

Diagram sources are Mermaid and are validated against their manifests. ERD
fingerprints must converge with the Prisma schema.

## 16. Acceptance criteria

The design is implemented only when:

- A guest completes a real database-backed booking journey.
- Concurrent requests cannot oversell inventory.
- Network lag and repeated clicks cannot create duplicate bookings or charges.
- Prices, taxes, fees, deposits, and policies remain consistent across the
  journey.
- Payment pending and failure are never shown as success.
- All roles are enforced server-side and privileged changes are audited.
- Vietnamese and English public journeys meet WCAG 2.2 AA.
- Hero motion does not break native scroll, keyboard navigation, reduced
  motion, or Core Web Vitals.
- The homepage uses the approved header, horizontal hero slider, chapter
  composition, and Suite Spotlight.
- The project runs locally without paid services.
- Required tests, diagrams, doctor, drift, and convergence checks pass with
  recorded evidence.

## 17. Deferred production decisions

These decisions do not block the graduation demo:

- Public domain and DNS ownership.
- Final managed PostgreSQL vendor.
- Production VNPay onboarding.
- Production email domain.
- Paid capacity upgrades.
- Commercial image replacements.
- Final legal and operational review.

They must be resolved before a real commercial launch.
