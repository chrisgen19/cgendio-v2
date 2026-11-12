import {runInNewContext} from 'node:vm';
import {describe, expect, it} from 'vitest';
import {INTERNAL_COOKIE} from './analytics';
import {isUntrackedPath} from './analytics-paths';
import {clarityScript, stopClarityOn} from './clarity';

const ID = 'zc88qmno9y';

/** Runs the loader against a fake browser: what it queued for clarity.js and which script tag it inserted, if any. */
const run = ({pathname = '/', cookie = ''}: {pathname?: string; cookie?: string} = {}) => {
  const inserted: Array<{src?: string; async?: number}> = [];
  const firstScript = {parentNode: {insertBefore: (tag: {src?: string}) => inserted.push(tag)}};
  const document = {cookie, createElement: () => ({}), getElementsByTagName: () => [firstScript]};
  const window: Record<string, unknown> = {};
  runInNewContext(clarityScript(ID), {window, document, location: {pathname}});
  const queue = (window.clarity as {q?: IArguments[]} | undefined)?.q ?? [];
  return {inserted, queued: queue.map((entry) => Array.from(entry))};
};

describe('clarityScript', () => {
  it("loads the project's tag on a public page", () => {
    expect(run().inserted).toEqual([{async: 1, src: `https://www.clarity.ms/tag/${ID}`}]);
  });

  it('denies both storage types, so Clarity runs without cookies', () => {
    expect(run().queued).toEqual([['consentv2', {ad_Storage: 'denied', analytics_Storage: 'denied'}]]);
  });

  it.each(['/admin', '/admin/posts', '/sign-in', '/preview/post/x'])('loads nothing on %s', (pathname) => {
    expect(run({pathname})).toEqual({inserted: [], queued: []});
  });

  it("loads nothing in the owner's browser", () => {
    expect(run({cookie: `theme=dark; ${INTERNAL_COOKIE}=1`})).toEqual({inserted: [], queued: []});
  });

  it('does not match a cookie whose name only ends the same way', () => {
    expect(run({cookie: `x${INTERNAL_COOKIE}=1`}).inserted).toHaveLength(1);
  });
});

describe('stopClarityOn', () => {
  const withClarity = (clarity: unknown) => {
    const previous = (globalThis as {window?: unknown}).window;
    (globalThis as {window?: unknown}).window = {clarity};
    return () => {
      (globalThis as {window?: unknown}).window = previous;
    };
  };

  it('stops Clarity on an untracked page', () => {
    const calls: unknown[][] = [];
    const restore = withClarity((...args: unknown[]) => calls.push(args));
    stopClarityOn('/preview/post/x', isUntrackedPath);
    restore();
    expect(calls).toEqual([['stop']]);
  });

  it('leaves it running on a public page', () => {
    const calls: unknown[][] = [];
    const restore = withClarity((...args: unknown[]) => calls.push(args));
    stopClarityOn('/writing', isUntrackedPath);
    restore();
    expect(calls).toEqual([]);
  });

  it('does nothing where Clarity never started', () => {
    const restore = withClarity(undefined);
    expect(() => stopClarityOn('/admin', isUntrackedPath)).not.toThrow();
    restore();
  });
});
