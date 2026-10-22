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

describe("EditorialHeader Component", () => {
  it("exports EditorialHeader with Awwwards micro-indexes and segmented theme switcher", async () => {
    const file = await readFile("src/components/layout/EditorialHeader.tsx", "utf8");
    assert.match(file, /"use client"/, "EditorialHeader must be a client component");
    assert.match(file, /01[\s\S]*?Triết lý/, "Missing 01 Triet ly micro-index");
    assert.match(file, /02[\s\S]*?Phân khu/, "Missing 02 Phan khu micro-index");
    assert.match(file, /03[\s\S]*?Suites & Villas/, "Missing 03 Suites micro-index");
    assert.match(file, /04[\s\S]*?Ẩm thực/, "Missing 04 Am thuc micro-index");
    assert.match(file, /05[\s\S]*?Trị liệu/, "Missing 05 Tri lieu micro-index");
    assert.match(file, /06[\s\S]*?Đặc quyền/, "Missing 06 Dac quyen micro-index");
    assert.match(file, /theme-switch-segmented/, "Segmented theme switcher container missing");
    assert.match(file, /Tối/, "Dusk 'Tối' label missing");
    assert.match(file, /Sáng/, "Dawn 'Sáng' label missing");
    assert.doesNotMatch(file, /href="#"/, "Dead link violation (href='#') forbidden");
    assert.doesNotMatch(file, /onClick=\{\(\)\s*=>\s*\{\}\}/, "Empty onClick handler forbidden");
  });
});

describe("EditorialHero Component", () => {
  it("renders pure editorial headline and 4-column booking ribbon without inline pill breaks", async () => {
    const file = await readFile("src/components/home/EditorialHero.tsx", "utf8");
    assert.match(file, /KHU NGHỈ DƯỠNG BIỆT LẬP · BÁN ĐẢO SƠN TRÀ, ĐÀ NẴNG/);
    assert.match(file, /Thành phố ở gần\./);
    assert.match(file, /Kỳ nghỉ ở rất xa\./);
    assert.match(file, /booking-ribbon-bar/, "Booking ribbon container missing");
    assert.match(file, /NHẬN PHÒNG/);
    assert.match(file, /TRẢ PHÒNG/);
    assert.match(file, /SỐ KHÁCH/);
    assert.doesNotMatch(file, /pill-badge/, "Inline pill badges forbidden per editorial standard");
    assert.doesNotMatch(file, /href="#"/, "Dead link violation forbidden");
  });
});
