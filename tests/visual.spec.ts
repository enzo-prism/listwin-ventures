import { expect, test, type Locator, type Page } from '@playwright/test';

const viewports = [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

const routes = [
  '/',
  '/press',
  '/contact',
  '/oral-history',
  '/4ag',
  '/company/canary-foundation',
  '/company/openwave',
  '/company/carbon-robotics',
  '/exploits/netaid',
] as const;

const slugify = (path: string) =>
  path
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .trim() || 'home';

async function stabilizePage(page: Page) {
  // Reduce flaky diffs: no cursor, no selection highlights, no transitions.
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        caret-color: transparent !important;
      }
      ::selection {
        background: transparent !important;
        color: inherit !important;
      }
      html:focus-within {
        scroll-behavior: auto !important;
      }
    `,
  });

  // Avoid waiting forever on analytics / third-party scripts.
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

  // Fonts can shift layout after first paint.
  await page
    .evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fonts = (document as any).fonts;
      if (fonts?.ready) await fonts.ready;
    })
    .catch(() => {});

  // Make sure above-the-fold media has finished decoding before snapshotting.
  // Background images (like the Home hero spotlight cards) can load after `networkidle`.
  await page
    .evaluate(async () => {
      const withTimeout = async <T>(promise: Promise<T>, ms: number) =>
        Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(undefined as T), ms))]);

      const waitForImg = (img: HTMLImageElement) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });

      // Only wait for images in/near the viewport. Below-the-fold images are lazy and may never load.
      const images = Array.from(document.images ?? []).filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.bottom > -120 && rect.top < window.innerHeight * 2;
      });
      await withTimeout(Promise.all(images.map((img) => waitForImg(img))), 8000);
      await withTimeout(
        Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))),
        8000,
      );

      const parseCssUrl = (value: string) => {
        const match = value.match(/url\\((?:\"|')?(.*?)(?:\"|')?\\)/);
        return match?.[1];
      };

      const heroUrls = new Set<string>();
      document.querySelectorAll<HTMLElement>('.hero-spotlight-card').forEach((el) => {
        const raw = el.style.getPropertyValue('--hero-image')?.trim();
        const url = raw ? parseCssUrl(raw) : undefined;
        if (url) heroUrls.add(url);
      });

      const loadUrl = (url: string) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const decode = img.decode?.bind(img);
            if (!decode) return resolve();
            // Decode helps avoid progressive paints that can flake screenshot stability.
            decode().then(resolve).catch(resolve);
          };
          img.onerror = () => resolve();
          img.src = url;
        });

      await withTimeout(Promise.all(Array.from(heroUrls).map(loadUrl)), 10_000);
    })
    .catch(() => {});

  // Give the layout a beat to settle (intersection observers, etc).
  await page.waitForTimeout(300);
}

function screenshotMasks(page: Page): Locator[] {
  return [
    page.locator('video'),
    page.locator('iframe'),
    // Footer copyright year changes over time; masking avoids annual churn.
    page.locator('footer span').filter({ hasText: 'Listwin Ventures' }),
  ];
}

async function snapshot(page: Page, name: string) {
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    mask: screenshotMasks(page),
    // Allow tiny, nondeterministic rendering noise (subpixel/anti-aliasing) without hiding real regressions.
    maxDiffPixels: 50,
    timeout: 15_000,
  });
}

test.describe('Visual regression', () => {
  // Block noisy third-party scripts/styles that can cause flake and slow the suite.
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Snapshot matrix runs on Desktop Chrome only.');

    // Ensure deterministic media queries regardless of project/device defaults.
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });

    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('googletagmanager.com') ||
        url.includes('google-analytics.com') ||
        url.includes('hotjar.com')
      ) {
        return route.abort();
      }
      return route.continue();
    });
  });

  for (const viewport of viewports) {
    test.describe(`${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });

      for (const route of routes) {
        test(`${route} (top)`, async ({ page }) => {
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          await stabilizePage(page);
          await snapshot(page, `${slugify(route)}-top-${viewport.width}x${viewport.height}.png`);
        });

        if (route === '/press') {
          test(`${route} (technology section)`, async ({ page }) => {
            await page.goto(route, { waitUntil: 'domcontentloaded' });
            await stabilizePage(page);
            const section = page.locator('#technology-leadership');
            await expect(section).toBeVisible();
            await section.scrollIntoViewIfNeeded();
            await page.waitForTimeout(150);
            await expect(section).toHaveScreenshot(`${slugify(route)}-technology-${viewport.width}x${viewport.height}.png`, {
              animations: 'disabled',
              maxDiffPixels: 50,
              timeout: 15_000,
            });
          });
        }

        if (route === '/oral-history') {
          test(`${route} (transcript CTA)`, async ({ page }) => {
            await page.goto(route, { waitUntil: 'domcontentloaded' });
            await stabilizePage(page);
            const transcript = page.getByRole('link', { name: 'Read transcript (PDF)' });
            await transcript.scrollIntoViewIfNeeded();
            await page.waitForTimeout(100);
            await snapshot(page, `${slugify(route)}-transcript-${viewport.width}x${viewport.height}.png`);
          });
        }

        if (route === '/company/canary-foundation' || route === '/company/openwave') {
          test(`${route} (related reading)`, async ({ page }) => {
            await page.goto(route, { waitUntil: 'domcontentloaded' });
            await stabilizePage(page);
            const related = page.getByRole('heading', { name: 'Related reading' });
            await related.scrollIntoViewIfNeeded();
            await page.waitForTimeout(100);
            await snapshot(page, `${slugify(route)}-related-${viewport.width}x${viewport.height}.png`);
          });
        }
      }
    });
  }
});
