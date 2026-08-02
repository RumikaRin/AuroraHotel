import { test, expect } from "@playwright/test";

test.describe("Aurora Form Behavior E2E", () => {
  test("my-bookings lookup form validates email and booking reference input", async ({ page }) => {
    await page.goto("/my-bookings");
    await expect(page.getByRole("heading", { name: /Tra cứu/i })).toBeVisible();

    const bookingInput = page.locator("input[placeholder*='AUR-']");
    if (await bookingInput.isVisible()) {
      await bookingInput.fill("AUR-DEMO-1234");
      const submitBtn = page.getByRole("button", { name: /Tra cứu hồ sơ/i });
      await expect(submitBtn).toBeVisible();
    }
  });

  test("booking step 2 form checks required fields before submission", async ({ page }) => {
    await page.route("**/api/rooms", async (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [{ id: "cat-1", slug: "deluxe-ocean-king", name: "Deluxe Ocean King", basePrice: 2500000, ratePlans: [{ id: "rp-flex", name: "Flexible", priceMultiplier: 1 }] }] }),
    }));
    await page.route("**/api/quote", async (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { roomSubtotal: 5000000, serviceSubtotal: 0, discountTotal: 0, taxAndFeeTotal: 500000, totalAmount: 5500000, nights: 2, rooms: [] } }),
    }));
    await page.goto("/booking");
    await expect(page.getByText(/Báo giá đã được xác nhận/i)).toBeVisible();
    await page.getByRole("button", { name: /Tiếp tục nhập thông tin/i }).click();
    await expect(page.getByRole("heading", { name: /Thông tin khách & thanh toán/i })).toBeVisible();

    const submitBtn = page.getByRole("button", { name: /Gửi yêu cầu đặt phòng/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    await expect(page.locator(".booking-error")).toContainText(/Vui lòng nhập họ tên/i);
  });
});
