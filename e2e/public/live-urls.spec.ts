import {expect, test} from '@playwright/test';
import {INDEXNOW_TEST_KEY} from '../support/test-env';

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
  ['/projects/budget-tracker.md', '/#work'],
];

/** v1's Markdown versions (linked from its llms.txt), served here too: URL, its HTML page, and the first line. */
const MARKDOWN_PAGES: [string, string, string][] = [
  [
    '/writing/redirect-maps-wordpress-to-nextjs.md',
    '/writing/redirect-maps-wordpress-to-nextjs',
    '# Redirect maps for a WordPress to Next.js migration',
  ],
  ['/projects/access-hire.md', '/projects/access-hire', '# Access Hire Australia'],
];

for (const [path, page, heading] of MARKDOWN_PAGES) {
  test(`${path} answers with the page as Markdown`, async ({request}) => {
    const response = await request.get(path, {maxRedirects: 0});
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('text/markdown; charset=utf-8');
    expect(response.headers().link).toMatch(new RegExp(`^<https?://[^>]+${page}>; rel="canonical"$`));
    expect(response.headers()['x-robots-tag']).toBe('noindex');
    expect((await response.text()).split('\n')[0]).toBe(heading);
  });

  test(`${page} answers with Markdown for Accept: text/markdown, and HTML for a browser`, async ({request}) => {
    const markdown = await request.get(page, {headers: {Accept: 'text/markdown, text/html;q=0.9'}});
    expect(markdown.headers()['content-type']).toBe('text/markdown; charset=utf-8');
    expect((await markdown.text()).split('\n')[0]).toBe(heading);
    const html = await request.get(page, {headers: {Accept: 'text/html,application/xhtml+xml,*/*;q=0.8'}});
    expect(html.headers()['content-type']).toContain('text/html');
  });
}

test('an unknown slug has no Markdown version', async ({request}) => {
  expect((await request.get('/writing/no-such-post.md')).status()).toBe(404);
});

test('an unknown post slug answers 404 on its first request, not a 200 with noindex', async ({request}, testInfo) => {
  // A slug no earlier request has used, so the first response is rendered on demand instead of coming from the ISR cache
  const path = `/writing/no-such-post-${testInfo.project.name}-${Date.now()}`;
  expect((await request.get(path)).status()).toBe(404);
  expect((await request.get(path)).status()).toBe(404);
});

test('/llms.txt links every published post and case study at its Markdown URL', async ({request}) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('text/plain; charset=utf-8');
  const body = await response.text();
  expect(body.split('\n')[0]).toBe('# Chris Diomampo');
  for (const path of LIVE_URLS.filter((url) => /^\/(writing|projects)\/./.test(url))) expect(body).toContain(`${path}.md)`);
});

test('/indexnow-key.txt serves the IndexNow key', async ({request}) => {
  const response = await request.get('/indexnow-key.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe(INDEXNOW_TEST_KEY);
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

// The labs only run under `next dev`; the e2e suite runs a production build, like the deployed site
for (const path of ['/design-lab/fresh-fruit', '/design-lab/fresh-fruit/editorial']) {
  test(`${path} is not served in production`, async ({request}) => {
    const response = await request.get(path, {maxRedirects: 0});
    expect(response.status()).toBe(404);
  });
}

test('an unknown project slug answers 404 on its first request, not a 200 with noindex', async ({request}, testInfo) => {
  // A slug no earlier request has used, so the first response is rendered on demand instead of coming from the ISR cache
  const path = `/projects/no-such-project-${testInfo.project.name}-${Date.now()}`;
  expect((await request.get(path)).status()).toBe(404);
  expect((await request.get(path)).status()).toBe(404);
});

test('/sign-in shows the admin sign-in, kept out of search results', async ({page}) => {
  const response = await page.goto('/sign-in');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  await expect(page.getByRole('heading', {name: 'Chris Diomampo admin'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Sign in with GitHub'})).toBeVisible();
});

// One page per pageMetadata caller shape: the home page's absolute title, the blog index, a case study
for (const path of ['/', '/writing', '/projects/access-hire']) {
  test(`${path} links the RSS feed at /feed.xml`, async ({page}) => {
    await page.goto(path);
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', /\/feed\.xml$/);
  });
}
