import 'server-only';
import {cacheLife, cacheTag} from 'next/cache';
import {
  type Milestone,
  milestoneSchema,
  PAGE_COPY_KEYS,
  type PageCopy,
  type Post,
  type Project,
  type ProjectGroup,
  pageCopySchema,
  postSchema,
  projectSchema,
  type SiteSettings,
  type StackItem,
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
  Milestone,
  PageCopy,
  PageCopyKey,
  Post,
  Project,
  ProjectGroup,
  ProjectSpan,
  ProjectTheme,
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
  return projectSchema.array().parse(
    rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      kindLabel: row.kindLabel,
      group: lower(row.group),
      glyph: row.glyph,
      theme: lower(row.theme),
      span: row.span,
      tags: row.tags,
      featured: row.featured,
      order: row.order,
    })),
  );
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
  return postSchema.array().parse(
    rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      tag: row.tag,
      // The home page shows month and year; the date part of the UTC timestamp is enough
      date: row.publishedAt?.toISOString().slice(0, 10),
      readMinutes: row.readMinutes,
      excerpt: row.excerpt,
    })),
  );
};

/** The single settings row. Not used by a component yet: the contact section and footer pick it up in Phase 6. */
export const getSiteSettings = async (): Promise<SiteSettings> => {
  'use cache';
  cacheTag(CACHE_TAGS.settings);
  cacheLife('max');
  const row = await db.siteSettings.findUniqueOrThrow({where: {id: 'site'}});
  return siteSettingsSchema.parse({contactEmail: row.contactEmail, openToProjects: row.openToProjects, cvUrl: row.cvUrl, socials: row.socials});
};

/** Every editable piece of home page copy, keyed by PAGE_COPY_KEYS. A missing key fails the parse (and the build). */
export const getPageCopy = async (): Promise<PageCopy> => {
  'use cache';
  cacheTag(CACHE_TAGS.copy);
  cacheLife('max');
  const rows = await db.pageCopy.findMany({where: {key: {in: [...PAGE_COPY_KEYS]}}, select: {key: true, value: true}});
  return pageCopySchema.parse(Object.fromEntries(rows.map((row) => [row.key, row.value])));
};
