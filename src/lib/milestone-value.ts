export type CountedValue = {
  /** Where the scroll-scrubbed counter starts: the smallest number with as many digits, so the width never changes */
  from: number;
  to: number;
  /** Shown as is after the counter, e.g. the '+' of '15+' */
  suffix: string;
};

// Longer numbers aren't counted: they stay well inside safe integers and the range CSS integers and counters hold
const MAX_COUNTED_DIGITS = 9;

/**
 * Splits a milestone value like '40+' into a counter range and a static suffix. The count starts at the smallest number
 * with the same digit count (10 for '40+', 1 for '6'), so it never shows a leading '0' or '0+'. Returns null for word
 * values such as 'CMS', which reveal instead of counting, and for digits that wouldn't print back as typed (zero-padded
 * like '007+', or too long), so the word path keeps the admin's text exactly.
 */
export const parseCountedValue = (value: string): CountedValue | null => {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  if (!match) return null;
  const digits = match[1] ?? '';
  if (digits.length > MAX_COUNTED_DIGITS || (digits.length > 1 && digits.startsWith('0'))) return null;
  const to = Number(digits);
  return {from: Math.min(to, 10 ** (digits.length - 1)), to, suffix: match[2] ?? ''};
};
