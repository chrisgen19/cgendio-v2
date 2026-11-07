import type {NextConfig} from 'next';

// Covers uploaded to R2 go through the image optimizer. Read at build time, so R2_PUBLIC_URL must be a build variable too.
const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // AVIF first for browsers that accept it (about 25% smaller on the photo-heavy tour captures), WebP otherwise
    formats: ['image/avif', 'image/webp'],
    remotePatterns: r2PublicUrl ? [new URL(`${r2PublicUrl}/**`)] : [],
  },
  partialPrefetching: true,
  // Admin, sign-in and draft previews never go in search results (also set as robots metadata on those pages)
  headers: async () => [
    {source: '/admin/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
    {source: '/admin', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
    {source: '/sign-in', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
    {source: '/preview/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]},
  ],
  // URLs the previous site (cgendio-v1) had that this one doesn't serve as pages (#81). Permanent (308) so search engines
  // move the old URLs over. Redirects run before the proxy, so /admin/sign-in never reaches the admin session check.
  redirects: async () => [
    // v1 slugs dropped dots ("Next.js" was "nextjs"); this site hyphenates them. Listed before the general tag rule.
    {source: '/writing/tag/nextjs', destination: '/writing?tag=next-js', permanent: true},
    // v1 had a page per tag; here a tag is a filter on the index. Tags this site doesn't use land on its empty state.
    {source: '/writing/tag/:tag', destination: '/writing?tag=:tag', permanent: true},
    // Side projects with a v1 page but none here (their Markdown versions too, in one hop). Redirects run before the
    // Markdown rewrites below, so these win for the three slugs.
    {source: '/projects/:slug(budget-tracker|ph-job-board-scraper|self-hosted-platform)', destination: '/#work', permanent: true},
    {source: '/projects/:slug(budget-tracker|ph-job-board-scraper|self-hosted-platform).md', destination: '/#work', permanent: true},
    // Sign-in moved to v1's /sign-in; the old path here keeps working for bookmarks
    {source: '/admin/sign-in', destination: '/sign-in', permanent: true},
  ],
  // Markdown for AI agents (src/app/md, #81): at <page>.md, and at the page URL itself for requests that ask for it
  // (`Accept: text/markdown`, sent by tools like Claude Code and Cursor). In beforeFiles: plain-array rewrites run after
  // the filesystem check, where the prerendered pages would answer first. Next anchors these header patterns (^...$).
  rewrites: async () => {
    const acceptsMarkdown = [{type: 'header' as const, key: 'accept', value: '(.*)text/markdown(.*)'}];
    // An explicit refusal (`text/markdown;q=0`, with or without other parameters) keeps the HTML. Other q-values aren't
    // ranked: a client that lists text/markdown at all gets it.
    const refusesMarkdown = [
      {type: 'header' as const, key: 'accept', value: '(?:.*,)?\\s*text/markdown\\s*(?:;[^,]*)?;\\s*q=0(?:\\.0{1,3})?\\s*(?:,.*)?'},
    ];
    return {
      beforeFiles: [
        {source: '/writing/:slug([a-z0-9-]+).md', destination: '/md/writing/:slug'},
        {source: '/projects/:slug([a-z0-9-]+).md', destination: '/md/projects/:slug'},
        {source: '/writing/:slug([a-z0-9-]+)', has: acceptsMarkdown, missing: refusesMarkdown, destination: '/md/writing/:slug'},
        {source: '/projects/:slug([a-z0-9-]+)', has: acceptsMarkdown, missing: refusesMarkdown, destination: '/md/projects/:slug'},
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      '*.css': {
        // Plain CSS modules must retain their module identity and scoped class exports.
        condition: {not: {path: '*.module.css'}},
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
