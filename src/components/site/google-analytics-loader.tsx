'use client';

import Script from 'next/script';
import {useFirstInteraction} from '@/lib/use-first-interaction';

/**
 * Renders the gtag scripts from the visitor's first scroll, tap or key press. gtag.js costs about 600ms of main-thread
 * time on a mid-range phone, so it stays out of page load. Trade-off: a visit with no interaction at all is not counted.
 */
export function GoogleAnalyticsLoader({id}: {id: string}) {
  const interacted = useFirstInteraction();
  if (!interacted) return null;
  return (
    <>
      <Script id="ga-config">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
    </>
  );
}
