import type {Page} from '@playwright/test';

/** What the page queued for gtag.js: each entry is one gtag(...) call's arguments. */
type GtagCall = [string, ...unknown[]];

/**
 * Serves an empty gtag.js, so tests never call Google and the queue stays readable: the real library would drain
 * window.dataLayer and send beacons. Our inline config script still defines gtag and queues every call.
 */
export const stubGtag = (page: Page) =>
  page.route('https://www.googletagmanager.com/gtag/js**', (route) => route.fulfill({contentType: 'application/javascript', body: ''}));

/** Waits for the lazily loaded config script to define gtag, after which events can be recorded. */
export const waitForGtag = (page: Page) => page.waitForFunction(() => typeof (window as {gtag?: unknown}).gtag === 'function');

/** Every queued gtag call with this command (`config`, `event`), in order. */
export const gtagCalls = (page: Page, command: string) =>
  page.evaluate(
    (wanted) =>
      ((window as {dataLayer?: IArguments[]}).dataLayer ?? []).map((entry) => Array.from(entry) as GtagCall).filter(([name]) => name === wanted),
    command,
  );

/** The params of every queued event with this name. */
export const gaEvents = async (page: Page, name: string) =>
  (await gtagCalls(page, 'event')).filter(([, eventName]) => eventName === name).map(([, , params]) => params);
