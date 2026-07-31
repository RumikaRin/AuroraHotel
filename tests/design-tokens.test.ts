import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Aurora design tokens", () => {
  it("defines locked color tokens and fonts in globals.css", async () => {
    const css = await readFile("src/app/globals.css", "utf8");
    // V5 token naming: --night maps to aurora-midnight (#14201b ≈ #17211D variant)
    // Verify brand colors are present by hex value
    assert.match(css, /#f7f4ed/i, "ivory color missing");
    assert.match(css, /#c5a46d/i, "gold color missing");
    assert.match(css, /#355b4b/i, "leaf/forest-green color missing");
    assert.match(css, /#b97857/i, "clay/terracotta color missing");
    assert.match(css, /Cormorant Garamond/);
    assert.match(css, /Manrope/);
  });
});
