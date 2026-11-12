import {expect, type Page, test} from '@playwright/test';
import {gaEvents, stubGtag, waitForGtag} from '../support/analytics';
import {NO_TOUR_SLUG} from '../support/test-env';

/*
 * Live-site links go through /out, which robots.txt disallows, so crawlers never see a client's domain in a link (and
 * the site never shows up in their backlink reports). Visitors still land on the client's site, and each click is a GA event.
 */

test('a case study links to its live site through /out, never to the client domain', async ({request}) => {
  for (const path of ['/projects/access-hire', `/projects/${NO_TOUR_SLUG}`]) {
    const html = await (await request.get(path)).text();
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map(([, href]) => href);
    expect(hrefs.filter((href) => href.startsWith('/out/')).length, path).toBeGreaterThan(0);
    expect(
      hrefs.filter((href) => /^https?:/.test(href) && !/github\.com|linkedin\.com/.test(href)),
      path,
    ).toEqual([]);
  }
});

// A tour stop's redirect is checked in walkthrough.spec.ts, on MyImprov's subdomain stop
test('/out redirects to the live site without being indexed or cached', async ({request}) => {
  const live = await request.get('/out/access-hire', {maxRedirects: 0});
  expect(live.status()).toBe(302);
  expect(live.headers().location).toBe('https://www.accesshire.net/');
  expect(live.headers()['x-robots-tag']).toBe('noindex, nofollow');
  expect(live.headers()['cache-control']).toBe('no-store');
});

test('/out answers 404 for an unknown project, so it redirects nowhere else', async ({request}) => {
  const response = await request.get('/out/no-such-project', {maxRedirects: 0});
  expect(response.status()).toBe(404);
  expect(response.headers().location).toBeUndefined();
});

test('/out sends an unknown or deleted stop to the live site, so an old link still works', async ({request}) => {
  for (const path of ['/out/access-hire?stop=no-such-stop', '/out/access-hire?stop=']) {
    const response = await request.get(path, {maxRedirects: 0});
    expect(response.status(), path).toBe(302);
    expect(response.headers().location, path).toBe('https://www.accesshire.net/');
  }
});

test('robots.txt keeps crawlers out of /out/ without blocking other paths that start with "out"', async ({request}) => {
  const body = await (await request.get('/robots.txt')).text();
  for (const group of body.split(/\n\s*\n/).filter((g) => g.includes('User-Agent'))) {
    expect(group).toMatch(/^Disallow: \/out\/$/m);
    expect(group).not.toMatch(/^Disallow: \/out$/m);
  }
});

test.describe('following a live-site link records live_site_click with the project and kind of link', () => {
  test.beforeEach(async ({page}) => {
    await stubGtag(page);
    // Keep the visit on this page so the queued event stays readable; the click still reaches the tracking listener
    await page.addInitScript(() => {
      const stay = (event: Event) => (event.target as Element).closest?.('a[href^="/out/"]') && event.preventDefault();
      addEventListener('click', stay, true);
      addEventListener('auxclick', stay, true);
    });
    await page.goto('/projects/access-hire');
    await waitForGtag(page);
  });

  const liveSite = (page: Page) => page.locator('main:visible').getByRole('link', {name: 'Live site', exact: true});

  test('on a click', async ({page}) => {
    await liveSite(page).click();
    expect(await gaEvents(page, 'live_site_click')).toEqual([{project: 'access-hire', link_type: 'live'}]);
  });

  test('on a middle click, which opens a new tab', async ({page}) => {
    await liveSite(page).click({button: 'middle'});
    expect(await gaEvents(page, 'live_site_click')).toEqual([{project: 'access-hire', link_type: 'live'}]);
  });

  test('but not on a right click', async ({page}) => {
    await liveSite(page).click({button: 'right'});
    expect(await gaEvents(page, 'live_site_click')).toEqual([]);
  });
});
