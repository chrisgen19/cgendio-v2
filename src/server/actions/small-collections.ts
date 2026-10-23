'use server';

import {randomUUID} from 'node:crypto';
import {updateTag} from 'next/cache';
import {redirect} from 'next/navigation';
import {type ActionResult, fieldErrorsFrom, isUniqueViolation} from '../admin/action-helpers';
import {milestoneFormSchema, stackFormSchema, timelineFormSchema} from '../admin/form-schemas';
import {requireAdmin} from '../admin-session';
import {CACHE_TAGS} from '../content';
import {db} from '../db';

/* Milestones, timeline entries and stack items: simple ordered rows. New rows go to the end. */

export async function saveMilestone(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const input = milestoneFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  if (id) {
    await db.milestone.update({where: {id}, data: input.data});
  } else {
    const last = await db.milestone.aggregate({_max: {order: true}});
    // key is the seed's idempotency handle; admin-made rows just need a unique one
    await db.milestone.create({data: {...input.data, key: `admin-${randomUUID()}`, order: (last._max.order ?? 0) + 1}});
  }
  updateTag(CACHE_TAGS.milestones);
  if (!id) redirect('/admin/milestones?created=1');
  return {ok: true, message: 'Milestone saved.'};
}

export async function saveTimelineEntry(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const input = timelineFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  if (id) {
    await db.timelineEntry.update({where: {id}, data: input.data});
  } else {
    const last = await db.timelineEntry.aggregate({_max: {order: true}});
    await db.timelineEntry.create({data: {...input.data, key: `admin-${randomUUID()}`, order: (last._max.order ?? 0) + 1}});
  }
  updateTag(CACHE_TAGS.timeline);
  if (!id) redirect('/admin/timeline?created=1');
  return {ok: true, message: 'Timeline entry saved.'};
}

export async function saveStackItem(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const input = stackFormSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return fieldErrorsFrom(input.error);

  try {
    if (id) {
      await db.stackItem.update({where: {id}, data: input.data});
    } else {
      const last = await db.stackItem.aggregate({_max: {order: true}});
      await db.stackItem.create({data: {...input.data, order: (last._max.order ?? 0) + 1}});
    }
  } catch (error) {
    if (isUniqueViolation(error)) return {ok: false, error: 'That name is already in the stack.', fieldErrors: {name: ['Already in the stack']}};
    throw error;
  }
  updateTag(CACHE_TAGS.stack);
  if (!id) redirect('/admin/stack?created=1');
  return {ok: true, message: 'Stack item saved.'};
}
