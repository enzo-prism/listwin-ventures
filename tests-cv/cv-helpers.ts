import { expect, type Page } from '@playwright/test';

// Shared by playwright.cv.config.ts (which injects the password into the server it boots) and by
// the spec (which types it into the form), so the two can never drift apart.
export const CV_TEST_PASSWORD = 'e2e-test:password 42';
export const CV_TEST_PORT = 8082;

// Strings that only exist in the authenticated CV shell. The private binary routes have separate
// request-level coverage in tests/cv-auth.test.mjs.
export const CV_MARKERS = /July 2026 original-format CV|Download Word CV|page-1\.png/i;

export async function expectLoginScreen(page: Page) {
  await expect(page.getByRole('heading', { name: 'Private CV access', level: 1 })).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
}

export async function expectNoCvContent(page: Page) {
  // Checks source, not rendered text, so content hidden by CSS would still be caught.
  expect(await page.content()).not.toMatch(CV_MARKERS);
}

export async function expectCvContent(page: Page) {
  await expect(page.getByRole('heading', { name: 'Don Listwin CV', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download Word CV' })).toBeVisible();
  await expect(page.getByRole('img', { name: "Page 1 of Don Listwin's July 2026 CV" })).toBeVisible();
}

export async function login(page: Page, password: string = CV_TEST_PASSWORD) {
  await page.goto('/cv');
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Open private CV' }).click();
}

// Same helper as tests/responsive.spec.ts, kept identical so both suites measure overflow the same way.
export async function expectNoHorizontalOverflow(page: Page) {
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
