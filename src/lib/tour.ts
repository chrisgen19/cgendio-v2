import type {ProjectDetail, TourStop} from '@/server/content-schema';

/** A project shows The Walkthrough once any stop has a note. Otherwise it keeps the standard case study layout. */
export const hasTour = (stops: TourStop[]) => stops.some((stop) => stop.note.trim() !== '');

/**
 * Splits a tour into what the frame opens on and the notes beside it. `frames` lines up with the page: frames[0] is the
 * opening, frames[i + 1] is notes[i]. A first stop with no note is the opening only; otherwise the first stop is both.
 */
export const tourFrames = (stops: TourStop[]) => {
  const [first, ...rest] = stops;
  if (first.note.trim() === '') return {opening: first, notes: rest, frames: stops};
  return {opening: first, notes: stops, frames: [first, ...stops]};
};

/** Stops with the same pair of captures are one page in the frame: moving between them scrolls instead of changing page. */
export const captureKey = ({captures}: TourStop) => `${captures.desktop.url}|${captures.mobile.url}`;

/** The frame's pages in first-seen order, each with its stops. A stop that appears twice in `frames` counts once. */
export const captureGroups = (stops: TourStop[]) => {
  const groups = new Map<string, Map<string, TourStop>>();
  for (const stop of stops) {
    const key = captureKey(stop);
    const group = groups.get(key) ?? new Map<string, TourStop>();
    if (!group.has(stop.key)) group.set(stop.key, stop);
    groups.set(key, group);
  }
  return [...groups].map(([key, group]) => ({key, stops: [...group.values()]}));
};

/** The reasoning rows with text, in reading order. Empty and whitespace-only fields are left out. */
export const reasoningRows = ({decision, contribution, outcome}: Pick<ProjectDetail, 'decision' | 'contribution' | 'outcome'>) =>
  [
    {label: 'The decision', text: decision},
    {label: 'Our part', text: contribution},
    {label: 'The result', text: outcome},
  ].flatMap(({label, text}) => (text?.trim() ? [{label, text: text.trim()}] : []));

/**
 * One capture of one stop replaced, or emptied with null. Works from the current list, so uploads that overlap can't
 * restore each other's old values. A draft has the same captures as a stop, so this takes both.
 */
export const setStopCapture = <T extends Pick<TourStop, 'key' | 'captures'>>(
  stops: T[],
  key: string,
  device: keyof TourStop['captures'],
  image: TourStop['captures'][typeof device] | null,
): T[] => stops.map((stop) => (stop.key === key ? {...stop, captures: {...stop.captures, [device]: image ?? {url: '', width: 0, height: 0}}} : stop));
