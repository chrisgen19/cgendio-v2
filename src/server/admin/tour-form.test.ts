import {describe, expect, it} from 'vitest';
import type {TourStop} from '../content-schema';
import {parseTourField} from './tour-form';

const caps: TourStop['captures'] = {
  desktop: {url: 'https://cdn.example.com/home-desktop.webp', width: 1600, height: 2400},
  mobile: {url: 'https://cdn.example.com/home-mobile.webp', width: 390, height: 2800},
};
const positions: TourStop['positions'] = {
  desktop: {y: 750, box: {x: 118, y: 850, w: 1360, h: 715}},
  mobile: {y: 820, labelAt: 'inside', box: {x: 18, y: 868, w: 354, h: 255}},
};

const stop = (overrides: Partial<TourStop> = {}): TourStop => ({
  key: 'a',
  heading: 'Home page',
  note: 'A note about the home page',
  emphasis: 'home page',
  selected: 'Equipment categories',
  onScreen: 'Categories, with a tab across to brands',
  path: '/',
  alt: 'The home page',
  captures: caps,
  positions,
  ...overrides,
});

type Draft = Omit<TourStop, 'positions'> & {positions: string};

/** A stop as the admin form posts it: the positions are the text in the JSON field. */
const draft = (overrides: Partial<Draft> = {}): Draft => ({...stop(), positions: JSON.stringify(positions), ...overrides});

describe('parseTourField', () => {
  it('parses drafts, turning the positions text into data', () => {
    expect(parseTourField(JSON.stringify([draft()]))).toEqual({ok: true, stops: [stop()]});
  });

  it('accepts an empty tour', () => {
    expect(parseTourField('[]')).toEqual({ok: true, stops: []});
  });

  it('accepts an opening stop with no note, no on screen line and no emphasis', () => {
    const result = parseTourField(JSON.stringify([draft({note: '', onScreen: '', emphasis: null}), draft({key: 'b'})]));
    expect(result.ok).toBe(true);
  });

  it('turns blank emphasis into null', () => {
    expect(parseTourField(JSON.stringify([draft({emphasis: ''})]))).toEqual({ok: true, stops: [stop({emphasis: null})]});
  });

  it.each<[Draft[], string]>([
    [[draft({positions: '{nope'})], 'Stop 1: positions are not valid JSON'],
    [[draft({positions: '{"desktop": {"y": 1}}'})], 'Stop 1: positions need desktop and mobile, each with y and box'],
    [
      [draft({positions: JSON.stringify({...positions, desktop: {y: -1, box: positions.desktop.box}})})],
      'Stop 1: positions need desktop and mobile, each with y and box',
    ],
    [[draft(), draft({key: 'b', captures: {...caps, desktop: {url: '', width: 0, height: 0}}})], 'Stop 2: the desktop capture is missing'],
    [[draft(), draft({key: 'b', captures: {...caps, mobile: {url: '', width: 0, height: 0}}})], 'Stop 2: the mobile capture is missing'],
    [[draft(), draft({key: 'b', note: ''})], 'Stop 2: only the first stop can have an empty note'],
    [[draft({path: '//evil.example'})], 'Stop 1: the page must be a path starting with a single / or a full https address'],
    [[draft({path: 'category'})], 'Stop 1: the page must be a path starting with a single / or a full https address'],
    [[draft({path: '/\\'})], 'Stop 1: the page must be a path starting with a single / or a full https address'],
    [[draft({path: '/\\evil.example'})], 'Stop 1: the page must be a path starting with a single / or a full https address'],
    [[draft({path: '/\t/evil.example'})], 'Stop 1: the page must be a path starting with a single / or a full https address'],
    [[draft({path: '/with space'})], 'Stop 1: the page must be a path starting with a single / or a full https address'],
    [[draft({emphasis: 'absent'})], 'Stop 1: the emphasis must be words from the note'],
    [[draft({heading: ''})], 'Stop 1: the heading is required'],
    [[draft({onScreen: ''})], 'Stop 1: the on screen line is required'],
    [[draft({selected: ' '})], 'Stop 1: the selected label is required'],
    [[draft({alt: ''})], 'Stop 1: the alt text is required'],
    [[draft({captures: {...caps, desktop: {url: 'javascript:alert(1)', width: 1, height: 1}}})], 'Stop 1: the desktop capture is missing'],
    [[draft({key: 'a'}), draft({key: 'a'})], 'Stop 2: duplicate stop key'],
  ])('rejects %j', (drafts, message) => {
    expect(parseTourField(JSON.stringify(drafts))).toEqual({ok: false, message});
  });

  it.each(['/', '/category/scissor-lift', '/a?b=c#d', '/caf%C3%A9', 'https://courses.example.com/'])('accepts the path %s', (path) => {
    expect(parseTourField(JSON.stringify([draft({path})])).ok).toBe(true);
  });

  it('rejects a field that is not a JSON array', () => {
    const message = 'The tour could not be read. Reload the page and try again.';
    expect(parseTourField('nope')).toEqual({ok: false, message});
    expect(parseTourField('{}')).toEqual({ok: false, message});
    expect(parseTourField('[1]')).toEqual({ok: false, message});
  });

  it('rejects more than 30 stops', () => {
    const drafts = Array.from({length: 31}, (_, index) => draft({key: `stop-${index}`}));
    expect(parseTourField(JSON.stringify(drafts))).toEqual({ok: false, message: 'A tour can have at most 30 stops'});
  });
});
