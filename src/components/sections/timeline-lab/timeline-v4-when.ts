/** A point on the timeline: a year, plus a month (1 to 12) when the admin typed one. */
export type WhenPoint = {year: number; month: number | null};

/** A parsed `when` string. `end` is null for an open-ended role (Now, Present, Current, Today). */
export type WhenRange = {start: WhenPoint; end: WhenPoint | null};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const OPEN_ENDED = /^(now|present|current|today)$/i;
// A hyphen, an en dash, an em dash or the word "to" between the two ends
const SEPARATOR = /\s*(?:-|\u2013|\u2014|\bto\b)\s*/i;

/** Reads "Sep", "Sept." or "September" as 9; null for anything else. */
const parseMonth = (word: string): number | null => {
  const index = MONTHS.indexOf(word.slice(0, 3).toLowerCase());
  return index === -1 ? null : index + 1;
};

/** One end of a range: "2018", "Feb 2025" or a bare "Feb" (its year comes from the other end). */
const parsePart = (part: string): {year: number | null; month: number | null} | null => {
  const match = /^(?:([a-z]+)\.?\s+)?(\d{4})$/i.exec(part);
  if (match) {
    const month = match[1] ? parseMonth(match[1]) : null;
    if (match[1] && month === null) return null;
    return {year: Number(match[2]), month};
  }
  const monthOnly = /^([a-z]+)\.?$/i.exec(part);
  if (monthOnly?.[1]) {
    const month = parseMonth(monthOnly[1]);
    return month === null ? null : {year: null, month};
  }
  return null;
};

/**
 * Parses an admin-typed `when` such as "Jun 2025 - Now", "Feb - Jun 2025" or "2007 - 2018". A start without a year takes
 * the end year, and a bare year stays month-less. Returns null when the text doesn't read as a date range, so callers
 * can drop the derived visual and still show the text itself.
 */
export const parseWhen = (when: string): WhenRange | null => {
  const parts = when.trim().split(SEPARATOR);
  if (parts.length > 2 || !parts[0]) return null;
  const [first, second] = parts;
  const start = parsePart(first);
  if (!start) return null;
  if (second === undefined)
    return start.year === null ? null : {start: {year: start.year, month: start.month}, end: {year: start.year, month: start.month}};
  if (OPEN_ENDED.test(second)) return start.year === null ? null : {start: {year: start.year, month: start.month}, end: null};
  const end = parsePart(second);
  if (!end || end.year === null) return null;
  return {start: {year: start.year ?? end.year, month: start.month}, end: {year: end.year, month: end.month}};
};

/** The ruler label for where a role starts: "Sep 2018", or "2007" when no month was given. Null when `when` doesn't parse. */
export const startLabel = (when: string): string | null => {
  const range = parseWhen(when);
  if (!range) return null;
  const {year, month} = range.start;
  return month ? `${MONTH_LABELS[month - 1]} ${year}` : String(year);
};
