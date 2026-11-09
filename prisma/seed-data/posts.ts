import type {Post} from '../../src/server/content-schema';

/**
 * Bodies live in prisma/seed-data/posts/<slug>.md and reading time is computed from them (prisma/seed.mts). Published
 * posts are ported from the v1 site, with its exact timestamps so nothing looks changed at cutover (#81 Phase D). The
 * canvas posts and v1's four title-only drafts stay drafts until they're written, with no date, so publishing one in
 * the admin stamps the real date.
 */
// `date` is left out because it's derived from `publishedAt`; `updatedAt` is optional on drafts with no v1 version
export type SeedPost = Omit<Post, 'readMinutes' | 'date' | 'publishedAt'> &
  ({status: 'PUBLISHED'; publishedAt: string; updatedAt: string} | {status: 'DRAFT'; updatedAt?: string});

export const posts: SeedPost[] = [
  {
    slug: 'wordpress-news-october-2026',
    title: "WordPress news, October 2026: what to patch and what's coming in 7.2",
    tag: 'WordPress',
    status: 'PUBLISHED',
    publishedAt: '2026-10-05T05:00:00.000Z',
    updatedAt: '2026-10-05T05:01:19.745Z',
    excerpt:
      'A roundup of the last three months for people who look after WordPress sites: three core security releases, a backdoor that rebuilds itself, what 7.1 shipped, what 7.2 plans, the WP Engine ruling, and what developers are saying about it.',
  },
  {
    slug: 'redirect-maps-wordpress-to-nextjs',
    title: 'Redirect maps for a WordPress to Next.js migration',
    tag: 'Migration',
    status: 'PUBLISHED',
    publishedAt: '2026-09-30T16:00:00.000Z',
    updatedAt: '2026-10-04T03:27:38.521Z',
    excerpt:
      'How I plan the redirect layer so a group of sites can change platforms without breaking the URLs that people and search engines already use.',
  },
  {
    slug: 'migrating-20-wordpress-sites-to-nextjs-without-losing-seo',
    title: 'Migrating 20+ WordPress sites to Next.js without losing SEO',
    tag: 'Migration',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'bulk-redirects-at-the-edge-with-cloudflare-and-vercel',
    title: 'Bulk redirects at the edge with Cloudflare and Vercel',
    tag: 'Infrastructure',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'my-claude-code-setup-subagents-skills-and-mcp',
    title: 'My Claude Code setup: subagents, skills and MCP',
    tag: 'AI workflow',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'two-reviewers-one-pr-claude-code-and-codex-reviews',
    title: 'Two reviewers, one PR: Claude Code and Codex reviews',
    tag: 'AI workflow',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'contact-form-7-to-iterable',
    title: 'Sending Contact Form 7 leads to Iterable without SMTP',
    tag: 'WordPress',
    status: 'DRAFT',
    updatedAt: '2026-10-04T03:27:38.539Z',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'budget-app-accounts',
    title: 'I built an accounts feature for my budget app, then simplified it',
    tag: 'Product',
    status: 'DRAFT',
    updatedAt: '2026-10-04T03:27:38.542Z',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'self-hosting-on-coolify',
    title: 'Self-hosting Next.js and Postgres on a VPS with Coolify',
    tag: 'Infrastructure',
    status: 'DRAFT',
    updatedAt: '2026-10-04T03:27:38.546Z',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'claude-code-setup',
    title: 'My Claude Code setup: CLAUDE.md, subagents and review loops',
    tag: 'AI workflow',
    status: 'DRAFT',
    updatedAt: '2026-10-04T03:27:38.548Z',
    excerpt: '[Excerpt]',
  },
];
