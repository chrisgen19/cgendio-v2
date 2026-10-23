import {expect, test} from '@playwright/test';

/* Seeded posts, newest first: "Migrating 20+ WordPress sites…", "Bulk redirects…", "My Claude Code setup…", "Two reviewers…". */

test('blog list, then a post, then the next post', async ({page}) => {
  await page.goto('/blog');
  await page.getByRole('link', {name: /Bulk redirects at the edge/}).click();

  await expect(page).toHaveURL(/\/blog\/bulk-redirects-at-the-edge-with-cloudflare-and-vercel$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Bulk redirects at the edge with Cloudflare and Vercel');

  // "Next article" is the newer post
  await page
    .getByRole('navigation', {name: 'Previous and next articles'})
    .getByRole('link', {name: /Next article.*Migrating 20\+ WordPress sites/})
    .click();
  await expect(page).toHaveURL(/\/blog\/migrating-20-wordpress-sites-to-nextjs-without-losing-seo$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Migrating 20+ WordPress sites to Next.js without losing SEO');
});

test('the RSS feed is valid XML with every published post', async ({page, request}) => {
  const response = await request.get('/blog/rss.xml');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/xml/);

  const xml = await response.text();
  const feed = await page.evaluate((text) => {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    return {
      error: doc.querySelector('parsererror')?.textContent ?? null,
      title: doc.querySelector('rss > channel > title')?.textContent ?? null,
      links: [...doc.querySelectorAll('rss > channel > item > link')].map((link) => link.textContent),
    };
  }, xml);

  expect(feed.error).toBeNull();
  expect(feed.title).toBeTruthy();
  expect(feed.links).toHaveLength(4);
  expect(feed.links[0]).toBe('http://localhost:3100/blog/migrating-20-wordpress-sites-to-nextjs-without-losing-seo');
});
