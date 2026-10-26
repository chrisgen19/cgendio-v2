import {describe, expect, it} from 'vitest';
import {parseWhen, startLabel} from './timeline-v4-when';

describe('parseWhen', () => {
  it('reads an open-ended role', () => {
    expect(parseWhen('Jun 2025 - Now')).toEqual({start: {year: 2025, month: 6}, end: null});
    expect(parseWhen('Jun 2025 to Present')).toEqual({start: {year: 2025, month: 6}, end: null});
  });

  it('gives a month-only start the end year', () => {
    expect(parseWhen('Feb - Jun 2025')).toEqual({start: {year: 2025, month: 2}, end: {year: 2025, month: 6}});
  });

  it('reads bare years and other dashes', () => {
    expect(parseWhen('2007 - 2018')).toEqual({start: {year: 2007, month: null}, end: {year: 2018, month: null}});
    expect(parseWhen('Sept. 2018 \u2013 May 2019')).toEqual({start: {year: 2018, month: 9}, end: {year: 2019, month: 5}});
    expect(parseWhen('2019\u20142022')).toEqual({start: {year: 2019, month: null}, end: {year: 2022, month: null}});
  });

  it('returns null for text it cannot read', () => {
    expect(parseWhen('[START] - 2018')).toBeNull();
    expect(parseWhen('Feb - Now')).toBeNull();
    expect(parseWhen('')).toBeNull();
  });
});

describe('startLabel', () => {
  it('labels the start of each role', () => {
    expect(startLabel('Sep 2018 - May 2019')).toBe('Sep 2018');
    expect(startLabel('2007 - 2018')).toBe('2007');
    expect(startLabel('Feb - Jun 2025')).toBe('Feb 2025');
    expect(startLabel('[YEAR]')).toBeNull();
  });
});
