import {defineConfig, devices} from '@playwright/test';
import {ADMIN_DEV_PORT, ADMIN_DEV_URL, testEnv} from './e2e/support/test-env';

export default defineConfig({
  testDir: 'e2e/admin-dev',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 60_000,
  expect: {timeout: 15_000},
  globalSetup: './e2e/support/admin-dev-setup.ts',
  globalTeardown: './e2e/support/admin-dev-teardown.ts',
  outputDir: 'test-results/admin-dev',
  reporter: [['list'], ['html', {open: 'never', outputFolder: 'playwright-report/admin-dev'}]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: ADMIN_DEV_URL,
    storageState: {cookies: [], origins: []},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON e2e/support/admin-dev-server.mts ${ADMIN_DEV_PORT}`,
    url: `${ADMIN_DEV_URL}/sign-in`,
    // Always own this server: reusing a production server would silently skip instant validation.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {...testEnv, E2E_ADMIN_DEV: '1', BETTER_AUTH_URL: ADMIN_DEV_URL, NEXT_PUBLIC_SITE_URL: ADMIN_DEV_URL},
  },
});
