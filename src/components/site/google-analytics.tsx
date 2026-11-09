import {analyticsEnv} from '@/lib/env';
import {GoogleAnalyticsLoader} from './google-analytics-loader';

/**
 * Google Analytics 4 through gtag.js, only when GA_MEASUREMENT_ID is set (ported from the previous site, #81).
 *
 * Mounted by the public chrome rather than the root layout, so /admin, /sign-in and draft previews are never tracked:
 * the root layout wraps those too. Client-side navigations are counted by GA's enhanced measurement, which listens for
 * history changes, not here. next/script keys both scripts by id or src, so moving between pages loads them once.
 * The id is read here, on the server, and the loader waits for the visitor's first interaction before adding the tag.
 */
export function GoogleAnalytics() {
  const id = analyticsEnv().GA_MEASUREMENT_ID;
  if (!id) return null;
  return <GoogleAnalyticsLoader id={id} />;
}
