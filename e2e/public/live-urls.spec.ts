import {expect, test} from '@playwright/test';

/*
 * The URLs the previous site (cgendio-v1) has indexed at cgdiomampo.dev, which this site keeps instead of redirecting
 * (#81). The side-project pages (/projects/budget-tracker, ph-job-board-scraper, self-hosted-platform) aren't here
 * yet: whether they get pages or redirects is still open in #81.
 */
const LIVE_URLS = [
  '/',
  '/writing',
  '/writing/wordpress-news-october-2026',
  '/writing/redirect-maps-wordpress-to-nextjs',
  '/projects/access-hire',
  '/projects/myimprov',
  '/projects/merthyr-village',
  '/projects/experience-sunnybank',
  '/projects/premium-mobile-car-valeting',
  '/projects/fresh-fruit-and-veg',
  '/feed.xml',
];

for (const path of LIVE_URLS) {
  test(`${path} answers 200 at the live site's URL`, async ({request}) => {
    const response = await request.get(path, {maxRedirects: 0});
    expect(response.status()).toBe(200);
  });
}

test('pages link the RSS feed at /feed.xml', async ({page}) => {
  await page.goto('/writing');
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', /\/feed\.xml$/);
});
