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

/** Every em or en dash in `text`. CLAUDE.md bans both in anything written for the site. */
export const findDashes = (text: string) => text.match(/[–—]/g) ?? [];

/** Markdown link targets that leave the page over plain http. Site-relative and in-page links are fine. */
export const findInsecureLinks = (text: string) =>
  [...text.matchAll(/\]\(([^)\s]+)/g)]
    .map((match) => match[1] ?? '')
    .filter((url) => !url.startsWith('https://') && !url.startsWith('/') && !url.startsWith('#'));

describe('findDashes', () => {
  it('finds an em dash and an en dash', () => {
    expect(findDashes('a — b and 1–2')).toEqual(['—', '–']);
  });

  it('leaves hyphens alone, including the double hyphen in a quoted comment', () => {
    expect(findDashes('all models -- including Neon -- make errors, cost-per-task')).toEqual([]);
  });
});

describe('findInsecureLinks', () => {
  it('flags a plain http link', () => {
    expect(findInsecureLinks('[a](http://example.test/p)')).toEqual(['http://example.test/p']);
  });

  it('accepts https, site-relative and in-page links', () => {
    expect(findInsecureLinks('[a](https://x.test) [b](/writing/post) [c](#sources)')).toEqual([]);
  });
});

describe('seeded post metadata', () => {
  it('uses no em or en dashes in any title or excerpt', () => {
    const offenders = posts.flatMap((post) => [
      ...findDashes(post.title).map(() => `${post.slug} title`),
      ...findDashes(post.excerpt).map(() => `${post.slug} excerpt`),
    ]);
    expect(offenders).toEqual([]);
  });
});

describe('seeded post bodies', () => {
  // A guard, not a count: a filter typo must not empty the loop below
  it('cover more than one post', () => {
    expect(withBodies.length).toBeGreaterThan(1);
  });

  describe.each(withBodies)('$slug', (post) => {
    const body = readFileSync(bodyPath(post.slug), 'utf8');

    it('uses no em or en dashes', () => {
      expect(findDashes(body)).toEqual([]);
    });

    it('links only over https', () => {
      expect(findInsecureLinks(body)).toEqual([]);
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
