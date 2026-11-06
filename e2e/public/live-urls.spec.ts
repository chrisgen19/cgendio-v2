import {expect, test} from '@playwright/test';

/*
 * The URLs the previous site (cgendio-v1) has indexed at cgdiomampo.dev, which this site keeps instead of redirecting
 * (#81). The few v1 URLs with no page here redirect instead (REDIRECTS below, set in next.config.ts).
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

/** v1 URL, then where it should permanently redirect. */
const REDIRECTS: [string, string][] = [
  ['/writing/tag/wordpress', '/writing?tag=wordpress'],
  ['/writing/tag/nextjs', '/writing?tag=next-js'],
  ['/writing/tag/ai', '/writing?tag=ai'],
  ['/projects/budget-tracker', '/#work'],
  ['/projects/ph-job-board-scraper', '/#work'],
  ['/projects/self-hosted-platform', '/#work'],
  ['/admin/sign-in', '/sign-in'],
  ['/writing/redirect-maps-wordpress-to-nextjs.md', '/writing/redirect-maps-wordpress-to-nextjs'],
  ['/projects/access-hire.md', '/projects/access-hire'],
  ['/projects/budget-tracker.md', '/#work'],
];

test('a v1 Markdown URL ends on the HTML page', async ({page}) => {
  const response = await page.goto('/projects/access-hire.md');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/projects\/access-hire$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
});

for (const [from, to] of REDIRECTS) {
  test(`${from} redirects permanently to ${to}`, async ({request}) => {
    const response = await request.get(from, {maxRedirects: 0});
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(to);
  });
}

test('a v1 tag URL ends on the filtered index', async ({page}) => {
  await page.goto('/writing/tag/wordpress');
  await expect(page).toHaveURL(/\/writing\?tag=wordpress$/);
  await expect(page.getByRole('link', {name: /WordPress news, October 2026/})).toBeVisible();
});

test('/sign-in shows the admin sign-in, kept out of search results', async ({page}) => {
  const response = await page.goto('/sign-in');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  await expect(page.getByRole('heading', {name: 'Cgdiomampo.dev admin'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Sign in with GitHub'})).toBeVisible();
});

// One page per pageMetadata caller shape: the home page's absolute title, the blog index, a case study
for (const path of ['/', '/writing', '/projects/access-hire']) {
  test(`${path} links the RSS feed at /feed.xml`, async ({page}) => {
    await page.goto(path);
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', /\/feed\.xml$/);
  });
}
