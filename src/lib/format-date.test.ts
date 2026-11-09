import {describe, expect, it} from 'vitest';
import {formatMonthYear, publishedDay} from './format-date';

describe('publishedDay', () => {
  it('counts midnight in Manila as the new day, not the UTC day before', () => {
    expect(publishedDay(new Date('2026-09-30T16:00:00.000Z'))).toBe('2026-10-01');
  });

  it('keeps the last moment before midnight in Manila on the old day', () => {
    expect(publishedDay(new Date('2026-09-30T15:59:59.999Z'))).toBe('2026-09-30');
  });

  it('leaves a day the admin stored at midnight UTC on that same day', () => {
    expect(publishedDay(new Date('2026-10-05T00:00:00.000Z'))).toBe('2026-10-05');
  });

  it('gives the page the month the previous site showed', () => {
    expect(formatMonthYear(publishedDay(new Date('2026-09-30T16:00:00.000Z')))).toBe('Oct 2026');
  });
});
