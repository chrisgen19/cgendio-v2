// "Oct 2026": the canvas shows month and year only. A post's day is a plain YYYY-MM-DD string, so format it in UTC.
const MONTH_YEAR = new Intl.DateTimeFormat('en', {month: 'short', year: 'numeric', timeZone: 'UTC'});

/** "2026-10-01" → "Oct 2026" */
export const formatMonthYear = (isoDate: string) => MONTH_YEAR.format(new Date(isoDate));

const PUBLISHED_DAY = new Intl.DateTimeFormat('en', {year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Manila'});

/**
 * The day a post was published, in Manila, where it is written. The previous site's posts are stamped at midnight
 * Manila, which is 16:00 UTC the day before, so the UTC date would show them a day early (#81 Phase D).
 *
 * 2026-09-30T16:00:00Z → "2026-10-01"
 */
export const publishedDay = (date: Date) => {
  // From the parts, because a locale's written order can change with the ICU data and the schema needs YYYY-MM-DD
  const parts = Object.fromEntries(PUBLISHED_DAY.formatToParts(date).map(({type, value}) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};
