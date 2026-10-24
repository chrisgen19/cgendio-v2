import type {Post} from '../../src/server/content-schema';

/**
 * Bodies live in prisma/seed-data/posts/<slug>.md and reading time is computed from them (prisma/seed.mts). Published
 * posts are ported from the v1 site; the canvas posts stay drafts until they're written, with no date, so publishing
 * one in the admin stamps the real date.
 */
export type SeedPost = Omit<Post, 'readMinutes' | 'date'> & ({status: 'PUBLISHED'; date: string} | {status: 'DRAFT'});

export const posts: SeedPost[] = [
  {
    slug: 'wordpress-news-october-2026',
    title: "WordPress news, October 2026: what to patch and what's coming in 7.2",
    tag: 'WORDPRESS',
    status: 'PUBLISHED',
    date: '2026-10-05',
    excerpt:
      'A roundup of the last three months for people who look after WordPress sites: three core security releases, a backdoor that rebuilds itself, what 7.1 shipped, what 7.2 plans, the WP Engine ruling, and what developers are saying about it.',
  },
  {
    slug: 'redirect-maps-wordpress-to-nextjs',
    title: 'Redirect maps for a WordPress to Next.js migration',
    tag: 'MIGRATION',
    status: 'PUBLISHED',
    date: '2026-10-01',
    excerpt:
      'How I plan the redirect layer so a group of sites can change platforms without breaking the URLs that people and search engines already use.',
  },
  {
    slug: 'migrating-20-wordpress-sites-to-nextjs-without-losing-seo',
    title: 'Migrating 20+ WordPress sites to Next.js without losing SEO',
    tag: 'MIGRATION',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'bulk-redirects-at-the-edge-with-cloudflare-and-vercel',
    title: 'Bulk redirects at the edge with Cloudflare and Vercel',
    tag: 'INFRASTRUCTURE',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'my-claude-code-setup-subagents-skills-and-mcp',
    title: 'My Claude Code setup: subagents, skills and MCP',
    tag: 'AI WORKFLOW',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
  {
    slug: 'two-reviewers-one-pr-claude-code-and-codex-reviews',
    title: 'Two reviewers, one PR: Claude Code and Codex reviews',
    tag: 'AI WORKFLOW',
    status: 'DRAFT',
    excerpt: '[Excerpt]',
  },
];
