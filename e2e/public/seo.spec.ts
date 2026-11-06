import {expect, test} from '@playwright/test';

/*
 * The SEO surface the previous site published, which this one has to keep through the cutover (#81 Phase C). These are
 * head tags and robots.txt lines, so one page of each kind is enough: the rest come from the same root metadata.
 */

const PAGES = ['/', '/writing', '/writing/wordpress-news-october-2026', '/projects/access-hire'];

const content = (html: string, selector: string) => html.match(new RegExp(`<meta[^>]*${selector}[^>]*>`))?.[0] ?? '';

for (const path of PAGES) {
  test(`${path} allows large image previews and untruncated snippets`, async ({page}) => {
    const response = await page.goto(path);
    const html = (await response?.text()) ?? '';
    const tag = content(html, 'name="robots"');
    expect(tag).toContain('max-image-preview:large');
    expect(tag).toContain('max-snippet:-1');
    expect(tag).toContain('max-video-preview:-1');
  });

  test(`${path} publishes og:locale en_US`, async ({page}) => {
    const response = await page.goto(path);
    expect(content((await response?.text()) ?? '', 'property="og:locale"')).toContain('content="en_US"');
  });
}

test('the home page carries the Search Console verification', async ({page}) => {
  const response = await page.goto('/');
  const tag = content((await response?.text()) ?? '', 'name="google-site-verification"');
  expect(tag).toContain('uRp-UbI0NWG6cjziZS9a40Y0BNqg2dFX-oVehIhyOUY');
});

test('the admin keeps its noindex instead of the site-wide robots meta', async ({page}) => {
  const response = await page.goto('/sign-in');
  const tag = content((await response?.text()) ?? '', 'name="robots"');
  expect(tag).toContain('noindex');
  expect(tag).not.toContain('max-image-preview');
});

test('robots.txt gives the AI crawlers their own group with the same rules', async ({request}) => {
  const body = await (await request.get('/robots.txt')).text();
  // A group is separated by a blank line, not by each User-Agent line: the AI group opens with 11 of them in a row
  const groups = body.split(/\n\s*\n/);
  const ai = groups.find((group) => group.includes('ClaudeBot'));
  expect(ai, 'no group names ClaudeBot').toBeDefined();
  for (const agent of [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
  ]) {
    expect(ai).toContain(`User-Agent: ${agent}`);
  }
  // Same access as everyone else: listing them is about being citable, not about giving them more of the site
  for (const path of ['/admin', '/preview', '/api']) expect(ai).toContain(`Disallow: ${path}`);
  expect(ai).toContain('Allow: /');
  expect(body).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
});
