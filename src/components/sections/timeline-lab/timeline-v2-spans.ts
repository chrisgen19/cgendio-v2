/**
 * Turns the timeline's free-text `when` field ("Jun 2025 - Now", "Feb - Jun 2025", "2007 - 2018") into month spans for
 * the career span chart. Pure and unit-tested: admins can type anything, so every function returns null instead of
 * guessing, and the chart then lists that role without a bar. The visible date is always `when` itself.
 *
 * Months are counted as `year * 12 + monthIndex` (Jan = 0). A span's `end` is exclusive: "2007 - 2018" runs from Jan
 * 2007 up to (not including) Jan 2019.
 */

export type MonthSpan = {
  /** First month of the role */
  start: number;
  /** The month after the last one (exclusive) */
  end: number;
  /** True when `when` ends in Now, Present, Current or Today */
  open: boolean;
};

type MonthPoint = {year: number | null; month: number | null};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const OPEN_WORDS = new Set(['now', 'present', 'current', 'today']);

// Hyphen, the Unicode dashes (U+2010 to U+2015), minus sign or the word "to", with any spacing around them
const SEPARATOR = /\s*(?:[-\u2010-\u2015\u2212]|\bto\b)\s*/i;

/** Parses "Jun 2025", "June 2025", "Jun", "2025" or "06/2025" into a month and year (either may be missing). */
const parsePoint = (raw: string): MonthPoint | null => {
  const text = raw.trim().toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ');
  if (!text) return null;
  const numeric = /^(\d{1,2})\s*\/\s*(\d{4})$/.exec(text);
  if (numeric) {
    const month = Number(numeric[1]) - 1;
    return month >= 0 && month < 12 ? {year: Number(numeric[2]), month} : null;
  }
  let year: number | null = null;
  let month: number | null = null;
  for (const word of text.split(' ')) {
    if (/^\d{4}$/.test(word)) {
      if (year !== null) return null;
      year = Number(word);
    } else if (/^[a-z]{3,9}$/.test(word)) {
      const index = MONTHS.indexOf(word.slice(0, 3));
      if (index === -1 || month !== null) return null;
      month = index;
    } else {
      return null;
    }
  }
  return year === null && month === null ? null : {year, month};
};

/**
 * Parses a `when` string into a month span. `nowMonth` is the current month (same counting) and closes open-ended
 * roles. Returns null when the text doesn't parse or the dates run backwards.
 */
export const parseWhen = (when: string, nowMonth: number): MonthSpan | null => {
  const parts = when.trim().split(SEPARATOR).filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return null;

  const startPoint = parsePoint(parts[0] ?? '');
  if (!startPoint) return null;

  const endText = (parts[1] ?? parts[0] ?? '').trim().toLowerCase();
  const open = parts.length === 2 && OPEN_WORDS.has(endText);
  const endPoint = open ? null : parsePoint(endText);
  if (!open && !endPoint) return null;

  let end: number;
  if (open) {
    end = nowMonth + 1;
  } else {
    // A bare end year runs to December
    if (!endPoint || endPoint.year === null) return null;
    end = endPoint.year * 12 + (endPoint.month ?? 11) + 1;
  }

  // A start without a year takes the end's year ("Feb - Jun 2025"), or the year before if its month comes later
  let startYear = startPoint.year;
  if (startYear === null) {
    if (open || !endPoint?.year) return null;
    startYear = endPoint.year;
    if ((startPoint.month ?? 0) > (endPoint.month ?? 11)) startYear -= 1;
  }
  const start = startYear * 12 + (startPoint.month ?? 0);

  return end > start ? {start, end, open} : null;
};

/** The month count for a date, in the same counting as `parseWhen`. */
export const monthOf = (date: Date): number => date.getUTCFullYear() * 12 + date.getUTCMonth();

/** Where a role's bar sits on the chart, as fractions of the axis (0 = the first January, 1 = now). */
export type BarPlacement = {
  /** Left edge */
  s: number;
  /** Width */
  w: number;
  open: boolean;
  /** Which side of the bar its `when` label goes: after the end, before the start, or on the bar when neither fits */
  side: 'end' | 'start' | 'inside';
};

export type AxisTick = {
  year: number;
  /** Position of January of `year` on the axis */
  frac: number;
  /** Whether the year gets a printed label (the first year and every fifth) */
  labelled: boolean;
  /** Labels this close to NOW get dropped where the axis is narrow */
  nearEnd: boolean;
};

export type SpanChart = {
  placements: (BarPlacement | null)[];
  ticks: AxisTick[];
  firstYear: number;
};

// Past this fraction the label goes before the bar, so it never runs off the right edge
const END_LABEL_LIMIT = 0.72;
const START_LABEL_MIN = 0.28;
const NEAR_END = 0.12;

/**
 * Lays out the chart: the axis runs from January of the earliest parsed start to the end of `nowMonth`, and each
 * entry gets a placement (null when its `when` doesn't parse). With nothing parseable the axis covers the last 10 years.
 */
export const buildSpanChart = (whens: string[], nowMonth: number): SpanChart => {
  const spans = whens.map((when) => parseWhen(when, nowMonth));
  const starts = spans.flatMap((span) => (span ? [span.start] : []));
  const firstYear = starts.length ? Math.floor(Math.min(...starts) / 12) : Math.floor(nowMonth / 12) - 10;
  const axisStart = firstYear * 12;
  // The axis always ends at NOW; a role typed with a future end is cut there
  const axisEnd = nowMonth + 1;
  const total = axisEnd - axisStart;

  const placements = spans.map((span): BarPlacement | null => {
    if (!span || span.start >= axisEnd) return null;
    const s = (span.start - axisStart) / total;
    const w = (Math.min(span.end, axisEnd) - span.start) / total;
    const side = s + w <= END_LABEL_LIMIT ? 'end' : s >= START_LABEL_MIN ? 'start' : 'inside';
    return {s, w, open: span.open, side};
  });

  const ticks: AxisTick[] = [];
  for (let year = firstYear; year * 12 < axisEnd; year++) {
    const frac = (year * 12 - axisStart) / total;
    const labelled = year === firstYear || (year % 5 === 0 && year - firstYear >= 3);
    ticks.push({year, frac, labelled, nearEnd: 1 - frac < NEAR_END});
  }

  return {placements, ticks, firstYear};
};
