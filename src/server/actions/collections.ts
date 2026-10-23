'use server';

import {updateTag} from 'next/cache';
import {z} from 'zod';
import type {ActionResult} from '../admin/action-helpers';
import {type Collection, collectionSchema} from '../admin/form-schemas';
import {requireAdmin} from '../admin-session';
import {CACHE_TAGS} from '../content';
import {db} from '../db';

const TAG: Record<Collection, string> = {
  projects: CACHE_TAGS.projects,
  posts: CACHE_TAGS.posts,
  milestones: CACHE_TAGS.milestones,
  timeline: CACHE_TAGS.timeline,
  stack: CACHE_TAGS.stack,
};

const deleteInput = z.object({collection: collectionSchema, id: z.string().min(1)});

export async function deleteItem(collection: Collection, id: string): Promise<ActionResult> {
  await requireAdmin();
  const input = deleteInput.safeParse({collection, id});
  if (!input.success) return {ok: false, error: 'Invalid request.'};

  // deleteMany reports a count instead of throwing P2025 when the item was already deleted (say, in another tab), which
  // inside the list's async transition would otherwise replace the admin page with the error page
  const where = {id: input.data.id};
  const remove = {
    projects: () => db.project.deleteMany({where}),
    posts: () => db.post.deleteMany({where}),
    milestones: () => db.milestone.deleteMany({where}),
    timeline: () => db.timelineEntry.deleteMany({where}),
    stack: () => db.stackItem.deleteMany({where}),
  }[input.data.collection];
  const {count} = await remove();
  if (count === 0) return {ok: false, error: 'That item no longer exists.'};
  updateTag(TAG[input.data.collection]);
  return {ok: true, message: 'Deleted.'};
}

const reorderInput = z.object({collection: collectionSchema.exclude(['posts']), ids: z.array(z.string().min(1)).min(1).max(200)});

/** Saves a new display order: `ids` in their new order, first = 1. Posts are ordered by date, so they're excluded. */
export async function reorderItems(collection: Exclude<Collection, 'posts'>, ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  const input = reorderInput.safeParse({collection, ids});
  if (!input.success) return {ok: false, error: 'Invalid request.'};

  const setOrder = {
    projects: (id: string, order: number) => db.project.update({where: {id}, data: {order}}),
    milestones: (id: string, order: number) => db.milestone.update({where: {id}, data: {order}}),
    timeline: (id: string, order: number) => db.timelineEntry.update({where: {id}, data: {order}}),
    stack: (id: string, order: number) => db.stackItem.update({where: {id}, data: {order}}),
  }[input.data.collection];
  await db.$transaction(input.data.ids.map((id, i) => setOrder(id, i + 1)));
  updateTag(TAG[input.data.collection]);
  return {ok: true, message: 'Order saved.'};
}
