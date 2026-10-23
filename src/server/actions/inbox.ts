'use server';

import {z} from 'zod';
import type {ActionResult} from '../admin/action-helpers';
import {requireAdmin} from '../admin-session';
import {db} from '../db';

const GONE = 'That message no longer exists.';

const readInput = z.object({id: z.string().min(1), read: z.boolean()});

/** Marks a contact message read or unread. Nothing public reads messages, so there's no cache tag to update. */
export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  const input = readInput.safeParse({id, read});
  if (!input.success) return {ok: false, error: 'Invalid request.'};
  // updateMany/deleteMany report a count instead of throwing when the message was already deleted (say, in another tab)
  const {count} = await db.contactMessage.updateMany({where: {id: input.data.id}, data: {readAt: input.data.read ? new Date() : null}});
  if (count === 0) return {ok: false, error: GONE};
  return {ok: true, message: input.data.read ? 'Marked as read.' : 'Marked as unread.'};
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const input = z.string().min(1).safeParse(id);
  if (!input.success) return {ok: false, error: 'Invalid request.'};
  const {count} = await db.contactMessage.deleteMany({where: {id: input.data}});
  if (count === 0) return {ok: false, error: GONE};
  return {ok: true, message: 'Deleted.'};
}
