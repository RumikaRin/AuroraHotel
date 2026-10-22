import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

describe("EditorialHeader architecture and route contracts", () => {
  it("includes all essential e-commerce routes, auth, language toggle, and mobile drawer", async () => {
    const fileContent = await readFile("src/components/layout/EditorialHeader.tsx", "utf8");

    // Route checks
    assert.ok(fileContent.includes('"/rooms"'), "Must contain link to /rooms catalog");
    assert.ok(fileContent.includes('"/experiences"'), "Must contain link to /experiences");
    assert.ok(fileContent.includes('"/offers"'), "Must contain link to /offers");
    assert.ok(fileContent.includes('"/my-bookings"'), "Must contain link to /my-bookings");
    assert.ok(fileContent.includes('"/login"'), "Must contain link to /login");

    // i18n & controls
    assert.ok(fileContent.includes("useLanguage"), "Must integrate useLanguage hook");
    assert.ok(fileContent.includes("toggleLanguage"), "Must provide toggleLanguage action");
    assert.ok(fileContent.includes("lang-btn"), "Must expose .lang-btn for QA automation");

    // Mobile drawer affordances
    assert.ok(fileContent.includes("menu-button"), "Must expose .menu-button for mobile toggle");
    assert.ok(fileContent.includes("mobile-overlay"), "Must implement .mobile-overlay drawer");
    assert.ok(!fileContent.includes('href="#"'), "Must not contain dead link href='#'");
  });
});
