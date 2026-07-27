import { expect, test, type Page } from '@playwright/test';

const routes = [
  '/',
  '/press',
  '/contact',
  '/4ag',
  '/belizekids',
  '/genologics',
  '/oral-history',
  '/privacy-policy',
  '/cookie-policy',
  '/zevx-closes-20m-funding-round-appoints-don-listwin-as-ceo',
  '/company/carbon-robotics',
  '/exploits/netaid',
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, viewportWidth } = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const widest = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    return { scrollWidth: widest, viewportWidth: window.innerWidth };
  });

  expect(scrollWidth, `scrollWidth=${scrollWidth} viewportWidth=${viewportWidth}`).toBeLessThanOrEqual(
    viewportWidth + 1,
  );
}

test.describe('Responsive smoke', () => {
  for (const route of routes) {
    test(`no horizontal overflow: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(550);
      await expectNoHorizontalOverflow(page);
    });
  }

  test('mobile nav contains focus, inerts the page, and restores focus (iPhone)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'iPhone', 'Mobile nav only exists below the md breakpoint.');

    await page.goto('/press', { waitUntil: 'domcontentloaded' });

    // The drawer toggle is a native <details><summary>, not a React button.
    const toggle = page.locator('header summary').filter({ hasText: 'Menu' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const initialBodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);

    await toggle.click();
    const menu = page.getByRole('dialog');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('aria-modal', 'true');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Close navigation menu');

    // The sticky header uses backdrop-filter, which can otherwise trap fixed descendants
    // inside the header's 64px containing block. The modal must cover the full viewport.
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));
    const menuBox = await menu.boundingBox();
    expect(menuBox).not.toBeNull();
    expect(menuBox?.y).toBeCloseTo(0, 0);
    expect(menuBox?.height).toBeGreaterThanOrEqual(viewport.height);
    const backdropBox = await page.locator('.mobile-backdrop').boundingBox();
    expect(backdropBox).not.toBeNull();
    expect(backdropBox?.width).toBeGreaterThanOrEqual(viewport.width);
    expect(backdropBox?.height).toBeGreaterThanOrEqual(viewport.height);
    const stackingState = await page.evaluate(() => ({
      header: Number.parseInt(getComputedStyle(document.querySelector('header')!).zIndex, 10),
      consent: Number.parseInt(getComputedStyle(document.querySelector('#consent-banner')!).zIndex, 10),
    }));
    expect(stackingState.header).toBeGreaterThan(stackingState.consent);

    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe('hidden');

    const closeButton = page.getByRole('button', { name: 'Close navigation menu' });
    await expect(closeButton).toBeFocused();

    const backgroundState = await page.evaluate(() => ({
      main: document.querySelector('main')?.inert,
      footer: document.querySelector('footer')?.inert,
      logo: document.querySelector('header a[href="/"]')?.inert,
      consent: document.querySelector('#consent-banner')?.inert,
    }));
    expect(backgroundState).toEqual({
      main: true,
      footer: true,
      logo: true,
      consent: true,
    });

    // Shift+Tab from the first control wraps to the final visible control in the dialog.
    await page.keyboard.press('Shift+Tab');
    await expect(menu.getByRole('link', { name: 'Contact' })).toBeFocused();

    // Repeated forward tabbing must never escape to the page behind the modal drawer.
    for (let index = 0; index < 18; index += 1) {
      await page.keyboard.press('Tab');
      const focusIsInside = await page.evaluate(() =>
        Boolean(document.activeElement?.closest?.('[role="dialog"]')),
      );
      expect(focusIsInside, `focus escaped the mobile dialog after Tab ${index + 1}`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Open navigation menu');

    const restoredState = await page.evaluate(() => ({
      bodyOverflow: getComputedStyle(document.body).overflow,
      main: document.querySelector('main')?.inert,
      footer: document.querySelector('footer')?.inert,
      logo: document.querySelector('header a[href="/"]')?.inert,
      consent: document.querySelector('#consent-banner')?.inert,
    }));
    expect(restoredState).toEqual({
      bodyOverflow: initialBodyOverflow,
      main: false,
      footer: false,
      logo: false,
      consent: false,
    });
  });

  test('native mobile nav remains accurate and closable without JavaScript', async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'iPhone', 'No-JavaScript fallback only needs one mobile browser.');

    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:8081',
      javaScriptEnabled: false,
      viewport: { width: 390, height: 664 },
    });
    const page = await context.newPage();
    await page.goto('/press', { waitUntil: 'domcontentloaded' });

    const drawer = page.locator('details.mobile-drawer');
    const toggle = drawer.locator(':scope > summary');
    const menu = page.getByRole('dialog');
    await expect(toggle).not.toHaveAttribute('aria-expanded');
    await toggle.click();
    await expect(drawer).toHaveAttribute('open', '');
    await expect(menu).toBeVisible();
    await expect(menu).not.toHaveAttribute('aria-modal');
    expect(await page.locator('main').evaluate((element) => element.inert)).toBe(false);

    // The native summary moves above the overlay and remains a working close control.
    await expect(toggle).toHaveCSS('position', 'fixed');
    await toggle.click();
    await expect(drawer).not.toHaveAttribute('open', '');

    await context.close();
  });

  test('mobile nav unlocks the page when the viewport becomes desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'iPhone', 'Mobile nav only exists below the md breakpoint.');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const toggle = page.locator('header summary').filter({ hasText: 'Menu' });
    const initialBodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    await toggle.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 844 });

    await expect(page.locator('.mobile-drawer')).not.toHaveAttribute('open', '');
    const state = await page.evaluate(() => ({
      bodyOverflow: getComputedStyle(document.body).overflow,
      main: document.querySelector('main')?.inert,
    }));
    expect(state).toEqual({ bodyOverflow: initialBodyOverflow, main: false });
  });

  test('desktop Investments dropdown does not introduce overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Desktop dropdown only applies on the desktop project.');

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const investments = page.locator('header button').filter({ hasText: 'Investments' });
    await expect(investments).toBeVisible();
    await investments.click();

    await page.waitForTimeout(100);
    await expectNoHorizontalOverflow(page);
  });
});
