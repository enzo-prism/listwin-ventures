import { defineConfig, devices } from '@playwright/test';

import { CV_TEST_PASSWORD, CV_TEST_PORT } from './tests-cv/cv-helpers';

// Separate config because /cv is a Vercel serverless function, not an Astro route: the webServer in
// playwright.config.ts (`astro preview`) 404s on it. Keeping this out of ./tests means the default
// `npm run test:e2e` run is unchanged — this suite only runs when you ask for it.
//
// Why a standalone node host (tests-cv/serve-cv.mjs) rather than `vercel dev` or a deployed URL:
//   - `vercel dev` needs a linked project, network, and a CV_PASSWORD in the Vercel env, and takes
//     tens of seconds to boot on a port it likes to pick itself. Flaky and slow in CI.
//   - A deployed preview URL means tests silently skip when the env var is unset, which is the
//     failure mode where you most want them running, and it can't control the password.
//   - The shim imports the exact default export Vercel invokes, against the real private/cv.html,
//     so the only thing being faked is the transport. Hermetic, ~100ms boot, no credentials.
export default defineConfig({
  testDir: './tests-cv',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${CV_TEST_PORT}`,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node tests-cv/serve-cv.mjs',
    port: CV_TEST_PORT,
    // Deliberately not reused: a stale server from an earlier run holds the OLD password and every
    // login test fails for a reason that looks nothing like the cause. Booting is ~100ms.
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      CV_PASSWORD: CV_TEST_PASSWORD,
      CV_TEST_PORT: String(CV_TEST_PORT),
    },
  },
  projects: [
    // Chromium only, on purpose. The login cookie is `__Host-` + `Secure`, and only Chromium treats
    // http://127.0.0.1 as a trustworthy origin, so WebKit (what devices['iPhone 13'] launches in the
    // main config) would reject the cookie and fail every post-login assertion for reasons that have
    // nothing to do with the app. Mobile widths are covered by setViewportSize in the spec instead.
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
