import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8081',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview:test',
    port: 8081,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iPhone',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'iPad',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
});
