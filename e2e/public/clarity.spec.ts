import {expect, type Page, test} from '@playwright/test';
import {clarityCalls, stubClarity} from '../support/analytics';
import {contactForm, fillContactForm, uniqueToken, useOwnIp} from '../support/contact';
import {previewPath} from '../support/preview';
import {CLARITY_TEST_ID, E2E_BASE_URL} from '../support/test-env';

/*
 * Microsoft Clarity (src/lib/clarity.ts): public pages load it cookieless, the admin, sign-in, draft previews and the
 * owner's browser never do, and a link between a preview and a public page is a full page load (TrackingBoundary), so the
 * two never share a document. Like the GA checks in seo.spec.ts, these look at what runs in the browser, not the HTML.
 *
 * The tag is stubbed, so clarity.js never runs here. That is why the boundary is asserted as documents rather than as
 * Clarity calls: the real script stops and restarts itself on every URL change, which a stub can't reproduce.
 */

const tag = (page: Page) => page.locator(`script[src="https://www.clarity.ms/tag/${CLARITY_TEST_ID}"]`);
const CONSENT = ['consentv2', {ad_Storage: 'denied', analytics_Storage: 'denied'}];
const PREVIEW = () => previewPath('post', 'redirect-maps-wordpress-to-nextjs');

test.beforeEach(async ({page}) => {
  await stubClarity(page);
});

const tags = (entries: Record<string, string>) => Object.entries(entries).map(([key, value]) => ['set', key, value]);

for (const [path, pageTags] of [
  ['/', {page_type: 'home'}],
  ['/writing', {page_type: 'blog'}],
  ['/contact', {page_type: 'contact'}],
  ['/projects/access-hire', {page_type: 'case_study', project: 'access-hire'}],
] as const) {
  test(`${path} loads Clarity without cookies and tags the page`, async ({page}) => {
    await page.goto(path);
    await expect(tag(page)).toHaveCount(1);
    await expect.poll(() => clarityCalls(page)).toEqual([CONSENT, ...tags({...pageTags, theme: 'light'})]);
  });
}

test('the theme tag follows the theme the page opened in', async ({page, context}) => {
  await context.addCookies([{name: 'theme', value: 'dark', url: E2E_BASE_URL}]);
  await page.goto('/writing');
  await expect.poll(() => clarityCalls(page)).toEqual([CONSENT, ...tags({page_type: 'blog', theme: 'dark'})]);
});

test('a client-side navigation tags the new page view', async ({page}) => {
  await page.goto('/writing');
  await expect.poll(() => clarityCalls(page)).toHaveLength(3);
  const post = page.locator('main a[href^="/writing/"]').first();
  const slug = (await post.getAttribute('href'))?.replace('/writing/', '') ?? '';
  await post.click();
  await page.waitForURL(`**/writing/${slug}`);
  // The real clarity.js restarts on the URL change and replays its queue, so these land on the new page view
  await expect.poll(async () => (await clarityCalls(page))?.slice(3)).toEqual(tags({page_type: 'post', post: slug, theme: 'light'}));
});

test('a sent contact message reaches Clarity as an event, with its topic and nothing the visitor typed', async ({page}, testInfo) => {
  await useOwnIp(page, testInfo);
  await page.goto('/contact');
  await expect.poll(() => clarityCalls(page)).toHaveLength(3);
  const token = uniqueToken();
  await fillContactForm(page, {name: `Visitor ${token}`, email: `visitor+${token}@example.test`, message: `A new site, ref ${token}.`});
  await contactForm(page).getByRole('button', {name: 'Send message'}).click();
  await expect(page.getByRole('heading', {name: "Thanks, I've got your message."})).toBeVisible();

  const calls = (await clarityCalls(page)) ?? [];
  expect(calls.slice(3)).toEqual([
    ['set', 'form_topic', 'NEXTJS'],
    ['event', 'generate_lead'],
  ]);
  expect(JSON.stringify(calls)).not.toContain(token);
});

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

/** Marks the current document, so a later check can tell a client-side navigation from a page load. */
const markDocument = (page: Page) => page.evaluate(() => Object.assign(window, {__sameDocument: true}));
const sameDocument = (page: Page) => page.evaluate(() => (window as {__sameDocument?: boolean}).__sameDocument === true);

test('a link out of a draft preview loads a new page, with no trace of the preview', async ({page}) => {
  await page.goto(PREVIEW());
  await expect(page.getByText(/preview · link valid for an hour/i)).toBeVisible();
  await markDocument(page);

  // The post's back link is a next/link, which would otherwise navigate client-side and keep the preview in the DOM
  await page.locator('main article a[href="/writing"]').first().click();
  await page.waitForURL('**/writing');
  expect(await sameDocument(page)).toBe(false);
  await expect(tag(page)).toHaveCount(1);
  // Hidden pages count too: a client-side navigation would leave the preview here, out of sight but recordable
  await expect(page.getByText(/preview · link valid for an hour/i)).toHaveCount(0);
});

test('Back from a public page to a draft preview is a separate page that never ran Clarity', async ({page}) => {
  await page.goto(PREVIEW());
  await page.locator('main article a[href="/writing"]').first().click();
  await page.waitForURL('**/writing');
  await expect(tag(page)).toHaveCount(1);
  await markDocument(page);

  await page.goBack();
  await page.waitForURL('**/preview/**');
  await expect(page.getByText(/preview · link valid for an hour/i)).toBeVisible();
  expect(await sameDocument(page)).toBe(false);
  expect(await clarityCalls(page)).toBeNull();
});

test('links between public pages stay client-side', async ({page}) => {
  await page.goto('/writing');
  await expect(tag(page)).toHaveCount(1);
  await markDocument(page);
  await page.locator('main a[href^="/writing/"]').first().click();
  await page.waitForURL('**/writing/*');
  expect(await sameDocument(page)).toBe(true);
});
