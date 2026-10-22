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
