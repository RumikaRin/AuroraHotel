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
  it("exports room types", () => {
    assert.deepEqual(Object.keys(ROOM_TYPES), [
      "DELUXE_KING",
      "DELUXE_TWIN",
      "EXECUTIVE_SUITE",
      "PRESIDENTIAL_SUITE",
    ]);
  });

  it("exports booking statuses", () => {
    assert.ok(BOOKING_STATUSES.CONFIRMED);
    assert.ok(BOOKING_STATUSES.CANCELLED);
  });

  it("exports user roles", () => {
    assert.ok(USER_ROLES.GUEST);
    assert.ok(USER_ROLES.RECEPTIONIST);
    assert.ok(USER_ROLES.HOUSEKEEPER);
    assert.ok(USER_ROLES.MANAGER);
    assert.ok(USER_ROLES.ADMIN);
  });
});
