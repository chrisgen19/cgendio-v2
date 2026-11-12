/*
 * The environment of the e2e build and server: the Playwright config, the prepare script and `pnpm test:e2e:build`
 * (used by CI) all read these values. Variables set here win over .env, so a local run never uses real secrets, the
 * real database or the real Resend API. CI's Postgres service listens on the same port as compose.yaml's.
 */

export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export const ADMIN_DEV_PORT = 3102;
export const ADMIN_DEV_URL = `http://localhost:${ADMIN_DEV_PORT}`;
export const ADMIN_DEV_FIXTURES = 'e2e/.auth/admin-dev.json';
export const ADMIN_DEV_LOG = 'e2e/.auth/admin-dev-server.log';

/** e2e/support/mock-resend.mts listens here and records every email the app sends. */
export const MOCK_RESEND_PORT = 3199;
export const MOCK_RESEND_URL = `http://127.0.0.1:${MOCK_RESEND_PORT}`;

export const ADMIN_EMAIL = 'e2e-admin@example.test';
/** The prepare script sets this as the contact email in SiteSettings, so the contact form sends its notification. */
export const CONTACT_EMAIL = 'inbox@example.test';
/** Signed-in admin cookies, written by the prepare script (gitignored). */
export const ADMIN_STORAGE_STATE = 'e2e/.auth/admin.json';
/** Every seeded project has a tour; the prepare script clears this one's, so specs can cover the layout without a tour. */
export const NO_TOUR_SLUG = 'premium-mobile-car-valeting';

/** Not a real property: it only has to match the G-XXXXXXXXXX shape the app accepts. */
export const GA_TEST_ID = 'G-E2ETEST000';

/** Not a real Clarity project: www.clarity.ms answers an unknown id with an empty 204, so nothing is ever recorded. */
export const CLARITY_TEST_ID = 'e2etest000';

/** Served at /indexnow-key.txt. No ping is ever sent: the e2e site is localhost, which buildIndexNowPayload skips. */
export const INDEXNOW_TEST_KEY = 'e2e-indexnow-key-0000';

export const testEnv = {
  // The prepare script drops and recreates this database, so it refuses any name that doesn't end in _test
  DATABASE_URL: 'postgresql://cgendio:cgendio@localhost:5437/cgendio_test',
  BETTER_AUTH_SECRET: 'e2e-only-secret-not-used-anywhere-else-0123456789',
  BETTER_AUTH_URL: E2E_BASE_URL,
  GITHUB_CLIENT_ID: 'e2e-github-client-id',
  GITHUB_CLIENT_SECRET: 'e2e-github-client-secret',
  ADMIN_EMAILS: ADMIN_EMAIL,
  RESEND_API_KEY: 're_e2e_mock',
  RESEND_BASE_URL: MOCK_RESEND_URL,
  MAIL_FROM: 'Chris Diomampo <e2e@example.test>',
  NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
  // A real-shaped id keeps analytics enabled so tests can check where its tags appear. The admin workflow fixture
  // serves gtag.js locally; browser tests without that stub can still request the script from Google.
  GA_MEASUREMENT_ID: GA_TEST_ID,
  // Same idea for Clarity. Specs that read its queue stub the tag (stubClarity) so the request never leaves the machine.
  CLARITY_PROJECT_ID: CLARITY_TEST_ID,
  INDEXNOW_KEY: INDEXNOW_TEST_KEY,
  // No test uploads, but the startup check (src/server/startup-env-check.ts) won't start the server without the R2
  // credentials, so these are placeholders. They never reach Cloudflare: nothing in e2e calls the upload action.
  R2_ACCOUNT_ID: 'e2e-r2-account-id',
  R2_ACCESS_KEY_ID: 'e2e-r2-access-key-id',
  R2_SECRET_ACCESS_KEY: 'e2e-r2-secret-access-key',
  R2_BUCKET: 'cgendio-e2e',
  // A host nothing serves from: the startup check requires it, but no e2e image is on it. prepare.mts rewrites every
  // seeded cover to a data: URL, so none of them is optimizable either way; this only adds an unused remotePattern.
  R2_PUBLIC_URL: 'https://e2e-media.example.test',
} satisfies Record<string, string>;
