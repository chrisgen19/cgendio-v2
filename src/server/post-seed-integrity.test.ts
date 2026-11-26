import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {posts} from '../../prisma/seed-data/posts';

/*
 * House rules for the post bodies in prisma/seed-data/posts, checked by machine rather than by eye: no em or en dashes
 * (CLAUDE.md), and no link that would leave the page over plain http. Bodies are optional, so posts without one (v1's
 * title-only drafts, which seed PLACEHOLDER_BODY) are skipped rather than failed.
 */
const NEON_SLUG = 'gemini-4-neon-developer-guide';
const GPT_6_2_SLUG = 'gpt-6-2-astra-sol-developer-guide';
const WP_7_2_SLUG = 'wordpress-7-2-gutenberg-developer-guide';
const bodyPath = (slug: string) => new URL(`../../prisma/seed-data/posts/${slug}.md`, import.meta.url);
const withBodies = posts.filter((post) => existsSync(bodyPath(post.slug)));

/** Every em or en dash in `text`. CLAUDE.md bans both in anything written for the site. */
export const findDashes = (text: string) => text.match(/[–—]/g) ?? [];

/**
 * Link targets that leave the page over plain http, from both Markdown links and bare autolinks. Site-relative and
 * in-page links are fine.
 */
export const findInsecureLinks = (text: string) => {
  const markdown = [...text.matchAll(/\]\(([^)\s]+)/g)].map((match) => match[1] ?? '');
  const autolinks = [...text.matchAll(/<((?:https?|ftp):\/\/[^>\s]+)>/g)].map((match) => match[1] ?? '');
  return [...markdown, ...autolinks].filter((url) => !url.startsWith('https://') && !url.startsWith('/') && !url.startsWith('#'));
};

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

  it('flags a bare autolink that is not https', () => {
    expect(findInsecureLinks('see <http://example.test/p> and <https://ok.test>')).toEqual(['http://example.test/p']);
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

  it('is seeded as published, with the timestamps the production admin stamped', () => {
    expect(post?.status).toBe('PUBLISHED');
    expect(post).toMatchObject({publishedAt: '2026-11-22T14:04:58.003Z', updatedAt: '2026-11-22T14:04:58.005Z'});
  });

  it('carries the agreed title, tag and excerpt', () => {
    expect(post?.title).toBe('Gemini 4 Neon for developers: which Gemini 4 model to pick, and what it really costs');
    expect(post?.tag).toBe('AI workflow');
    expect(post?.excerpt).toBe(
      "Google shipped four Gemini 4 models in six weeks. What Neon costs per task next to Hydrogen and Carbon, what changes in your code when you switch, what developers on Hacker News make of it, and which one I'd point a project at.",
    );
  });

  it('has a body file at its slug', () => {
    expect(existsSync(bodyPath(NEON_SLUG))).toBe(true);
  });
});

describe('the GPT-6.2 Astra and Sol post', () => {
  const post = posts.find((candidate) => candidate.slug === GPT_6_2_SLUG);

  it('is seeded as published, with the timestamps the production admin stamped', () => {
    expect(post?.status).toBe('PUBLISHED');
    expect(post).toMatchObject({publishedAt: '2026-11-23T00:00:00.000Z', updatedAt: '2026-11-23T07:52:20.534Z'});
  });

  it('carries the agreed title, tag and excerpt', () => {
    expect(post?.title).toBe('GPT-6.2 Astra and Sol for developers: when Astra is worth 4x Sol, and what changes in the Responses API');
    expect(post?.tag).toBe('AI workflow');
    expect(post?.excerpt).toBe(
      "OpenAI shipped GPT-6.2 Astra ($8/$40) and Sol ($2/$10) on November 17. What they cost per task, the Responses API caching and reasoning changes that break old habits, what Hacker News developers make of both, and how I'd wire them into a Next.js app.",
    );
  });

  it('has a body file at its slug', () => {
    expect(existsSync(bodyPath(GPT_6_2_SLUG))).toBe(true);
  });
});

describe('the WordPress 7.2 and Gutenberg post', () => {
  const post = posts.find((candidate) => candidate.slug === WP_7_2_SLUG);

  it('is seeded as a draft with no publish date', () => {
    expect(post?.status).toBe('DRAFT');
    expect(post).not.toHaveProperty('publishedAt');
  });

  it('carries the agreed title, tag and excerpt', () => {
    expect(post?.title).toBe("WordPress 7.2 and Gutenberg for developers: what's shipping, what's delayed, and what breaks");
    expect(post?.tag).toBe('WordPress');
    expect(post?.excerpt).toBe(
      'WordPress 7.2 lands December 8 with inline SVG admin icons, a DataForm inspector, client-side media in the Media Library, and Gutenberg 23.7 to 24.3. What actually ships, what got pulled (Secrets API, React 19 in core, real-time collaboration), and the CSS, JS and PHP breaking changes to check first.',
    );
  });

  it('has a body file at its slug', () => {
    expect(existsSync(bodyPath(WP_7_2_SLUG))).toBe(true);
  });
});
