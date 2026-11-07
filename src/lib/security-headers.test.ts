import {describe, expect, it} from 'vitest';
import {contentSecurityPolicy, HSTS} from './security-headers';

/*
 * The static Content-Security-Policy next.config.ts sends on every response (#99). Each case reads the policy as the
 * browser does: one directive per name, with its source list.
 */

const PRODUCTION = {isDev: false, siteUrl: 'https://cgdiomampo.dev', r2PublicUrl: 'https://media.cgdiomampo.dev'};

/** `name source source` pairs, keyed by directive name. A valueless directive maps to an empty list. */
const parse = (policy: string) =>
  Object.fromEntries(
    policy.split('; ').map((directive) => {
      const [name, ...sources] = directive.split(' ');
      return [name, sources];
    }),
  );

describe('contentSecurityPolicy', () => {
  it('covers every directive the site needs', () => {
    expect(Object.keys(parse(contentSecurityPolicy(PRODUCTION)))).toEqual([
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'media-src',
      'connect-src',
      'object-src',
      'base-uri',
      'form-action',
      'frame-ancestors',
      'upgrade-insecure-requests',
    ]);
  });

  it('locks down plugins, framing, base rewrites and off-site form posts', () => {
    const directives = parse(contentSecurityPolicy(PRODUCTION));
    expect(directives['default-src']).toEqual(["'self'"]);
    expect(directives['object-src']).toEqual(["'none'"]);
    expect(directives['frame-ancestors']).toEqual(["'none'"]);
    expect(directives['base-uri']).toEqual(["'self'"]);
    expect(directives['form-action']).toEqual(["'self'"]);
    // Self-hosted with next/font/local (#94), so no font host is allowed
    expect(directives['font-src']).toEqual(["'self'"]);
  });

  it('allows the inline scripts and the GA tag, and nothing else executable', () => {
    expect(parse(contentSecurityPolicy(PRODUCTION))['script-src']).toEqual(["'self'", "'unsafe-inline'", 'https://*.googletagmanager.com']);
  });

  it("adds 'unsafe-eval' in dev only, where React evaluates code to rebuild server stacks", () => {
    expect(parse(contentSecurityPolicy({...PRODUCTION, isDev: true}))['script-src']).toContain("'unsafe-eval'");
    expect(parse(contentSecurityPolicy(PRODUCTION))['script-src']).not.toContain("'unsafe-eval'");
  });

  it('allows the Remotion player and React inline styles', () => {
    expect(parse(contentSecurityPolicy(PRODUCTION))['style-src']).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("allows the player's silent data: audio tags", () => {
    expect(parse(contentSecurityPolicy(PRODUCTION))['media-src']).toEqual(["'self'", 'data:']);
  });

  it('allows images from the site, the R2 public origin, the bucket default domain and GA', () => {
    expect(parse(contentSecurityPolicy(PRODUCTION))['img-src']).toEqual([
      "'self'",
      'data:',
      'blob:',
      'https://media.cgdiomampo.dev',
      'https://*.r2.dev',
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
    ]);
  });

  it('strips the R2 public URL to its origin', () => {
    expect(parse(contentSecurityPolicy({...PRODUCTION, r2PublicUrl: 'https://media.cgdiomampo.dev/covers/'}))['img-src']).toContain(
      'https://media.cgdiomampo.dev',
    );
  });

  it('lists the R2 origin once when it is already on the bucket default domain', () => {
    const sources = parse(contentSecurityPolicy({...PRODUCTION, r2PublicUrl: 'https://*.r2.dev'}))['img-src'];
    expect(sources.filter((source) => source === 'https://*.r2.dev')).toHaveLength(1);
  });

  it.each([undefined, '', 'not a url'])('leaves the R2 origin out when R2_PUBLIC_URL is %p', (r2PublicUrl) => {
    expect(parse(contentSecurityPolicy({...PRODUCTION, r2PublicUrl}))['img-src']).toEqual([
      "'self'",
      'data:',
      'blob:',
      'https://*.r2.dev',
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
    ]);
  });

  it('allows the browser-side R2 upload and the GA beacons to connect', () => {
    expect(parse(contentSecurityPolicy(PRODUCTION))['connect-src']).toEqual([
      "'self'",
      'https://*.r2.cloudflarestorage.com',
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
    ]);
  });

  it.each([
    ['https://cgdiomampo.dev', true],
    ['http://localhost:3100', false],
    ['', false],
    [undefined, false],
  ])('upgrades insecure requests for %p: %p', (siteUrl, upgrades) => {
    expect(contentSecurityPolicy({...PRODUCTION, siteUrl}).includes('upgrade-insecure-requests')).toBe(upgrades);
  });

  it('is a single line with no stray whitespace', () => {
    const policy = contentSecurityPolicy(PRODUCTION);
    expect(policy).not.toMatch(/\s{2,}|[\n\r\t]/);
    expect(policy.trim()).toBe(policy);
    expect(policy.endsWith(';')).toBe(false);
  });
});

describe('HSTS', () => {
  it('is two years on every subdomain, without preload', () => {
    expect(HSTS).toBe('max-age=63072000; includeSubDomains');
  });
});
