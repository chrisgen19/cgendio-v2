'use client';

import {usePathname, useSearchParams} from 'next/navigation';
import {useEffect} from 'react';
import {CLARITY_READY, clarityPageTags} from '@/lib/clarity';

type Clarity = (command: string, ...args: unknown[]) => void;

/**
 * Sets Clarity's custom tags for the page being viewed (page_type, the project or post slug, the blog's tag filter and
 * the theme), so recordings and heatmaps can be filtered by them. Clarity runs cookieless, so every page view is its own
 * session and the tags are set again on each one. clarity.js starts a new page view whenever the URL changes apart from
 * its hash, so this re-runs on the query too: /writing?tag= and ?page= are client-side navigations that keep the path.
 *
 * On a client-side navigation clarity.js has just stopped itself and restarts 250ms later; until then `window.clarity`
 * is its queue, which the restart replays, so the tags land on the new page view. On the first load this runs at
 * hydration, before the lazy loader has defined `window.clarity`, so it waits for the loader's CLARITY_READY. Where
 * Clarity never loads (owner's browser, a build without the id) that event never comes and nothing is sent.
 */
export function ClarityPageTags() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    const apply = () => {
      const clarity = (window as {clarity?: Clarity}).clarity;
      if (typeof clarity !== 'function') return;
      const tags = {...clarityPageTags(pathname, search), theme: document.documentElement.dataset.theme ?? 'light'};
      for (const [key, value] of Object.entries(tags)) clarity('set', key, value);
    };
    if (typeof (window as {clarity?: Clarity}).clarity === 'function') {
      apply();
      return;
    }
    window.addEventListener(CLARITY_READY, apply, {once: true});
    return () => window.removeEventListener(CLARITY_READY, apply);
  }, [pathname, search]);
  return null;
}
