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
      await page.waitForTimeout(550);
      await expectNoHorizontalOverflow(page);
    });
  }

  test('mobile nav opens/closes and locks scroll (iPhone)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'iPhone', 'Mobile nav only exists below the md breakpoint.');

    await page.goto('/press', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('header button').filter({ hasText: 'Menu' });
    await expect(toggle).toBeVisible();

    await toggle.click();
    const menu = page.getByRole('dialog');
    await expect(menu).toBeVisible();

    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
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
