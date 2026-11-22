import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {posts} from '../../prisma/seed-data/posts';

/*
 * House rules for the post bodies in prisma/seed-data/posts, checked by machine rather than by eye: no em or en dashes
 * (CLAUDE.md), and no link that would leave the page over plain http. Bodies are optional, so posts without one (v1's
 * title-only drafts, which seed PLACEHOLDER_BODY) are skipped rather than failed.
 */
const NEON_SLUG = 'gemini-4-neon-developer-guide';
const bodyPath = (slug: string) => new URL(`../../prisma/seed-data/posts/${slug}.md`, import.meta.url);
const withBodies = posts.filter((post) => existsSync(bodyPath(post.slug)));

describe('seeded post bodies', () => {
  // A guard, not a count: a filter typo must not empty the loop below
  it('cover more than one post', () => {
    expect(withBodies.length).toBeGreaterThan(1);
  });

  describe.each(withBodies)('$slug', (post) => {
    const body = readFileSync(bodyPath(post.slug), 'utf8');

    it('uses no em or en dashes', () => {
      expect(body.match(/[–—]/g) ?? []).toEqual([]);
    });

    it('links only over https', () => {
      const links = [...body.matchAll(/\]\((?<url>[^)\s]+)/g)].map((match) => match.groups?.url ?? '');
      expect(links.filter((url) => !url.startsWith('https://'))).toEqual([]);
    });
  });
});

describe('the Gemini 4 Neon post', () => {
  const post = posts.find((candidate) => candidate.slug === NEON_SLUG);

  it('is seeded as a draft with no publish date', () => {
    expect(post?.status).toBe('DRAFT');
    expect(post).not.toHaveProperty('publishedAt');
  });

  it('carries the agreed title, tag and excerpt', () => {
    expect(post?.title).toBe('Gemini 4 Neon for developers: which Gemini 4 model to pick, and what it really costs');
    expect(post?.tag).toBe('AI workflow');
    expect(post?.excerpt).toMatch(/^Google shipped four Gemini 4 models in six weeks\./);
  });

  it('has a body file at its slug', () => {
    expect(existsSync(bodyPath(NEON_SLUG))).toBe(true);
  });
});
