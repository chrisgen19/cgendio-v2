import {expect, type Page, test} from '@playwright/test';

/*
 * No placeholder reaches production: bracketed stand-ins like [YOUR PHOTO], [Excerpt] or [Earlier role] fail the build.
 * Checks what a visitor or a crawler gets: the visible text, the title, meta and Open Graph descriptions, image alt text
 * and JSON-LD. Markdown link text is fine, since it renders without brackets.
 */

const PLACEHOLDER = /\[[A-Z][A-Za-z0-9 .,'/&+-]{0,60}\]/g;

const placeholdersOn = async (page: Page, path: string) => {
  await page.goto(path);
  const text = await page.evaluate(() => {
    const meta = [...document.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]')];
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const alts = [...document.querySelectorAll('img[alt]')];
    return [
      document.body.innerText,
      document.title,
      ...meta.map((tag) => tag.getAttribute('content') ?? ''),
      ...jsonLd.map((script) => script.textContent ?? ''),
      ...alts.map((img) => img.getAttribute('alt') ?? ''),
    ].join('\n');
  });
  return [...new Set(text.match(PLACEHOLDER) ?? [])];
};

for (const path of ['/', '/blog']) {
  test(`${path} has no placeholder text`, async ({page}) => {
    expect(await placeholdersOn(page, path)).toEqual([]);
  });
}

// The sitemap lists every published post and case study (the RSS feed stops at 20), so a new one is covered without
// touching this test
for (const [kind, prefix] of [
  ['post', '/blog/'],
  ['case study', '/work/'],
]) {
  test(`every published ${kind} has no placeholder text`, async ({page, request}) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname).filter((path) => path.startsWith(prefix));
    expect(paths.length).toBeGreaterThan(0);

    for (const path of paths) {
      await test.step(path, async () => {
        expect(await placeholdersOn(page, path)).toEqual([]);
      });
    }
  });
}
