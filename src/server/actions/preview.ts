'use server';

import {z} from 'zod';
import {requireAdmin} from '../admin-session';
import {db} from '../db';
import {createPreviewPath} from '../preview';

const input = z.object({type: z.enum(['post', 'project']), id: z.string().min(1)});

/** A fresh one-hour preview link for a post or project, drafts included. */
export async function getPreviewLink(type: 'post' | 'project', id: string): Promise<{ok: true; path: string} | {ok: false; error: string}> {
  await requireAdmin();
  const parsed = input.safeParse({type, id});
  if (!parsed.success) return {ok: false, error: 'Invalid request.'};

  const row =
    parsed.data.type === 'post'
      ? await db.post.findUnique({where: {id: parsed.data.id}, select: {slug: true}})
      : await db.project.findUnique({where: {id: parsed.data.id}, select: {slug: true}});
  if (!row) return {ok: false, error: 'Save it first, then preview.'};
  return {ok: true, path: createPreviewPath(parsed.data.type, row.slug)};
}
