# Aurora Hotel P0 Remediation & Lenis Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all audit-identified P0 defects in Aurora Hotel (guest checkout, RBAC, operations database integration, dynamic room detail SSR, multi-room inventory hold release) and replace custom wheel hijacking with Lenis Scroll.

**Architecture:** We use Next.js 15 App Router with NextAuth v5 beta on Edge middleware for role-based route protection, backed by Prisma ORM and PostgreSQL. The checkout flow auto-upserts guest accounts to eliminate login friction while maintaining idempotency. Operational endpoints expose domain service state machines (`operations.service.ts`) to receptionist and housekeeping dashboards. Smooth scrolling uses `@studio-freight/lenis` / `lenis` v1.1.x scoped to desktop devices with native momentum preserved on touch.

**Tech Stack:** Next.js 15.5.22, React 19, TypeScript 5.7, Tailwind CSS, Prisma 6.0, NextAuth v5 beta, Lenis 1.1.x, Node 24 test runner.

---

### Task 1: Dependencies & Lenis Scroll Engine Integration

**Files:**
- Create: `src/components/layout/LenisProvider.tsx`
- Modify: `package.json`
- Modify: `src/app/layout.tsx:1-40`
- Modify: `design.md:65-85`
- Delete: `src/components/layout/SmoothScroll.tsx`
- Test: `tests/lenis-provider.test.ts`

- [ ] **Step 1: Install dependencies including lenis**

Run: `npm install && npm install lenis@^1.1.0`
Expected: `node_modules` populated and `lenis` added to `dependencies` in `package.json`.

- [ ] **Step 2: Write test for Lenis configuration helper**

Create `tests/lenis-provider.test.ts`:
```ts
import test from "node:test";
import assert from "node:assert/strict";

function getLenisConfig(isTouch: boolean, prefersReducedMotion: boolean) {
  if (isTouch || prefersReducedMotion) {
    return null;
  }
  return {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.0,
    infinite: false,
  };
}

test("Lenis disabled on touch devices", () => {
  const config = getLenisConfig(true, false);
  assert.equal(config, null);
});

test("Lenis disabled when prefers-reduced-motion is active", () => {
  const config = getLenisConfig(false, true);
  assert.equal(config, null);
});

test("Lenis configured with locked luxury parameters on desktop", () => {
  const config = getLenisConfig(false, false);
  assert.notEqual(config, null);
  assert.equal(config?.lerp, 0.08);
  assert.equal(config?.duration, 1.2);
  assert.equal(config?.smoothWheel, true);
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/lenis-provider.test.ts`
Expected: PASS 3 tests.

- [ ] **Step 4: Implement LenisProvider component**

Create `src/components/layout/LenisProvider.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Preserve 100% native momentum on touch devices (mobile & tablet)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    // Respect accessibility: disabled on reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    // Smooth scroll for anchor navigation
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      const href = target?.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, { offset: -60 });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 5: Replace SmoothScroll in RootLayout and delete SmoothScroll.tsx**

Modify `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LenisProvider } from "@/components/layout/LenisProvider";

export const metadata: Metadata = {
  title: {
    default: "Aurora Hotel — Where Every Stay Becomes a Memory",
    template: "%s | Aurora Hotel",
  },
  description:
    "Contemporary luxury oceanfront hotel in Da Nang, Vietnam. Book directly for the best rates on premium rooms, suites, dining, and spa experiences.",
  openGraph: {
    siteName: "Aurora Hotel",
    type: "website",
    title: "Aurora Hotel — Where Every Stay Becomes a Memory",
    description:
      "Contemporary luxury oceanfront hotel in Da Nang, Vietnam. Book directly for the best rates.",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className="min-h-screen bg-aurora-ivory text-aurora-midnight antialiased font-interface"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
```

Delete `src/components/layout/SmoothScroll.tsx`.

- [ ] **Step 6: Update design.md scroll policy**

Update line 69 of `design.md`:
Replace:
`- Vertical scrolling remains native; Lenis, Locomotive Scroll, and pinned scroll narratives are prohibited.`
With:
`- Vertical scrolling utilizes Lenis on desktop (lerp: 0.08, duration: 1.2s, smoothWheel: true) while strictly preserving 100% native momentum scrolling on touch devices (pointer: coarse). Custom wheel event hijacking and pinned scroll narratives are prohibited.`

- [ ] **Step 7: Verify design lock check & UI contracts**

Run: `npm run design:check && npm run ui:contract-check`
Expected: Both exit 0 with clean verification.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/components/layout/LenisProvider.tsx src/app/layout.tsx design.md tests/lenis-provider.test.ts
git rm src/components/layout/SmoothScroll.tsx
git commit -m "feat(scroll): integrate Lenis smooth scroll and remove wheel hijacking`n`nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: RBAC Role Synchronization & Edge Route Guards

**Files:**
- Modify: `src/types/next-auth.d.ts:1-24`
- Modify: `src/auth.config.ts:1-43`
- Modify: `src/middleware.ts:120-135`
- Test: `tests/rbac-guards.test.ts`

- [ ] **Step 1: Write test for RBAC route authorization logic**

Create `tests/rbac-guards.test.ts`:
```ts
import test from "node:test";
import assert from "node:assert/strict";

type UserRole = "ADMIN" | "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPER" | "CUSTOMER" | "GUEST" | "STAFF";

function checkRouteAccess(pathname: string, user: { role: UserRole } | null): { allowed: boolean; redirectUrl?: string } {
  if (pathname.startsWith("/admin")) {
    if (!user) return { allowed: false, redirectUrl: "/login" };
    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return { allowed: false, redirectUrl: "/" };
    }
  }

  if (pathname.startsWith("/operations/reception")) {
    if (!user) return { allowed: false, redirectUrl: "/login" };
    if (user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "RECEPTIONIST") {
      return { allowed: false, redirectUrl: "/" };
    }
  }

  if (pathname.startsWith("/operations/housekeeping")) {
    if (!user) return { allowed: false, redirectUrl: "/login" };
    if (user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "HOUSEKEEPER") {
      return { allowed: false, redirectUrl: "/" };
    }
  }

  return { allowed: true };
}

test("Unauthenticated user is blocked from operations routes", () => {
  assert.deepEqual(checkRouteAccess("/operations/reception", null), { allowed: false, redirectUrl: "/login" });
  assert.deepEqual(checkRouteAccess("/operations/housekeeping", null), { allowed: false, redirectUrl: "/login" });
});

test("Customer role is redirected to home from operations and admin", () => {
  const customer = { role: "CUSTOMER" as const };
  assert.deepEqual(checkRouteAccess("/operations/reception", customer), { allowed: false, redirectUrl: "/" });
  assert.deepEqual(checkRouteAccess("/operations/housekeeping", customer), { allowed: false, redirectUrl: "/" });
  assert.deepEqual(checkRouteAccess("/admin", customer), { allowed: false, redirectUrl: "/" });
});

test("Receptionist can access reception desk but not admin or housekeeping", () => {
  const receptionist = { role: "RECEPTIONIST" as const };
  assert.deepEqual(checkRouteAccess("/operations/reception", receptionist), { allowed: true });
  assert.deepEqual(checkRouteAccess("/operations/housekeeping", receptionist), { allowed: false, redirectUrl: "/" });
  assert.deepEqual(checkRouteAccess("/admin", receptionist), { allowed: false, redirectUrl: "/" });
});

test("Housekeeper can access housekeeping command but not reception or admin", () => {
  const housekeeper = { role: "HOUSEKEEPER" as const };
  assert.deepEqual(checkRouteAccess("/operations/housekeeping", housekeeper), { allowed: true });
  assert.deepEqual(checkRouteAccess("/operations/reception", housekeeper), { allowed: false, redirectUrl: "/" });
  assert.deepEqual(checkRouteAccess("/admin", housekeeper), { allowed: false, redirectUrl: "/" });
});

test("Admin and Manager have access to all operational routes", () => {
  for (const role of ["ADMIN", "MANAGER"] as const) {
    const user = { role };
    assert.deepEqual(checkRouteAccess("/admin", user), { allowed: true });
    assert.deepEqual(checkRouteAccess("/operations/reception", user), { allowed: true });
    assert.deepEqual(checkRouteAccess("/operations/housekeeping", user), { allowed: true });
  }
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/rbac-guards.test.ts`
Expected: PASS 5 tests.

- [ ] **Step 3: Update NextAuth type definitions**

Modify `src/types/next-auth.d.ts`:
```ts
import type { DefaultSession } from "next-auth";

export type RoleType =
  | "ADMIN"
  | "MANAGER"
  | "RECEPTIONIST"
  | "HOUSEKEEPER"
  | "CUSTOMER"
  | "GUEST"
  | "STAFF";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleType;
    } & DefaultSession["user"];
  }

  interface User {
    role?: RoleType | string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: RoleType | string;
  }
}
```

- [ ] **Step 4: Update auth.config.ts with complete role matrix and edge guards**

Modify `src/auth.config.ts`:
```ts
import type { NextAuthConfig } from "next-auth";
import type { RoleType } from "@/types/next-auth";

const ALLOWED_ROLES: RoleType[] = [
  "ADMIN",
  "MANAGER",
  "RECEPTIONIST",
  "HOUSEKEEPER",
  "CUSTOMER",
  "GUEST",
  "STAFF",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        const tokenRole = token.role as RoleType;
        session.user.role = ALLOWED_ROLES.includes(tokenRole) ? tokenRole : "CUSTOMER";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        const role = auth.user.role;
        if (role !== "ADMIN" && role !== "MANAGER" && role !== "STAFF") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (pathname.startsWith("/operations/reception")) {
        if (!isLoggedIn) return false;
        const role = auth.user.role;
        if (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (pathname.startsWith("/operations/housekeeping")) {
        if (!isLoggedIn) return false;
        const role = auth.user.role;
        if (role !== "ADMIN" && role !== "MANAGER" && role !== "HOUSEKEEPER") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (pathname.startsWith("/profile") && !isLoggedIn) return false;

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

- [ ] **Step 5: Update middleware.ts to guard /operations**

Modify `src/middleware.ts` around line 124:
```ts
  // 2. Auth guard only where it can block navigation. Public routes keep the
  // plain pass-through so the nonce request override reaches the renderer.
  const needsAuthGuard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/operations");
```

- [ ] **Step 6: Run tests and typecheck**

Run: `node --experimental-strip-types --test tests/rbac-guards.test.ts && npm run typecheck`
Expected: Tests pass and typecheck exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/types/next-auth.d.ts src/auth.config.ts src/middleware.ts tests/rbac-guards.test.ts
git commit -m "feat(auth): synchronize 5 operational roles and enforce Edge route guards`n`nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Frictionless Guest Checkout

**Files:**
- Modify: `src/app/api/checkout/route.ts:1-58`
- Modify: `src/app/booking/page.tsx:150-205`
- Test: `tests/guest-checkout.test.ts`

- [ ] **Step 1: Write test for guest user resolution logic**

Create `tests/guest-checkout.test.ts`:
```ts
import test from "node:test";
import assert from "node:assert/strict";

interface MockUser {
  id: string;
  email: string;
  roleId: string;
}

interface MockDb {
  users: MockUser[];
}

async function resolveCheckoutUser(
  session: { user?: { id?: string; email?: string } } | null,
  guestInput: { guestEmail: string; guestName: string; guestPhone: string },
  db: MockDb,
): Promise<{ id: string; email: string }> {
  if (session?.user?.id && session?.user?.email) {
    return { id: session.user.id, email: session.user.email };
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === guestInput.guestEmail.toLowerCase());
  if (existing) {
    return { id: existing.id, email: existing.email };
  }

  const newUser: MockUser = {
    id: `guest-${Date.now()}`,
    email: guestInput.guestEmail.toLowerCase(),
    roleId: "role-customer",
  };
  db.users.push(newUser);
  return { id: newUser.id, email: newUser.email };
}

test("Logged-in user uses session identity directly", async () => {
  const db: MockDb = { users: [] };
  const user = await resolveCheckoutUser(
    { user: { id: "user-123", email: "member@aurorahotel.vn" } },
    { guestEmail: "other@gmail.com", guestName: "Other", guestPhone: "0900000000" },
    db,
  );
  assert.equal(user.id, "user-123");
  assert.equal(user.email, "member@aurorahotel.vn");
  assert.equal(db.users.length, 0);
});

test("Guest user without session is automatically created in db", async () => {
  const db: MockDb = { users: [] };
  const user = await resolveCheckoutUser(
    null,
    { guestEmail: "traveler@gmail.com", guestName: "Nguyễn Khách", guestPhone: "0912345678" },
    db,
  );
  assert.equal(user.email, "traveler@gmail.com");
  assert.equal(db.users.length, 1);
  assert.equal(db.users[0].email, "traveler@gmail.com");
});

test("Returning guest user matches existing account without duplicate creation", async () => {
  const db: MockDb = { users: [{ id: "existing-guest", email: "traveler@gmail.com", roleId: "role-customer" }] };
  const user = await resolveCheckoutUser(
    null,
    { guestEmail: "traveler@gmail.com", guestName: "Nguyễn Khách", guestPhone: "0912345678" },
    db,
  );
  assert.equal(user.id, "existing-guest");
  assert.equal(db.users.length, 1);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/guest-checkout.test.ts`
Expected: PASS 3 tests.

- [ ] **Step 3: Update checkout API route to allow guest reservations**

Modify `src/app/api/checkout/route.ts`:
```ts
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { bookingCheckoutSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { processCheckout } from "@/services/checkout.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonApiError(request, 400, "BAD_REQUEST", "Body must be valid JSON");
    }

    const parsed = bookingCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError(
        request,
        400,
        "BAD_REQUEST",
        "Invalid checkout payload",
        parsed.error.flatten().fieldErrors,
      );
    }

    // Resolve user: Use active session or auto-upsert guest account
    const session = await auth();
    let checkoutUser: { id: string; email: string };

    if (session?.user?.id && session?.user?.email) {
      checkoutUser = { id: session.user.id, email: session.user.email };
    } else {
      const guestEmail = parsed.data.guestEmail.trim().toLowerCase();
      let user = await db.user.findUnique({
        where: { email: guestEmail },
      });

      if (!user) {
        let role = await db.role.findFirst({
          where: { type: { in: ["CUSTOMER", "GUEST"] } },
        });
        if (!role) {
          role = await db.role.create({
            data: { name: "Customer", type: "CUSTOMER" },
          });
        }

        user = await db.user.create({
          data: {
            email: guestEmail,
            name: parsed.data.guestName.trim(),
            phone: parsed.data.guestPhone.trim(),
            roleId: role.id,
            password: null, // Unregistered guest account
          },
        });
      }

      checkoutUser = { id: user.id, email: user.email };
    }

    const result = await processCheckout(
      parsed.data,
      checkoutUser,
      request.headers.get("idempotency-key"),
    );

    if ("existingBookingId" in result) {
      return Response.json({ bookingId: result.existingBookingId, replayed: true });
    }
    return Response.json(
      {
        bookingId: result.newBookingId,
        bookingNumber: result.bookingNumber,
        totalAmount: result.totalAmount,
        replayed: false,
      },
      { status: 201 },
    );
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
```

- [ ] **Step 4: Update booking checkout page UI**

Modify `src/app/booking/page.tsx`:
In `submitBooking`, remove the 401 redirect:
```ts
      if (response.status === 401) {
        // Guest checkout is allowed; if 401 occurs, display error message instead of jarring redirect
        throw new Error(json.error?.message || t("booking.checkoutFailed"));
      }
```
In Step 3 (Confirmation view), add direct links to manage booking and an optional password setup card for guests:
```tsx
  {step === 3 && (
    <div className="booking-card booking-result confirmed">
      <div className="booking-card-heading">
        <p className="booking-eyebrow">Xác Nhận Đặt Phòng Hoàn Tất</p>
        <h2>Cảm ơn quý khách!</h2>
      </div>
      <p>
        Mã đơn đặt phòng của quý khách là:{" "}
        <strong className="font-mono text-aurora-brass text-lg">{bookingResult?.bookingNumber || "Đang xử lý"}</strong>.
        Chúng tôi đã gửi email xác nhận cùng hướng dẫn nhận phòng chi tiết tới <strong>{guestEmail}</strong>.
      </p>

      <div className="booking-result-actions mt-6 flex gap-4">
        <Link
          href={`/my-bookings?bookingNumber=${encodeURIComponent(bookingResult?.bookingNumber || "")}&email=${encodeURIComponent(guestEmail)}`}
          className="booking-primary-button"
        >
          Xem & Quản Lý Đơn Đặt Phòng
        </Link>
        <Link href="/" className="booking-secondary-button">
          Về Trang Chủ
        </Link>
      </div>
    </div>
  )}
```

- [ ] **Step 5: Run tests and typecheck**

Run: `node --experimental-strip-types --test tests/guest-checkout.test.ts && npm run typecheck`
Expected: All tests pass and typecheck exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/checkout/route.ts src/app/booking/page.tsx tests/guest-checkout.test.ts
git commit -m "feat(checkout): enable frictionless guest checkout with auto-upsert and direct management link`n`nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Operations Backend REST API Endpoints

**Files:**
- Create: `src/app/api/operations/reception/route.ts`
- Create: `src/app/api/operations/checkin/route.ts`
- Create: `src/app/api/operations/checkout/route.ts`
- Create: `src/app/api/operations/housekeeping/route.ts`
- Create: `src/app/api/operations/cleaning/route.ts`
- Test: `tests/operations-api.test.ts`

- [ ] **Step 1: Write test for operational state transitions**

Create `tests/operations-api.test.ts`:
```ts
import test from "node:test";
import assert from "node:assert/strict";

interface RoomState {
  id: string;
  number: string;
  status: "CLEAN" | "DIRTY" | "INSPECTING" | "MAINTENANCE";
  isOccupied: boolean;
}

interface BookingState {
  id: string;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
  assignedRoomId?: string;
}

function processCheckIn(booking: BookingState, room: RoomState): { booking: BookingState; room: RoomState } {
  if (booking.status !== "CONFIRMED") {
    throw new Error(`Cannot check in booking with status ${booking.status}`);
  }
  if (room.status !== "CLEAN") {
    throw new Error(`Room ${room.number} is not clean (current: ${room.status})`);
  }
  return {
    booking: { ...booking, status: "CHECKED_IN", assignedRoomId: room.id },
    room: { ...room, isOccupied: true },
  };
}

function processCheckOut(booking: BookingState, room: RoomState): { booking: BookingState; room: RoomState } {
  if (booking.status !== "CHECKED_IN") {
    throw new Error(`Cannot check out booking with status ${booking.status}`);
  }
  return {
    booking: { ...booking, status: "CHECKED_OUT" },
    room: { ...room, status: "DIRTY", isOccupied: false },
  };
}

function updateCleaning(room: RoomState, nextStatus: RoomState["status"]): RoomState {
  return { ...room, status: nextStatus };
}

test("Check-in updates booking to CHECKED_IN and room to occupied", () => {
  const booking: BookingState = { id: "bk-1", status: "CONFIRMED" };
  const room: RoomState = { id: "rm-101", number: "101", status: "CLEAN", isOccupied: false };
  const res = processCheckIn(booking, room);
  assert.equal(res.booking.status, "CHECKED_IN");
  assert.equal(res.room.isOccupied, true);
});

test("Check-in rejects dirty room", () => {
  const booking: BookingState = { id: "bk-1", status: "CONFIRMED" };
  const room: RoomState = { id: "rm-101", number: "101", status: "DIRTY", isOccupied: false };
  assert.throws(() => processCheckIn(booking, room), /is not clean/);
});

test("Check-out automatically transitions room to DIRTY", () => {
  const booking: BookingState = { id: "bk-1", status: "CHECKED_IN", assignedRoomId: "rm-101" };
  const room: RoomState = { id: "rm-101", number: "101", status: "CLEAN", isOccupied: true };
  const res = processCheckOut(booking, room);
  assert.equal(res.booking.status, "CHECKED_OUT");
  assert.equal(res.room.status, "DIRTY");
  assert.equal(res.room.isOccupied, false);
});

test("Housekeeping advances room through cleaning lifecycle", () => {
  let room: RoomState = { id: "rm-101", number: "101", status: "DIRTY", isOccupied: false };
  room = updateCleaning(room, "INSPECTING");
  assert.equal(room.status, "INSPECTING");
  room = updateCleaning(room, "CLEAN");
  assert.equal(room.status, "CLEAN");
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/operations-api.test.ts`
Expected: PASS 4 tests.

- [ ] **Step 3: Implement GET /api/operations/reception**

Create `src/app/api/operations/reception/route.ts`:
```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [bookings, rooms] = await Promise.all([
      db.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
        },
        include: {
          guest: { select: { name: true, email: true, phone: true } },
          roomCategory: { select: { id: true, name: true, slug: true } },
          roomAssignments: {
            include: { room: true },
          },
        },
        orderBy: { checkIn: "asc" },
        take: 100,
      }),
      db.room.findMany({
        include: {
          roomCategory: { select: { id: true, name: true } },
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      }),
    ]);

    const formattedBookings = bookings.map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      guestName: b.guest.name || b.guest.email,
      roomCategoryId: b.roomCategoryId,
      roomCategoryName: b.roomCategory.name,
      status: b.status,
      checkIn: b.checkIn.toISOString().slice(0, 10),
      checkOut: b.checkOut.toISOString().slice(0, 10),
      assignedRoom: b.roomAssignments[0]?.room?.number || null,
      assignedRoomId: b.roomAssignments[0]?.room?.id || null,
    }));

    const formattedRooms = rooms.map((r) => ({
      id: r.id,
      roomNumber: r.number,
      floor: r.floor,
      categoryName: r.roomCategory.name,
      roomCategoryId: r.roomCategoryId,
      status: r.status,
    }));

    return NextResponse.json({ success: true, bookings: formattedBookings, rooms: formattedRooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Implement POST /api/operations/checkin**

Create `src/app/api/operations/checkin/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { assignRoomToBooking, performCheckIn } from "@/services/operations.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, roomId } = body;
    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    if (roomId && typeof roomId === "string") {
      await assignRoomToBooking({
        bookingId,
        roomId,
        staffId: session.user.id,
      });
    }

    const updated = await performCheckIn({
      bookingId,
      staffId: session.user.id,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
```

- [ ] **Step 5: Implement POST /api/operations/checkout**

Create `src/app/api/operations/checkout/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { performCheckOut } from "@/services/operations.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId } = body;
    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const updated = await performCheckOut({
      bookingId,
      staffId: session.user.id,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-out failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
```

- [ ] **Step 6: Implement GET /api/operations/housekeeping**

Create `src/app/api/operations/housekeeping/route.ts`:
```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "HOUSEKEEPER" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rooms = await db.room.findMany({
      include: {
        roomCategory: { select: { name: true } },
      },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });

    const formattedRooms = rooms.map((r) => ({
      id: r.id,
      roomNumber: r.number,
      floor: r.floor,
      categoryName: r.roomCategory.name,
      status: r.status,
      notes: r.notes || "",
    }));

    return NextResponse.json({ success: true, rooms: formattedRooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
```

- [ ] **Step 7: Implement PATCH /api/operations/cleaning**

Create `src/app/api/operations/cleaning/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateRoomCleaningStatus } from "@/services/operations.service";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER" && role !== "HOUSEKEEPER" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { roomId, status, notes } = body;
    if (!roomId || !status) {
      return NextResponse.json({ error: "roomId and status are required" }, { status: 400 });
    }

    const updated = await updateRoomCleaningStatus({
      roomId,
      status,
      notes,
      staffId: session.user.id,
    });

    return NextResponse.json({ success: true, room: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status update failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
```

- [ ] **Step 8: Run typecheck and test**

Run: `node --experimental-strip-types --test tests/operations-api.test.ts && npm run typecheck`
Expected: Tests pass and typecheck exits 0.

- [ ] **Step 9: Commit**

```bash
git add src/app/api/operations/ tests/operations-api.test.ts
git commit -m "feat(operations): expose RESTful API endpoints for reception, checkin, checkout, and housekeeping`n`nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Operations Front-End Dashboards Data Binding

**Files:**
- Modify: `src/app/operations/reception/page.tsx:1-161`
- Modify: `src/app/operations/housekeeping/page.tsx:1-128`

- [ ] **Step 1: Connect Receptionist Desk to live API with Clean Room suggestion modal**

Modify `src/app/operations/reception/page.tsx`:
```tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoomMatrixGrid, MatrixRoomItem } from "@/components/operations/RoomMatrixGrid";

interface ReceptionBooking {
  id: string;
  bookingNumber: string;
  guestName: string;
  roomCategoryId: string;
  roomCategoryName: string;
  status: string;
  checkIn: string;
  checkOut: string;
  assignedRoom?: string | null;
  assignedRoomId?: string | null;
}

export default function ReceptionPage() {
  const [matrixRooms, setMatrixRooms] = useState<MatrixRoomItem[]>([]);
  const [bookings, setBookings] = useState<ReceptionBooking[]>([]);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<ReceptionBooking | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/operations/reception");
      if (!res.ok) throw new Error("Failed to load operations data");
      const json = await res.json();
      if (json.success) {
        setBookings(json.bookings || []);
        setMatrixRooms(json.rooms || []);
      }
    } catch {
      setActionMessage("Lỗi tải dữ liệu phòng và đơn đặt.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const initiateCheckIn = (booking: ReceptionBooking) => {
    setSelectedBookingForCheckIn(booking);
    // Find available CLEAN rooms for this booking's category
    const availableClean = matrixRooms.filter(
      (r) => r.roomCategoryId === booking.roomCategoryId && r.status === "CLEAN"
    );
    setSelectedRoomId(booking.assignedRoomId || (availableClean[0]?.id ?? ""));
  };

  const confirmCheckIn = async () => {
    if (!selectedBookingForCheckIn) return;
    try {
      const res = await fetch("/api/operations/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForCheckIn.id,
          roomId: selectedRoomId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Check-in thất bại");
      }
      setActionMessage(`Check-in thành công cho đơn ${selectedBookingForCheckIn.bookingNumber}`);
      setSelectedBookingForCheckIn(null);
      fetchData();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Check-in thất bại");
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    try {
      const res = await fetch("/api/operations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Check-out thất bại");
      }
      setActionMessage("Check-out thành công. Phòng đã chuyển sang trạng thái DIRTY.");
      fetchData();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Check-out thất bại");
    }
  };

  const cleanRoomsForCategory = selectedBookingForCheckIn
    ? matrixRooms.filter((r) => r.roomCategoryId === selectedBookingForCheckIn.roomCategoryId && r.status === "CLEAN")
    : [];

  return (
    <div className="min-h-screen bg-aurora-ivory text-aurora-espresso flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center bg-aurora-espresso text-aurora-ivory p-6 rounded-surface border border-aurora-brass/30">
          <div>
            <span className="text-xs text-aurora-brass font-bold uppercase tracking-wider">RECEPTIONIST DESK</span>
            <h1 className="font-serif-display text-2xl font-light">Nghiệp Vụ Lễ Tân & Check-in / Out</h1>
          </div>
          <Link href="/admin" className="text-xs text-aurora-brass border border-aurora-brass/40 px-4 py-2 min-h-[44px] inline-flex items-center rounded-control hover:bg-aurora-brass/10">
            Về Dashboard Quản Trị
          </Link>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-input bg-aurora-success/10 border border-aurora-success text-aurora-success text-xs font-semibold">
            ✓ {actionMessage}
          </div>
        )}

        {/* Room Assignment Modal */}
        {selectedBookingForCheckIn && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-aurora-ivory text-aurora-espresso p-6 rounded-surface border border-aurora-brass max-w-md w-full space-y-4">
              <h3 className="font-serif-display text-xl font-bold">Xác Nhận Check-In & Phân Phòng</h3>
              <p className="text-xs text-aurora-taupe">
                Đơn: <strong>{selectedBookingForCheckIn.bookingNumber}</strong> ({selectedBookingForCheckIn.guestName})
                <br />
                Hạng phòng: <strong>{selectedBookingForCheckIn.roomCategoryName}</strong>
              </p>

              <div>
                <label className="text-xs font-bold block mb-2">Gợi ý phòng CLEAN khả dụng:</label>
                {cleanRoomsForCategory.length === 0 ? (
                  <p className="text-xs text-aurora-error">Không có phòng sạch khả dụng cho hạng phòng này.</p>
                ) : (
                  <select
                    className="w-full min-h-[44px] border border-aurora-mist rounded-input p-2 text-xs bg-white"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                  >
                    {cleanRoomsForCategory.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        Phòng {rm.roomNumber} (Tầng {rm.floor}) — {rm.status}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-aurora-mist">
                <button
                  onClick={() => setSelectedBookingForCheckIn(null)}
                  className="px-4 py-2 min-h-[44px] border border-aurora-mist rounded-control text-xs"
                >
                  Huỷ
                </button>
                <button
                  onClick={confirmCheckIn}
                  disabled={cleanRoomsForCategory.length === 0 && !selectedBookingForCheckIn.assignedRoomId}
                  className="px-4 py-2 min-h-[44px] bg-aurora-success text-white rounded-control text-xs font-bold disabled:opacity-50"
                >
                  Xác Nhận Check-In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Matrix Grid */}
        <div className="space-y-4">
          <h2 className="font-serif-luxury text-2xl font-bold text-aurora-espresso">
            Sơ Đồ Phòng Theo Tầng & Trạng Thái Trực Quan
          </h2>
          {isLoading ? (
            <div className="p-8 text-center text-xs text-aurora-taupe">Đang tải sơ đồ phòng...</div>
          ) : (
            <RoomMatrixGrid rooms={matrixRooms} />
          )}
        </div>

        {/* Bookings table */}
        <div className="bg-aurora-ivory rounded-surface p-6 border border-aurora-mist shadow-sm space-y-4">
          <h2 className="font-serif-display text-xl text-aurora-espresso">Danh Sách Đơn Đặt Phòng Lưu Trú</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-aurora-mist text-aurora-espresso font-bold">
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Tên Khách</th>
                  <th className="p-3">Hạng Phòng</th>
                  <th className="p-3">Số Phòng</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác Lễ Tân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-mist/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-aurora-linen/50">
                    <td className="p-3 font-mono font-bold text-aurora-espresso">{b.bookingNumber}</td>
                    <td className="p-3 font-semibold">{b.guestName}</td>
                    <td className="p-3">{b.roomCategoryName}</td>
                    <td className="p-3 font-mono text-aurora-walnut font-bold">{b.assignedRoom || "Chưa gán"}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        b.status === "CONFIRMED" ? "bg-aurora-success/10 text-aurora-success" :
                        b.status === "CHECKED_IN" ? "bg-aurora-information/10 text-aurora-information" : "bg-aurora-mist text-aurora-espresso"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {b.status === "CONFIRMED" && (
                        <button
                          onClick={() => initiateCheckIn(b)}
                          className="px-3 py-2 min-h-[44px] rounded-control bg-aurora-success text-white text-[11px] font-semibold hover:opacity-90"
                        >
                          Check-in
                        </button>
                      )}
                      {b.status === "CHECKED_IN" && (
                        <button
                          onClick={() => handleCheckOut(b.id)}
                          className="px-3 py-2 min-h-[44px] rounded-control bg-aurora-warning text-white text-[11px] font-semibold hover:opacity-90"
                        >
                          Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Connect Housekeeping Command to live API**

Modify `src/app/operations/housekeeping/page.tsx`:
```tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoomMatrixGrid, MatrixRoomItem } from "@/components/operations/RoomMatrixGrid";

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<MatrixRoomItem[]>([]);
  const [actionMessage, setActionMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/operations/housekeeping");
      if (!res.ok) throw new Error("Failed to fetch housekeeping rooms");
      const json = await res.json();
      if (json.success) {
        setRooms(json.rooms || []);
      }
    } catch {
      setActionMessage("Lỗi tải danh sách buồng phòng.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const updateStatus = async (roomId: string, newStatus: MatrixRoomItem["status"]) => {
    try {
      const res = await fetch("/api/operations/cleaning", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Cập nhật trạng thái thất bại");
      }
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
      );
      setActionMessage(`Đã cập nhật phòng sang trạng thái ${newStatus}`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Lỗi cập nhật");
    }
  };

  return (
    <div className="min-h-screen bg-aurora-ivory text-aurora-espresso flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center bg-aurora-espresso text-aurora-ivory p-6 rounded-surface border border-aurora-brass/30">
          <div>
            <span className="text-xs text-aurora-brass font-bold uppercase tracking-wider">HOUSEKEEPING COMMAND</span>
            <h1 className="font-serif-display text-2xl font-light">Quản Lý & Phân Luồng Dọn Phòng</h1>
          </div>
          <Link href="/admin" className="text-xs text-aurora-brass border border-aurora-brass/40 px-4 py-2 min-h-[44px] inline-flex items-center rounded-control hover:bg-aurora-brass/10">
            Về Dashboard Quản Trị
          </Link>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-input bg-aurora-success/10 border border-aurora-success text-aurora-success text-xs font-semibold">
            ✓ {actionMessage}
          </div>
        )}

        {/* Interactive Floor Matrix */}
        <div className="space-y-4">
          <h2 className="font-serif-luxury text-2xl font-bold text-aurora-espresso">
            Hàng Đợi Trạng Thái Buồng Phòng Trực Quan
          </h2>
          {isLoading ? (
            <div className="p-8 text-center text-xs text-aurora-taupe">Đang tải trạng thái buồng phòng...</div>
          ) : (
            <RoomMatrixGrid
              rooms={rooms}
              onStatusChange={updateStatus}
              isHousekeeperView
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-aurora-ivory rounded-surface p-6 border border-aurora-mist shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-aurora-walnut">Tầng {room.floor}</span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      room.status === "CLEAN"
                        ? "bg-aurora-success/10 text-aurora-success"
                        : room.status === "DIRTY"
                        ? "bg-aurora-error/10 text-aurora-error"
                        : room.status === "INSPECTING"
                        ? "bg-aurora-warning/10 text-aurora-warning"
                        : "bg-aurora-mist text-aurora-espresso"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="text-3xl font-mono font-bold text-aurora-espresso">Phòng {room.roomNumber}</div>
                <div className="text-xs text-aurora-taupe">{room.categoryName}</div>
              </div>

              {/* Status transition controls */}
              <div className="space-y-2 pt-3 border-t border-aurora-mist">
                <span className="text-[11px] font-semibold text-aurora-espresso">Cập nhật trạng thái:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(room.id, "CLEAN")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-success/10 text-aurora-success text-[11px] font-bold hover:bg-aurora-success hover:text-white transition-all"
                  >
                    Clean
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "DIRTY")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-error/10 text-aurora-error text-[11px] font-bold hover:bg-aurora-error hover:text-white transition-all"
                  >
                    Dirty
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "INSPECTING")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-warning/10 text-aurora-warning text-[11px] font-bold hover:bg-aurora-warning hover:text-white transition-all"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => updateStatus(room.id, "MAINTENANCE")}
                    className="px-2 py-2 min-h-[44px] rounded-control bg-aurora-espresso/10 text-aurora-espresso text-[11px] font-bold hover:bg-aurora-espresso hover:text-white transition-all"
                  >
                    Maint
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Run UI contract check and typecheck**

Run: `npm run ui:contract-check && npm run typecheck`
Expected: Both exit 0 cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/app/operations/reception/page.tsx src/app/operations/housekeeping/page.tsx
git commit -m "feat(operations): bind reception and housekeeping UI to real REST endpoints with clean room modal`n`nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Dynamic Server-Rendered Room Detail Page

**Files:**
- Modify: `src/app/rooms/[slug]/page.tsx:1-250`
- Test: `tests/room-detail.test.ts`

- [ ] **Step 1: Write test for room slug lookup & notFound condition**

Create `tests/room-detail.test.ts`:
```ts
import test from "node:test";
import assert from "node:assert/strict";

interface MockCategory {
  slug: string;
  name: string;
  isActive: boolean;
}

function resolveRoomCategory(slug: string, categories: MockCategory[]) {
  const match = categories.find((c) => c.slug === slug && c.isActive);
  if (!match) return { notFound: true };
  return { notFound: false, category: match };
}

test("Valid room slug returns category", () => {
  const categories: MockCategory[] = [
    { slug: "deluxe-ocean-king", name: "Deluxe Ocean King", isActive: true },
    { slug: "presidential-suite", name: "Presidential Suite", isActive: true },
  ];
  const res = resolveRoomCategory("presidential-suite", categories);
  assert.equal(res.notFound, false);
  assert.equal(res.category?.name, "Presidential Suite");
});

test("Invalid or inactive room slug triggers notFound", () => {
  const categories: MockCategory[] = [
    { slug: "deluxe-ocean-king", name: "Deluxe Ocean King", isActive: true },
    { slug: "archived-room", name: "Archived Room", isActive: false },
  ];
  assert.equal(resolveRoomCategory("non-existent-slug", categories).notFound, true);
  assert.equal(resolveRoomCategory("archived-room", categories).notFound, true);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/room-detail.test.ts`
Expected: PASS 2 tests.

- [ ] **Step 3: Refactor /rooms/[slug] to dynamic Server Component**

Modify `src/app/rooms/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.roomCategory.findUnique({
    where: { slug, isActive: true },
  });
  if (!category) return { title: "Room Not Found | Aurora Hotel" };

  return {
    title: `${category.name} | Aurora Hotel`,
    description: category.description.slice(0, 160),
  };
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await db.roomCategory.findUnique({
    where: { slug, isActive: true },
    include: {
      ratePlans: { where: { isActive: true } },
    },
  });

  if (!category) {
    notFound();
  }

  const amenities = Array.isArray(category.amenities)
    ? (category.amenities as string[])
    : [];
  const images = Array.isArray(category.images)
    ? (category.images as string[])
    : ["/images/aurora/deluxe-king.jpg"];

  const checkIn = typeof search.checkIn === "string" ? search.checkIn : "";
  const checkOut = typeof search.checkOut === "string" ? search.checkOut : "";
  const guests = typeof search.guests === "string" ? search.guests : "2";

  const bookingQuery = new URLSearchParams();
  bookingQuery.set("roomCategoryId", category.id);
  if (checkIn) bookingQuery.set("checkIn", checkIn);
  if (checkOut) bookingQuery.set("checkOut", checkOut);
  if (guests) bookingQuery.set("guests", guests);

  return (
    <div className="min-h-screen bg-aurora-ivory text-aurora-espresso flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-aurora-taupe flex gap-2 items-center">
          <Link href="/" className="hover:text-aurora-brass">Trang Chủ</Link>
          <span>/</span>
          <Link href="/rooms" className="hover:text-aurora-brass">Hạng Phòng</Link>
          <span>/</span>
          <span className="text-aurora-espresso font-semibold">{category.name}</span>
        </nav>

        {/* Room Header */}
        <div className="space-y-4">
          <span className="text-xs text-aurora-brass font-bold uppercase tracking-wider">HẠNG PHÒNG NGHỈ DƯỠNG</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-light text-aurora-espresso">{category.name}</h1>
          <p className="max-w-3xl text-sm sm:text-base text-aurora-taupe leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-surface overflow-hidden">
          <div className="md:col-span-2 relative h-[360px] sm:h-[480px]">
            <Image
              src={images[0] || "/images/aurora/deluxe-king.jpg"}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {images.slice(1, 3).map((img, idx) => (
              <div key={idx} className="relative h-[170px] sm:h-[230px]">
                <Image
                  src={img}
                  alt={`${category.name} - view ${idx + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Specifications & Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8 border-t border-aurora-mist">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-3 gap-4 p-6 bg-aurora-linen/40 rounded-surface border border-aurora-mist">
              <div>
                <span className="text-xs text-aurora-taupe block">Diện tích</span>
                <strong className="text-lg text-aurora-espresso">{category.sizeSqm} m²</strong>
              </div>
              <div>
                <span className="text-xs text-aurora-taupe block">Sức chứa</span>
                <strong className="text-lg text-aurora-espresso">Tối đa {category.maxOccupancy} khách</strong>
              </div>
              <div>
                <span className="text-xs text-aurora-taupe block">Giường</span>
                <strong className="text-lg text-aurora-espresso">{category.bedConfiguration}</strong>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif-luxury text-2xl font-bold">Tiện Nghi Đẳng Cấp</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-aurora-espresso">
                {amenities.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-aurora-brass">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rate Plan & Booking CTA */}
          <div className="space-y-6">
            <div className="bg-aurora-ivory p-6 rounded-surface border border-aurora-brass/40 shadow-sm space-y-6">
              <div>
                <span className="text-xs text-aurora-taupe">Giá tiêu chuẩn mỗi đêm</span>
                <div className="text-3xl font-serif-display font-bold text-aurora-espresso">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(category.basePrice)}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-aurora-walnut uppercase tracking-wider block">Gói giá có sẵn:</span>
                {category.ratePlans.map((rp) => (
                  <div key={rp.id} className="p-3 border border-aurora-mist rounded-control space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>{rp.name}</span>
                      <span className="text-aurora-brass font-mono">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          Math.round(category.basePrice * Number(rp.multiplier))
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/booking?${bookingQuery.toString()}`}
                className="w-full min-h-[48px] bg-aurora-espresso text-aurora-ivory font-bold text-xs uppercase tracking-wider rounded-control flex items-center justify-center hover:bg-aurora-walnut transition-all"
              >
                Đặt Phòng Ngay
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Run test and typecheck**

Run: `node --experimental-strip-types --test tests/room-detail.test.ts && npm run typecheck`
Expected: Test passes and typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/rooms/\[slug\]/page.tsx tests/room-detail.test.ts
git commit -m "feat(rooms): convert /rooms/[slug] to dynamic server-rendered page backed by PostgreSQL`n`nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Multi-Room Hold Expiration Inventory Fix

**Files:**
- Modify: `src/app/api/internal/jobs/daily-maintenance/route.ts:15-45`
- Test: `tests/daily-maintenance.test.ts`

- [ ] **Step 1: Write test for multi-room release category extraction**

Create `tests/daily-maintenance.test.ts`:
```ts
import test from "node:test";
import assert from "node:assert/strict";

interface MockBooking {
  id: string;
  roomCategoryId: string;
  bookingRooms?: Array<{ roomCategoryId: string }>;
}

function extractCategoriesToRelease(booking: MockBooking): string[] {
  if (booking.bookingRooms && booking.bookingRooms.length > 0) {
    return booking.bookingRooms.map((r) => r.roomCategoryId);
  }
  return [booking.roomCategoryId];
}

test("Single room reservation releases primary room category", () => {
  const bk: MockBooking = { id: "bk-1", roomCategoryId: "cat-deluxe" };
  const categories = extractCategoriesToRelease(bk);
  assert.deepEqual(categories, ["cat-deluxe"]);
});

test("Multi-room reservation releases all rooms in bookingRooms", () => {
  const bk: MockBooking = {
    id: "bk-2",
    roomCategoryId: "cat-deluxe",
    bookingRooms: [
      { roomCategoryId: "cat-deluxe" },
      { roomCategoryId: "cat-executive" },
      { roomCategoryId: "cat-villa" },
    ],
  };
  const categories = extractCategoriesToRelease(bk);
  assert.deepEqual(categories, ["cat-deluxe", "cat-executive", "cat-villa"]);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/daily-maintenance.test.ts`
Expected: PASS 2 tests.

- [ ] **Step 3: Update daily-maintenance route to include bookingRooms and release all inventory**

Modify `src/app/api/internal/jobs/daily-maintenance/route.ts`:
```ts
    // 2. Release ONLY actually expired pending booking holds (30-min expiration limit)
    const holdExpirationCutoff = new Date(Date.now() - 30 * 60 * 1000);
    const expiredBookings = await db.booking.findMany({
      where: {
        status: "PENDING_PAYMENT",
        createdAt: { lt: holdExpirationCutoff },
      },
      include: {
        bookingRooms: true,
      },
      take: 50,
    });

    let releasedHoldsCount = 0;
    for (const bk of expiredBookings) {
      const { count } = await db.booking.updateMany({
        where: { id: bk.id, status: "PENDING_PAYMENT" },
        data: { status: "CANCELLED" },
      });
      if (count === 1) {
        const categoryIds =
          bk.bookingRooms && bk.bookingRooms.length > 0
            ? bk.bookingRooms.map((r) => r.roomCategoryId)
            : [bk.roomCategoryId];

        for (const catId of categoryIds) {
          await releaseAvailability(
            {
              roomCategoryId: catId,
              checkIn: bk.checkIn,
              checkOut: bk.checkOut,
            },
            db
          );
        }
        releasedHoldsCount++;
      }
    }
```

- [ ] **Step 4: Run test and typecheck**

Run: `node --experimental-strip-types --test tests/daily-maintenance.test.ts && npm run typecheck`
Expected: Tests pass and typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/internal/jobs/daily-maintenance/route.ts tests/daily-maintenance.test.ts
git commit -m "fix(cron): release inventory for all rooms in multi-room bookings on hold expiration`n`nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: End-to-End Quality Gates & Build Verification

**Files:**
- Test all altered and created files

- [ ] **Step 1: Run comprehensive UI Affordance Contract Checks**

Run: `npm run ui:contract-check`
Expected: 0 dead controls detected.

- [ ] **Step 2: Run Design Lock Verification**

Run: `npm run design:check`
Expected: Aurora design lock: verified.

- [ ] **Step 3: Run Full Typecheck**

Run: `npm run typecheck`
Expected: Exits 0 with 0 TypeScript errors.

- [ ] **Step 4: Run Linter**

Run: `npm run lint`
Expected: Exits 0 cleanly.

- [ ] **Step 5: Run Node 24 Native Test Suite**

Run: `npm run test`
Expected: All tests pass.

- [ ] **Step 6: Run Production Next.js Build**

Run: `npm run build`
Expected: Successful Next.js production build (`.next` generated cleanly).
