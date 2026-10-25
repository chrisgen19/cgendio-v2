import {z} from 'zod';

/* The shapes components receive. src/server/content.ts maps Prisma rows to these and parses them at the boundary. */

export const stackItemSchema = z.object({
  name: z.string().min(1),
  order: z.int(),
});

export const projectGroupSchema = z.enum(['client', 'personal']);
export const projectThemeSchema = z.enum(['ink', 'lime', 'tint', 'gray']);

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  kindLabel: z.string().min(1),
  group: projectGroupSchema,
  glyph: z.string().min(1),
  theme: projectThemeSchema,
  tags: z.array(z.string().min(1)),
  /** The case study cover, also shown on the home page card when set */
  coverImageUrl: z.url().nullable(),
  featured: z.boolean(),
  order: z.int(),
});

export const milestoneSchema = z.object({
  kind: z.string().min(1),
  value: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.int(),
});

export const timelineDotSchema = z.enum(['lime', 'accent', 'ink', 'placeholder']);

export const timelineEntrySchema = z.object({
  when: z.string().min(1),
  role: z.string().min(1),
  org: z.string().min(1),
  description: z.string().min(1),
  dot: timelineDotSchema,
  isCurrent: z.boolean(),
  order: z.int(),
});

export const postSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  tag: z.string().min(1),
  date: z.iso.date(),
  readMinutes: z.int().positive(),
  excerpt: z.string().min(1),
});

/** A post page: the list fields plus the Markdown body and cover. */
export const postDetailSchema = postSchema.extend({
  body: z.string(),
  coverImageUrl: z.url().nullable(),
});

/** A previous/next link between posts or projects. */
export const contentLinkSchema = z.object({slug: z.string().min(1), title: z.string().min(1)});

/** A published post or project in the sitemap: its slug and when it was last saved. */
export const sitemapEntrySchema = z.object({slug: z.string().min(1), lastModified: z.iso.datetime()});

/** A blog tag as filter: the label as written, its URL slug (?tag=) and how many published posts use it. */
export const postTagSchema = z.object({label: z.string().min(1), slug: z.string().min(1), count: z.int().positive()});

/** A case study page: the card fields plus the Markdown case study, cover, links and the facts row. */
export const projectDetailSchema = projectSchema.extend({
  caseStudy: z.string().nullable(),
  liveUrl: z.url().nullable(),
  repoUrl: z.url().nullable(),
  client: z.string().nullable(),
  role: z.string().nullable(),
});

export const siteSettingsSchema = z.object({
  contactEmail: z.string().min(1),
  openToProjects: z.boolean(),
  cvUrl: z.url().nullable(),
  photoUrl: z.url().nullable(),
  /** Profile URLs by network, null until known */
  socials: z.record(z.string(), z.url().nullable()),
});

/** Every editable piece of home page copy, grouped by section (the admin form follows this order). */
export const PAGE_COPY_KEYS = [
  'stack.eyebrow',
  'about.eyebrow',
  'about.statement',
  'about.name',
  'about.role',
  'about.fact1.title',
  'about.fact1.body',
  'about.fact2.title',
  'about.fact2.body',
  'about.fact3.title',
  'about.fact3.body',
  'work.eyebrow',
  'work.heading',
  'milestones.eyebrow',
  'milestones.heading',
  'milestones.lede',
  'timeline.eyebrow',
  'timeline.heading',
  'timeline.lede',
  'timeline.cvLabel',
  'blog.eyebrow',
  'blog.heading',
  'blog.lede',
  'blog.allLabel',
  'contact.eyebrow',
  'contact.heading',
  'contact.lede',
  'contact.primaryLabel',
  'contact.cvLabel',
  'contact.location',
] as const;

export const pageCopyKeySchema = z.enum(PAGE_COPY_KEYS);

/** All keys are required: a missing row fails loudly instead of rendering an empty heading. */
export const pageCopySchema = z.record(pageCopyKeySchema, z.string().min(1));

export type StackItem = z.infer<typeof stackItemSchema>;
export type ProjectGroup = z.infer<typeof projectGroupSchema>;
export type ProjectTheme = z.infer<typeof projectThemeSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type TimelineDot = z.infer<typeof timelineDotSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;
export type Post = z.infer<typeof postSchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type ContentLink = z.infer<typeof contentLinkSchema>;
export type PostTag = z.infer<typeof postTagSchema>;
export type SitemapEntry = z.infer<typeof sitemapEntrySchema>;
export type ProjectDetail = z.infer<typeof projectDetailSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type PageCopyKey = z.infer<typeof pageCopyKeySchema>;
export type PageCopy = z.infer<typeof pageCopySchema>;
