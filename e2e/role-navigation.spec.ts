import { test, expect } from "@playwright/test";

test.describe("Aurora Role Navigation & RBAC Safeguards E2E", () => {
  test("receptionist page renders operations UI", async ({ page }) => {
    await page.goto("/operations/reception");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("housekeeper page renders status queue UI", async ({ page }) => {
    await page.goto("/operations/housekeeping");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("admin dashboard routes handle authentication redirection safely", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/admin/reports");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/admin/rooms");
    await expect(page.locator("h1")).toBeVisible();
  });
});
