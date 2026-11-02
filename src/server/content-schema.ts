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

/** A spot on a capture, in the capture's own pixels. */
const tourRectSchema = z.object({x: z.number().nonnegative(), y: z.number().nonnegative(), w: z.number().positive(), h: z.number().positive()});

/**
 * Where the tour's frame looks on a capture. `y` is how far it pans, `startY` where it pans from, and `x` with `zoom`
 * crop the width. `box` is the selection box and `labelAt` moves its label when above the box would cover something.
 */
export const tourViewSchema = z.object({
  y: z.number().nonnegative(),
  startY: z.number().nonnegative().optional(),
  x: z.number().nonnegative().optional(),
  zoom: z.number().positive().optional(),
  box: tourRectSchema,
  labelAt: z.enum(['right', 'bottom', 'inside']).optional(),
});

const tourCaptureSchema = z.object({url: z.url(), width: z.int().positive(), height: z.int().positive()});

/**
 * Where a stop's page lives: a path on the live site, or a full https address for a page on one of its subdomains. A path
 * must stay on the site once joined to its URL: `//host` and `/\\host` would resolve elsewhere, `/\\` makes new URL throw,
 * and browsers strip tabs and line breaks before parsing, so all of them are refused. The domain of a full address depends
 * on the project, so the admin form and tourHref check that.
 */
export const isTourPath = (path: string) => {
  if (/[\s\\]/.test(path)) return false;
  const isFull = path.startsWith('https://');
  if (!isFull && !/^\/(?!\/)/.test(path)) return false;
  try {
    const url = new URL(path, 'https://site.invalid');
    return isFull ? url.hostname.includes('.') && !url.username && !url.password : url.host === 'site.invalid';
  } catch {
    return false;
  }
};

export const tourPositionsSchema = z.object({desktop: tourViewSchema, mobile: tourViewSchema});

/** One stop of a case study tour: the note beside the frame, and what the frame shows while it is on the reading line. */
export const tourStopSchema = z.object({
  key: z.string().min(1),
  heading: z.string().min(1),
  /** May be empty on the first stop only, which then only sets the frame's opening view. */
  note: z.string(),
  /** Words of `note` to pick out. */
  emphasis: z.string().min(1).nullable(),
  selected: z.string().min(1),
  onScreen: z.string(),
  path: z.string().refine(isTourPath),
  alt: z.string().min(1),
  captures: z.object({desktop: tourCaptureSchema, mobile: tourCaptureSchema}),
  positions: tourPositionsSchema,
});

export const MAX_TOUR_STOPS = 30;

/** A tour in order. The rules across stops live here, so a row edited by hand fails as loudly as a bad form. */
export const tourStopsSchema = z
  .array(tourStopSchema)
  .max(MAX_TOUR_STOPS)
  .superRefine((stops, ctx) => {
    const seen = new Set<string>();
    stops.forEach((stop, index) => {
      const issue = (message: string) => ctx.addIssue({code: 'custom', message, path: [index]});
      if (seen.has(stop.key)) issue('duplicate stop key');
      seen.add(stop.key);
      if (!stop.note.trim() && index > 0) issue('only the first stop can have an empty note');
      if (stop.note.trim() && !stop.onScreen.trim()) issue('a stop with a note needs an on screen line');
      if (stop.emphasis && !stop.note.includes(stop.emphasis)) issue('the emphasis must be words from the note');
    });
  });

/** A case study page: the card fields plus the Markdown case study, cover, links, the facts row, the reasoning and the tour. */
export const projectDetailSchema = projectSchema.extend({
  caseStudy: z.string().nullable(),
  liveUrl: z.url().nullable(),
  repoUrl: z.url().nullable(),
  client: z.string().nullable(),
  role: z.string().nullable(),
  decision: z.string().nullable(),
  contribution: z.string().nullable(),
  outcome: z.string().nullable(),
  tourStops: tourStopsSchema,
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
export type TourStop = z.infer<typeof tourStopSchema>;
export type TourView = z.infer<typeof tourViewSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type PageCopyKey = z.infer<typeof pageCopyKeySchema>;
export type PageCopy = z.infer<typeof pageCopySchema>;
