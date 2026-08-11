import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the showcase app, not for the library.
 *
 * The library's own tests are unit tests under `src/**` and run with vitest.
 * These drive the full demo application in a real browser, so they live with
 * the app they exercise.
 *
 * Run from the repo root: `npm run e2e`
 */
export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // `npm run dev` serves index.html, which mounts examples/showcase/main.tsx.
    command: 'npm run dev',
    cwd: '../../..',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
