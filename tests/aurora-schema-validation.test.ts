import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Aurora P0 database schema", () => {
  it("defines core hotel models with day availability versioning and unique constraints", async () => {
    const schema = await readFile("prisma/schema.prisma", "utf8");
    assert.match(schema, /model RoomCategory/);
    assert.match(schema, /model RatePlan/);
    assert.match(schema, /model Room/);
    assert.match(schema, /model DayAvailability/);
    assert.match(schema, /model Booking/);
    assert.match(schema, /model RoomAssignment/);
    assert.match(schema, /model Payment/);
    assert.match(schema, /model AuditLog/);
    assert.match(schema, /model EmailOutbox/);
    assert.match(schema, /model CheckoutIdempotency/);
    assert.match(schema, /version\s+Int\s+@default\(0\)/);
    assert.match(schema, /@@unique\(\[roomCategoryId, date\]\)/);
    assert.match(schema, /bookingNumber\s+String\s+@unique/);
  });
});
