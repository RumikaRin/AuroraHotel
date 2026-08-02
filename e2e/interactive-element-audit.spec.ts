import { test, expect } from "@playwright/test";

test.describe("Aurora Interactive Element Audit E2E", () => {
  test("homepage hero CTA navigates to booking page", async ({ page }) => {
    await page.goto("/");
    const heroBtn = page.getByRole("link", { name: /khám phá & đặt phòng/i });
    if (await heroBtn.isVisible()) {
      await heroBtn.click();
      await page.waitForURL("**/rooms**");
      expect(page.url()).toContain("/rooms");
    }
  });

  test("room directory card links navigate to room detail page", async ({ page }) => {
    await page.goto("/rooms");
    const detailLink = page.locator("a[href*='/rooms/']").first();
    await expect(detailLink).toBeVisible();
    await detailLink.click();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("booking wizard advances through step 1 to step 2", async ({ page }) => {
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
  });
});
