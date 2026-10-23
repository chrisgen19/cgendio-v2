import {describe, expect, it} from 'vitest';
import {isUniqueViolation, readMinutesFor} from './action-helpers';

const words = (count: number) => Array.from({length: count}, (_, i) => `word${i}`).join(' ');

describe('readMinutesFor', () => {
  it('is at least one minute, even for an empty body', () => {
    expect(readMinutesFor('')).toBe(1);
    expect(readMinutesFor('   \n\t ')).toBe(1);
  });

  it('counts about 200 words a minute, rounding up', () => {
    expect(readMinutesFor(words(200))).toBe(1);
    expect(readMinutesFor(words(201))).toBe(2);
    expect(readMinutesFor(words(1000))).toBe(5);
  });

  it('ignores runs of whitespace and newlines between words', () => {
    expect(readMinutesFor(`  one\n\ntwo\t\tthree   `)).toBe(1);
    expect(readMinutesFor(words(400).replace(/ /g, '\n\n'))).toBe(2);
  });
});

describe('isUniqueViolation', () => {
  it('matches Prisma P2002 errors only', () => {
    expect(isUniqueViolation({code: 'P2002'})).toBe(true);
    expect(isUniqueViolation({code: 'P2025'})).toBe(false);
    expect(isUniqueViolation(new Error('P2002'))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation('P2002')).toBe(false);
  });
});
