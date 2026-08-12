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
  await expect(page.locator("header")).toHaveAttribute("data-header-tone", "dark");
  await expect(page.locator("header")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator("footer a[href='/']")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('button[aria-label="Mở menu"]')).toBeVisible();
});

test("transparent header adapts its foreground to the section beneath it", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header").first();
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(header).toHaveAttribute("data-header-tone", "dark");
  await expect(header).toHaveCSS("color", "rgb(251, 248, 242)");

  await page.locator(".prologue-section").evaluate((section) => {
    section.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await expect(header).toHaveAttribute("data-header-tone", "light");
  await expect(header).toHaveCSS("color", "rgb(38, 30, 26)");

  await page.locator("#suites").evaluate((section) => {
    section.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await expect(header).toHaveAttribute("data-header-tone", "dark");
});

test("homepage uses one-gesture section stops while keeping reduced-motion escape hatches", async ({ page }) => {
  await page.goto("/");

  const rhythm = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const sections = [...document.querySelectorAll<HTMLElement>("[data-scroll-section]")];
    return {
      scrollMode: document.documentElement.dataset.scrollMode,
      scrollSnapType: root.scrollSnapType,
      scrollPaddingTop: root.scrollPaddingTop,
      sectionCount: sections.length,
      sectionHeights: sections.map((section) => Math.round(section.getBoundingClientRect().height)),
      sectionSnapAlign: sections.map((section) => getComputedStyle(section).scrollSnapAlign),
      supportsMandatory: CSS.supports("scroll-snap-type", "y mandatory"),
    };
  });

  expect(rhythm.scrollSnapType).toBe("y mandatory");
  expect(rhythm.scrollMode).toBe("chapter");
  expect(rhythm.supportsMandatory).toBe(true);
  expect(rhythm.scrollPaddingTop).toBe("0px");
  expect(rhythm.sectionCount).toBeGreaterThanOrEqual(5);
  expect(rhythm.sectionHeights.every((height) => Math.abs(height - 720) <= 8)).toBe(true);
  expect(rhythm.sectionSnapAlign.every((value) => value === "start")).toBe(true);
});

test("non-home customer pages keep the header readable without chapter snapping", async ({ page }) => {
  await page.goto("/offers");

  const offers = await page.evaluate(() => {
    const header = document.querySelector("header");
    const sections = [...document.querySelectorAll<HTMLElement>("[data-scroll-section]")];
    const heroContent = document.querySelector<HTMLElement>(".offers-hero-content");
    return {
      background: header ? getComputedStyle(header).backgroundColor : "",
      scrollMode: document.documentElement.dataset.scrollMode,
      scrollSnapType: getComputedStyle(document.documentElement).scrollSnapType,
      sectionCount: sections.length,
      snapStops: sections.map((section) => getComputedStyle(section).scrollSnapStop),
      heroContentTop: heroContent?.getBoundingClientRect().top ?? 0,
    };
  });

  expect(offers.background).toBe("rgba(0, 0, 0, 0)");
  expect(offers.scrollMode).toBe("free");
  expect(offers.scrollSnapType).toBe("none");
  expect(offers.sectionCount).toBeGreaterThanOrEqual(2);
  expect(offers.snapStops.every((value) => value === "normal")).toBe(true);
  expect(offers.heroContentTop).toBeGreaterThanOrEqual(82);

  await page.goto("/rooms/deluxe-ocean-king");
  const breadcrumbTop = await page.locator(".room-breadcrumb").evaluate((element) => element.getBoundingClientRect().top);
  expect(breadcrumbTop).toBeGreaterThanOrEqual(82);
});

test("homepage leads with the approved direct-on-image hotel story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Thành phố ở gần/ })).toBeVisible();
  await expect(page.locator(".hero-copy")).not.toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator("#booking")).toContainText("Giá trực tiếp minh bạch");
  expect(await page.locator('main a[href="/experiences"]').count()).toBeGreaterThan(0);
});

test("homepage guest picker uses a custom accessible listbox", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".booking-key select")).toHaveCount(0);
  const trigger = page.getByRole("button", { name: /chọn số khách/i });
  await trigger.click();
  await expect(page.getByRole("listbox", { name: /chọn số khách/i })).toBeVisible();
  await page.getByRole("option", { name: /3 khách.*1 phòng/i }).click();
  await expect(trigger).toContainText("3 khách");
});

test("customer polish: room discovery uses a photo hero and custom filter listboxes", async ({ page }) => {
  await page.goto("/rooms");

  await expect(page.locator(".rooms-hero-image")).toBeVisible();
  await expect(page.locator(".room-filter-bar select")).toHaveCount(0);

  const viewTrigger = page.getByRole("button", { name: /tầm nhìn/i });
  await viewTrigger.click();
  await expect(page.getByRole("listbox", { name: /tầm nhìn/i })).toBeVisible();
  await page.getByRole("option", { name: "Hướng biển" }).click();
  await expect(viewTrigger).toContainText("Hướng biển");
});

test("customer polish: mobile filter sheet exposes one accessible close action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/rooms");
  await page.getByRole("button", { name: /tầm nhìn/i }).click();

  await expect(page.getByRole("button", { name: "Đóng Tầm nhìn" })).toHaveCount(1);
});

test("customer polish: booking flow replaces native selects without changing quote inputs", async ({ page }) => {
  let quoteBody: unknown;
  await page.route("**/api/rooms", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: [{ id: "cat-1", slug: "deluxe-ocean-king", name: "Deluxe Ocean King", basePrice: 2500000, ratePlans: [{ id: "rp-flex", name: "Flexible", priceMultiplier: 1 }] }] }),
  }));
  await page.route("**/api/quote", async (route) => {
    quoteBody = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { roomSubtotal: 5000000, serviceSubtotal: 0, discountTotal: 0, taxAndFeeTotal: 500000, totalAmount: 5500000, nights: 2, rooms: [] } }),
    });
  });

  await page.goto("/booking?roomCategoryId=cat-1&checkIn=2026-09-10&checkOut=2026-09-12&guests=2");
  await expect(page.locator(".booking-flow select")).toHaveCount(0);
  const guestTrigger = page.getByRole("button", { name: /số khách.*2 khách/i });
  await guestTrigger.click();
  await page.getByRole("option", { name: /3 khách/i }).click();
  await expect.poll(() => quoteBody).toEqual({
    checkIn: "2026-09-10",
    checkOut: "2026-09-12",
    rooms: [{ roomCategoryId: "cat-1", ratePlanId: "rp-flex", numGuests: 3 }],
  });
});

test("customer polish: language selection updates customer copy beyond the header", async ({ page }) => {
  await page.goto("/rooms");
  await page.getByRole("button", { name: /chuyển ngôn ngữ sang tiếng anh/i }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "A room worth remembering." })).toBeVisible();
});

test("customer polish: language selection also updates the booking journey", async ({ page }) => {
  await page.route("**/api/rooms", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: [{ id: "cat-1", slug: "deluxe-ocean-king", name: "Deluxe Ocean King", basePrice: 2500000, ratePlans: [{ id: "rp-flex", name: "Flexible", priceMultiplier: 1 }] }] }),
  }));
  await page.route("**/api/quote", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: { roomSubtotal: 5000000, serviceSubtotal: 0, discountTotal: 0, taxAndFeeTotal: 500000, totalAmount: 5500000, nights: 2, rooms: [] } }),
  }));
  await page.goto("/booking?roomCategoryId=cat-1&checkIn=2026-09-10&checkOut=2026-09-12&guests=2");
  await page.getByRole("button", { name: /chuyển ngôn ngữ sang tiếng anh/i }).click();

  await expect(page.getByRole("heading", { name: "Book at your own pace." })).toBeVisible();
  await expect(page.getByText("System-confirmed quote for your current choices.")).toBeVisible();
});

test("customer polish: language selection carries through offer and experience stories", async ({ page }) => {
  await page.goto("/offers");
  await page.getByRole("button", { name: /chuyển ngôn ngữ sang tiếng anh/i }).click();
  await expect(page.getByRole("heading", { name: /A direct reason to book/i })).toBeVisible();

  await page.goto("/experiences");
  await expect(page.getByRole("heading", { name: /Where every sense/i })).toBeVisible();
  await expect(page.getByText("A day told through small moments.")).toBeVisible();
});

test("customer polish: mobile navigation contains its own visible exit action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu" }).click();

  const menu = page.locator("#mobileMenu");
  await expect(menu.getByRole("button", { name: "Đóng menu" })).toBeVisible();
  await menu.getByRole("button", { name: "Đóng menu" }).click();
  await expect(menu).not.toHaveClass(/open/);
});

test("customer polish: experiences tells the stay story through dedicated moments", async ({ page }) => {
  await page.goto("/experiences");
  await expect(page.locator("[data-testid=experience-moments]")).toBeVisible();
  await expect(page.locator("[data-testid=experience-moments] article")).toHaveCount(3);
});

test("homepage date picker becomes a mobile bottom sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator('.booking-key input[type="date"]')).toHaveCount(0);
  await page.getByRole("button", { name: /chọn ngày nhận phòng/i }).click();
  await expect(page.getByRole("dialog", { name: /chọn ngày lưu trú/i })).toBeVisible();
});

test("custom booking controls preserve the availability query handoff", async ({ page }) => {
  const availabilityQueries: URL[] = [];
  await page.route("**/api/availability?*", async (route) => {
    availabilityQueries.push(new URL(route.request().url()));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [{ id: "room-1" }] }),
    });
  });

  await page.goto("/");
  const checkIn = page.getByRole("button", { name: /chọn ngày nhận phòng/i });
  await expect(checkIn).toContainText(/\d{2}\/\d{2}\/\d{4}/);
  await checkIn.click();

  const firstChoice = page.locator(".availability-picker-day:not(:disabled)").nth(4);
  await firstChoice.click();
  await expect(page.getByText(/Chọn ngày trả phòng sau ngày nhận phòng/i)).toBeVisible();
  await page.locator(".availability-picker-day:not(:disabled)").nth(2).click();
  await expect(page.getByRole("dialog", { name: /chọn ngày lưu trú/i })).toBeHidden();

  await page.getByRole("button", { name: /chọn số khách/i }).click();
  await page.getByRole("option", { name: /3 khách.*1 phòng/i }).click();
  await page.getByRole("button", { name: /kiểm tra phòng/i }).click();
  await page.waitForURL(/\/rooms\?checkIn=.*&checkOut=.*&guests=3/);

  expect(availabilityQueries).toHaveLength(1);
  const query = availabilityQueries[0].searchParams;
  expect(query.get("checkIn")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(query.get("checkOut")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(query.get("guests")).toBe("3");
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

test("rooms preserve booking dates and provide an accessible image lightbox", async ({ page }) => {
  await page.goto("/rooms?checkIn=2026-09-10&checkOut=2026-09-13&guests=2");
  await expect(page.getByRole("heading", { name: /Một căn phòng/i })).toBeVisible();
  await expect(page.locator("[data-testid=rooms-search-summary]")).toContainText("10/09/2026");
  const detailLink = page.locator('main a[href^="/rooms/"]').first();
  await expect(detailLink).toHaveAttribute("href", /checkIn=2026-09-10/);
  const galleryButton = page.locator('button[aria-label^="Mở thư viện ảnh"]').first();
  await galleryButton.click();
  const dialog = page.getByRole("dialog", { name: /Bộ sưu tập ảnh/i });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("room detail keeps rate-plan context and labels the quote as server-owned", async ({ page }) => {
  await page.goto("/rooms/deluxe-ocean-king?checkIn=2026-09-10&checkOut=2026-09-13&guests=2");
  await expect(page.getByRole("heading", { name: "Deluxe Ocean King" })).toBeVisible();
  await expect(page.getByText("Giá tham khảo từ")).toBeVisible();
  await expect(page.getByText(/Giá và tổng tiền cuối cùng được xác nhận/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Chọn ngày & đặt phòng/ })).toHaveAttribute("href", /checkIn=2026-09-10/);
  const earlyPlan = page.getByRole("radio", { name: /Đặt sớm/i });
  await earlyPlan.click();
  await expect(earlyPlan).toHaveAttribute("aria-checked", "true");
});

test("booking shows supported payment choices without fake hold or QR promises", async ({ page }) => {
  await page.route("**/api/rooms", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: [{ id: "cat-1", slug: "deluxe-ocean-king", name: "Deluxe Ocean King", basePrice: 2500000, ratePlans: [{ id: "rp-flex", name: "Flexible", priceMultiplier: 1 }] }] }),
  }));
  await page.route("**/api/quote", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: { roomSubtotal: 5000000, serviceSubtotal: 0, discountTotal: 0, taxAndFeeTotal: 500000, totalAmount: 5500000, nights: 2, rooms: [] } }),
  }));
  await page.goto("/booking?roomCategoryId=cat-1&checkIn=2026-09-10&checkOut=2026-09-12&guests=2");
  await expect(page.getByRole("heading", { name: /Đặt phòng/i })).toBeVisible();
  await expect(page.getByText(/Báo giá đã được xác nhận/i)).toBeVisible();
  await page.getByRole("button", { name: /Tiếp tục nhập thông tin/i }).click();
  await expect(page.locator("body")).not.toContainText(/Thời gian phiên làm việc|PAY_AT_HOTEL|QR Check-in|Thanh Toán Tại Khách Sạn/i);
  await expect(page.getByRole("button", { name: /mô phỏng/i })).toBeVisible();
});

test("checkout keeps one idempotency key and does not call pending payment confirmed", async ({ page }) => {
  await page.route("**/api/rooms", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: [{ id: "cat-1", slug: "deluxe-ocean-king", name: "Deluxe Ocean King", basePrice: 2500000, ratePlans: [{ id: "rp-flex", name: "Flexible", priceMultiplier: 1 }] }] }),
  }));
  await page.route("**/api/quote", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: { roomSubtotal: 5000000, serviceSubtotal: 0, discountTotal: 0, taxAndFeeTotal: 500000, totalAmount: 5500000, nights: 2, rooms: [] } }),
  }));
  let checkoutCount = 0;
  await page.route("**/api/checkout", async (route) => {
    checkoutCount += 1;
    if (checkoutCount === 1) {
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ message: "Temporary checkout failure" }) });
      return;
    }
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ bookingId: "booking-1", bookingNumber: "AUR-260910-ABC123", totalAmount: 5500000, replayed: false }) });
  });
  const checkoutRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/checkout")) checkoutRequests.push(request.headers()["idempotency-key"] || "");
  });
  await page.goto("/booking?roomCategoryId=cat-1&checkIn=2026-09-10&checkOut=2026-09-12&guests=2");
  await expect(page.getByText(/Báo giá đã được xác nhận/i)).toBeVisible();
  await page.getByRole("button", { name: /Tiếp tục nhập thông tin/i }).click();
  await page.getByLabel(/Họ & tên/i).fill("Nguyễn Văn A");
  await page.getByLabel(/Email/i).fill("nguyen@example.com");
  await page.getByLabel(/Số điện thoại/i).fill("0901234567");
  await page.getByRole("button", { name: /Chuyển khoản ngân hàng/i }).click();
  const submit = page.getByRole("button", { name: /Gửi yêu cầu đặt phòng/i });
  await submit.click();
  await expect(page.locator(".booking-error")).toContainText("Temporary checkout failure");
  await submit.click();
  await expect(page.getByText(/đang chờ thanh toán/i)).toBeVisible();
  expect(checkoutRequests).toHaveLength(2);
  expect(checkoutRequests[0]).toBeTruthy();
  expect(checkoutRequests[0]).toBe(checkoutRequests[1]);
  await expect(page.locator("body")).not.toContainText("Đặt phòng đã được xác nhận");
});

test("experiences and offers stay editorial and route to real customer actions", async ({ page }) => {
  await page.goto("/experiences");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main img[alt]").first()).toBeVisible();
  await expect(page.locator('main a[href="/rooms"]').first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/chọn property|marketplace|thêm vào giỏ|thanh toán dịch vụ/i);

  await page.goto("/offers");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Xem rate plan/i }).first()).toHaveAttribute("href", /\/booking\?offer=/);
  await expect(page.locator("body")).toContainText(/Giá.*xác nhận|báo giá/i);
});

test("booking lookup preserves the existing request contract and uses real booking fields", async ({ page }) => {
  let lookupBody: unknown;
  await page.route("**/api/bookings/lookup", async (route) => {
    if (route.request().method() === "POST") {
      lookupBody = route.request().postDataJSON();
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { id: "booking-1", bookingNumber: "AUR-260910-ABC123", guestName: "Nguyễn Văn A", guestEmail: "nguyen@example.com", guestPhone: "0901234567", checkIn: "2026-09-10", checkOut: "2026-09-12", nights: 2, totalAmount: 5500000, status: "PENDING_PAYMENT", cancelToken: "token-1234567890", roomCategory: { name: "Deluxe Ocean King" }, ratePlan: { name: "Flexible" } } }),
      });
      return;
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: {} }) });
  });
  await page.goto("/my-bookings");
  await expect(page.getByRole("heading", { name: /Tra cứu kỳ nghỉ/i })).toBeVisible();
  await page.getByLabel(/Mã đặt phòng/i).fill("AUR-260910-ABC123");
  await page.getByLabel(/Email đặt phòng/i).fill("nguyen@example.com");
  await page.getByRole("button", { name: /Tra cứu/i }).click();
  await expect(page.getByLabel("Chi tiết xác nhận đặt phòng").getByText("Deluxe Ocean King")).toBeVisible();
  expect(lookupBody).toEqual({ bookingNumber: "AUR-260910-ABC123", email: "nguyen@example.com" });
  await expect(page.locator("body")).not.toContainText(/QR Check-in|Mã QR|Deluxe Ocean Suite/i);
});

test("account entry has no fabricated stay history and links to real customer states", async ({ page }) => {
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: /Cánh cửa vào kỳ nghỉ/i })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("AUR-260715-B9A1");
  await expect(page.getByRole("link", { name: /Mở tra cứu/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mở tài khoản/i })).toBeVisible();
});
