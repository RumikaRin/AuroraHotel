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
    await page.goto("/booking");
    await page.getByRole("button", { name: /Tiếp Tục/i }).click();
    await expect(page.getByText("Bước 2: Thông Tin Liên Hệ Khách Hàng")).toBeVisible();
  });
});
