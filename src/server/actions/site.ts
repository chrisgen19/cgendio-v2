'use server';

import {updateTag} from 'next/cache';
import {type ActionResult, fieldErrorsFrom} from '../admin/action-helpers';
import {pageCopyFormSchema, settingsFormSchema} from '../admin/form-schemas';
import {requireAdmin} from '../admin-session';
import {CACHE_TAGS} from '../content';
import {db} from '../db';

/** Contact email, the "Open to projects" status, the CV link and the LinkedIn profile (kept in socials). */
export async function saveSettings(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const input = settingsFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  const {linkedinUrl, ...fields} = input.data;
  const current = await db.siteSettings.findUniqueOrThrow({where: {id: 'site'}, select: {socials: true}});
  const socials = {...(current.socials as Record<string, string | null>), linkedin: linkedinUrl};
  await db.siteSettings.update({where: {id: 'site'}, data: {...fields, socials}});
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
