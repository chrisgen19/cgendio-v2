/*
 * The Content-Security-Policy and Strict-Transport-Security headers next.config.ts sends on every response (#99, #10
 * step 7). Pure and separate from the config so src/lib/security-headers.test.ts can check every directive without
 * building the app.
 *
 * The policy is static, with `script-src 'unsafe-inline'` rather than a nonce. Next's own guide
 * (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md) says a nonce has to be generated per
 * request, which forces every page to render dynamically and rules out Partial Prerendering, which this site relies on.
 * The static policy still pins the script hosts, blocks plugins, `base` rewrites, framing and off-site form posts, and
 * limits where images may come from and where the browser may connect.
 */

/** Two years, the length preload lists expect, but without `preload`: the policy can still be withdrawn. */
export const HSTS = 'max-age=63072000; includeSubDomains';

/** GA4's own CSP guidance: the tag comes from googletagmanager, the beacons go to the analytics hosts. */
const GA_SCRIPT = ['https://*.googletagmanager.com'];
const GA_IMG = ['https://*.google-analytics.com', 'https://*.googletagmanager.com'];
const GA_CONNECT = ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'];

/** Admin uploads PUT straight to the bucket from the browser (src/components/admin/upload-field.tsx). The account id is
 * only known at runtime, while this header is compiled at build time, so the host stays a wildcard. */
const R2_UPLOAD = 'https://*.r2.cloudflarestorage.com';

/** Covers still served from the bucket's default domain, until #81 moves them to a custom one. */
const R2_DEFAULT_PUBLIC = 'https://*.r2.dev';

/** The origin of a URL, or nothing when it is unset or unparseable. A source expression needs the origin, not the path. */
const originOf = (url: string | undefined) => {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
};

const isHttps = (url: string | undefined) => originOf(url)?.startsWith('https://') ?? false;

type PolicyOptions = {
  /** `next dev`: React evaluates code to rebuild server stacks in the browser, so it needs 'unsafe-eval'. */
  isDev: boolean;
  /** NEXT_PUBLIC_SITE_URL. Only its scheme matters here. */
  siteUrl?: string;
  /** R2_PUBLIC_URL: where next/image falls back to loading a cover straight from the host. */
  r2PublicUrl?: string;
};

/** One Content-Security-Policy header value for every response. */
export const contentSecurityPolicy = ({isDev, siteUrl, r2PublicUrl}: PolicyOptions) => {
  const r2Origin = originOf(r2PublicUrl);
  const directives: Array<[string, string[]]> = [
    ['default-src', ["'self'"]],
    // Inline: the theme script in the root layout and GA's config snippet, plus Next's own flight data scripts
    ['script-src', ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...GA_SCRIPT]],
    // React and the Remotion player write style attributes, which count as inline styles
    ['style-src', ["'self'", "'unsafe-inline'"]],
    // data: for the e2e and seed fixtures, blob: for the admin's upload preview
    ['img-src', ["'self'", 'data:', 'blob:', ...(r2Origin ? [r2Origin] : []), R2_DEFAULT_PUBLIC, ...GA_IMG]],
    // Self-hosted through next/font/local (#94): nothing is fetched from Google
    ['font-src', ["'self'"]],
    // The film is silent, but the Remotion player still preallocates <audio> tags on a base64 data URL
    // (node_modules/remotion/dist/cjs/audio/shared-audio-tags.js), which default-src 'self' would block
    ['media-src', ["'self'", 'data:']],
    ['connect-src', ["'self'", R2_UPLOAD, ...GA_CONNECT]],
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    // Server actions post to this origin; GitHub sign-in is a script redirect, not a form, so it isn't affected
    ['form-action', ["'self'"]],
    ['frame-ancestors', ["'none'"]],
  ];

  return [
    ...directives.map(([name, sources]) => `${name} ${[...new Set(sources)].join(' ')}`),
    // Only on an https site: over plain http (e2e, dev, the container smoke test) it would upgrade same-origin requests
    ...(isHttps(siteUrl) ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
};
