import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("Aurora Revenue & Occupancy Reporting", () => {
  it("calculates Average Daily Rate (ADR) and RevPAR correctly", () => {
    const totalRevenue = 50000000; // 50M VND
    const totalNightsBooked = 20;
    const totalAvailableRooms = 10;
    const daysInPeriod = 5;

    const adr = Math.round(totalRevenue / totalNightsBooked);
    const totalRoomNightsAvailable = totalAvailableRooms * daysInPeriod;
    const revpar = Math.round(totalRevenue / totalRoomNightsAvailable);
    const occupancyRate = (totalNightsBooked / totalRoomNightsAvailable) * 100;

    assert.equal(adr, 2500000);
    assert.equal(revpar, 1000000);
    assert.equal(occupancyRate, 40);
  });
});
