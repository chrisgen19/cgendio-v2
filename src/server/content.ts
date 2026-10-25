import 'server-only';
import {cacheLife, cacheTag} from 'next/cache';
import type {Post as PostRow, Project as ProjectRow} from '@/generated/prisma/client';
import {tagSlug} from '@/lib/tag-slug';
import {
  type ContentLink,
  contentLinkSchema,
  type Milestone,
  milestoneSchema,
  PAGE_COPY_KEYS,
  type PageCopy,
  type Post,
  type PostDetail,
  type PostTag,
  type Project,
  type ProjectDetail,
  type ProjectGroup,
  pageCopySchema,
  postDetailSchema,
  postSchema,
  postTagSchema,
  projectDetailSchema,
  projectSchema,
  type SitemapEntry,
  type SiteSettings,
  type StackItem,
  sitemapEntrySchema,
  siteSettingsSchema,
  stackItemSchema,
  type TimelineEntry,
  timelineEntrySchema,
} from './content-schema';
import {db} from './db';

/*
 * The only way components read content. Every getter is cached until its tag is revalidated: the home page is
 * prerendered from these at build time, and the Phase 5 admin calls revalidateTag/updateTag with CACHE_TAGS after a
 * save. Rows are mapped to the shapes in content-schema.ts and parsed there, so components never see Prisma types.
 */

// Components take their types from here too, so nothing outside src/server depends on Prisma or the seed data
export type {
  ContentLink,
  Milestone,
  PageCopy,
  PageCopyKey,
  Post,
  PostDetail,
  PostTag,
  Project,
  ProjectDetail,
  ProjectGroup,
  ProjectSpan,
  ProjectTheme,
  SitemapEntry,
  SiteSettings,
  StackItem,
  TimelineDot,
  TimelineEntry,
} from './content-schema';

export const CACHE_TAGS = {
  projects: 'projects',
  posts: 'posts',
  milestones: 'milestones',
  timeline: 'timeline',
  stack: 'stack',
  settings: 'settings',
  copy: 'copy',
} as const;

const lower = <T extends string>(value: T) => value.toLowerCase() as Lowercase<T>;

/** Card fields of a project row (the Work grid and the case study page share them). */
const projectFields = (row: ProjectRow) => ({
  slug: row.slug,
  title: row.title,
  summary: row.summary,
  kindLabel: row.kindLabel,
  group: lower(row.group),
  glyph: row.glyph,
  theme: lower(row.theme),
  span: row.span,
  tags: row.tags,
  coverImageUrl: row.coverImageUrl,
  featured: row.featured,
  order: row.order,
});

/** List fields of a post row. Drafts have no publishedAt, so the preview passes their last save instead. */
const postFields = (row: PostRow, date: Date | null = row.publishedAt) => ({
  slug: row.slug,
  title: row.title,
  tag: row.tag,
  // Pages show the day or month and year; the date part of the UTC timestamp is enough
  date: date?.toISOString().slice(0, 10),
  readMinutes: row.readMinutes,
  excerpt: row.excerpt,
});

/** A project row as its case study page shape; used by getProject and the draft preview. */
export const toProjectDetail = (row: ProjectRow): ProjectDetail =>
  projectDetailSchema.parse({
    ...projectFields(row),
    caseStudy: row.caseStudy,
    liveUrl: row.liveUrl,
    repoUrl: row.repoUrl,
    client: row.client,
    role: row.role,
  });

/** A post row as its article page shape; used by getPost and the draft preview. */
export const toPostDetail = (row: PostRow, date: Date | null = row.publishedAt): PostDetail =>
  postDetailSchema.parse({...postFields(row, date), body: row.body, coverImageUrl: row.coverImageUrl});

export const getStack = async (): Promise<StackItem[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.stack);
  cacheLife('max');
  const rows = await db.stackItem.findMany({select: {name: true, order: true}, orderBy: {order: 'asc'}});
  return stackItemSchema.array().parse(rows);
};

/** Published, featured projects in display order; `group: 'all'` (the default) returns both groups. */
export const getProjects = async ({group = 'all'}: {group?: ProjectGroup | 'all'} = {}): Promise<Project[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.projects);
  cacheLife('max');
  const rows = await db.project.findMany({
    where: {status: 'PUBLISHED', featured: true, ...(group === 'all' ? {} : {group: group === 'client' ? 'CLIENT' : 'PERSONAL'})},
    orderBy: {order: 'asc'},
  });
  return projectSchema.array().parse(rows.map((row) => projectFields(row)));
};

export const getMilestones = async (): Promise<Milestone[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.milestones);
  cacheLife('max');
  const rows = await db.milestone.findMany({
    select: {kind: true, value: true, title: true, description: true, order: true},
    orderBy: {order: 'asc'},
  });
  return milestoneSchema.array().parse(rows);
};

export const getTimeline = async (): Promise<TimelineEntry[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.timeline);
  cacheLife('max');
  const rows = await db.timelineEntry.findMany({orderBy: {order: 'asc'}});
  return timelineEntrySchema.array().parse(
    rows.map((row) => ({
      when: row.when,
      role: row.role,
      org: row.org,
      description: row.description,
      dot: lower(row.dot),
      isCurrent: row.isCurrent,
      order: row.order,
    })),
  );
};

/** Published posts, newest first. */
export const getPosts = async ({limit}: {limit?: number} = {}): Promise<Post[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts);
  cacheLife('max');
  const rows = await db.post.findMany({
    where: {status: 'PUBLISHED', publishedAt: {not: null}},
    orderBy: [{publishedAt: 'desc'}, {title: 'asc'}],
    take: limit,
  });
  return postSchema.array().parse(rows.map((row) => postFields(row)));
};

/** One published post with its body, or null for drafts and unknown slugs (the page then 404s). */
export const getPost = async (slug: string): Promise<PostDetail | null> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts);
  cacheLife('max');
  const row = await db.post.findFirst({where: {slug, status: 'PUBLISHED', publishedAt: {not: null}}});
  return row ? toPostDetail(row) : null;
};

export const BLOG_PAGE_SIZE = 10;

/**
 * Tags in use by published posts, most used first, with the slug used in /blog?tag=. Labels that share a slug ("C#" and
 * "C++") are one filter: it shows the most used label and counts every post that matches, as getBlogIndex does.
 */
export const getPostTags = async (): Promise<PostTag[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts);
  cacheLife('max');
  const groups = new Map<string, Map<string, number>>();
  for (const post of await getPosts()) {
    const labels = groups.get(tagSlug(post.tag)) ?? new Map<string, number>();
    labels.set(post.tag, (labels.get(post.tag) ?? 0) + 1);
    groups.set(tagSlug(post.tag), labels);
  }
  const tags = [...groups].map(([slug, labels]) => {
    const [label] = [...labels].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    return {label, slug, count: [...labels.values()].reduce((sum, n) => sum + n, 0)};
  });
  return postTagSchema.array().parse(tags.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)));
};

/**
 * One page of the blog index, optionally for one tag. Callers pass a known tag slug and a page within range (the
 * blog page checks both first), which keeps the number of cache entries small.
 */
export const getBlogIndex = async ({tag, page}: {tag: string | null; page: number}) => {
  'use cache';
  cacheTag(CACHE_TAGS.posts);
  cacheLife('max');
  const all = await getPosts();
  const matching = tag ? all.filter((post) => tagSlug(post.tag) === tag) : all;
  const pageCount = Math.max(1, Math.ceil(matching.length / BLOG_PAGE_SIZE));
  return {posts: matching.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE), page, pageCount, total: matching.length};
};

/** The published neighbours of a post: `previous` is the older one, `next` the newer one. */
export const getAdjacentPosts = async (slug: string): Promise<{previous: ContentLink | null; next: ContentLink | null}> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts);
  cacheLife('max');
  const posts = await getPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  const link = (post: Post | undefined) => (post ? contentLinkSchema.parse({slug: post.slug, title: post.title}) : null);
  return index === -1 ? {previous: null, next: null} : {previous: link(posts[index + 1]), next: link(posts[index - 1])};
};

/** Slugs of every published post, for generateStaticParams. */
export const getPostSlugs = async (): Promise<string[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts);
  cacheLife('max');
  return (await getPosts()).map((post) => post.slug);
};

/** One published project with its case study (featured or not), or null for drafts and unknown slugs. */
export const getProject = async (slug: string): Promise<ProjectDetail | null> => {
  'use cache';
  cacheTag(CACHE_TAGS.projects);
  cacheLife('max');
  const row = await db.project.findFirst({where: {slug, status: 'PUBLISHED'}});
  return row ? toProjectDetail(row) : null;
};

/** Published projects in display order, as links: case study slugs and the "Next project" order. */
const getPublishedProjectLinks = async (): Promise<ContentLink[]> => {
  'use cache';
  cacheTag(CACHE_TAGS.projects);
  cacheLife('max');
  const rows = await db.project.findMany({where: {status: 'PUBLISHED'}, orderBy: {order: 'asc'}, select: {slug: true, title: true}});
  return contentLinkSchema.array().parse(rows);
};

/** Slugs of every published project, for generateStaticParams. */
export const getProjectSlugs = async (): Promise<string[]> => (await getPublishedProjectLinks()).map((project) => project.slug);

/** The project after this one in display order, wrapping round to the first; null when it's the only one. */
export const getNextProject = async (slug: string): Promise<ContentLink | null> => {
  const projects = await getPublishedProjectLinks();
  const index = projects.findIndex((project) => project.slug === slug);
  const next = projects[(index + 1) % projects.length];
  return next && next.slug !== slug ? next : null;
};

/** Published posts and projects with their last save, for sitemap.ts. Drafts never appear. */
export const getSitemapEntries = async (): Promise<{posts: SitemapEntry[]; projects: SitemapEntry[]}> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.projects);
  cacheLife('max');
  const select = {slug: true, updatedAt: true} as const;
  const [posts, projects] = await Promise.all([
    db.post.findMany({where: {status: 'PUBLISHED', publishedAt: {not: null}}, orderBy: {publishedAt: 'desc'}, select}),
    db.project.findMany({where: {status: 'PUBLISHED'}, orderBy: {order: 'asc'}, select}),
  ]);
  const toEntries = (rows: {slug: string; updatedAt: Date}[]) =>
    sitemapEntrySchema.array().parse(rows.map((row) => ({slug: row.slug, lastModified: row.updatedAt.toISOString()})));
  return {posts: toEntries(posts), projects: toEntries(projects)};
};

/** The single settings row: the header status, contact details, CV link, About photo and social profiles. */
export const getSiteSettings = async (): Promise<SiteSettings> => {
  'use cache';
  cacheTag(CACHE_TAGS.settings);
  cacheLife('max');
  const row = await db.siteSettings.findUniqueOrThrow({where: {id: 'site'}});
  return siteSettingsSchema.parse({
    contactEmail: row.contactEmail,
    openToProjects: row.openToProjects,
    cvUrl: row.cvUrl,
    photoUrl: row.photoUrl,
    socials: row.socials,
  });
};

/** Every editable piece of home page copy, keyed by PAGE_COPY_KEYS. A missing key fails the parse (and the build). */
export const getPageCopy = async (): Promise<PageCopy> => {
  'use cache';
  cacheTag(CACHE_TAGS.copy);
  cacheLife('max');
  const rows = await db.pageCopy.findMany({where: {key: {in: [...PAGE_COPY_KEYS]}}, select: {key: true, value: true}});
  return pageCopySchema.parse(Object.fromEntries(rows.map((row) => [row.key, row.value])));
};
