import 'server-only';
import {milestones} from '@/content/milestones';
import {posts} from '@/content/posts';
import {projects} from '@/content/projects';
import {
  type Milestone,
  milestoneSchema,
  type Post,
  type Project,
  type ProjectGroup,
  postSchema,
  projectSchema,
  type StackItem,
  stackItemSchema,
  type TimelineEntry,
  timelineEntrySchema,
} from '@/content/schema';
import {stack} from '@/content/stack';
import {timeline} from '@/content/timeline';

/* The only way components read content. Phase 4 swaps these bodies for Prisma queries; the signatures stay. */

const byOrder = <T extends {order: number}>(rows: T[]) => [...rows].sort((a, b) => a.order - b.order);

export const getStack = async (): Promise<StackItem[]> => byOrder(stackItemSchema.array().parse(stack));

/** Featured projects in display order; `group: 'all'` (the default) returns both groups. */
export const getProjects = async ({group = 'all'}: {group?: ProjectGroup | 'all'} = {}): Promise<Project[]> =>
  byOrder(projectSchema.array().parse(projects)).filter((p) => p.featured && (group === 'all' || p.group === group));

export const getMilestones = async (): Promise<Milestone[]> => byOrder(milestoneSchema.array().parse(milestones));

export const getTimeline = async (): Promise<TimelineEntry[]> => byOrder(timelineEntrySchema.array().parse(timeline));

/** Newest first. ISO dates sort correctly as strings. */
export const getPosts = async ({limit}: {limit?: number} = {}): Promise<Post[]> => {
  const sorted = [...postSchema.array().parse(posts)].sort((a, b) => b.date.localeCompare(a.date));
  return limit === undefined ? sorted : sorted.slice(0, limit);
};
