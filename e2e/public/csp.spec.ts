import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, type Locator, type Page, test} from '@playwright/test';
import {expectNoCspViolations, recordCspViolations} from '../support/csp';
import {heroControls} from '../support/hero';

/*
 * The Content-Security-Policy and HSTS headers (src/lib/security-headers.ts, #99): that every response carries them,
 * and that nothing the public pages load is blocked by the policy. The policy is static, so this sweep is what catches
 * a script, style, image or fetch added later that production would block.
 *
 * e2e runs over http with R2_PUBLIC_URL empty (e2e/support/test-env.ts), so the policy has no `upgrade-insecure-requests`
 * and no R2 public origin of its own; the covers are on the bucket's default domain, which `https://*.r2.dev` covers.
 */

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.r2.dev https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  "media-src 'self' data:",
  "connect-src 'self' https://*.r2.cloudflarestorage.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

// A prerendered page, a post, the feed and a route handler: the headers come from next.config.ts, so all of them get them
for (const path of ['/', '/writing/wordpress-news-october-2026', '/feed.xml', '/api/health']) {
  test(`${path} sends the CSP and HSTS headers`, async ({request}) => {
    const headers = (await request.get(path)).headers();
    expect(headers['content-security-policy'], `CSP on ${path}`).toBe(CSP_DIRECTIVES.join('; '));
    expect(headers['strict-transport-security'], `HSTS on ${path}`).toBe('max-age=63072000; includeSubDomains');
  });
}

test('the policy has no upgrade-insecure-requests on an http site', async ({request}) => {
  expect((await request.get('/')).headers()['content-security-policy']).not.toContain('upgrade-insecure-requests');
});

/** The tour captures live on R2; the local fixture keeps the sweep offline, as in walkthrough.spec.ts. */
const FIXTURE = readFileSync(join(__dirname, '../support/fixtures/about-photo.png'));

const serveCapturesLocally = (page: Page) =>
  page.route(
    (url) => /(access-hire|myimprov|merthyr-village|experience-sunnybank|fresh-fruit)-tour/.test(decodeURIComponent(url.href)),
    (route) => route.fulfill({body: FIXTURE, contentType: 'image/png'}),
  );

/** Down the page in steps, so scroll-driven reveals, lazy images and the sticky layouts all run. */
const scrollThrough = async (page: Page) => {
  const steps = await page.evaluate(() => Math.ceil(document.body.scrollHeight / window.innerHeight));
  for (let step = 1; step <= steps; step++) {
    await page.evaluate((index) => window.scrollTo({top: index * window.innerHeight, behavior: 'instant'}), step);
    await page.waitForTimeout(150);
  }
};

test.beforeEach(async ({page}) => {
  await recordCspViolations(page);
  await serveCapturesLocally(page);
});

test('the home page and the hero film run with no CSP violation', async ({page}) => {
  test.setTimeout(90_000);
  await page.goto('/');
  const {toggle, skip, seeMyWork} = heroControls(page);

  // A few seconds of the film under the policy: the player mounts, renders and animates
  await expect(toggle).toHaveAccessibleName('Pause film');
  await page.waitForTimeout(4_000);
  await expectNoCspViolations(page, 'the hero film while playing');

  // Then to the brand card, which is where the film ends
  await skip.click();
  await expect(seeMyWork).toBeVisible();

  await scrollThrough(page);
  await expectNoCspViolations(page, '/');
});

// /sign-in has no <main>: it's the shadcn card outside the public chrome, so it waits for its button instead
const PAGES: Array<[path: string, ready: (page: Page) => Locator]> = [
  ['/writing', (page) => page.locator('main:visible')],
  ['/writing/wordpress-news-october-2026', (page) => page.locator('main:visible')],
  ['/contact', (page) => page.locator('main:visible')],
  ['/sign-in', (page) => page.getByRole('button', {name: 'Sign in with GitHub'})],
];

for (const [path, ready] of PAGES) {
  test(`${path} loads with no CSP violation`, async ({page}) => {
    await page.goto(path);
    await expect(ready(page)).toBeVisible();
    await scrollThrough(page);
    await expectNoCspViolations(page, path);
  });
}

test('a case study and its walkthrough run with no CSP violation', async ({page}) => {
  await page.goto('/projects/access-hire');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
  // The walkthrough swaps capture layers as the reading line passes each stop
  await scrollThrough(page);
  await expectNoCspViolations(page, '/projects/access-hire');
});
