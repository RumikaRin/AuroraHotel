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

test("customer navigation marks the active route and keeps footer links real", async ({ page }) => {
  await page.goto("/rooms");

  const activeRoomsLink = page.locator('nav[aria-label="Điều hướng chính"] a[href="/rooms"]');
  await expect(activeRoomsLink).toHaveAttribute("aria-current", "page");
  await expect(page.locator("footer a[href='/']")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('button[aria-label="Mở menu"]')).toBeVisible();
});

test("homepage leads with the approved direct-on-image hotel story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Thành phố ở gần/ })).toBeVisible();
  await expect(page.locator(".hero-copy")).not.toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator("#booking")).toContainText("Giá trực tiếp minh bạch");
  expect(await page.locator('main a[href="/experiences"]').count()).toBeGreaterThan(0);
});

test("homepage room reel keeps real room destinations and quiet motion fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const roomLinks = page.locator('#suites a[href^="/rooms/"]');
  expect(await roomLinks.count()).toBeGreaterThan(0);
  await expect(roomLinks.first()).toHaveAttribute("href", /\/rooms\/[^/]+$/);
  await expect(page.locator("body")).not.toContainText(/PAY_AT_HOTEL|fake QR|giữ phòng giả|hold timer/i);
  const motion = await page.locator(".hero-slide").first().evaluate((node) => {
    const style = getComputedStyle(node);
    return { transition: style.transitionDuration, animation: style.animationDuration };
  });
  expect(Number.parseFloat(motion.transition)).toBeLessThan(0.1);
  expect(Number.parseFloat(motion.animation)).toBeLessThan(0.1);
});
