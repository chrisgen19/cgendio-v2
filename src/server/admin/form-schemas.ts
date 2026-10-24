import {z} from 'zod';
import {PAGE_COPY_KEYS} from '../content-schema';

/* Zod schemas for the admin forms. Inputs arrive as FormData strings, so these coerce. */

const text = (label: string, max = 500) =>
  z
    .string({error: `${label} is required`})
    .trim()
    .min(1, {error: `${label} is required`})
    .max(max, {error: `${label} is too long (max ${max} characters)`});

/** A Radix Switch with a name posts "on" when checked and nothing when off */
const checkbox = z.preprocess((value) => value === 'on' || value === 'true', z.boolean());

/** Empty optional fields become null instead of "" */
/** An http(s) address on a real domain, or empty. Bare z.url() also accepts mailto:, ftp: and javascript: URLs. */
const optionalUrl = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.url({protocol: /^https?$/, hostname: z.regexes.domain, error: 'Enter a full URL'}).nullable(),
);
const optionalText = z.preprocess((value) => (typeof value === 'string' && value.trim() === '' ? null : value), z.string().trim().nullable());

const slug = z
  .string({error: 'Slug is required'})
  .trim()
  .min(1, {error: 'Slug is required'})
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {error: 'Use lowercase letters, numbers and single hyphens'});

const status = z.preprocess((value) => (value === 'on' ? 'PUBLISHED' : 'DRAFT'), z.enum(['DRAFT', 'PUBLISHED']));

export const projectFormSchema = z.object({
  title: text('Title', 160),
  slug,
  summary: text('Summary', 600),
  kindLabel: text('Kind label', 80),
  group: z.enum(['CLIENT', 'PERSONAL'], {error: 'Pick a group'}),
  glyph: text('Glyph', 40),
  theme: z.enum(['INK', 'LIME', 'TINT', 'GRAY'], {error: 'Pick a theme'}),
  span: z.coerce.number().pipe(z.union([z.literal(4), z.literal(5), z.literal(6), z.literal(7)], {error: 'Span is 4, 5, 6 or 7'})),
  tags: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(40)).max(8, {error: 'At most 8 tags'})),
  featured: checkbox,
  status,
  coverImageUrl: optionalUrl,
  caseStudy: optionalText,
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  client: optionalText.pipe(z.string().max(120).nullable()),
  role: optionalText.pipe(z.string().max(120).nullable()),
});

export const postFormSchema = z.object({
  title: text('Title', 200),
  slug,
  excerpt: text('Excerpt', 400),
  tag: text('Tag', 40),
  body: text('Body', 100_000),
  status,
  /** yyyy-mm-dd from a date input; empty means "set it when first published" */
  publishedAt: z.preprocess((value) => (value === '' || value === undefined ? null : value), z.iso.date().nullable()),
  coverImageUrl: optionalUrl,
});

export const milestoneFormSchema = z.object({
  kind: text('Kind', 40),
  value: text('Value', 40),
  title: text('Title', 120),
  description: text('Description', 400),
});

export const timelineFormSchema = z.object({
  when: text('When', 60),
  role: text('Role', 120),
  org: text('Organisation', 120),
  description: text('Description', 600),
  dot: z.enum(['LIME', 'ACCENT', 'INK', 'PLACEHOLDER'], {error: 'Pick a dot colour'}),
  isCurrent: checkbox,
});

export const stackFormSchema = z.object({name: text('Name', 40)});

export const settingsFormSchema = z.object({
  contactEmail: text('Contact email', 200),
  openToProjects: checkbox,
  cvUrl: optionalUrl,
  photoUrl: optionalUrl,
  linkedinUrl: optionalUrl,
});

export const pageCopyFormSchema = z.object(
  Object.fromEntries(PAGE_COPY_KEYS.map((key) => [key, text(key, 600)])) as Record<(typeof PAGE_COPY_KEYS)[number], ReturnType<typeof text>>,
);

export const collectionSchema = z.enum(['projects', 'posts', 'milestones', 'timeline', 'stack']);
export type Collection = z.infer<typeof collectionSchema>;
