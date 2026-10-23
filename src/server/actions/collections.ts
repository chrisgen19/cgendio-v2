'use server';

import {updateTag} from 'next/cache';
import {z} from 'zod';
import type {Prisma} from '@/generated/prisma/client';
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

/** Thrown inside the reorder transaction to roll it back when one of the ids no longer exists. */
class StaleListError extends Error {}

const reorderInput = z.object({collection: collectionSchema.exclude(['posts']), ids: z.array(z.string().min(1)).min(1).max(200)});

/** Saves a new display order: `ids` in their new order, first = 1. Posts are ordered by date, so they're excluded. */
export async function reorderItems(collection: Exclude<Collection, 'posts'>, ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  const input = reorderInput.safeParse({collection, ids});
  if (!input.success) return {ok: false, error: 'Invalid request.'};

  const setOrder = {
    projects: (tx: Prisma.TransactionClient, id: string, order: number) => tx.project.updateMany({where: {id}, data: {order}}),
    milestones: (tx: Prisma.TransactionClient, id: string, order: number) => tx.milestone.updateMany({where: {id}, data: {order}}),
    timeline: (tx: Prisma.TransactionClient, id: string, order: number) => tx.timelineEntry.updateMany({where: {id}, data: {order}}),
    stack: (tx: Prisma.TransactionClient, id: string, order: number) => tx.stackItem.updateMany({where: {id}, data: {order}}),
  }[input.data.collection];
  // All or nothing: if an item was deleted elsewhere (say, in another tab), roll the whole order back and say so, rather
  // than saving half of it or throwing P2025, which inside the list's async transition would show the error page
  try {
    await db.$transaction(async (tx) => {
      for (const [i, id] of input.data.ids.entries()) {
        const {count} = await setOrder(tx, id, i + 1);
        if (count === 0) throw new StaleListError();
      }
    });
  } catch (error) {
    if (error instanceof StaleListError) return {ok: false, error: 'An item in this list no longer exists. Reload to see the current list.'};
    throw error;
  }
  updateTag(TAG[input.data.collection]);
  return {ok: true, message: 'Order saved.'};
}
