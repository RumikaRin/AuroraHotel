# Aurora Hotel Requirement Traceability Matrix

> Date: 2026-08-01  
> Status: 16 P0 Requirements Fully Traced & Verified  

---

| Requirement ID | Area | User Journey & Page | API / Server Handler | Domain Service & DB Entity | Test Coverage | Status |
|---|---|---|---|---|---|---|
| **REQ-01** | Multi-room Booking | Public `/booking` (Step 1-3) | `/api/checkout` | `booking.service.ts`, `BookingRoom`, `BookingGuest` | `tests/booking.service.test.ts`, `e2e/aurora-business-real-db.spec.ts` | ✅ Verified |
| **REQ-02** | Day-level Price & Inventory | `/rooms/[slug]`, `/booking` | `/api/availability`, `/api/quote` | `availability.service.ts`, `pricing.service.ts`, `DayAvailability` | `tests/availability.service.test.ts`, `tests/pricing.service.test.ts` | ✅ Verified |
| **REQ-03** | Atomic Overbooking Protection | Public `/booking` Checkout | `/api/checkout` | `availability.service.ts` (`version` check, `updateMany`) | `tests/concurrency.test.ts` | ✅ Verified |
| **REQ-04** | All-or-Nothing Multi-room Hold | Public `/booking` Checkout | `/api/checkout` | `booking.service.ts`, `availability.service.ts` | `tests/booking.service.test.ts` | ✅ Verified |
| **REQ-05** | Add-on Services & Pricing | `/booking` (Step 2) | `/api/services`, `/api/quote` | `pricing.service.ts`, `Service`, `BookingService` | `tests/pricing.service.test.ts` | ✅ Verified |
| **REQ-06** | Promotions & Coupons | `/booking` (Step 2) | `/api/coupons/verify`, `/api/quote` | `coupon.service.ts`, `Coupon`, `CouponUsage`, `Promotion` | `tests/coupon.service.test.ts`, `tests/security/negative-rules.test.ts` | ✅ Verified |
| **REQ-07** | Idempotent Checkout | `/booking` (Step 3 Submit) | `/api/checkout` | `checkout.service.ts`, `CheckoutIdempotency` | `tests/checkout.service.test.ts`, `tests/security/idempotency.test.ts` | ✅ Verified |
| **REQ-08** | Payment Events & Recovery | `/account`, `/my-bookings` | `/api/checkout` | `payment.service.ts`, `Payment`, `PaymentEvent` | `tests/payment.service.test.ts` | ✅ Verified |
| **REQ-09** | Refunds & Anti-Double Refund | `/admin/reports`, `/admin/bookings` | `/api/refunds` | `payment.service.ts`, `Refund` | `tests/security/negative-rules.test.ts` | ✅ Verified |
| **REQ-10** | Customer Stays & Profile | `/account`, `/my-bookings` | `/api/bookings/lookup` | `booking.service.ts`, `User`, `Booking` | `tests/account.test.ts`, `e2e/aurora-flows.spec.ts` | ✅ Verified |
| **REQ-11** | Reception Operations | `/operations/reception` | Server actions & Prisma | `operations.service.ts`, `RoomAssignment`, `Booking` | `tests/operations.service.test.ts`, `e2e/aurora-flows.spec.ts` | ✅ Verified |
| **REQ-12** | Housekeeping Operations | `/operations/housekeeping` | Server actions & Prisma | `operations.service.ts`, `Room` (`status`) | `tests/operations.service.test.ts` | ✅ Verified |
| **REQ-13** | Admin Catalog Management | `/admin/*` | Prisma server handlers | Admin models (`RoomCategory`, `RatePlan`, `InventoryBlock`) | `tests/admin.test.ts`, `e2e/aurora-flows.spec.ts` | ✅ Verified |
| **REQ-14** | Occupancy & Revenue Reporting | `/admin/reports` | Server page DB aggregation | `Booking`, `Room`, `Payment`, `Refund` | `tests/reports.test.ts` | ✅ Verified |
| **REQ-15** | Server-side RBAC & Audit | All protected routes | `guards.ts`, `rbac.ts` | `rbac.ts`, `audit.service.ts`, `AuditLog` | `tests/rbac.test.ts`, `tests/audit.service.test.ts` | ✅ Verified |
| **REQ-16** | Media Upload & Quarantine | `/admin/media` | `/api/cron/cleanup` | `blob-adapter.ts`, Vercel Blob | `tests/blob-adapter.test.ts` | ✅ Verified |
