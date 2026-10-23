import {beforeEach, describe, expect, it, vi} from 'vitest';

/* The data-access layer with Prisma mocked: the queries it sends and how rows become the shapes components get. */

const db = vi.hoisted(() => ({
  stackItem: {findMany: vi.fn()},
  project: {findMany: vi.fn(), findFirst: vi.fn()},
  milestone: {findMany: vi.fn()},
  timelineEntry: {findMany: vi.fn()},
  post: {findMany: vi.fn(), findFirst: vi.fn()},
  siteSettings: {findUniqueOrThrow: vi.fn()},
  pageCopy: {findMany: vi.fn()},
}));

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({cacheTag: vi.fn(), cacheLife: vi.fn()}));
vi.mock('./db', () => ({db}));

const {getAdjacentPosts, getBlogIndex, getNextProject, getPageCopy, getPost, getPostTags, getPosts, getProjects, getSiteSettings, getTimeline} =
  await import('./content');
const {PAGE_COPY_KEYS} = await import('./content-schema');

const projectRow = (slug: string, overrides: Record<string, unknown> = {}) => ({
  id: `id-${slug}`,
  slug,
  title: `Project ${slug}`,
  summary: 'Summary',
  kindLabel: 'Client work',
  group: 'CLIENT',
  glyph: 'Ab',
  theme: 'TINT',
  span: 6,
  tags: ['Next.js'],
  featured: true,
  order: 1,
  status: 'PUBLISHED',
  coverImageUrl: null,
  caseStudy: null,
  liveUrl: null,
  repoUrl: null,
  client: null,
  role: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const postRow = (slug: string, publishedAt: string, tag = 'MIGRATION') => ({
  id: `id-${slug}`,
  slug,
  title: `Post ${slug}`,
  excerpt: 'Excerpt',
  tag,
  body: '# Body',
  readMinutes: 3,
  status: 'PUBLISHED',
  publishedAt: new Date(publishedAt),
  coverImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getProjects', () => {
  it('asks for published, featured projects in order and lowercases the enums', async () => {
    db.project.findMany.mockResolvedValue([projectRow('alpha')]);
    const projects = await getProjects();
    expect(db.project.findMany).toHaveBeenCalledWith({where: {status: 'PUBLISHED', featured: true}, orderBy: {order: 'asc'}});
    expect(projects).toEqual([
      {
        slug: 'alpha',
        title: 'Project alpha',
        summary: 'Summary',
        kindLabel: 'Client work',
        group: 'client',
        glyph: 'Ab',
        theme: 'tint',
        span: 6,
        tags: ['Next.js'],
        featured: true,
        order: 1,
      },
    ]);
  });

  it('filters by group', async () => {
    db.project.findMany.mockResolvedValue([]);
    await getProjects({group: 'personal'});
    expect(db.project.findMany).toHaveBeenCalledWith({where: {status: 'PUBLISHED', featured: true, group: 'PERSONAL'}, orderBy: {order: 'asc'}});
  });

  it('fails instead of rendering a row that breaks the schema', async () => {
    db.project.findMany.mockResolvedValue([projectRow('alpha', {span: 3})]);
    await expect(getProjects()).rejects.toThrow();
  });
});

describe('getTimeline', () => {
  it('lowercases the dot colour', async () => {
    db.timelineEntry.findMany.mockResolvedValue([
      {id: '1', when: '2024 — now', role: 'Dev', org: 'Co', description: 'Things', dot: 'LIME', isCurrent: true, order: 1},
    ]);
    expect((await getTimeline())[0].dot).toBe('lime');
  });
});

describe('posts', () => {
  it('lists published posts with a date, newest first, as ISO days', async () => {
    db.post.findMany.mockResolvedValue([postRow('newer', '2026-10-01T00:00:00Z')]);
    const posts = await getPosts({limit: 4});
    expect(db.post.findMany).toHaveBeenCalledWith({
      where: {status: 'PUBLISHED', publishedAt: {not: null}},
      orderBy: [{publishedAt: 'desc'}, {title: 'asc'}],
      take: 4,
    });
    expect(posts[0].date).toBe('2026-10-01');
  });

  it('returns null for a draft or unknown slug', async () => {
    db.post.findFirst.mockResolvedValue(null);
    expect(await getPost('missing')).toBeNull();
    expect(db.post.findFirst).toHaveBeenCalledWith({where: {slug: 'missing', status: 'PUBLISHED', publishedAt: {not: null}}});
  });

  it('links a post to the older one as previous and the newer one as next', async () => {
    db.post.findMany.mockResolvedValue([
      postRow('newest', '2026-10-01T00:00:00Z'),
      postRow('middle', '2026-09-01T00:00:00Z'),
      postRow('oldest', '2026-08-01T00:00:00Z'),
    ]);
    expect(await getAdjacentPosts('middle')).toEqual({
      previous: {slug: 'oldest', title: 'Post oldest'},
      next: {slug: 'newest', title: 'Post newest'},
    });
    expect(await getAdjacentPosts('newest')).toEqual({previous: {slug: 'middle', title: 'Post middle'}, next: null});
    expect(await getAdjacentPosts('unknown')).toEqual({previous: null, next: null});
  });

  it('groups tags by slug, most used first', async () => {
    db.post.findMany.mockResolvedValue([
      postRow('a', '2026-10-01T00:00:00Z', 'AI WORKFLOW'),
      postRow('b', '2026-09-01T00:00:00Z', 'AI WORKFLOW'),
      postRow('c', '2026-08-01T00:00:00Z', 'C#'),
      postRow('d', '2026-07-01T00:00:00Z', 'C++'),
      postRow('e', '2026-06-01T00:00:00Z', 'C#'),
      postRow('f', '2026-05-01T00:00:00Z', 'MIGRATION'),
    ]);
    expect(await getPostTags()).toEqual([
      {label: 'C#', slug: 'c', count: 3},
      {label: 'AI WORKFLOW', slug: 'ai-workflow', count: 2},
      {label: 'MIGRATION', slug: 'migration', count: 1},
    ]);
  });

  it('pages the blog index ten at a time, per tag', async () => {
    const rows = Array.from({length: 23}, (_, i) =>
      postRow(`post-${i}`, new Date(Date.UTC(2026, 0, 1) - i * 86_400_000).toISOString(), i % 2 ? 'ODD' : 'EVEN'),
    );
    db.post.findMany.mockResolvedValue(rows);

    const third = await getBlogIndex({tag: null, page: 3});
    expect(third).toMatchObject({page: 3, pageCount: 3, total: 23});
    expect(third.posts.map((post) => post.slug)).toEqual(['post-20', 'post-21', 'post-22']);

    const odd = await getBlogIndex({tag: 'odd', page: 1});
    expect(odd).toMatchObject({pageCount: 2, total: 11});
    expect(odd.posts).toHaveLength(10);
  });
});

describe('getNextProject', () => {
  it('wraps round to the first project, and is null when there is only one', async () => {
    db.project.findMany.mockResolvedValue([
      {slug: 'one', title: 'One'},
      {slug: 'two', title: 'Two'},
    ]);
    expect(await getNextProject('one')).toEqual({slug: 'two', title: 'Two'});
    expect(await getNextProject('two')).toEqual({slug: 'one', title: 'One'});
    expect(db.project.findMany).toHaveBeenCalledWith({where: {status: 'PUBLISHED'}, orderBy: {order: 'asc'}, select: {slug: true, title: true}});

    db.project.findMany.mockResolvedValue([{slug: 'one', title: 'One'}]);
    expect(await getNextProject('one')).toBeNull();
  });
});

describe('getSiteSettings', () => {
  it('reads the single settings row', async () => {
    db.siteSettings.findUniqueOrThrow.mockResolvedValue({
      id: 'site',
      contactEmail: '[YOUR EMAIL]',
      openToProjects: true,
      cvUrl: null,
      socials: {github: 'https://github.com/chrisgen19', linkedin: null},
    });
    expect(await getSiteSettings()).toEqual({
      contactEmail: '[YOUR EMAIL]',
      openToProjects: true,
      cvUrl: null,
      socials: {github: 'https://github.com/chrisgen19', linkedin: null},
    });
    expect(db.siteSettings.findUniqueOrThrow).toHaveBeenCalledWith({where: {id: 'site'}});
  });
});

describe('getPageCopy', () => {
  it('returns every key, and fails when one is missing', async () => {
    const rows = PAGE_COPY_KEYS.map((key) => ({key, value: `copy for ${key}`}));
    db.pageCopy.findMany.mockResolvedValue(rows);
    expect((await getPageCopy())['work.heading']).toBe('copy for work.heading');

    db.pageCopy.findMany.mockResolvedValue(rows.filter((row) => row.key !== 'work.heading'));
    await expect(getPageCopy()).rejects.toThrow();
  });
});
