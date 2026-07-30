import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GET as getRooms } from "../../src/app/api/rooms/route.ts";
import { GET as getAvailability } from "../../src/app/api/availability/route.ts";

describe("Aurora Hotel API Routes", () => {
  it("exports room categories and availability", async () => {
    const response = await getRooms();
    assert.equal(response.status, 200);
    const json = await response.json();
    assert.ok(Array.isArray(json.data));
  });

  it("handles availability search query", async () => {
    const request = new Request("http://localhost:3000/api/availability?checkIn=2026-08-01&checkOut=2026-08-03");
    const response = await getAvailability(request);
    assert.equal(response.status, 200);
    const json = await response.json();
    assert.ok(Array.isArray(json.data));
  });
});
