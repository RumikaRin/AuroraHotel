import { test, expect } from "@playwright/test";

test("customer shell exposes the approved warm image-led tokens", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("#booking")).toBeVisible();

  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      espresso: styles.getPropertyValue("--espresso").trim(),
      linen: styles.getPropertyValue("--linen").trim(),
      brass: styles.getPropertyValue("--antique-brass").trim(),
      navy: styles.getPropertyValue("--aurora-midnight").trim(),
    };
  });

  expect(tokens.espresso).toBe("#261e1a");
  expect(tokens.linen).toBe("#f3eee7");
  expect(tokens.brass).toBe("#b59a6b");
  expect(tokens.navy).not.toBe("#17211d");
});
