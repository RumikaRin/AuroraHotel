const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.resolve('.gstack/qa-reports/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = {
    pages: [],
    consoleErrors: [],
    brokenLinks: [],
    interactions: []
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('pageerror', err => {
    results.consoleErrors.push({ url: page.url(), text: err.message });
  });

  const routes = [
    { name: 'home', path: '/' },
    { name: 'rooms', path: '/rooms' },
    { name: 'room-detail', path: '/rooms/deluxe-king' },
    { name: 'experiences', path: '/experiences' },
    { name: 'offers', path: '/offers' },
    { name: 'my-bookings', path: '/my-bookings' }
  ];

  console.log('--- PHASE 1: ROUTE AUDIT ---');
  for (const r of routes) {
    try {
      const resp = await page.goto('http://localhost:3003' + r.path, { waitUntil: 'networkidle', timeout: 8000 });
      const status = resp ? resp.status() : 0;
      const title = await page.title();
      const shotPath = path.join(screenshotDir, r.name + '.png');
      await page.screenshot({ path: shotPath, fullPage: false });

      const links = await page.$$eval('a[href]', els => els.map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/')));

      results.pages.push({
        name: r.name,
        path: r.path,
        status,
        title,
        linkCount: links.length
      });
      console.log('Checked ' + r.path + ' -> HTTP ' + status + ' (' + title + ')');
    } catch (err) {
      results.pages.push({
        name: r.name,
        path: r.path,
        status: 'ERROR',
        error: err.message
      });
      console.error('Failed ' + r.path + ':', err.message);
    }
  }

  console.log('--- PHASE 2: INTERACTIVE AUDIT ---');
  // 1. Language Toggle
  await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
  const langBtn = await page.$('.lang-btn');
  if (langBtn) {
    const textBefore = await langBtn.textContent();
    await langBtn.click();
    await page.waitForTimeout(400);
    const textAfter = await langBtn.textContent();
    results.interactions.push({
      test: 'language-toggle',
      success: textBefore !== textAfter,
      details: 'Toggled from ' + textBefore.trim() + ' to ' + textAfter.trim()
    });
    // Toggle back
    await langBtn.click();
    await page.waitForTimeout(400);
  }

  // 2. Carousel Next
  const nextBtn = await page.$('.circle-button:nth-child(2)');
  if (nextBtn) {
    await nextBtn.click();
    await page.waitForTimeout(600);
    const counter = await page.$eval('.hero-counter strong', el => el.textContent);
    results.interactions.push({
      test: 'hero-carousel-next',
      success: counter === '02',
      details: 'Hero counter updated to ' + counter
    });
  }

  // 3. Room Reel Navigation
  const reelIndicator = await page.$('.reel-indicator:nth-child(2)');
  if (reelIndicator) {
    await reelIndicator.click();
    await page.waitForTimeout(600);
    const reelHead = await page.$eval('.reel-head-count', el => el.textContent);
    results.interactions.push({
      test: 'room-reel-nav',
      success: reelHead.includes('02'),
      details: 'Reel head counter updated to ' + reelHead
    });
  }

  // 4. Mobile Viewport Check
  console.log('--- PHASE 3: RESPONSIVE AUDIT ---');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotDir, 'home-mobile.png'), fullPage: false });

  const menuBtn = await page.$('.menu-button');
  const menuVisible = menuBtn ? await menuBtn.isVisible() : false;
  results.interactions.push({
    test: 'mobile-hamburger-visible',
    success: menuVisible,
    details: 'Mobile hamburger button visible: ' + menuVisible
  });

  if (menuBtn && menuVisible) {
    await menuBtn.click();
    await page.waitForTimeout(400);
    const overlay = await page.$('.mobile-overlay.is-open');
    const overlayVisible = overlay ? await overlay.isVisible() : false;
    results.interactions.push({
      test: 'mobile-drawer-open',
      success: overlayVisible,
      details: 'Mobile drawer open state: ' + overlayVisible
    });
    await page.screenshot({ path: path.join(screenshotDir, 'mobile-menu-open.png'), fullPage: false });
  }

  await browser.close();

  fs.writeFileSync('.gstack/qa-reports/raw-results.json', JSON.stringify(results, null, 2));
  console.log('--- QA AUDIT COMPLETE ---');
  console.log(JSON.stringify(results, null, 2));
})();
