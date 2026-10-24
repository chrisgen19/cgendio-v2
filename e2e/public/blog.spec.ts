import {expect, test} from '@playwright/test';

/* Seeded published posts, newest first: "WordPress news, October 2026…", "Redirect maps…". The four canvas posts are drafts. */

test('blog list, then a post, then the next post', async ({page}) => {
  await page.goto('/blog');
  await page.getByRole('link', {name: /Redirect maps for a WordPress/}).click();

  await expect(page).toHaveURL(/\/blog\/redirect-maps-wordpress-to-nextjs$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Redirect maps for a WordPress to Next.js migration');

  // "Next article" is the newer post
  await page
    .getByRole('navigation', {name: 'Previous and next articles'})
    .getByRole('link', {name: /Next article.*WordPress news, October 2026/})
    .click();
  await expect(page).toHaveURL(/\/blog\/wordpress-news-october-2026$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText("WordPress news, October 2026: what to patch and what's coming in 7.2");
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
  expect(feed.links).toHaveLength(2);
  expect(feed.links[0]).toBe('http://localhost:3100/blog/wordpress-news-october-2026');
});
