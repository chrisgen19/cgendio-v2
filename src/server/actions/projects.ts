'use server';

import {updateTag} from 'next/cache';
import {redirect} from 'next/navigation';
import {after} from 'next/server';
import {type ActionResult, fieldErrorsFrom, isUniqueViolation} from '../admin/action-helpers';
import {projectFormSchema} from '../admin/form-schemas';
import {requireAdmin} from '../admin-session';
import {CACHE_TAGS} from '../content';
import {db} from '../db';
import {pingIndexNow, projectPaths} from '../indexnow';

/** Create (no id) or update a project. useActionState signature: (previous result, form data). */
export async function saveProject(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const input = projectFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  const existing = id ? await db.project.findUnique({where: {id}, select: {slug: true, status: true}}) : null;
  let savedId = id;
  try {
    if (id) {
      await db.project.update({where: {id}, data: input.data});
    } else {
      const last = await db.project.aggregate({_max: {order: true}});
      savedId = (await db.project.create({data: {...input.data, order: (last._max.order ?? 0) + 1}, select: {id: true}})).id;
    }
  } catch (error) {
    if (isUniqueViolation(error)) return {ok: false, error: 'That slug is taken.', fieldErrors: {slug: ['Another project already uses this slug']}};
    throw error;
  }

  updateTag(CACHE_TAGS.projects);
  // Published now or before: an unpublished or renamed project tells search engines its old URL is gone
  if (input.data.status === 'PUBLISHED' || existing?.status === 'PUBLISHED') {
    after(() => pingIndexNow(projectPaths(input.data.slug, ...(existing ? [existing.slug] : []))));
  }
  // A new project gets its own edit page; redirect() throws, so it stays outside the try
  if (!id) redirect(`/admin/projects/${savedId}?created=1`);
  return {ok: true, message: 'Project saved.', id: savedId};
}
