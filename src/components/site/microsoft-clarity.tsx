import Script from 'next/script';
import {clarityScript} from '@/lib/clarity';
import {clarityEnv} from '@/lib/env';

/**
 * Microsoft Clarity recordings and heatmaps, only when CLARITY_PROJECT_ID is set. Mounted next to GoogleAnalytics by the
 * public chrome, so /admin, /sign-in and draft previews never render it. Cookieless and skipped for the owner's
 * browser: see clarityScript.
 */
export function MicrosoftClarity() {
  const id = clarityEnv().CLARITY_PROJECT_ID;
  if (!id) return null;
  return (
    // lazyOnload, like gtag.js: the tag waits for the load event and an idle moment, so it stays out of hydration
    <Script id="clarity-config" strategy="lazyOnload">
      {clarityScript(id)}
    </Script>
  );
}
