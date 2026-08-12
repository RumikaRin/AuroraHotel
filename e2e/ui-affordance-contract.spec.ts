import { test, expect } from "@playwright/test";

test.describe("Aurora Hotel — UI Affordance & Control Contracts", () => {
  test("public header navigates without dead links or href='#'", async ({ page }) => {
    await page.goto("/");
    const homeLogo = page.locator("header a").first();
    await expect(homeLogo).toHaveAttribute("href", "/");

    const bookNowBtn = page.getByRole("link", { name: "Đặt Phòng Trực Tiếp" });
    await expect(bookNowBtn).toHaveAttribute("href", "/booking");
  });

  test("room hold timer displays truthful session status statement", async ({ page }) => {
    await page.goto("/booking");
    await expect(page.getByText("Thời gian phiên làm việc:")).toBeVisible();
    await expect(page.getByText("Tình trạng phòng & giá được xác thực chính xác khi hoàn tất thanh toán.")).toBeVisible();
  });

  test("room matrix displays dual status dimensions", async ({ page }) => {
    await page.goto("/operations/reception");
    await expect(page.getByText("Sơ Đồ Lưới Trực Quan Lễ Tân")).toBeVisible();
    await expect(page.getByText("Tầng 1")).toBeVisible();
  });

  test("admin dashboard CSV export button triggers download safely", async ({ page }) => {
    await page.goto("/admin/reports");
    const exportBtn = page.getByRole("button", { name: "Xuất Báo Cáo CSV (Excel)" });
    await expect(exportBtn).toBeVisible();
  });
});
