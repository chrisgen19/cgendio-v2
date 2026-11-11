'use client';

import {useEffect} from 'react';
import {track, trackParams} from '@/lib/analytics';

/**
 * Sends a GA4 event for every click on an element with `data-track="<event name>"`, with its `data-track-*` attributes
 * as params. One listener on the document, so server components can opt in with attributes alone. Rendered by
 * GoogleAnalytics, so it only listens where the tag is on the page.
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-track]') : null;
      const name = target?.dataset.track;
      if (target && name) track(name, trackParams(target.dataset));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
