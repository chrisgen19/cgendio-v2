import {z} from 'zod';

/* The shapes components receive. src/server/content.ts maps Prisma rows to these and parses them at the boundary. */

export const stackItemSchema = z.object({
  name: z.string().min(1),
  order: z.int(),
});

export const projectGroupSchema = z.enum(['client', 'personal']);
export const projectThemeSchema = z.enum(['ink', 'lime', 'tint', 'gray']);
/** A `#rrggbb` colour in any case, read as lowercase (the admin saves lowercase; a hand edit may not) */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .transform((value) => value.toLowerCase());

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
  /** The card's brand tint (src/lib/brand-palette.ts); without a brand colour the card uses its theme */
  brandColor: hexColorSchema.nullable(),
  brandTint: hexColorSchema.nullable(),
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
  'about.heading',
  'about.intro',
  'about.name',
  'about.frameLabel',
  'about.role.label',
  'about.role.value',
  'about.role.note',
  'about.role.pin',
  'about.based.label',
  'about.based.value',
  'about.based.note',
  'about.timezone.label',
  'about.timezone.value',
  'about.timezone.note',
  'about.timezone.pin',
  'about.experience.label',
  'about.experience.value',
  'about.experience.note',
  'about.experience.pin',
  'about.sites.label',
  'about.sites.value',
  'about.sites.note',
  'about.sites.pin',
  'about.status.label',
  'about.status.open',
  'about.status.closed',
  'about.contactLabel',
  'about.cvLabel',
  'build.eyebrow',
  'build.heading',
  'build.wp.label',
  'build.wp.labelSub',
  'build.wp.line',
  'build.wp.proof',
  'build.next.label',
  'build.next.labelSub',
  'build.next.line',
  'build.next.proof',
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
