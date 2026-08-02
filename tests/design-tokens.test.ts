import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Aurora design tokens", () => {
  it("defines locked color tokens and fonts in globals.css", async () => {
    const css = await readFile("src/app/globals.css", "utf8");
    // V10 customer design lock: warm editorial palette with legacy semantic aliases retained.
    assert.match(css, /#fbf8f2/i, "warm ivory color missing");
    assert.match(css, /#b59a6b/i, "antique brass color missing");
    assert.match(css, /#2e7d5a/i, "semantic success color missing");
    assert.match(css, /#a76d55/i, "muted terracotta color missing");
    assert.match(css, /#261e1a/i, "espresso color missing");
    assert.match(css, /Cormorant Garamond/);
    assert.match(css, /Manrope/);
  });
});
