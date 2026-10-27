import {describe, expect, it} from 'vitest';
import {parseCountedValue} from './milestone-value';

describe('parseCountedValue', () => {
  it('starts a two-digit count at 10, so it never shows 0+', () => {
    expect(parseCountedValue('40+')).toEqual({from: 10, to: 40, suffix: '+'});
    expect(parseCountedValue('15+')).toEqual({from: 10, to: 15, suffix: '+'});
  });

  it('starts a one-digit count at 1', () => {
    expect(parseCountedValue('6')).toEqual({from: 1, to: 6, suffix: ''});
  });

  it('keeps longer suffixes and wider numbers', () => {
    expect(parseCountedValue('120k')).toEqual({from: 100, to: 120, suffix: 'k'});
  });

  it('never starts above the value', () => {
    expect(parseCountedValue('0')).toEqual({from: 0, to: 0, suffix: ''});
    expect(parseCountedValue('10+')).toEqual({from: 10, to: 10, suffix: '+'});
  });

  it('returns null for word values', () => {
    expect(parseCountedValue('CMS')).toBeNull();
    expect(parseCountedValue('VPS')).toBeNull();
  });
});
