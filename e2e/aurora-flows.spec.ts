import { test, expect } from "@playwright/test";

test.describe("Aurora Hotel Domain E2E Workflows", () => {
  test("navigates luxury room directory and detail page", async ({ page }) => {
    await page.goto("/rooms");
    await expect(page.locator("h1")).toContainText("Bộ Sưu Tập Hạng Phòng Luxury");

    await page.goto("/rooms/deluxe-garden-view");
    await expect(page.locator("h1")).toContainText("Deluxe Garden View");
  });

  test("renders 3-step checkout page with summary panel", async ({ page }) => {
    await page.goto("/booking?slug=deluxe-garden-view");
    await expect(page.locator("h1")).toContainText("Đặt Phòng Khoảnh Khắc");
    await expect(page.getByText("Bước 1: Chọn Ngày & Hạng Phòng")).toBeVisible();
  });

  test("renders guest self-service lookup portal", async ({ page }) => {
    await page.goto("/my-bookings");
    await expect(page.locator("h1")).toContainText("Tra Cứu & Quản Lý Đơn Đặt Phòng");
  });

  test("renders reception and housekeeping staff dashboards", async ({ page }) => {
    await page.goto("/operations/reception");
    await expect(page.locator("h1")).toContainText("Quản Lý Check-in / Check-out Lễ Tân");

    await page.goto("/operations/housekeeping");
    await expect(page.locator("h1")).toContainText("Quản Lý Trạng Thái Vệ Sinh Buồng Phòng");
  });

  test("renders admin management dashboard and sub-routes", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText("Hệ Thống Quản Trị Aurora Hotel System");

    await page.goto("/admin/bookings");
    await expect(page.locator("h1")).toContainText("Quản Lý Đơn Đặt Phòng & Trạng Thái");

    await page.goto("/admin/reports");
    await expect(page.locator("h1")).toContainText("Báo Cáo Doanh Thu & Công Suất Phòng");
  });
});
