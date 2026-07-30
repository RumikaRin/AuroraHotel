import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ROOM_TYPES,
  RATE_PLANS,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  ROOM_STATUSES,
  USER_ROLES,
  AUDIT_ACTIONS,
} from "../src/domain/contracts.ts";

describe("Aurora domain contracts", () => {
  it("exports room types and rate plans", () => {
    assert.deepEqual(Object.keys(ROOM_TYPES), [
      "DELUXE_KING",
      "DELUXE_TWIN",
      "EXECUTIVE_SUITE",
      "PRESIDENTIAL_SUITE",
    ]);
    assert.ok(RATE_PLANS.FLEXIBLE_BREAKFAST);
  });

  it("exports booking and payment statuses", () => {
    assert.ok(BOOKING_STATUSES.CONFIRMED);
    assert.ok(BOOKING_STATUSES.CANCELLED);
    assert.ok(PAYMENT_METHODS.MOCK_PAYMENT);
    assert.ok(PAYMENT_STATUSES.PAID);
  });

  it("exports user roles, room statuses, and audit actions", () => {
    assert.ok(USER_ROLES.GUEST);
    assert.ok(USER_ROLES.RECEPTIONIST);
    assert.ok(USER_ROLES.HOUSEKEEPER);
    assert.ok(USER_ROLES.MANAGER);
    assert.ok(USER_ROLES.ADMIN);
    assert.ok(ROOM_STATUSES.CLEAN);
    assert.ok(AUDIT_ACTIONS.BOOKING_CREATED);
  });
});
