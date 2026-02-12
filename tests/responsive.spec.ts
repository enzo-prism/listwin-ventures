import { expect, test, type Page } from '@playwright/test';

const routes = [
  '/',
  '/press',
  '/cv',
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
      await page.waitForTimeout(150);
      await expectNoHorizontalOverflow(page);
    });
  }

  test('mobile nav opens/closes and locks scroll (iPhone)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'iPhone', 'Mobile nav only exists below the md breakpoint.');

    await page.goto('/press', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('[data-nav-toggle]');
    await expect(toggle).toBeVisible();

    await toggle.click();
    const menu = page.locator('[data-nav-menu]');
    await expect(menu).toBeVisible();

    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe('hidden');

    const overlay = page.locator('[data-nav-overlay]');
    // Click in the left gutter below the header (panel spans nearly the full height).
    await overlay.click({ position: { x: 5, y: 150 } });
    await expect(menu).not.toBeVisible();
  });

  test('desktop Investments dropdown does not introduce overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'iPhone', 'Desktop dropdown only applies at >= md.');

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const investments = page.locator('nav[aria-label="Primary"] summary').filter({ hasText: 'Investments' });
    await expect(investments).toBeVisible();
    await investments.click();

    await page.waitForTimeout(100);
    await expectNoHorizontalOverflow(page);
  });
});
