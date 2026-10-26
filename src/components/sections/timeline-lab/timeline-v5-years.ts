// A hyphen, an en dash (U+2013), an em dash (U+2014) or the word 'to', with or without spaces around the dashes
const SEPARATOR = /\s*[-\u2013\u2014]\s*|\s+to\s+/i;
const YEAR = /\b(19|20)\d{2}\b/;

/**
 * The start year of a range like 'Jun 2025 - Now', 'Feb - Jun 2025' or '2007 - 2018', parsed from the free-text `when`.
 * A start without a year inherits the end's year ('Feb - Jun 2025' starts in 2025). Returns null when no year can be
 * found, so the counter fades out instead of rolling. Drives the Year counter's visuals only: `when` stays the visible date.
 */
export const parseStartYear = (when: string): number | null => {
  const [start = '', end = ''] = when.trim().split(SEPARATOR);
  const year = YEAR.exec(start)?.[0] ?? YEAR.exec(end)?.[0];
  return year ? Number(year) : null;
};
