// "Oct 2026": the canvas shows month and year only. Dates are stored as UTC days, so format them in UTC.
const MONTH_YEAR = new Intl.DateTimeFormat('en', {month: 'short', year: 'numeric', timeZone: 'UTC'});

/** "2026-10-01" → "Oct 2026" */
export const formatMonthYear = (isoDate: string) => MONTH_YEAR.format(new Date(isoDate));
