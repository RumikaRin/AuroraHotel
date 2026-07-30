// Layout-safety gate required by docs/00-quy-trinh/05-kiem-thu.md (5.3):
//   1. no horizontal scroll at 320 / 375 / 414 / 768px,
//   2. tap targets >= 44x44px below 768px,
//   3. no serious/critical axe violations (includes contrast checks),
//   4. exactly one h1 and no skipped heading levels.
// When the project grows, add every new public route to PUBLIC_ROUTES
// instead of writing a new harness. Thresholds come from the project's
// design.md accessibility floor; changing a threshold means amending
// design.md first, never loosening this spec to make it pass.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/login"] as const;
const VIEWPORT_WIDTHS = [320, 375, 414, 768] as const;
const MIN_TAP_TARGET_PX = 44;

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    dimensions.scrollWidth,
    `document is wider than the viewport (${dimensions.scrollWidth}px > ${dimensions.clientWidth}px)`,
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}

for (const route of PUBLIC_ROUTES) {
  test.describe(`layout safety: ${route}`, () => {
    for (const width of VIEWPORT_WIDTHS) {
      test(`no horizontal scroll at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        await expect(page.locator("main")).toBeVisible();
        await expectNoHorizontalOverflow(page);
      });
    }

    test(`tap targets are at least ${MIN_TAP_TARGET_PX}x${MIN_TAP_TARGET_PX}px on mobile`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();

      const offenders = await page.evaluate((minSize) => {
        const targets = Array.from(
          document.querySelectorAll<HTMLElement>("a, button"),
        );
        return targets
          .filter((el) => {
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") {
              return false;
            }
            const box = el.getBoundingClientRect();
            if (box.width === 0 && box.height === 0) return false; // not rendered
            return box.width < minSize || box.height < minSize;
          })
          .map((el) => {
            const box = el.getBoundingClientRect();
            return `${el.tagName.toLowerCase()} "${(el.textContent ?? "")
              .trim()
              .slice(0, 40)}" is ${Math.round(box.width)}x${Math.round(box.height)}px`;
          });
      }, MIN_TAP_TARGET_PX);

      expect(offenders).toEqual([]);
    });

    test("has exactly one h1 and no skipped heading levels", async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();

      const levels = await page.evaluate(() =>
        Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(
          (heading) => Number(heading.tagName.slice(1)),
        ),
      );

      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      let previous = 0;
      for (const level of levels) {
        expect(
          level - previous,
          `heading order ${levels.join(" -> ")} skips a level`,
        ).toBeLessThanOrEqual(1);
        previous = level;
      }
    });

    test("has no serious or critical axe violations", async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations.filter(
        (violation) =>
          violation.impact === "critical" || violation.impact === "serious",
      );

      expect(
        blocking.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes
            .slice(0, 8)
            .map((node) => ({ target: node.target, html: node.html })),
        })),
      ).toEqual([]);
    });
  });
}
