import {z} from 'zod';
import {isTourPath, MAX_TOUR_STOPS, type TourStop, tourPositionsSchema, tourStopsSchema} from '../content-schema';

const UNREADABLE = 'The tour could not be read. Reload the page and try again.';

const draftCaptureSchema = z.object({url: z.string(), width: z.number(), height: z.number()});

/** A stop as the admin form posts it: the same fields, with the positions still as the text in the JSON field. */
const draftSchema = z.object({
  key: z.string(),
  heading: z.string(),
  note: z.string(),
  emphasis: z.string().nullable(),
  selected: z.string(),
  onScreen: z.string(),
  path: z.string(),
  alt: z.string(),
  captures: z.object({desktop: draftCaptureSchema, mobile: draftCaptureSchema}),
  positions: z.string(),
});

type Draft = z.infer<typeof draftSchema>;

const hasCapture = ({url, width, height}: Draft['captures']['desktop']) => /^https?:\/\//.test(url) && width > 0 && height > 0;

/** What is wrong with this stop's text and captures, or null. */
const textProblem = (draft: Draft, index: number): string | null => {
  const note = draft.note.trim();
  const emphasis = draft.emphasis?.trim();
  if (!draft.heading.trim()) return 'the heading is required';
  if (!note && index > 0) return 'only the first stop can have an empty note';
  if (emphasis && !note.includes(emphasis)) return 'the emphasis must be words from the note';
  if (!draft.selected.trim()) return 'the selected label is required';
  if (note && !draft.onScreen.trim()) return 'the on screen line is required';
  if (!isTourPath(draft.path.trim())) return 'the page path must start with a single /';
  if (!draft.alt.trim()) return 'the alt text is required';
  if (!hasCapture(draft.captures.desktop)) return 'the desktop capture is missing';
  if (!hasCapture(draft.captures.mobile)) return 'the mobile capture is missing';
  return null;
};

const readPositions = (text: string): {ok: true; positions: TourStop['positions']} | {ok: false; message: string} => {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return {ok: false, message: 'positions are not valid JSON'};
  }
  const parsed = tourPositionsSchema.safeParse(value);
  return parsed.success ? {ok: true, positions: parsed.data} : {ok: false, message: 'positions need desktop and mobile, each with y and box'};
};

const readDrafts = (raw: string): Draft[] | null => {
  try {
    const parsed = z.array(draftSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/**
 * The admin's tour field to validated stops, or the first problem as a message naming the stop. Only http(s) captures
 * pass here: the public schema is wider, because the e2e and any future source may hold other URLs.
 */
export const parseTourField = (raw: string): {ok: true; stops: TourStop[]} | {ok: false; message: string} => {
  const drafts = readDrafts(raw);
  if (!drafts) return {ok: false, message: UNREADABLE};
  if (drafts.length > MAX_TOUR_STOPS) return {ok: false, message: `A tour can have at most ${MAX_TOUR_STOPS} stops`};

  const seen = new Set<string>();
  const stops: TourStop[] = [];
  for (const [index, draft] of drafts.entries()) {
    const fail = (problem: string) => ({ok: false as const, message: `Stop ${index + 1}: ${problem}`});
    if (seen.has(draft.key)) return fail('duplicate stop key');
    seen.add(draft.key);
    const problem = textProblem(draft, index);
    if (problem) return fail(problem);
    const positions = readPositions(draft.positions);
    if (!positions.ok) return fail(positions.message);
    stops.push({
      ...draft,
      heading: draft.heading.trim(),
      note: draft.note.trim(),
      emphasis: draft.emphasis?.trim() || null,
      selected: draft.selected.trim(),
      onScreen: draft.onScreen.trim(),
      path: draft.path.trim(),
      alt: draft.alt.trim(),
      positions: positions.positions,
    });
  }
  const checked = tourStopsSchema.safeParse(stops);
  return checked.success ? {ok: true, stops: checked.data} : {ok: false, message: UNREADABLE};
};
