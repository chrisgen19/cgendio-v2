import {expect, test} from '@playwright/test';

/*
 * What the production container relies on (Phase 9, #10): the health check the Dockerfile's HEALTHCHECK and Coolify call,
 * and the security headers the previous site sent on every response (#81).
 */

test('/api/health reports the server and the database, uncached', async ({request}) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.json()).toEqual({status: 'ok', database: 'ok'});
});

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

// A prerendered page, a post, the feed and a route handler: the headers come from next.config.ts, so all of them get them
for (const path of ['/', '/writing/wordpress-news-october-2026', '/feed.xml', '/api/health']) {
  test(`${path} sends the security headers`, async ({request}) => {
    const headers = (await request.get(path)).headers();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(headers[name], `${name} on ${path}`).toBe(value);
  });
}
