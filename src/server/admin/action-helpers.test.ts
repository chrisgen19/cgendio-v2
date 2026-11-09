import {describe, expect, it} from 'vitest';
import {isUniqueViolation, readMinutesFor, resolvePublishedAt} from './action-helpers';

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

describe('resolvePublishedAt', () => {
  const stored = new Date('2026-10-05T14:30:00.000Z');

  /*
   * The form's date input holds a day and no time, and it is pre-filled from the stored timestamp. Re-saving an
   * unrelated field must not push the post back to midnight: that would change its RSS pubDate and reorder it against
   * other posts from the same day.
   */
  it('keeps the stored time when the submitted day is the day it already has', () => {
    expect(resolvePublishedAt({day: '2026-10-05', stored, isPublished: true})).toBe(stored);
  });

  it('keeps a post stamped at midnight Manila when the form submits the Manila day it shows', () => {
    const midnightManila = new Date('2026-09-30T16:00:00.000Z');
    expect(resolvePublishedAt({day: '2026-10-01', stored: midnightManila, isPublished: true})).toBe(midnightManila);
  });

  it('takes a different day as a real change and starts it at midnight UTC', () => {
    expect(resolvePublishedAt({day: '2026-10-06', stored, isPublished: true})?.toISOString()).toBe('2026-10-06T00:00:00.000Z');
  });

  it('starts at midnight UTC when there is nothing stored yet', () => {
    expect(resolvePublishedAt({day: '2026-10-05', stored: null, isPublished: true})?.toISOString()).toBe('2026-10-05T00:00:00.000Z');
  });

  it('stamps now when a post is published for the first time with no day given', () => {
    const now = new Date('2026-11-06T09:15:00.000Z');
    expect(resolvePublishedAt({day: null, stored: null, isPublished: true, now})).toBe(now);
  });

  it('leaves a published post alone when no day is given', () => {
    expect(resolvePublishedAt({day: null, stored, isPublished: true})).toBe(stored);
  });

  it('leaves a draft unpublished when no day is given', () => {
    expect(resolvePublishedAt({day: null, stored: null, isPublished: false})).toBeNull();
  });

  it('keeps a draft its old date rather than stamping it', () => {
    expect(resolvePublishedAt({day: null, stored, isPublished: false})).toBe(stored);
  });
});
