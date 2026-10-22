# Design Specification: Aurora Hotel P0 Remediation & Lenis Scroll Integration

**Status:** Approved by User  
**Date:** 2026-10-22  
**Target:** Aurora Hotel Production Platform  
**Author:** Senior Architecture & Engineering Team  

---

## 1. Executive Summary & Background

Following an extensive architectural, security, and user experience audit of the Aurora Hotel codebase, this specification defines the implementation blueprint to remediate all identified P0 blockers and integrate the industry-standard **Lenis Scroll** engine.

The core objectives are:
1. Deliver a **frictionless guest checkout** experience that allows unauthenticated guests to book directly without mandatory login friction, while maintaining strict idempotency and audit trails.
2. Align user roles across Prisma, NextAuth, and RBAC, closing security gaps on operational routes (`/operations/reception` and `/operations/housekeeping`) via Edge middleware guards.
3. Replace custom wheel-event scroll hijacking with a clean, hardware-accelerated **Lenis Smooth Scroll** implementation tailored for luxury hospitality on desktop while strictly preserving 100% native momentum on touch devices.
4. Convert static mock operational interfaces into real-time, database-backed tools for hotel receptionists and housekeepers.
5. Upgrade `/rooms/[slug]` to dynamic server-side rendering backed by PostgreSQL instead of a 2-room static in-memory fallback.
6. Fix orphaned inventory leakage during the automated cancellation of expired booking holds in multi-room bookings.

---

## 2. Problem Statement & Audit Evidence

| Issue ID | Area | Root Cause & Failure Scenario | Target Resolution |
| :--- | :--- | :--- | :--- |
| **SEC-001** | Auth & RBAC | `auth.config.ts` coerces any role other than `ADMIN` or `STAFF` to `CUSTOMER`. Legitimate `RECEPTIONIST` and `HOUSEKEEPER` accounts in the database lose their operational permissions upon session creation. | Synchronize all 5 active domain roles: `ADMIN`, `MANAGER`, `RECEPTIONIST`, `HOUSEKEEPER`, `CUSTOMER`. |
| **SEC-002** | Security Guard | `src/middleware.ts` guards only `/admin` and `/profile`. Routes `/operations/reception` and `/operations/housekeeping` lack middleware-level enforcement. | Enforce Edge middleware checks for `/operations/reception` (Admin, Manager, Receptionist) and `/operations/housekeeping` (Admin, Manager, Housekeeper). |
| **BIZ-001** | Booking Engine | `/api/checkout/route.ts` executes `requireUser(await auth())` and throws 401 Unauthorized for guests without an active login session, violating the core brief for direct guest bookings. | Implement frictionless auto-upsert for guest accounts during checkout, maintaining idempotency and linking the booking record cleanly. |
| **OPS-001** | Operations | `/operations/reception` and `/operations/housekeeping` manipulate local component state with hardcoded arrays; check-ins, check-outs, and cleaning updates never hit the database. | Implement REST API endpoints (`/api/operations/*`) wrapping `operations.service.ts` with real-time Prisma DB reads/writes and audit logging. |
| **INV-001** | Inventory & Cron | `daily-maintenance/route.ts` releases inventory only for `bk.roomCategoryId`, omitting secondary rooms in `bk.bookingRooms`, permanently reducing available inventory count. | Query `bookingRooms` on expired bookings and release all associated room categories in the transaction. |
| **UI-001** | Interaction / Design | `src/components/layout/SmoothScroll.tsx` calls `e.preventDefault()` on native `wheel` events, causing scroll hijacking that conflicts with `design.md`. | Replace with official `lenis` package configured for desktop-only smooth easing, respecting `prefers-reduced-motion` and native touch. |
| **UI-002** | Room Detail | `src/app/rooms/[slug]/page.tsx` relies on a hardcoded 2-room dictionary (`ROOM_DETAILS`) and silently falls back to Deluxe King on unrecognized slugs. | Implement dynamic database queries via Prisma with Next.js `notFound()` on invalid slugs and real rate-plan selectors. |

---

## 3. Technical Architecture & Component Design

### 3.1 Lenis Smooth Scroll Engine (`src/components/layout/LenisProvider.tsx`)

* **Package:** `lenis` (v1.1.x).
* **Scope & Parameters:**
  * Enabled exclusively on non-coarse pointer devices (`(pointer: fine)`).
  * Automatically disabled on touch screens (`(pointer: coarse)`) to retain 100% native iOS Safari and Android Chrome inertial scrolling.
  * Honors accessibility: Immediately unloads if `prefers-reduced-motion: reduce` is detected.
  * Smooth configuration:
    * `duration: 1.2`
    * `lerp: 0.08`
    * `easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` (smooth logarithmic deceleration)
    * `smoothWheel: true`
* **Anchor Navigation:** Integrates with internal anchor links (e.g. `#ledger`, `#main-content`, `#booking`) to glide smoothly without browser jumping.
* **Cleanup:** Delete `src/components/layout/SmoothScroll.tsx`. Update `src/app/layout.tsx` to wrap children with `<LenisProvider>`.

### 3.2 Frictionless Guest Checkout (`/api/checkout` & `checkout.service.ts`)

* **Authentication Handling:**
  ```ts
  const session = await auth();
  let userId: string;
  let userEmail: string;

  if (session?.user?.id && session?.user?.email) {
    userId = session.user.id;
    userEmail = session.user.email;
  } else {
    // Guest checkout: Find or create guest user account
    const existingUser = await db.user.findUnique({
      where: { email: parsed.data.guestEmail },
    });
    if (existingUser) {
      userId = existingUser.id;
      userEmail = existingUser.email;
    } else {
      const guestRole = await db.role.findFirst({
        where: { type: { in: ["CUSTOMER", "GUEST"] } },
      });
      const newGuest = await db.user.create({
        data: {
          email: parsed.data.guestEmail,
          name: parsed.data.guestName,
          phone: parsed.data.guestPhone,
          roleId: guestRole?.id || "default-customer-role",
          password: null, // Unregistered guest account
        },
      });
      userId = newGuest.id;
      userEmail = newGuest.email;
    }
  }
  ```
* **Idempotency Guarantee:**
  * `CheckoutIdempotency` safely records `userId` using the resolved user ID.
  * Replayed requests with the same `Idempotency-Key` return the existing booking ID without duplicate charges or inventory reservation.
* **Confirmation Screen (Step 3):**
  * Displays confirmed booking details, reference number, and arrival guide.
  * Provides a 1-click button to view the booking at `/my-bookings?bookingNumber=...&email=...`.
  * Renders an optional account activation card: "Create a password to save your details and earn member perks on future stays".

### 3.3 Role Synchronization & Edge Route Guards

* **Session Callback (`src/auth.config.ts`):**
  * Populate `session.user.role` with the token's authenticated role:
    `"ADMIN" | "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPER" | "CUSTOMER"`.
* **Edge Route Guards (`src/auth.config.ts` -> `authorized`):**
  * `/admin/*`: Restricted to `ADMIN` and `MANAGER`.
  * `/operations/reception/*`: Restricted to `ADMIN`, `MANAGER`, and `RECEPTIONIST`.
  * `/operations/housekeeping/*`: Restricted to `ADMIN`, `MANAGER`, and `HOUSEKEEPER`.
  * Unauthenticated requests are redirected to `/login?callbackUrl=...`. Unauthorized authenticated users are redirected to `/`.

### 3.4 Operational API Endpoints & UI Data Binding

* **REST Endpoints (`src/app/api/operations/*`):**
  1. `GET /api/operations/reception`:
     * Queries bookings with status `CONFIRMED` or `CHECKED_IN`, ordered by arrival date.
     * Queries all rooms with their physical status, cleaning status, and current occupancy.
  2. `POST /api/operations/checkin`:
     * Validates input: `{ bookingId: string, roomId?: string }`.
     * If `roomId` is provided, invokes `assignRoomToBooking`.
     * Invokes `performCheckIn`: Updates booking to `CHECKED_IN`, room to `OCCUPIED`, writes audit log.
  3. `POST /api/operations/checkout`:
     * Validates input: `{ bookingId: string }`.
     * Invokes `performCheckOut`: Updates booking to `CHECKED_OUT`, sets assigned rooms to `DIRTY`, writes audit log.
  4. `GET /api/operations/housekeeping`:
     * Queries rooms grouped by floor, filtering by cleaning status (`DIRTY`, `INSPECTING`, `CLEAN`, `MAINTENANCE`).
  5. `PATCH /api/operations/cleaning`:
     * Validates input: `{ roomId: string, status: "CLEAN" | "DIRTY" | "INSPECTING" | "MAINTENANCE", notes?: string }`.
     * Invokes `updateRoomCleaningStatus`: Updates status, writes audit log.
* **UI Integration:**
  * `/operations/reception/page.tsx`: Connects to `GET /api/operations/reception`. Provides an interactive Room Assignment modal showing available `CLEAN` rooms for the booked category before confirming check-in.
  * `/operations/housekeeping/page.tsx`: Connects to `GET /api/operations/housekeeping` and `PATCH /api/operations/cleaning`. Staff can tap a room card to cycle its state from `DIRTY` to `INSPECTING` to `CLEAN`.

### 3.5 Dynamic Room Detail Page (`src/app/rooms/[slug]/page.tsx`)

* **Server Component Pattern:**
  * Fetches category from Prisma:
    ```ts
    const category = await db.roomCategory.findUnique({
      where: { slug: resolvedParams.slug, isActive: true },
      include: { ratePlans: { where: { isActive: true } } },
    });
    if (!category) notFound();
    ```
  * Safely parses JSON arrays for `amenities` and `images`.
  * Renders dynamic rate-plan comparison cards with real price calculations based on rate multipliers.
  * Generates SEO metadata dynamically using `generateMetadata({ params })`.

### 3.6 Cron Job Inventory Integrity (`daily-maintenance/route.ts`)

* **Fix Multi-Room Leakage:**
  * Query expired bookings with `include: { bookingRooms: true }`.
  * Extract all room categories:
    ```ts
    const categoryIds = bk.bookingRooms.length > 0
      ? bk.bookingRooms.map((r) => r.roomCategoryId)
      : [bk.roomCategoryId];

    for (const catId of categoryIds) {
      await releaseAvailability({
        roomCategoryId: catId,
        checkIn: bk.checkIn,
        checkOut: bk.checkOut,
      }, db);
    }
    ```

---

## 4. State Machines & Transitions

```
[Booking State Machine]
DRAFT -> PENDING_PAYMENT -> (Payment Success) -> CONFIRMED -> (Check-in) -> CHECKED_IN -> (Check-out) -> CHECKED_OUT
                       \-> (30-min Expired)  -> CANCELLED (Inventory released)
                       \-> (Guest Cancel)    -> CANCELLED (Inventory released)

[Room Cleaning State Machine]
CLEAN -> (Guest Checked In) -> OCCUPIED -> (Guest Checked Out) -> DIRTY -> (Staff Cleaning) -> INSPECTING -> (Manager/Staff Verified) -> CLEAN
                                                                    \-> (Issue Reported) -> MAINTENANCE ----------------------------------> CLEAN
```

---

## 5. Security & Verification Strategy

1. **Role Access Tests:** Verify that non-authenticated requests to `/operations/*` receive 307 redirect to login, and authenticated `CUSTOMER` accounts receive 307 redirect to root.
2. **Guest Checkout E2E:** Execute an end-to-end checkout with guest credentials, validating:
   - 201 Created response.
   - Idempotency key stored.
   - DayAvailability `bookedCount` incremented.
   - AuditLog created with action `BOOKING_CREATED`.
3. **Multi-Room Hold Expiration Test:** Simulate a 2-room booking in `PENDING_PAYMENT`, run `daily-maintenance`, verify both room categories have their `bookedCount` decremented.
4. **Lenis Scroll Smoke Test:** Verify desktop wheel smoothly glides without `e.preventDefault()` blocking, and touch devices retain native touch events.
5. **Quality Gates:** Run `npm run lint`, `npm run typecheck`, and Node 24 native test suite (`node --experimental-strip-types --test tests/*.test.ts`).

---

## 6. Document History
- 2026-10-22: Initial specification drafted and approved during collaborative brainstorming.
