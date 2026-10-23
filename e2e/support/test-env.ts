/*
 * The environment of the e2e server: the Playwright config, the prepare script and .github/workflows/ci.yml all use
 * these values (the workflow repeats them, keep it in sync). Variables set here win over .env, so a local run never
 * uses real secrets, the real database or the real Resend API.
 */

export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

/** e2e/support/mock-resend.mts listens here and records every email the app sends. */
export const MOCK_RESEND_PORT = 3199;
export const MOCK_RESEND_URL = `http://127.0.0.1:${MOCK_RESEND_PORT}`;

export const ADMIN_EMAIL = 'e2e-admin@example.test';
/** The prepare script sets this as the contact email in SiteSettings, so the contact form sends its notification. */
export const CONTACT_EMAIL = 'inbox@example.test';
/** Signed-in admin cookies, written by the prepare script (gitignored). */
export const ADMIN_STORAGE_STATE = 'e2e/.auth/admin.json';

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
  MAIL_FROM: 'Cgdiomampo.dev <e2e@example.test>',
  NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
  // No uploads in e2e; empty keeps the image config the same as CI's
  R2_PUBLIC_URL: '',
} satisfies Record<string, string>;
