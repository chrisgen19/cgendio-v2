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
    {label: 'My part', text: contribution},
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

const FRAME_WIDTHS = {
  desktop: {wide: '62vw', narrow: '560px'},
  // The phone's width under 1080px, --phone-w in globals.css
  mobile: {wide: '340px', narrow: 'clamp(200px, 56vw, 250px)'},
} as const;

/** The image `sizes` for a capture. A zoomed stop renders wider than its frame, so it needs a larger file to stay sharp. */
export const captureSizes = (device: keyof typeof FRAME_WIDTHS, zoom: number) => {
  const scaled = (width: string) => (zoom === 1 ? width : `calc(${width} * ${zoom})`);
  const {wide, narrow} = FRAME_WIDTHS[device];
  return `(min-width: 1080px) ${scaled(wide)}, ${scaled(narrow)}`;
};

const isFullAddress = (path: string) => path.startsWith('https://');

/**
 * Where a stop's page links to, or null for no link. A path joins the live site; a full address must be on its domain or a
 * subdomain. The admin refuses any other address on save, and this keeps a row edited by hand from linking off-site.
 */
export const tourHref = (path: string, liveUrl: string | null) => {
  if (!liveUrl) return null;
  const url = new URL(path, liveUrl);
  if (!isFullAddress(path)) return url.toString();
  const site = new URL(liveUrl).hostname.replace(/^www\./, '');
  return url.hostname === site || url.hostname.endsWith(`.${site}`) ? url.toString() : null;
};

/** What the address bar shows. The home page reads as the bare host; with no live site a path shows alone. A full address shows its own host. */
export const tourAddress = (path: string, liveHost: string | null): {host: string | null; path: string} => {
  if (isFullAddress(path)) {
    const url = new URL(path);
    const rest = `${url.pathname}${url.search}`;
    return {host: url.host, path: rest === '/' ? '' : rest};
  }
  return {host: liveHost, path: path === '/' && liveHost ? '' : path};
};
