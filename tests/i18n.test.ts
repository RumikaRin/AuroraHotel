import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTranslation, translateBookingStatus } from "../src/domain/i18n.ts";

describe("Aurora bilingual i18n", () => {
  it("returns Vietnamese translations by default", () => {
    assert.equal(getTranslation("vi", "nav.rooms"), "Phòng & Suites");
    assert.equal(getTranslation("vi", "nav.bookNow"), "Đặt Phòng");
  });

  it("returns English translations when requested", () => {
    assert.equal(getTranslation("en", "nav.rooms"), "Rooms & Suites");
    assert.equal(getTranslation("en", "nav.bookNow"), "Book Now");
  });

  it("translates booking statuses in both languages", () => {
    assert.equal(translateBookingStatus("CONFIRMED", "vi"), "Đã xác nhận");
    assert.equal(translateBookingStatus("CONFIRMED", "en"), "Confirmed");
  });
});
