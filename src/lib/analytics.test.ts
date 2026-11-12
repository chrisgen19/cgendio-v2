import {runInNewContext} from 'node:vm';
import {afterEach, describe, expect, it} from 'vitest';
import {gaConfigScript, INTERNAL_COOKIE, internalCookie, track, trackParams} from './analytics';

const ID = 'G-TEST000000';

describe('track', () => {
  const global = globalThis as {window?: unknown};

  afterEach(() => {
    delete global.window;
  });

  it('sends the event through gtag once the tag has loaded', () => {
    const calls: unknown[][] = [];
    global.window = {gtag: (...args: unknown[]) => calls.push(args)};
    track('generate_lead', {form_topic: 'Next.js & React'});
    expect(calls).toEqual([['event', 'generate_lead', {form_topic: 'Next.js & React'}]]);
  });

  it('sends no params object when there are none', () => {
    const calls: unknown[][] = [];
    global.window = {gtag: (...args: unknown[]) => calls.push(args)};
    track('cv_download');
    expect(calls).toEqual([['event', 'cv_download', {}]]);
  });

  it('does nothing before gtag has loaded', () => {
    global.window = {};
    expect(() => track('cv_download')).not.toThrow();
  });

  it('sends the event to Clarity too, with each param as a tag set before it', () => {
    const calls: unknown[][] = [];
    global.window = {clarity: (...args: unknown[]) => calls.push(args)};
    track('generate_lead', {form_topic: 'NEXTJS'});
    expect(calls).toEqual([
      ['set', 'form_topic', 'NEXTJS'],
      ['event', 'generate_lead'],
    ]);
  });

  it('sends to both when both tags are on the page', () => {
    const gtag: unknown[][] = [];
    const clarity: unknown[][] = [];
    global.window = {gtag: (...args: unknown[]) => gtag.push(args), clarity: (...args: unknown[]) => clarity.push(args)};
    track('cv_download');
    expect(gtag).toEqual([['event', 'cv_download', {}]]);
    expect(clarity).toEqual([['event', 'cv_download']]);
  });

  it('does nothing on the server', () => {
    expect(() => track('cv_download')).not.toThrow();
  });
});

describe('trackParams', () => {
  it('turns data-track-* attributes into snake_case params', () => {
    expect(trackParams({track: 'contact_email', trackMethod: 'mailto', trackFormTopic: 'WordPress'})).toEqual({
      method: 'mailto',
      form_topic: 'WordPress',
    });
  });

  it('ignores other data attributes and empty values', () => {
    expect(trackParams({track: 'cv_download', state: 'open', trackMethod: undefined})).toEqual({});
  });
});

describe('internalCookie', () => {
  it('lasts a year on the whole site and is Secure on https', () => {
    expect(internalCookie(true)).toBe(`${INTERNAL_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
  });

  it('drops Secure on http, so local builds can still set it', () => {
    expect(internalCookie(false)).toBe(`${INTERNAL_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax`);
  });
});

describe('gaConfigScript', () => {
  /** Runs the config script against a fake browser and returns what it queued for gtag.js. */
  const run = (cookie: string) => {
    const window: Record<string, unknown> = {};
    const context = {window, location: {pathname: '/'}, document: {cookie}};
    runInNewContext(gaConfigScript(ID), context);
    return (window.dataLayer as IArguments[]).map((entry) => Array.from(entry));
  };

  it('configures the measurement id with no traffic type for a visitor', () => {
    expect(run('theme=dark').find(([command]) => command === 'config')).toEqual(['config', ID, {}]);
  });

  it('marks the traffic internal when the admin cookie is there', () => {
    expect(run(`theme=dark; ${INTERNAL_COOKIE}=1`).find(([command]) => command === 'config')).toEqual(['config', ID, {traffic_type: 'internal'}]);
  });

  it('does not match a cookie whose name only ends the same way', () => {
    expect(run(`x${INTERNAL_COOKIE}=1`).find(([command]) => command === 'config')).toEqual(['config', ID, {}]);
  });

  it('still installs the opt-out for untracked pages', () => {
    const window: Record<string, unknown> = {};
    const location = {pathname: '/admin'};
    runInNewContext(gaConfigScript(ID), {window, location, document: {cookie: ''}});
    expect(window[`ga-disable-${ID}`]).toBe(true);
  });
});
