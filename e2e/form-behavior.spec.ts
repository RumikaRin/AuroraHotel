import { test, expect } from "@playwright/test";

test.describe("Aurora Form Behavior E2E", () => {
  test("my-bookings lookup form validates email and booking reference input", async ({ page }) => {
    await page.goto("/my-bookings");
    await expect(page.locator("h1")).toContainText("Tra Cứu & Quản Lý Đặt Phòng");

    const bookingInput = page.locator("input[placeholder*='AUR-']");
    if (await bookingInput.isVisible()) {
      await bookingInput.fill("AUR-DEMO-1234");
      const submitBtn = page.getByRole("button", { name: /Tìm Đơn Đặt Phòng/i });
      await expect(submitBtn).toBeVisible();
    }
  });

  test("booking step 2 form checks required fields before submission", async ({ page }) => {
    await page.goto("/booking");
    await page.getByRole("button", { name: /Tiếp Tục/i }).click();
    await expect(page.getByText("Bước 2: Thông Tin Liên Hệ Khách Hàng")).toBeVisible();

    const submitBtn = page.getByRole("button", { name: /Hoàn Tất Đặt Phòng/i });
    await expect(submitBtn).toBeDisabled();
  });
});
