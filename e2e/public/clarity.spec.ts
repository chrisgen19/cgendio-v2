import {expect, type Page, test} from '@playwright/test';
import {clarityCalls, stubClarity} from '../support/analytics';
import {previewPath} from '../support/preview';
import {CLARITY_TEST_ID, E2E_BASE_URL} from '../support/test-env';

/*
 * Microsoft Clarity (src/lib/clarity.ts): public pages load it cookieless, the admin, sign-in, draft previews and the
 * owner's browser never do, and a client-side navigation into an untracked page stops it (ClarityRouteGuard). Like the
 * GA checks in seo.spec.ts, these look at what runs in the browser, not at the HTML.
 */

const tag = (page: Page) => page.locator(`script[src="https://www.clarity.ms/tag/${CLARITY_TEST_ID}"]`);
const CONSENT = ['consentv2', {ad_Storage: 'denied', analytics_Storage: 'denied'}];
const PREVIEW = () => previewPath('post', 'redirect-maps-wordpress-to-nextjs');

test.beforeEach(async ({page}) => {
  await stubClarity(page);
});

for (const path of ['/', '/writing', '/contact']) {
  test(`${path} loads Clarity without cookies`, async ({page}) => {
    await page.goto(path);
    await expect(tag(page)).toHaveCount(1);
    expect(await clarityCalls(page)).toEqual([CONSENT]);
  });
}

test('the sign-in page does not load Clarity', async ({page}) => {
  await page.goto('/sign-in');
  // Wait for the page to be up before asserting an absence, so this cannot pass by racing next/script's injection
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  await expect(page.locator('script#clarity-config')).toHaveCount(0);
  expect(await clarityCalls(page)).toBeNull();
});

test('a draft preview does not load Clarity', async ({page}) => {
  await page.goto(PREVIEW());
  await expect(page.getByText(/preview · link valid for an hour/i)).toBeVisible();
  await expect(page.locator('script#clarity-config')).toHaveCount(0);
  expect(await clarityCalls(page)).toBeNull();
});

test("the owner's browser runs the loader but skips Clarity", async ({page, context}) => {
  await context.addCookies([{name: 'cg_internal', value: '1', url: E2E_BASE_URL}]);
  await page.goto('/contact');
  await expect(page.locator('script#clarity-config')).toHaveCount(1);
  await expect(tag(page)).toHaveCount(0);
  expect(await clarityCalls(page)).toBeNull();
});

test('going back from a public page to a draft preview stops Clarity', async ({page}) => {
  await page.goto(PREVIEW());
  await expect(page.getByText(/preview · link valid for an hour/i)).toBeVisible();

  // The marker survives only client-side navigations. A plain <a> (the footer's) is a full load, and Back then restores
  // the preview's own document from the bfcache, where Clarity never ran; the post's back link is a next/link.
  await page.evaluate(() => Object.assign(window, {__sameDocument: true}));
  await page.locator('main article a[href="/writing"]').first().click();
  await page.waitForURL('**/writing');
  await expect(tag(page)).toHaveCount(1);

  await page.goBack();
  await page.waitForURL('**/preview/**');
  // Still the same document, so this was the client-side Back that the loader's one-time path check cannot see
  expect(await page.evaluate(() => (window as {__sameDocument?: boolean}).__sameDocument)).toBe(true);
  await expect.poll(() => clarityCalls(page)).toEqual([CONSENT, ['stop']]);
});
