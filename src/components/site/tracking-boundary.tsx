'use client';

import {useEffect} from 'react';
import {crossesTrackingBoundary} from '@/lib/analytics-paths';

/**
 * Turns a link click between an untracked page (admin, sign-in, a draft preview) and a public one into a full page load,
 * so the two never share a document. Without it a visitor who opens a preview link, follows the post's back link and
 * presses Back has the draft's URL and its signature uploaded to Clarity, and the hidden preview DOM recorded on the
 * public page (measured against clarity.js 0.8.77 on #156). See crossesTrackingBoundary for the rules.
 *
 * A capture listener on the document runs before React's own, and next/link skips its client-side navigation once
 * the click is defaultPrevented (node_modules/next/dist/client/app-dir/link.js). It doesn't see a programmatic
 * router.push across the line; nothing does that today. Mounted in the root layout, so it is on every page.
 */
export function TrackingBoundary() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const modified = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (!crossesTrackingBoundary({from: location.href, to: link.href, target: link.target, modified, download: link.hasAttribute('download')}))
        return;
      event.preventDefault();
      location.assign(link.href);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
