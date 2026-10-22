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
