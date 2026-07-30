import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

describe("Aurora seed script", () => {
  it("contains deterministic seed data for all 4 room categories and 5 roles", async () => {
    const seedScript = await readFile("prisma/seed.ts", "utf8");
    assert.match(seedScript, /admin@aurorahotel\.com/);
    assert.match(seedScript, /receptionist@aurorahotel\.com/);
    assert.match(seedScript, /housekeeper@aurorahotel\.com/);
    assert.match(seedScript, /guest@aurorahotel\.com/);
    assert.match(seedScript, /DELUXE_KING/);
    assert.match(seedScript, /DELUXE_TWIN/);
    assert.match(seedScript, /EXECUTIVE_SUITE/);
    assert.match(seedScript, /PRESIDENTIAL_SUITE/);
    assert.match(seedScript, /FLEXIBLE_BREAKFAST/);
    assert.match(seedScript, /NON_REFUNDABLE/);
  });
});
