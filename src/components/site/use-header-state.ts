'use client';

import {useEffect, useRef, useState} from 'react';
import {SECTION_IDS} from './nav-links';

export type HeaderState = {
  /** The header has passed the hero (or the top of an inner page) and now sits over content. */
  stuck: boolean;
  /** The page has moved at all, so content is travelling under the header and it needs its own surface. */
  scrolled: boolean;
  /** The home section crossing the reading line, or null before the scrollspy has resolved one. */
  active: string | null;
  /** `active`'s place in SECTION_IDS, or -1. For headers that show a position as a count. */
  activeIndex: number;
  /** The last meaningful scroll direction. False at rest and near the top of the page. */
  scrollingDown: boolean;
};

const INITIAL: HeaderState = {stuck: false, scrolled: false, active: null, activeIndex: -1, scrollingDown: false};

/** Past this many pixels of scroll the page is moving under the header, and the header needs a surface. */
const SURFACE_AT = 8;

/**
 * Everything the sticky header needs to know about the page under it, in one hook.
 *
 * `stuck` is read from an IntersectionObserver on `[data-nav-sentinel]` — the marker `home-page.tsx` puts at the
 * bottom edge of the hero — rather than from `@container scroll-state(stuck: top)`. A header that overlays the hero
 * is already at its sticky position on the first paint, so the CSS query would report it stuck at scroll 0; and the
 * query is Chrome and Edge only, while the stuck surface is what makes the nav readable over content.
 *
 * On a page with no such marker (an inner page, which has no hero) `stuck` falls back to "scrolled past the header",
 * read from a passive scroll listener. The hook never creates a marker of its own: see the note in the effect.
 *
 * `scrolled` is the separate, earlier question "is anything moving under the header". Over the hero the header is
 * transparent, so as soon as the film scrolls its headline and mock-ups run straight through the logo and the rail;
 * the surface therefore comes on at the first few pixels of scroll, while `stuck` keeps gating the rail's readout so
 * the instrument still only names a section once the film has ended.
 *
 * @param offset Distance from the viewport top at which the change happens — the header's own height.
 */
export function useHeaderState(offset = 72): HeaderState {
  const [state, setState] = useState<HeaderState>(INITIAL);
  const lastY = useRef(0);

  useEffect(() => {
    const setStuck = (stuck: boolean) => setState((current) => (current.stuck === stuck ? current : {...current, stuck}));

    // The surface, on its own listener: it has to answer at the first few pixels, before any sentinel is in play.
    const onSurfaceScroll = () => {
      const scrolled = window.scrollY > SURFACE_AT;
      setState((current) => (current.scrolled === scrolled ? current : {...current, scrolled}));
    };
    onSurfaceScroll();
    window.addEventListener('scroll', onSurfaceScroll, {passive: true});

    /*
     * The marker the page puts at the hero's bottom edge, if it has a hero. Where there is none, `stuck` falls back to
     * "scrolled past the header" from a scroll listener.
     *
     * Nothing is ever appended to the DOM to stand in for a missing marker. In the App Router <body> is React's root
     * container, and an unmanaged node inside it derails React's own traversal of the page's top-level children: it
     * made Next scroll to the footer on every client-side navigation to a page without a hero.
     */
    const sentinel = document.querySelector<HTMLElement>('[data-nav-sentinel]');
    let stuckObserver: IntersectionObserver | undefined;
    let onStuckScroll: (() => void) | undefined;

    if (sentinel) {
      stuckObserver = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < offset), {
        rootMargin: `${-offset}px 0px 0px 0px`,
        threshold: 0,
      });
      stuckObserver.observe(sentinel);
    } else {
      onStuckScroll = () => setStuck(window.scrollY > offset);
      onStuckScroll();
      window.addEventListener('scroll', onStuckScroll, {passive: true});
    }

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
      stuckObserver?.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onSurfaceScroll);
      if (onStuckScroll) window.removeEventListener('scroll', onStuckScroll);
    };
  }, [offset]);

  return state;
}
