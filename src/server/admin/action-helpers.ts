import {z} from 'zod';
// A relative path with its extension: prisma/seed.mts imports this file under plain Node, which has neither `@/` nor extension lookup
import {publishedDay} from '../../lib/format-date.ts';

/** What every admin server action returns. Expected failures are values; only the unexpected throws. */
export type ActionResult = {ok: true; message: string; id?: string} | {ok: false; error: string; fieldErrors?: Record<string, string[]>};

export const initialActionResult: ActionResult | null = null;

export const fieldErrorsFrom = (error: z.ZodError): ActionResult => ({
  ok: false,
  error: 'Check the highlighted fields.',
  fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
});

/** Prisma's unique-constraint error (P2002), e.g. a slug that's already taken. */
export const isUniqueViolation = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && (error as {code: unknown}).code === 'P2002';

/** Reading time at about 200 words a minute, at least one minute. */
export const readMinutesFor = (markdown: string) => Math.max(1, Math.ceil(markdown.trim().split(/\s+/).filter(Boolean).length / 200));

/**
 * The timestamp to store for a post, given the day its form submitted.
 *
 * The date input carries a day and no time, and it is pre-filled from the stored timestamp, so re-saving an unrelated
 * field would otherwise push a post published at 14:30 back to midnight. That moves it in the RSS feed and reorders it
 * against other posts from the same day. So a submitted day that matches the stored one keeps the stored time, and only
 * a genuinely different day starts at midnight UTC.
 *
 * With no day submitted: a post being published for the first time is stamped now, and anything else keeps what it has.
 */
type PublishedAtInput = {day: string | null; stored: Date | null; isPublished: boolean; now?: Date};

export const resolvePublishedAt = ({day, stored, isPublished, now = new Date()}: PublishedAtInput) => {
  if (!day) return isPublished ? (stored ?? now) : stored;
  if (stored && publishedDay(stored) === day) return stored;
  return new Date(`${day}T00:00:00Z`);
};
