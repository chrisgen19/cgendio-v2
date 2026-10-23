import {defineConfig, devices} from '@playwright/test';
import {ADMIN_STORAGE_STATE, E2E_BASE_URL, E2E_PORT, MOCK_RESEND_URL, testEnv} from './e2e/support/test-env.ts';

/*
 * End-to-end tests against a production build (`next start`) with the seeded e2e database. Run `pnpm test:e2e`: it
 * prepares the database first. CI builds in its own step, so the web server only starts there.
 */

const CI = Boolean(process.env.CI);

const desktop = {...devices['Desktop Chrome'], viewport: {width: 1440, height: 900}};
const mobile = {...devices['Desktop Chrome'], viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [['html', {open: 'never'}], ['github'], ['list']] : [['html', {open: 'never'}], ['list']],
  // Screenshots differ between macOS and Linux font rendering, so each platform keeps its own baselines
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  expect: {toHaveScreenshot: {maxDiffPixelRatio: 0.01, animations: 'disabled'}},
  use: {baseURL: E2E_BASE_URL, trace: 'on-first-retry', screenshot: 'only-on-failure'},
  projects: [
    {name: 'desktop', testDir: 'e2e/public', use: desktop},
    {name: 'mobile', testDir: 'e2e/public', use: mobile},
    // Runs after the public projects: editing a project title would otherwise race the Work section snapshots
    {name: 'admin', testDir: 'e2e/admin', dependencies: ['desktop', 'mobile'], use: {...desktop, storageState: ADMIN_STORAGE_STATE}},
  ],
  webServer: [
    {
      command: 'node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON e2e/support/mock-resend.mts',
      url: `${MOCK_RESEND_URL}/health`,
      reuseExistingServer: !CI,
    },
    {
      command: CI ? `pnpm start --port ${E2E_PORT}` : `pnpm build && pnpm start --port ${E2E_PORT}`,
      url: E2E_BASE_URL,
      env: testEnv,
      timeout: 300_000,
      // Locally, a server already on the port is reused (handy when iterating on specs); it must be an e2e build
      reuseExistingServer: !CI,
    },
  ],
});
