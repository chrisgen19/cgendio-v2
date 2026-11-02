import {describe, expect, it} from 'vitest';
import {type TourStop, tourStopSchema} from '@/server/content-schema';
import {captureGroups, captureKey, captureSizes, hasTour, reasoningRows, setStopCapture, tourFrames} from './tour';

const baseCaptures: TourStop['captures'] = {
  desktop: {url: 'https://cdn.example.com/home-desktop.webp', width: 1600, height: 2400},
  mobile: {url: 'https://cdn.example.com/home-mobile.webp', width: 390, height: 2800},
};
const otherCaptures: TourStop['captures'] = {
  desktop: {url: 'https://cdn.example.com/brand-desktop.webp', width: 1600, height: 2640},
  mobile: {url: 'https://cdn.example.com/brand-mobile.webp', width: 390, height: 6480},
};
const view = {y: 0, box: {x: 0, y: 0, w: 10, h: 10}};

const stop = (overrides: Partial<TourStop> = {}): TourStop => ({
  key: 'a',
  heading: 'Home page',
  note: 'A note',
  emphasis: null,
  selected: 'Banner',
  onScreen: 'A banner',
  path: '/',
  alt: 'The home page',
  captures: baseCaptures,
  positions: {desktop: view, mobile: view},
  ...overrides,
});

describe('tourStopSchema paths', () => {
  it.each([
    '//evil.example',
    '/\\',
    '/\\evil.example',
    '/\t/evil.example',
    'category',
  ])('refuses %j, so a hand-edited row fails instead of linking off-site', (path) => {
    expect(tourStopSchema.safeParse(stop({path})).success).toBe(false);
  });
});

describe('hasTour', () => {
  it('needs at least one stop with a note', () => {
    expect(hasTour([])).toBe(false);
    expect(hasTour([stop({note: '   '})])).toBe(false);
    expect(hasTour([stop({note: ''}), stop({key: 'b'})])).toBe(true);
  });
});

describe('tourFrames', () => {
  it('uses an empty-note first stop as the opening only', () => {
    const opening = stop({key: 'a', note: ''});
    const note = stop({key: 'b'});
    expect(tourFrames([opening, note])).toEqual({opening, notes: [note], frames: [opening, note]});
  });

  it('reuses the first stop as the opening when it has a note', () => {
    const first = stop({key: 'a'});
    expect(tourFrames([first])).toEqual({opening: first, notes: [first], frames: [first, first]});
  });
});

describe('captureGroups', () => {
  it('groups stops that share both captures, unique by key, in first-seen order', () => {
    const a = stop({key: 'a'});
    const b = stop({key: 'b', captures: otherCaptures});
    const c = stop({key: 'c'});
    expect(captureGroups([a, a, b, c]).map((group) => group.stops.map(({key}) => key))).toEqual([['a', 'c'], ['b']]);
  });

  it('splits on either capture differing', () => {
    expect(captureKey(stop())).not.toBe(captureKey(stop({captures: {...baseCaptures, mobile: otherCaptures.mobile}})));
  });
});

describe('captureSizes', () => {
  it('uses the frame width when a stop has no zoom', () => {
    expect(captureSizes('desktop', 1)).toBe('(min-width: 1080px) 62vw, 560px');
    expect(captureSizes('mobile', 1)).toBe('(min-width: 1080px) 340px, min(100vw, 560px)');
  });

  it('scales the width by the zoom, so a zoomed capture is not upscaled', () => {
    expect(captureSizes('desktop', 1.93)).toBe('(min-width: 1080px) calc(62vw * 1.93), calc(560px * 1.93)');
    expect(captureSizes('mobile', 2)).toBe('(min-width: 1080px) calc(340px * 2), calc(min(100vw, 560px) * 2)');
  });
});

describe('setStopCapture', () => {
  const image = {url: 'https://cdn.example.com/new.webp', width: 10, height: 20};

  it('keeps both captures when two uploads finish one after the other', () => {
    const stops = [stop({key: 'a'}), stop({key: 'b'})];
    const next = setStopCapture(setStopCapture(stops, 'a', 'mobile', otherCaptures.mobile), 'a', 'desktop', image);
    expect(next[0]?.captures).toEqual({desktop: image, mobile: otherCaptures.mobile});
    expect(next[1]).toBe(stops[1]);
  });

  it('empties a removed capture and leaves the other device alone', () => {
    const [first] = setStopCapture([stop()], 'a', 'desktop', null);
    expect(first?.captures).toEqual({desktop: {url: '', width: 0, height: 0}, mobile: baseCaptures.mobile});
  });
});

describe('reasoningRows', () => {
  it('drops empty and whitespace-only reasoning, keeping order and trimming', () => {
    expect(reasoningRows({decision: ' Why ', contribution: '   ', outcome: null})).toEqual([{label: 'The decision', text: 'Why'}]);
    expect(reasoningRows({decision: null, contribution: null, outcome: null})).toEqual([]);
  });

  it('keeps all three in reading order', () => {
    expect(reasoningRows({decision: 'A', contribution: 'B', outcome: 'C'}).map(({label}) => label)).toEqual([
      'The decision',
      'Our part',
      'The result',
    ]);
  });
});
