import Script from 'next/script';
import {UNTRACKED_PATH} from '@/lib/analytics-paths';
import {analyticsEnv} from '@/lib/env';

/**
 * Google Analytics 4 through gtag.js, only when GA_MEASUREMENT_ID is set (ported from the previous site, #81).
 *
 * Mounted by the public chrome rather than the root layout, so /admin, /sign-in and draft previews never load it: the
 * root layout wraps those too. Client-side navigations are counted by GA's enhanced measurement, which listens for
 * history changes, not here. next/script keys both scripts by id or src, so moving between pages loads them once.
 *
 * Once loaded, gtag.js stays for the rest of the visit, so a client-side navigation (a quick Back from a public page to
 * a draft preview, say) could still record an untracked page. GA's opt-out flag, window['ga-disable-<id>'], is
 * therefore a getter that checks the current URL, so every hit sent while an untracked page is showing is dropped.
 */
export function GoogleAnalytics() {
  const id = analyticsEnv().GA_MEASUREMENT_ID;
  if (!id) return null;
  const optOut = `Object.defineProperty(window,${JSON.stringify(`ga-disable-${id}`)},{configurable:true,get:function(){return new RegExp(${JSON.stringify(UNTRACKED_PATH.source)}).test(location.pathname)}});`;
  return (
    <>
      {/* lazyOnload: gtag.js waits for the page's load event and an idle moment, so it stays out of hydration */}
      <Script id="ga-config" strategy="lazyOnload">
        {`${optOut}window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
    </>
  );
}
