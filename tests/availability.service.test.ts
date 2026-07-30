import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reserveAvailability } from "../src/services/availability.service.ts";
import { ConflictError } from "../src/domain/errors.ts";

describe("DayAvailability reservation concurrency guard", () => {
  it("atomically increments bookedCount when inventory is available", async () => {
    const mockTx = {
      dayAvailability: {
        findMany: async () => [
          { id: "da-1", roomCategoryId: "cat-1", date: new Date("2026-08-01"), totalInventory: 10, bookedCount: 0, holdCount: 0, version: 0 },
        ],
        updateMany: async () => ({ count: 1 }),
      },
    };

    const res = await reserveAvailability(
      { roomCategoryId: "cat-1", checkIn: "2026-08-01", checkOut: "2026-08-02" },
      mockTx as unknown as Parameters<typeof reserveAvailability>[1],
    );
    assert.equal(res.success, true);
  });

  it("throws ConflictError when inventory update fails due to concurrency or zero inventory", async () => {
    const mockTx = {
      dayAvailability: {
        findMany: async () => [
          { id: "da-1", roomCategoryId: "cat-1", date: new Date("2026-08-01"), totalInventory: 10, bookedCount: 10, holdCount: 0, version: 5 },
        ],
        updateMany: async () => ({ count: 0 }),
      },
    };

    await assert.rejects(
      () =>
        reserveAvailability(
          { roomCategoryId: "cat-1", checkIn: "2026-08-01", checkOut: "2026-08-02" },
          mockTx as unknown as Parameters<typeof reserveAvailability>[1],
        ),
      ConflictError,
    );
  });
});
