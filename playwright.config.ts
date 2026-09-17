import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './fixtures/test-data';

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
  /* 60s, not the 30s default: the target is a live third-party site — see
   * test-strategy.md#pipeline. */
  timeout: 60_000,
  /* TESTING.md: passing only on retry is flaky, not green. This makes the
   * run itself say so instead of leaving it to whoever reads the report. */
  failOnFlakyTests: true,
  /* One worker in CI: no group is near its budget, and extra concurrency
   * against a site we don't own buys minutes we don't need — see
   * test-strategy.md#pipeline for the durations and what reopens this.
   * Locally, unbounded, which is where parallel isolation gets proven. */
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
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
