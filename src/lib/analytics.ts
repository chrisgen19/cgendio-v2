import {gaOptOutScript} from './analytics-paths';

type Params = Record<string, string>;
type Gtag = (command: 'event', name: string, params: Params) => void;

/**
 * Sends a GA4 event through gtag.js. Does nothing on the server, before the tag has loaded (it loads lazily, so a very
 * early click goes uncounted) or where it never loads: the admin, draft previews and builds without GA_MEASUREMENT_ID.
 * Never pass what a visitor typed: GA's terms forbid personal data in events.
 */
export const track = (name: string, params: Params = {}) => {
  const gtag = (globalThis as {window?: {gtag?: Gtag}}).window?.gtag;
  if (typeof gtag === 'function') gtag('event', name, params);
};

/**
 * The params of a `data-track` element, from its other `data-track-*` attributes: `data-track-form-topic="WordPress"`
 * arrives in the dataset as `trackFormTopic` and leaves as `form_topic`. Empty attributes are dropped.
 */
export const trackParams = (dataset: Record<string, string | undefined>): Params =>
  Object.fromEntries(
    Object.entries(dataset)
      .filter((entry): entry is [string, string] => /^track[A-Z]/.test(entry[0]) && Boolean(entry[1]))
      .map(([key, value]) => [
        key
          .slice(5)
          .replace(/^[A-Z]/, (c) => c.toLowerCase())
          .replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
        value,
      ]),
  );

/** Marks this browser as the site owner's, so GA tags its hits as internal traffic. Set by the admin, never cleared. */
export const INTERNAL_COOKIE = 'cg_internal';

const YEAR_SECONDS = 60 * 60 * 24 * 365;

/** The `document.cookie` string that sets the internal-traffic cookie. It holds no secret, so scripts may read it. */
export const internalCookie = (secure: boolean) => `${INTERNAL_COOKIE}=1; Path=/; Max-Age=${YEAR_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`;

/** Sets the internal-traffic cookie for a year (refreshed on each admin visit). */
export const markInternal = () => {
  // biome-ignore lint/suspicious/noDocumentCookie: a plain cookie the inline GA config script reads before gtag.js loads
  document.cookie = internalCookie(location.protocol === 'https:');
};

/** Matches the internal-traffic cookie in `document.cookie`. A string, because the inline GA and Clarity scripts embed it. */
export const INTERNAL_PATTERN = `(?:^|;\\s*)${INTERNAL_COOKIE}=1(?:;|$)`;

/**
 * The inline script that sets up gtag before gtag.js arrives: the opt-out for untracked pages, the dataLayer queue and
 * the config call. With the internal-traffic cookie present, every hit carries `traffic_type: 'internal'`, which the
 * property's Internal Traffic data filter excludes. gtag is assigned to window explicitly so `track` can find it.
 */
export const gaConfigScript = (measurementId: string) =>
  `${gaOptOutScript(measurementId)}var w=window;w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments)};` +
  `w.gtag('js',new Date());w.gtag('config',${JSON.stringify(measurementId)},new RegExp(${JSON.stringify(INTERNAL_PATTERN)}).test(document.cookie)?{traffic_type:'internal'}:{});`;
