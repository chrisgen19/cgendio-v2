export type CountedValue = {
  /** Where the scroll-scrubbed counter starts: the smallest number with as many digits, so the width never changes */
  from: number;
  to: number;
  /** Shown as is after the counter, e.g. the '+' of '15+' */
  suffix: string;
};

/**
 * Splits a milestone value like '40+' into a counter range and a static suffix. The count starts at the smallest number
 * with the same digit count (10 for '40+', 1 for '6'), so it never shows a leading '0' or '0+'. Returns null for word
 * values such as 'CMS', which reveal instead of counting.
 */
export const parseCountedValue = (value: string): CountedValue | null => {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  if (!match) return null;
  const digits = match[1] ?? '';
  const to = Number(digits);
  return {from: Math.min(to, 10 ** (digits.length - 1)), to, suffix: match[2] ?? ''};
};
