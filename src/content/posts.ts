import type {Post} from './schema';

// The canvas only gives month and year: dates use the 1st of the month and the home page shows "Oct 2026".
export const posts: Post[] = [
  {
    slug: 'migrating-20-wordpress-sites-to-nextjs-without-losing-seo',
    title: 'Migrating 20+ WordPress sites to Next.js without losing SEO',
    tag: 'MIGRATION',
    date: '2026-10-01',
    readMinutes: 9,
    excerpt: '[Excerpt]',
  },
  {
    slug: 'bulk-redirects-at-the-edge-with-cloudflare-and-vercel',
    title: 'Bulk redirects at the edge with Cloudflare and Vercel',
    tag: 'INFRASTRUCTURE',
    date: '2026-09-01',
    readMinutes: 6,
    excerpt: '[Excerpt]',
  },
  {
    slug: 'my-claude-code-setup-subagents-skills-and-mcp',
    title: 'My Claude Code setup: subagents, skills and MCP',
    tag: 'AI WORKFLOW',
    date: '2026-09-01',
    readMinutes: 7,
    excerpt: '[Excerpt]',
  },
  {
    slug: 'two-reviewers-one-pr-claude-code-and-codex-reviews',
    title: 'Two reviewers, one PR: Claude Code and Codex reviews',
    tag: 'AI WORKFLOW',
    date: '2026-08-01',
    readMinutes: 5,
    excerpt: '[Excerpt]',
  },
];
