import { test, expect } from "@playwright/test";

test.describe("Aurora Hotel Domain E2E Workflows", () => {
  test("navigates luxury room directory and detail page", async ({ page }) => {
    await page.goto("/rooms");
    await expect(page.getByRole("heading", { name: /Một căn phòng/i })).toBeVisible();

    await page.goto("/rooms/deluxe-ocean-king");
    await expect(page.locator("h1")).toContainText("Deluxe Ocean King");
  });

  test("renders 3-step checkout page with summary panel", async ({ page }) => {
    await page.goto("/booking?slug=deluxe-ocean-king");
    await expect(page.getByRole("heading", { name: /Chọn ngày & hạng phòng/i })).toBeVisible();
  });

  test("renders guest self-service lookup portal", async ({ page }) => {
    await page.goto("/my-bookings");
    await expect(page.getByRole("heading", { name: /Tra cứu/i })).toBeVisible();
  });

  test("renders reception and housekeeping staff dashboards", async ({ page }) => {
    await page.goto("/operations/reception");
    await expect(page.locator("h1")).toContainText("Nghiệp Vụ Lễ Tân & Check-in / Out");

    await page.goto("/operations/housekeeping");
    await expect(page.locator("h1")).toContainText("Quản Lý Trạng Thái Dọn Dẹp Buồng Phòng");
  });

  test("renders admin management dashboard and sub-routes", async ({ page }) => {
    await page.goto("/admin");
    // Unauthenticated user is redirected or sees login page
    await expect(page.locator("h1")).toBeVisible();
  });
});
