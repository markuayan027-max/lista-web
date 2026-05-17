import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Default: Chromium only for fast local/CI enrollment runs. Set FULL_BROWSER_MATRIX=1 for all browsers. */
  projects: process.env.FULL_BROWSER_MATRIX
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
        { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
        { name: 'Microsoft Edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
        { name: 'Google Chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
      ]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command: "pnpm run dev",
      url: "http://localhost:3001/api/healthz",
      reuseExistingServer: true,
      cwd: "./artifacts/api-server",
      timeout: 180000,
      name: "API Server",
    },
    {
      command: "pnpm run dev:client",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      cwd: "./artifacts/lista",
      timeout: 120000,
      name: "Vite Dev (lista)",
    },
  ],
});
