import test from "node:test";
import assert from "node:assert/strict";

function getLenisConfig(isTouch: boolean, prefersReducedMotion: boolean) {
  if (isTouch || prefersReducedMotion) {
    return null;
  }
  return {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.0,
    infinite: false,
  };
}

test("Lenis disabled on touch devices", () => {
  const config = getLenisConfig(true, false);
  assert.equal(config, null);
});

test("Lenis disabled when prefers-reduced-motion is active", () => {
  const config = getLenisConfig(false, true);
  assert.equal(config, null);
});

test("Lenis configured with locked luxury parameters on desktop", () => {
  const config = getLenisConfig(false, false);
  assert.notEqual(config, null);
  assert.equal(config?.lerp, 0.08);
  assert.equal(config?.duration, 1.2);
  assert.equal(config?.smoothWheel, true);
});
