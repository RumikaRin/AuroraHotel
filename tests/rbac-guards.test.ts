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
