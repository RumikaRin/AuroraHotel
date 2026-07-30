import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Aurora design tokens", () => {
  it("defines locked color tokens and fonts in globals.css", async () => {
    const css = await readFile("src/app/globals.css", "utf8");
    assert.match(css, /--color-aurora-midnight:\s*#17211D/i);
    assert.match(css, /--color-warm-ivory:\s*#F7F4ED/i);
    assert.match(css, /--color-champagne-gold:\s*#C5A46D/i);
    assert.match(css, /--color-forest-green:\s*#355B4B/i);
    assert.match(css, /--color-terracotta:\s*#B97857/i);
    assert.match(css, /Cormorant Garamond/);
    assert.match(css, /Manrope/);
  });
});
