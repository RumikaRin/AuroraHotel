import { test, expect } from "@playwright/test";

test.describe("Aurora Route Smoke Tests", () => {
  const publicRoutes = [
    "/",
    "/rooms",
    "/rooms/deluxe-ocean-king",
    "/booking",
    "/login",
    "/my-bookings",
  ];

  for (const route of publicRoutes) {
    test(`renders public route ${route} cleanly`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main")).toBeVisible();
    });
  }

  test("health probes respond safely", async ({ page }) => {
    const liveRes = await page.goto("/api/health/live");
    expect(liveRes?.status()).toBe(200);

    const readyRes = await page.goto("/api/health/ready");
    expect([200, 503]).toContain(readyRes?.status());
  });
});
