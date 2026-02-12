import { expect, test } from '@playwright/test';

const pressUrls = [
  'https://med.stanford.edu/news/all-news/2009/06/foundation-to-back-early-cancer-detection-center.html',
  'https://med.stanford.edu/canarycenter/history.html',
  'https://med.stanford.edu/news/all-news/2007/05/canary-foundation-pledges-to-team-with-cancer-center.html',
  'https://www.earlydetectionresearch.com/award/',
  'https://www.earlycancer.cam.ac.uk/news/prof-antonis-antoniou-announced-2024-don-listwin-award-winner',
  'https://news.cancerresearchuk.org/2023/10/11/seeing-those-results-for-the-first-time-made-my-whole-career-seem-worthwhile-peter-sasieni-wins-don-listwin-award/',
  'https://www.fredhutch.org/en/news/center-news/2010/08/Arnold-Canary-Foundation.html',
  'https://www.prnewswire.com/news-releases/canary-foundation-announces-85-million-in-gifts-to-advance-vital-cancer-early-detection-studies-167085565.html',
  'https://news.standuptocancer.org/press/stand-up-to-cancer-awards-73-6-million-for-novel-groundbreaking-cancer-research/',
  'https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2000/m08/cisco-systems-inc-announces-departure-of-don-listwin.html',
  'https://www.lightreading.com/cable-technology/listwin-leaves-cisco',
  'https://www.lightreading.com/cable-technology/cisco-s-nuti-moves-to-symbol',
  'https://www.wsj.com/articles/SB115266884127904206',
] as const;

const oralHistory = {
  transcriptPdf: 'https://archive.computerhistory.org/resources/access/text/2018/11/102738862-05-01-acc.pdf',
  youtubeWatch: 'https://www.youtube.com/watch?v=WEHJnQ2XtN8',
} as const;

test.describe('Content coverage', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Content checks run on Desktop Chrome only.');
  });

  test('Press page includes the key external references', async ({ page }) => {
    await page.goto('/press', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Cancer Early Detection', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Technology Leadership', exact: true })).toBeVisible();

    for (const url of pressUrls) {
      await expect(page.locator(`a[href="${url}"]`), url).toHaveCount(1);
    }
  });

  test('Oral history page includes transcript + YouTube links', async ({ page }) => {
    await page.goto('/oral-history', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('iframe[src*="youtube.com/embed/WEHJnQ2XtN8"]')).toHaveCount(1);
    await expect(page.locator(`a[href="${oralHistory.youtubeWatch}"]`)).toHaveCount(1);
    await expect(page.locator(`a[href="${oralHistory.transcriptPdf}"]`)).toHaveCount(1);
  });

  test('CV page is available by direct URL and includes anti-index controls', async ({ page, request }) => {
    await page.goto('/cv', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Don Listwin', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Board Experience', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Managment Experience', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Skills', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Education', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Personal', level: 2 })).toBeVisible();

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute('content', /noindex/i);

    const robotsResponse = await request.get('/robots.txt');
    expect(robotsResponse.ok()).toBeTruthy();
    const robotsBody = await robotsResponse.text();
    expect(robotsBody).toContain('Disallow: /cv');

    const llmsResponse = await request.get('/llms.txt');
    expect(llmsResponse.ok()).toBeTruthy();
    const llmsBody = await llmsResponse.text();
    expect(llmsBody).toContain('/cv');

    const sitemapResponse = await request.get('/sitemap.xml');
    expect(sitemapResponse.ok()).toBeTruthy();
    const sitemapBody = await sitemapResponse.text();
    expect(sitemapBody).not.toContain('/cv</loc>');
  });

  test('Stanford company page surfaces core external coverage', async ({ page }) => {
    await page.goto('/company/stanford', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'External coverage' })).toBeVisible();

    const expected = [
      'https://med.stanford.edu/news/all-news/2009/06/foundation-to-back-early-cancer-detection-center.html',
      'https://med.stanford.edu/canarycenter/history.html',
      'https://med.stanford.edu/news/all-news/2007/05/canary-foundation-pledges-to-team-with-cancer-center.html',
      'https://www.fredhutch.org/en/news/center-news/2010/08/Arnold-Canary-Foundation.html',
      'https://www.prnewswire.com/news-releases/canary-foundation-announces-85-million-in-gifts-to-advance-vital-cancer-early-detection-studies-167085565.html',
      'https://news.standuptocancer.org/press/stand-up-to-cancer-awards-73-6-million-for-novel-groundbreaking-cancer-research/',
    ] as const;

    for (const url of expected) {
      await expect(page.locator(`a[href="${url}"]`), url).toHaveCount(1);
    }
  });

  test('Canary Foundation company page includes the full external reference set', async ({ page }) => {
    await page.goto('/company/canary-foundation', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'External coverage' })).toBeVisible();

    const expected = [
      'https://med.stanford.edu/news/all-news/2009/06/foundation-to-back-early-cancer-detection-center.html',
      'https://med.stanford.edu/canarycenter/history.html',
      'https://med.stanford.edu/news/all-news/2007/05/canary-foundation-pledges-to-team-with-cancer-center.html',
      'https://www.earlydetectionresearch.com/award/',
      'https://www.earlycancer.cam.ac.uk/news/prof-antonis-antoniou-announced-2024-don-listwin-award-winner',
      'https://news.cancerresearchuk.org/2023/10/11/seeing-those-results-for-the-first-time-made-my-whole-career-seem-worthwhile-peter-sasieni-wins-don-listwin-award/',
      'https://www.fredhutch.org/en/news/center-news/2010/08/Arnold-Canary-Foundation.html',
      'https://www.prnewswire.com/news-releases/canary-foundation-announces-85-million-in-gifts-to-advance-vital-cancer-early-detection-studies-167085565.html',
      'https://news.standuptocancer.org/press/stand-up-to-cancer-awards-73-6-million-for-novel-groundbreaking-cancer-research/',
      'https://www.wsj.com/articles/SB115266884127904206',
    ] as const;

    for (const url of expected) {
      await expect(page.locator(`a[href="${url}"]`), url).toHaveCount(1);
    }
  });

  test('Openwave company page includes Cisco transition references', async ({ page }) => {
    await page.goto('/company/openwave', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Related reading' })).toBeVisible();

    const expected = [
      'https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2000/m08/cisco-systems-inc-announces-departure-of-don-listwin.html',
      'https://www.lightreading.com/cable-technology/listwin-leaves-cisco',
      'https://www.lightreading.com/cable-technology/cisco-s-nuti-moves-to-symbol',
    ] as const;

    for (const url of expected) {
      await expect(page.locator(`a[href="${url}"]`), url).toHaveCount(1);
    }
  });
});
