import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignRoomToBooking,
  updateRoomCleaningStatus,
  performCheckIn,
  performCheckOut,
} from "../src/services/operations.service.ts";

describe("Aurora Operations Service (Reception & Housekeeping)", () => {
  it("assigns room to booking with category match", async () => {
    const mockDb = {
      booking: {
        findUnique: async () => ({ id: "bk-1", roomCategoryId: "cat-1", status: "CONFIRMED" }),
      },
      room: {
        findUnique: async () => ({ id: "rm-101", roomCategoryId: "cat-1", number: "101", status: "CLEAN" }),
      },
      roomAssignment: {
        create: async (args: { data: Record<string, unknown> }) => ({ ...args.data, id: "ra-1" }),
      },
      auditLog: { create: async (args: { data: Record<string, unknown> }) => args.data },
    };

    const res = await assignRoomToBooking(
      { bookingId: "bk-1", roomId: "rm-101", staffId: "st-1" },
      mockDb as unknown as Parameters<typeof assignRoomToBooking>[1],
    );
    assert.equal(res.roomId, "rm-101");
  });

  it("updates room cleaning status", async () => {
    const mockDb = {
      room: {
        findUnique: async () => ({ id: "rm-101", status: "DIRTY", notes: null }),
        update: async (args: { data: { status: string } }) => ({ id: "rm-101", status: args.data.status }),
      },
      auditLog: { create: async (args: { data: Record<string, unknown> }) => args.data },
    };

    const res = await updateRoomCleaningStatus(
      { roomId: "rm-101", status: "CLEAN", staffId: "st-2" },
      mockDb as unknown as Parameters<typeof updateRoomCleaningStatus>[1],
    );
    assert.equal(res.status, "CLEAN");
  });

  it("performs guest check-in and check-out", async () => {
    let bookingStatus = "CONFIRMED";
    let roomStatus = "CLEAN";
    const mockDb = {
      booking: {
        findUnique: async (args: { where: { id: string } }) => {
          if (args.where.id === "bk-1") return { id: "bk-1", status: bookingStatus };
          return { id: "bk-2", status: bookingStatus, roomAssignments: [{ roomId: "rm-101" }] };
        },
        updateMany: async (args: { data: { status: string } }) => {
          bookingStatus = args.data.status;
          return { count: 1 };
        },
      },
      room: {
        updateMany: async (args: { data: { status: string } }) => {
          roomStatus = args.data.status;
          return { count: 1 };
        },
      },
      auditLog: { create: async (args: { data: Record<string, unknown> }) => args.data },
    };

    const checkInRes = await performCheckIn(
      { bookingId: "bk-1", staffId: "st-1" },
      mockDb as unknown as Parameters<typeof performCheckIn>[1],
    );
    assert.equal(checkInRes?.status, "CHECKED_IN");

    await performCheckOut(
      { bookingId: "bk-2", staffId: "st-1" },
      mockDb as unknown as Parameters<typeof performCheckOut>[1],
    );
    assert.equal(roomStatus, "DIRTY");
  });
});
