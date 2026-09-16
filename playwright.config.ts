import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Project layout, tag strategy and the reasoning behind each project below:
 * docs/testing/test-strategy.md
 * Coverage map — which behavior maps to which test and tag:
 * docs/testing/test-plan.md
 * Test-writing conventions: TESTING.md
 */
export default defineConfig({
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* At most one retry, CI-only — see test-strategy.md#pipeline for why. */
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://automationexercise.com',
    trace: 'on-first-retry',
  },

  projects: [
    /* API layer — no browser, the `request` fixture only. */
    {
      name: 'api',
      testDir: './tests/api',
    },

    /* e2e layer — browser-driven journeys. `e2e-chromium` carries full
     * regression; every other engine/device project is restricted to the
     * curated `@smoke` set via `grep`, so `npx playwright test` with no
     * CLI filter still runs the right subset per project. */
    {
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'e2e-firefox',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Firefox'] },
      grep: /@smoke/,
    },
    {
      name: 'e2e-webkit',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Safari'] },
      grep: /@smoke/,
    },
    {
      name: 'e2e-mobile-ios',
      testDir: './tests/e2e',
      use: { ...devices['iPhone 13'] },
      grep: /@smoke/,
    },
    {
      name: 'e2e-mobile-android',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 5'] },
      grep: /@smoke/,
    },
  ],
});
