'use server';

import {updateTag} from 'next/cache';
import {redirect} from 'next/navigation';
import {type ActionResult, fieldErrorsFrom, isUniqueViolation, readMinutesFor} from '../admin/action-helpers';
import {postFormSchema} from '../admin/form-schemas';
import {requireAdmin} from '../admin-session';
import {CACHE_TAGS} from '../content';
import {db} from '../db';

/** Create (no id) or update a post. Reading time comes from the body; publishedAt is set the first time it's published. */
export async function savePost(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const input = postFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  const {publishedAt, ...fields} = input.data;
  const existing = id ? await db.post.findUnique({where: {id}, select: {publishedAt: true}}) : null;
  const date = publishedAt
    ? new Date(`${publishedAt}T00:00:00Z`)
    : fields.status === 'PUBLISHED'
      ? (existing?.publishedAt ?? new Date())
      : (existing?.publishedAt ?? null);
  const data = {...fields, readMinutes: readMinutesFor(fields.body), publishedAt: date};

  let savedId = id;
  try {
    if (id) await db.post.update({where: {id}, data});
    else savedId = (await db.post.create({data, select: {id: true}})).id;
  } catch (error) {
    if (isUniqueViolation(error)) return {ok: false, error: 'That slug is taken.', fieldErrors: {slug: ['Another post already uses this slug']}};
    throw error;
  }

  updateTag(CACHE_TAGS.posts);
  if (!id) redirect(`/admin/posts/${savedId}?created=1`);
  return {ok: true, message: 'Post saved.', id: savedId};
}
