import Script from 'next/script';
import {analyticsEnv} from '@/lib/env';

/**
 * Google Analytics 4 through gtag.js, only when GA_MEASUREMENT_ID is set (ported from the previous site, #81).
 *
 * Mounted by the public chrome rather than the root layout, so /admin, /sign-in and draft previews are never tracked:
 * the root layout wraps those too. Client-side navigations are counted by GA's enhanced measurement, which listens for
 * history changes, not here. next/script keys both scripts by id or src, so moving between pages loads them once.
 */
export function GoogleAnalytics() {
  const id = analyticsEnv().GA_MEASUREMENT_ID;
  if (!id) return null;
  return (
    <>
      {/* lazyOnload: gtag.js waits for the page's load event and an idle moment, so it stays out of hydration */}
      <Script id="ga-config" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
    </>
  );
}
