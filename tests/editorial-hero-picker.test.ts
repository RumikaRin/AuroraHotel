import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

describe("EditorialHero datepicker and booking search contracts", () => {
  it("eliminates native date inputs and integrates custom luxury AvailabilityPicker", async () => {
    const fileContent = await readFile("src/components/home/EditorialHero.tsx", "utf8");

    // Native date inputs ban (Image #17 bug prevention)
    assert.ok(!fileContent.includes('type="date"'), "Must NOT contain unstyled native type='date' input");

    // Integration of custom AvailabilityPicker
    assert.ok(fileContent.includes("AvailabilityPicker"), "Must import and render AvailabilityPicker");
    assert.ok(fileContent.includes("/api/availability"), "Must query availability endpoint or prepare query string");
    assert.ok(fileContent.includes("/rooms?checkIn="), "Must redirect to /rooms with checkIn query parameter");
    assert.ok(fileContent.includes("useLanguage"), "Must integrate bilingual language dictionary");
    assert.ok(!fileContent.includes('href="#"'), "Must not contain dead links");
  });
});
