'use client';

import {useEffect, useRef, useState} from 'react';
import {SECTION_IDS} from './nav-links';

export type HeaderState = {
  /** The header has passed the hero (or the top of an inner page) and now sits over content. */
  stuck: boolean;
  /** The home section crossing the reading line, or null before the scrollspy has resolved one. */
  active: string | null;
  /** `active`'s place in SECTION_IDS, or -1. For headers that show a position as a count. */
  activeIndex: number;
  /** The last meaningful scroll direction. False at rest and near the top of the page. */
  scrollingDown: boolean;
};

const INITIAL: HeaderState = {stuck: false, active: null, activeIndex: -1, scrollingDown: false};

/**
 * Everything a sticky header needs to know about the page under it, in one hook, so the three lab directions all
 * answer to the same signals and only their looks differ.
 *
 * `stuck` is read from an IntersectionObserver on `[data-nav-sentinel]` — the marker the preview page puts at the
 * bottom edge of the hero — rather than from `@container scroll-state(stuck: top)`. A header that overlays the hero
 * is already at its sticky position on the first paint, so the CSS query would report it stuck at scroll 0; and the
 * query is Chrome-only, while the stuck surface is what makes the nav readable over content. With no sentinel on the
 * page (an inner page with no hero) the hook plants one at the top of the document, so `stuck` means "scrolled".
 *
 * @param offset Distance from the viewport top at which the change happens — the header's own height.
 */
export function useHeaderState(offset = 72): HeaderState {
  const [state, setState] = useState<HeaderState>(INITIAL);
  const lastY = useRef(0);

  useEffect(() => {
    const planted = document.querySelector('[data-nav-sentinel]') === null;
    let sentinel = document.querySelector<HTMLElement>('[data-nav-sentinel]');
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.dataset.navSentinel = '';
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
      document.body.append(sentinel);
    }

    const stuckObserver = new IntersectionObserver(
      ([entry]) => {
        const stuck = !entry.isIntersecting && entry.boundingClientRect.top < offset;
        setState((current) => (current.stuck === stuck ? current : {...current, stuck}));
      },
      {rootMargin: `${-offset}px 0px 0px 0px`, threshold: 0},
    );
    stuckObserver.observe(sentinel);

    // A thin band across the upper third: whatever crosses it is what the reader is looking at.
    const visible = new Set<string>();
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const active = SECTION_IDS.find((id) => visible.has(id));
        if (!active) return;
        setState((current) => (current.active === active ? current : {...current, active, activeIndex: SECTION_IDS.indexOf(active)}));
      },
      {rootMargin: '-38% 0px -56% 0px', threshold: 0},
    );
    for (const id of SECTION_IDS) {
      const element = document.getElementById(id);
      if (element) sectionObserver.observe(element);
    }

    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      // Ignore sub-pixel jitter and the elastic overscroll at the top, where "down" would flicker.
      if (Math.abs(delta) < 6 || y < offset) {
        if (y < offset) setState((current) => (current.scrollingDown ? {...current, scrollingDown: false} : current));
        return;
      }
      lastY.current = y;
      const scrollingDown = delta > 0;
      setState((current) => (current.scrollingDown === scrollingDown ? current : {...current, scrollingDown}));
    };
    window.addEventListener('scroll', onScroll, {passive: true});

    return () => {
      stuckObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (planted) sentinel?.remove();
    };
  }, [offset]);

  return state;
}
