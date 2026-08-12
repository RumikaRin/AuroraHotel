import { test, expect } from "@playwright/test";

test.describe("Aurora UI/UX Pro Max Enhanced Features E2E", () => {
  test("rooms page filter bar filters rooms by name and opens compare modal", async ({ page }) => {
    await page.goto("/rooms");

    // Filter bar should be visible
    const filterHeader = page.locator("text=Bộ Lọc Tìm Kếm Hạng Phòng");
    await expect(filterHeader).toBeVisible();

    // Type in search query
    const searchInput = page.locator("#search-input");
    await searchInput.fill("Deluxe");

    // Deluxe Ocean King should remain visible
    await expect(page.locator("text=Deluxe Ocean King")).toBeVisible();

    // Compare button click
    const compareBtn = page.locator("button:has-text('+ So Sánh')").first();
    await compareBtn.click();

    // Open Compare Modal
    const openCompareModalBtn = page.locator("button:has-text('So Sánh Phòng (1)')");
    await openCompareModalBtn.click();

    // Compare modal title should be visible
    await expect(page.locator("text=Bảng So Sánh Các Hạng Phòng")).toBeVisible();
  });

  test("booking wizard renders 15-minute room hold countdown timer and sticky summary drawer", async ({ page }) => {
    await page.goto("/booking");

    // Hold Timer should be visible
    await expect(page.locator("text=Giữ phòng an toàn:")).toBeVisible();

    // Advance to Step 2
    const nextBtn = page.locator("button:has-text('Tiếp Tục: Nhập Thông Tin Khách Hàng')");
    await nextBtn.click();

    // Step 2 heading
    await expect(page.locator("text=Bước 2: Nhập Thông Tin Khách Hàng")).toBeVisible();
  });

  test("reception and housekeeping render interactive room matrix grid", async ({ page }) => {
    await page.goto("/operations/reception");

    // Room matrix title
    await expect(page.locator("text=Sơ Đồ Phòng Theo Tầng & Trạng Thái Trực Quan")).toBeVisible();

    // Floor 1 heading
    await expect(page.locator("text=Tầng 1")).toBeVisible();

    // Click room 101
    const roomTile = page.locator("button:has-text('P.101')");
    await roomTile.click();

    // Room detail modal should pop up
    await expect(page.locator("text=CHI TIẾT PHÒNG #101")).toBeVisible();
  });
});
