import {describe, expect, it} from 'vitest';
import {PAGE_COPY_KEYS, pageCopySchema, postDetailSchema, postSchema, projectSchema, siteSettingsSchema, timelineEntrySchema} from './content-schema';

const project = {
  slug: 'off-hire-landing-page',
  title: 'Off-hire landing page',
  summary: 'A summary',
  kindLabel: 'Client work',
  group: 'client',
  glyph: 'Oh',
  theme: 'lime',
  span: 7,
  tags: ['Next.js'],
  coverImageUrl: null,
  featured: true,
  order: 1,
};

const post = {
  slug: 'a-post',
  title: 'A post',
  tag: 'MIGRATION',
  date: '2026-10-01',
  readMinutes: 9,
  excerpt: '[Excerpt]',
};

describe('projectSchema', () => {
  it('accepts a project card', () => {
    expect(projectSchema.parse(project)).toEqual(project);
  });

  it.each(['Has Caps', 'trailing-', '-leading', 'double--hyphen', 'spa ce', ''])('rejects the slug %j', (slug) => {
    expect(projectSchema.safeParse({...project, slug}).success).toBe(false);
  });

  it('only allows bento spans 4 to 7 and the known groups and themes', () => {
    expect(projectSchema.safeParse({...project, span: 3}).success).toBe(false);
    expect(projectSchema.safeParse({...project, span: 8}).success).toBe(false);
    expect(projectSchema.safeParse({...project, group: 'CLIENT'}).success).toBe(false);
    expect(projectSchema.safeParse({...project, theme: 'red'}).success).toBe(false);
  });
});

describe('postSchema', () => {
  it('accepts a post row', () => {
    expect(postSchema.parse(post)).toEqual(post);
  });

  it('needs an ISO date and a positive whole read time', () => {
    expect(postSchema.safeParse({...post, date: '01/10/2026'}).success).toBe(false);
    expect(postSchema.safeParse({...post, date: undefined}).success).toBe(false);
    expect(postSchema.safeParse({...post, readMinutes: 0}).success).toBe(false);
    expect(postSchema.safeParse({...post, readMinutes: 1.5}).success).toBe(false);
  });

  it('allows a post page without a cover, but not a cover that is not a URL', () => {
    expect(postDetailSchema.safeParse({...post, body: '# Hi', coverImageUrl: null}).success).toBe(true);
    expect(postDetailSchema.safeParse({...post, body: '# Hi', coverImageUrl: 'cover.png'}).success).toBe(false);
  });
});

describe('timelineEntrySchema', () => {
  it('rejects an unknown dot colour', () => {
    const entry = {when: '2024', role: 'Dev', org: 'Co', description: 'Did things', dot: 'lime', isCurrent: true, order: 1};
    expect(timelineEntrySchema.safeParse(entry).success).toBe(true);
    expect(timelineEntrySchema.safeParse({...entry, dot: 'LIME'}).success).toBe(false);
  });
});

describe('siteSettingsSchema', () => {
  it('keeps the placeholder email and allows unknown socials as null', () => {
    const settings = {
      contactEmail: '[YOUR EMAIL]',
      openToProjects: true,
      cvUrl: null,
      photoUrl: null,
      socials: {github: 'https://github.com/x', linkedin: null},
    };
    expect(siteSettingsSchema.parse(settings)).toEqual(settings);
    expect(siteSettingsSchema.safeParse({...settings, socials: {github: 'not a url'}}).success).toBe(false);
  });
});

describe('pageCopySchema', () => {
  const full = Object.fromEntries(PAGE_COPY_KEYS.map((key) => [key, `copy for ${key}`]));

  it('accepts every key', () => {
    expect(pageCopySchema.parse(full)).toEqual(full);
  });

  it('fails loudly on a missing or empty key', () => {
    const {'about.statement': _missing, ...withoutOne} = full;
    expect(pageCopySchema.safeParse(withoutOne).success).toBe(false);
    expect(pageCopySchema.safeParse({...full, 'work.heading': ''}).success).toBe(false);
  });
});
