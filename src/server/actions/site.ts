'use server';

import {updateTag} from 'next/cache';
import {type ActionResult, fieldErrorsFrom} from '../admin/action-helpers';
import {pageCopyFormSchema, settingsFormSchema} from '../admin/form-schemas';
import {requireAdmin} from '../admin-session';
import {CACHE_TAGS} from '../content';
import {db} from '../db';

/** Contact email, the "Open to projects" status and the CV link. */
export async function saveSettings(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const input = settingsFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  await db.siteSettings.update({where: {id: 'site'}, data: input.data});
  updateTag(CACHE_TAGS.settings);
  return {ok: true, message: 'Settings saved.'};
}

/** Every page copy key in one go. Only rows whose text changed are written. */
export async function savePageCopy(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const input = pageCopyFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  const current = await db.pageCopy.findMany({select: {key: true, value: true}});
  const before = new Map(current.map((row) => [row.key, row.value]));
  const changed = Object.entries(input.data).filter(([key, value]) => before.get(key) !== value);
  if (changed.length === 0) return {ok: true, message: 'No changes to save.'};

  await db.$transaction(changed.map(([key, value]) => db.pageCopy.upsert({where: {key}, create: {key, value}, update: {value}})));
  updateTag(CACHE_TAGS.copy);
  return {ok: true, message: `Saved ${changed.length} change${changed.length === 1 ? '' : 's'}.`};
}
