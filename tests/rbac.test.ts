import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasPermission, assertPermission } from "../src/server/auth/rbac.ts";

describe("Aurora RBAC system", () => {
  it("grants guests self-service permissions only", () => {
    assert.equal(hasPermission("GUEST", "booking:read_own"), true);
    assert.equal(hasPermission("GUEST", "room:assign"), false);
    assert.equal(hasPermission("GUEST", "room:update_cleaning"), false);
  });

  it("grants registered customers self-service permissions only", () => {
    assert.equal(hasPermission("CUSTOMER", "booking:read_own"), true);
    assert.equal(hasPermission("CUSTOMER", "booking:create_own"), true);
    assert.equal(hasPermission("CUSTOMER", "room:assign"), false);
  });

  it("grants receptionists booking management and checkin permissions", () => {
    assert.equal(hasPermission("RECEPTIONIST", "booking:read_all"), true);
    assert.equal(hasPermission("RECEPTIONIST", "room:assign"), true);
    assert.equal(hasPermission("RECEPTIONIST", "checkin:perform"), true);
    assert.equal(hasPermission("RECEPTIONIST", "audit:read"), false);
  });

  it("grants housekeepers room cleaning permissions only", () => {
    assert.equal(hasPermission("HOUSEKEEPER", "room:update_cleaning"), true);
    assert.equal(hasPermission("HOUSEKEEPER", "booking:create_any"), false);
  });

  it("grants admin all permissions", () => {
    assert.equal(hasPermission("ADMIN", "booking:read_own"), true);
    assert.equal(hasPermission("ADMIN", "audit:read"), true);
    assert.equal(hasPermission("ADMIN", "room:update_cleaning"), true);
  });

  it("throws ForbiddenError on permission assertion failure", () => {
    assert.throws(
      () => assertPermission("GUEST", "audit:read"),
      /Permission denied/i,
    );
  });
});
