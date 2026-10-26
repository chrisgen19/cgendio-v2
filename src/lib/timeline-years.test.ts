import {describe, expect, it} from 'vitest';
import {parseStartYear} from './timeline-years';

describe('parseStartYear', () => {
  it('reads a month and year start', () => {
    expect(parseStartYear('Jun 2025 - Now')).toBe(2025);
    expect(parseStartYear('Mar 2022 - Nov 2024')).toBe(2022);
  });

  it('inherits the end year when the start has none', () => {
    expect(parseStartYear('Feb - Jun 2025')).toBe(2025);
  });

  it('reads a bare year range', () => {
    expect(parseStartYear('2007 - 2018')).toBe(2007);
  });

  it('accepts en dash, em dash and "to" as separators', () => {
    expect(parseStartYear('Sep 2018 \u2013 May 2019')).toBe(2018);
    expect(parseStartYear('Feb\u2014Jun 2022')).toBe(2022);
    expect(parseStartYear('Jan to Mar 2020')).toBe(2020);
  });

  it('returns null without a year', () => {
    expect(parseStartYear('Earlier role')).toBeNull();
    expect(parseStartYear('')).toBeNull();
  });
});
