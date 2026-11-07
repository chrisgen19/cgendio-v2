'use server';

import {updateTag} from 'next/cache';
import {redirect} from 'next/navigation';
import {after} from 'next/server';
import {type ActionResult, fieldErrorsFrom, isUniqueViolation, readMinutesFor, resolvePublishedAt} from '../admin/action-helpers';
import {postFormSchema} from '../admin/form-schemas';
import {requireAdmin} from '../admin-session';
import {CACHE_TAGS} from '../content';
import {db} from '../db';
import {pingIndexNow, postPaths} from '../indexnow';

/** Create (no id) or update a post. Reading time comes from the body; publishedAt is set the first time it's published. */
export async function savePost(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const input = postFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  const {publishedAt, ...fields} = input.data;
  const existing = id ? await db.post.findUnique({where: {id}, select: {publishedAt: true, slug: true, status: true}}) : null;
  const date = resolvePublishedAt({day: publishedAt, stored: existing?.publishedAt ?? null, isPublished: fields.status === 'PUBLISHED'});
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
  // Published now or before: an unpublished or renamed post tells search engines its old URL is gone
  if (fields.status === 'PUBLISHED' || existing?.status === 'PUBLISHED') {
    after(() => pingIndexNow(postPaths(fields.slug, ...(existing ? [existing.slug] : []))));
  }
  if (!id) redirect(`/admin/posts/${savedId}?created=1`);
  return {ok: true, message: 'Post saved.', id: savedId};
}
