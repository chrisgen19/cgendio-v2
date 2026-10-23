import {z} from 'zod';

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
