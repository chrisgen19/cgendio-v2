import {describe, expect, it} from 'vitest';
import {stackPlaces, stackScope} from './work-stack';

describe('stackPlaces', () => {
  const places = stackPlaces(3);

  it('names each card its own timeline', () => {
    expect(places.map((p) => p.own)).toEqual(['--work-c0', '--work-c1', '--work-c2']);
  });

  it('counts each card its index', () => {
    expect(places.map((p) => p.index)).toEqual([0, 1, 2]);
  });

  it('follows the next card, and none after the last', () => {
    expect(places.map((p) => p.next)).toEqual(['--work-c1', '--work-c2', 'none']);
  });

  it('returns nothing for no projects', () => {
    expect(stackPlaces(0)).toEqual([]);
  });
});

describe('stackScope', () => {
  it('lists every card timeline', () => {
    expect(stackScope(3)).toBe('--work-c0, --work-c1, --work-c2');
  });
});
