import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Homepage Redesign - Tokens & Dependencies", () => {
  it("has gsap installed in package.json", async () => {
    const pkgJson = JSON.parse(await readFile("package.json", "utf8"));
    assert.ok(
      pkgJson.dependencies?.gsap || pkgJson.devDependencies?.gsap,
      "gsap package must be declared in package.json"
    );
  });

  it("defines atmospheric design tokens in globals.css", async () => {
    const css = await readFile("src/app/globals.css", "utf8");
    // Verify base atmospheric tokens
    assert.match(css, /--bg-surface:\s*#110e0c/i, "--bg-surface token missing or invalid");
    assert.match(css, /--bg-surface-card:\s*#1c1613/i, "--bg-surface-card token missing");
    assert.match(css, /--accent-brass:\s*#e2c799/i, "--accent-brass token missing");
    assert.match(css, /--brass-hairline:\s*rgba\(226,\s*199,\s*153/i, "--brass-hairline token missing");
    // Verify dawn theme overrides
    assert.match(css, /\[data-theme=["']dawn["']\]/, "dawn theme selector missing");
    // Verify photographic viewport scrim protection rules
    assert.match(css, /\.site-nav:not\(\.scrolled\)/, "unscrolled navbar contrast protection missing");
    assert.match(css, /overflow-x:\s*clip/, "overflow-x: clip root safety rail missing");
  });
});
