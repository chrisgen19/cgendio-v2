import {describe, expect, it} from 'vitest';
import {stackPlaces, stackScope} from './work-stack';

// Client, personal, client, personal: every filter hides cards between the ones it shows
const projects = [{group: 'client'}, {group: 'personal'}, {group: 'client'}, {group: 'personal'}] as const;

describe('stackPlaces', () => {
  const places = stackPlaces(projects);

  it('names each card its own timeline', () => {
    expect(places.map((p) => p.own)).toEqual(['--work-c0', '--work-c1', '--work-c2', '--work-c3']);
  });

  it('counts the index among the cards each filter shows', () => {
    expect(places.map((p) => p.index.all)).toEqual([0, 1, 2, 3]);
    expect(places.map((p) => p.index.client)).toEqual([0, 0, 1, 0]);
    expect(places.map((p) => p.index.personal)).toEqual([0, 0, 0, 1]);
  });

  it('follows the next card the filter shows, skipping hidden ones', () => {
    expect(places.map((p) => p.next.all)).toEqual(['--work-c1', '--work-c2', '--work-c3', 'none']);
    expect(places.map((p) => p.next.client)).toEqual(['--work-c2', 'none', 'none', 'none']);
    expect(places.map((p) => p.next.personal)).toEqual(['none', '--work-c3', 'none', 'none']);
  });

  it('returns nothing for no projects', () => {
    expect(stackPlaces([])).toEqual([]);
  });
});

describe('stackScope', () => {
  it('lists every card timeline', () => {
    expect(stackScope(3)).toBe('--work-c0, --work-c1, --work-c2');
  });
});
