import {runInNewContext} from 'node:vm';
import {describe, expect, it} from 'vitest';
import {crossesTrackingBoundary, gaOptOutScript, isUntrackedPath} from './analytics-paths';

describe('isUntrackedPath', () => {
  it.each(['/admin', '/admin/', '/admin/projects/abc', '/preview/post/a-draft', '/sign-in', '/sign-in/'])('%s is untracked', (path) => {
    expect(isUntrackedPath(path)).toBe(true);
  });

  it.each([
    '/',
    '/writing',
    '/writing/a-post',
    '/projects/access-hire',
    '/contact',
    '/administrator',
    '/previews',
    '/sign-inside',
  ])('%s is tracked', (path) => {
    expect(isUntrackedPath(path)).toBe(false);
  });
});

describe('gaOptOutScript', () => {
  const ID = 'G-TEST000000';
  const KEY = `ga-disable-${ID}`;

  /** Runs the script against a fake window and location, as the browser would, and returns both to inspect. */
  const run = (pathname: string, setUp?: (window: Record<string, unknown>) => void) => {
    const window: Record<string, unknown> = {};
    const location = {pathname};
    setUp?.(window);
    runInNewContext(gaOptOutScript(ID), {window, location});
    return {window, location};
  };

  it('reports an opt-out only while an untracked page is showing', () => {
    const {window, location} = run('/writing');
    expect(window[KEY]).toBe(false);
    for (const path of ['/preview/post/x', '/admin', '/sign-in']) {
      location.pathname = path;
      expect(window[KEY]).toBe(true);
    }
    location.pathname = '/contact';
    expect(window[KEY]).toBe(false);
  });

  it('keeps an opt-out that was already set', () => {
    const {window} = run('/writing', (w) => {
      w[KEY] = true;
    });
    expect(window[KEY]).toBe(true);
  });

  it('still lets a later script opt the visit out, and back in', () => {
    const {window, location} = run('/writing');
    window[KEY] = true;
    expect(window[KEY]).toBe(true);
    window[KEY] = false;
    expect(window[KEY]).toBe(false);
    location.pathname = '/preview/post/x';
    expect(window[KEY]).toBe(true);
  });

  it('leaves a flag that another script already controls alone', () => {
    const {window} = run('/preview/post/x', (w) => {
      Object.defineProperty(w, KEY, {configurable: true, get: () => 'theirs'});
    });
    expect(window[KEY]).toBe('theirs');
  });

  it('does not throw when the flag cannot be redefined', () => {
    expect(() =>
      run('/writing', (w) => {
        Object.defineProperty(w, KEY, {configurable: false, writable: false, value: true});
      }),
    ).not.toThrow();
  });
});

describe('crossesTrackingBoundary', () => {
  const PREVIEW = 'https://cgdiomampo.dev/preview/post/a-draft?expires=1&signature=abc';

  it.each([
    [PREVIEW, '/writing'],
    [PREVIEW, 'https://cgdiomampo.dev/'],
    ['https://cgdiomampo.dev/writing', '/preview/post/a-draft'],
    ['https://cgdiomampo.dev/', '/sign-in'],
    ['https://cgdiomampo.dev/admin/posts', '/writing/a-post'],
  ])('%s to %s is a full page load', (from, to) => {
    expect(crossesTrackingBoundary({from, to})).toBe(true);
  });

  it.each([
    ['https://cgdiomampo.dev/', '/writing'],
    ['https://cgdiomampo.dev/writing', '/writing/a-post#intro'],
    ['https://cgdiomampo.dev/admin', '/admin/posts'],
    ['https://cgdiomampo.dev/sign-in', '/admin'],
    [PREVIEW, '#section'],
  ])('%s to %s stays client-side', (from, to) => {
    expect(crossesTrackingBoundary({from, to})).toBe(false);
  });

  it('leaves other origins to the browser', () => {
    expect(crossesTrackingBoundary({from: PREVIEW, to: 'https://example.com/writing'})).toBe(false);
  });

  it('leaves new tabs, windows and downloads alone', () => {
    expect(crossesTrackingBoundary({from: PREVIEW, to: '/writing', target: '_blank'})).toBe(false);
    expect(crossesTrackingBoundary({from: PREVIEW, to: '/writing', modified: true})).toBe(false);
    expect(crossesTrackingBoundary({from: PREVIEW, to: '/writing', download: true})).toBe(false);
  });

  it('treats an explicit _self target as the same tab', () => {
    expect(crossesTrackingBoundary({from: PREVIEW, to: '/writing', target: '_self'})).toBe(true);
  });
});
