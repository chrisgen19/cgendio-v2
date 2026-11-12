import {expect, test} from '@playwright/test';
import {contentSecurityPolicy, HSTS} from '../../src/lib/security-headers';
import {E2E_BASE_URL} from '../support/test-env';

/*
 * What the production container relies on (Phase 9, #10): the health check the Dockerfile's HEALTHCHECK and Coolify call,
 * the security headers the previous site sent on every response (#81), and the Content-Security-Policy and HSTS headers
 * (src/lib/security-headers.ts, #99). The policy's directives are unit-tested there; this checks that next.config.ts
 * sends the policy the build compiled, with the e2e site URL, on every kind of response. The sweep for violations is in
 * csp.spec.ts.
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

// The build runs with NEXT_PUBLIC_SITE_URL set to the e2e site URL (e2e/support/test-env.ts)
const CSP = contentSecurityPolicy({isDev: false, siteUrl: E2E_BASE_URL});

// A prerendered page, a post, the feed and a route handler: the headers come from next.config.ts, so all of them get them
for (const path of ['/', '/writing/wordpress-news-october-2026', '/feed.xml', '/api/health']) {
  test(`${path} sends the security, CSP and HSTS headers`, async ({request}) => {
    const headers = (await request.get(path)).headers();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(headers[name], `${name} on ${path}`).toBe(value);
    expect(headers['content-security-policy'], `CSP on ${path}`).toBe(CSP);
    expect(headers['strict-transport-security'], `HSTS on ${path}`).toBe(HSTS);
  });
}

test('the policy has no upgrade-insecure-requests on an http site', async ({request}) => {
  expect((await request.get('/')).headers()['content-security-policy']).not.toContain('upgrade-insecure-requests');
});
