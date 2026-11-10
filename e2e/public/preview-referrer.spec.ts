import {expect, type Page, test} from '@playwright/test';
import {previewPath} from '../support/preview';

/*
 * A draft preview's URL carries its signature. The site's Referrer-Policy is same-origin, which would hand that URL to
 * the next page as document.referrer (and gtag reports it as page_referrer), so the preview opts out of referrers.
 */
const PREVIEW = () => previewPath('post', 'redirect-maps-wordpress-to-nextjs');

/** Leaves the current page with a full navigation, as a plain link does, and returns what the next page sees. */
const referrerAfterLeaving = async (page: Page) => {
  await page.evaluate(() => window.location.assign('/writing'));
  await page.waitForURL('**/writing');
  return page.evaluate(() => document.referrer);
};

test('a draft preview asks for no referrer', async ({page}) => {
  await page.goto(PREVIEW());
  await expect(page.getByText(/preview · link valid for an hour/i)).toBeVisible();
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
});

test('a page reached from a draft preview gets no referrer, so the signed URL never travels on', async ({page}) => {
  await page.goto(PREVIEW());
  await expect(page.getByText(/preview · link valid for an hour/i)).toBeVisible();
  expect(await referrerAfterLeaving(page)).toBe('');
});

test('a page reached from a public page still gets its referrer', async ({page}) => {
  await page.goto('/contact');
  await expect(page.locator('meta[name="referrer"]')).toHaveCount(0);
  expect(await referrerAfterLeaving(page)).toMatch(/\/contact$/);
});
