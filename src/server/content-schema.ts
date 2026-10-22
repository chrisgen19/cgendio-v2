import {z} from 'zod';

/* Shaped like the Phase 4 Prisma rows, so src/server/content.ts can swap mock data for queries without touching components. */

export const stackItemSchema = z.object({
  name: z.string().min(1),
  order: z.int(),
});

export const projectGroupSchema = z.enum(['client', 'personal']);
export const projectThemeSchema = z.enum(['ink', 'lime', 'tint', 'gray']);
export const projectSpanSchema = z.union([z.literal(4), z.literal(5), z.literal(6), z.literal(7)]);

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  kindLabel: z.string().min(1),
  group: projectGroupSchema,
  glyph: z.string().min(1),
  theme: projectThemeSchema,
  span: projectSpanSchema,
  tags: z.array(z.string().min(1)),
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

export type StackItem = z.infer<typeof stackItemSchema>;
export type ProjectGroup = z.infer<typeof projectGroupSchema>;
export type ProjectTheme = z.infer<typeof projectThemeSchema>;
export type ProjectSpan = z.infer<typeof projectSpanSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type TimelineDot = z.infer<typeof timelineDotSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;
export type Post = z.infer<typeof postSchema>;
