'use client';

import {motion, useMotionValue, useMotionValueEvent, useScroll, useTransform} from 'motion/react';
import {type CSSProperties, type FocusEvent, type ReactNode, useEffect, useRef, useState} from 'react';

/**
 * When the section pins. Keep in sync with the media query of the `timeline-lab v4` block in globals.css: the CSS lays the
 * pinned stage out before hydration, this hook only adds the scroll-linked pan on top. Touch, small or short screens and
 * reduced motion never pin.
 */
const PIN_QUERY =
  '(scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-width: 860px) and (min-height: 680px) and (pointer: fine)';

/** Under the `md` breakpoint the track is a native swipe row (see the `max-md:` classes below). */
const SWIPE_QUERY = '(max-width: 859.98px)';

type Geometry = {overflow: number; head: number; span: number; fillLeft: number; fillWidth: number};

/** Where the stage sticks and how tall it is, both in px. Drives the sticky `top` and the scroll offsets together. */
type Pin = {top: number; height: number; overflow: number};

/** Tracks a media query, false on the server and until hydration. */
function useMatches(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** Reads the track's layout: how far it pans, and where the first and last cards' centres sit on it. */
const measure = (track: HTMLElement, pane: HTMLElement, list: HTMLElement): Geometry | null => {
  const items = list.children;
  const first = items[0] as HTMLElement | undefined;
  const last = items[items.length - 1] as HTMLElement | undefined;
  const firstCard = first?.firstElementChild as HTMLElement | null | undefined;
  const lastCard = last?.firstElementChild as HTMLElement | null | undefined;
  if (!first || !last || !firstCard || !lastCard) return null;
  const head = first.offsetLeft + firstCard.offsetWidth / 2;
  const lastCentre = last.offsetLeft + lastCard.offsetWidth / 2;
  return {
    overflow: Math.max(0, track.offsetWidth - pane.clientWidth),
    head,
    span: lastCentre - head,
    fillLeft: first.offsetLeft,
    fillWidth: last.offsetLeft + lastCard.offsetWidth - first.offsetLeft,
  };
};

/**
 * The stage sticks centred in the window. If it is ever taller than the window it sticks with its bottom edge on the
 * window's, so the track and its ruler stay in view and the intro is what scrolls off.
 */
const stickyTop = (stageHeight: number, viewport: number) =>
  Math.round(stageHeight <= viewport ? (viewport - stageHeight) / 2 : viewport - stageHeight);

type TimelineV4TrackProps = {
  /** The eyebrow, heading, lede and current role: pinned above the track. */
  intro: ReactNode;
  /** The section heading's id, which names the swipe row on phones. */
  headingId: string;
  /** One `<li>` per role, oldest first. Each holds its card `<article>` first, then its ruler segment. */
  children: ReactNode;
  count: number;
};

/**
 * The pinned horizontal journey. On a desktop with motion allowed, the stage sticks for a short scroll distance while
 * the track pans left and a playhead glides along the year ruler from the first card to the NOW card. Everywhere else
 * the CSS lays the same markup out as a swipe row (phones) or a grid, and this component leaves it alone.
 */
export function TimelineV4Track({intro, headingId, children, count}: TimelineV4TrackProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const activeRef = useRef(-1);
  const pinRef = useRef<Pin | null>(null);
  const pinned = useMatches(PIN_QUERY);
  const swipe = useMatches(SWIPE_QUERY);
  const [pin, setPin] = useState<Pin | null>(null);
  const [active, setActive] = useState(0);

  const overflow = useMotionValue(0);
  const headStart = useMotionValue(0);
  const headSpan = useMotionValue(0);
  const fillLeft = useMotionValue(0);
  const fillWidth = useMotionValue(1);
  // 0 when the wrapper's top reaches the stage's sticky top, 1 when its bottom reaches the stage's bottom: the pinned stretch
  const {scrollYProgress} = useScroll({
    target: wrapperRef,
    offset: pin ? [`start ${pin.top}px`, `end ${pin.top + pin.height}px`] : ['start start', 'end end'],
  });
  const x = useTransform(() => -scrollYProgress.get() * overflow.get());
  const headX = useTransform(() => headStart.get() + scrollYProgress.get() * headSpan.get());
  const fillScale = useTransform(() => Math.min(1, Math.max(0, (headX.get() - fillLeft.get()) / fillWidth.get())));

  /** Marks the role under the playhead, so its card lifts and the chip counts it. */
  const markActive = (progress: number) => {
    const list = listRef.current;
    if (!list || count < 1) return;
    const index = Math.round(Math.min(1, Math.max(0, progress)) * (count - 1));
    if (index === activeRef.current) return;
    list.children[activeRef.current]?.removeAttribute('data-active');
    list.children[index]?.setAttribute('data-active', '');
    activeRef.current = index;
    setActive(index);
  };

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (pinned) markActive(progress);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: markActive only reads refs, state setters and the stable motion values
  useEffect(() => {
    const track = trackRef.current;
    const pane = paneRef.current;
    const list = listRef.current;
    const stage = stageRef.current;
    if (!pinned || !track || !pane || !list || !stage) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-v4-card]'));
    for (const card of cards) card.tabIndex = 0;

    const update = () => {
      const geometry = measure(track, pane, list);
      if (!geometry) return;
      overflow.set(geometry.overflow);
      headStart.set(geometry.head);
      headSpan.set(geometry.span);
      fillLeft.set(geometry.fillLeft);
      fillWidth.set(geometry.fillWidth || 1);
      const next = {top: stickyTop(stage.offsetHeight, window.innerHeight), height: stage.offsetHeight, overflow: geometry.overflow};
      const prev = pinRef.current;
      // Only a real change re-renders: a new offset restarts useScroll's tracking
      if (prev && prev.top === next.top && prev.height === next.height && prev.overflow === next.overflow) return;
      pinRef.current = next;
      setPin(next);
    };
    update();
    markActive(scrollYProgress.get());
    // Re-measure when the cards reflow (a resize, or the web fonts arriving after the first layout) or the window changes height
    const observer = new ResizeObserver(update);
    observer.observe(track);
    observer.observe(pane);
    observer.observe(stage);
    window.addEventListener('resize', update);
    document.fonts?.ready.then(update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      for (const card of cards) card.removeAttribute('tabindex');
      list.children[activeRef.current]?.removeAttribute('data-active');
      activeRef.current = -1;
      overflow.set(0);
      pinRef.current = null;
      setPin(null);
    };
  }, [pinned, overflow, headStart, headSpan, fillLeft, fillWidth, scrollYProgress]);

  /**
   * Focus can't scroll a transformed track into view, so a focused card scrolls the window instead: to the point in the
   * pinned distance where the playhead sits on that card. Works the same with Shift+Tab coming back up from below. Only
   * keyboard focus counts (`:focus-visible`): a mouse click on a card that is already in view must not jump the page.
   */
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    const list = listRef.current;
    const target = event.target as HTMLElement;
    const item = target.closest('li');
    if (!pinned || !wrapper || !list || !item || count < 2 || !target.matches(':focus-visible')) return;
    const index = Array.prototype.indexOf.call(list.children, item) as number;
    if (index < 0) return;
    const scrollToCard = () => {
      const current = pinRef.current;
      if (!current) return;
      const pinStart = wrapper.getBoundingClientRect().top + window.scrollY - current.top;
      window.scrollTo({top: pinStart + (index / (count - 1)) * current.overflow, behavior: 'instant'});
    };
    scrollToCard();
    requestAnimationFrame(scrollToCard);
  };

  const swipeRegion = swipe ? ({role: 'region', 'aria-labelledby': headingId, tabIndex: 0} as const) : null;
  // The count feeds the CSS height estimate before hydration; the measured pan and sticky top replace it once known
  const wrapperStyle = {
    '--tl-v4-count': count,
    ...(pin ? {'--tl-v4-overflow': `${pin.overflow}px`, '--tl-v4-top': `${pin.top}px`} : null),
  } as CSSProperties;

  return (
    // data-measured shows the playhead only once it has real positions, so it never flashes at the track's left edge
    <div ref={wrapperRef} className="tl-v4-wrap" style={wrapperStyle} data-measured={pin ? '' : undefined}>
      <div ref={stageRef} className="tl-v4-stage flex flex-col gap-12 max-md:gap-9">
        {intro}
        {/* On phones the row is its own scroll container: a named, focusable region so the keyboard can scroll it too */}
        <div
          ref={paneRef}
          {...swipeRegion}
          className="tl-v4-pane max-md:-mx-5 max-md:snap-x max-md:snap-mandatory max-md:scroll-px-5 max-md:overflow-x-auto max-md:focus-visible:-outline-offset-2"
        >
          <motion.div ref={trackRef} onFocus={onFocus} style={{x}} className="tl-v4-track relative max-md:w-max max-md:px-5">
            <ol ref={listRef} className="tl-v4-list m-0 grid list-none grid-cols-3 gap-x-6 gap-y-10 p-0 max-lg:grid-cols-2 max-md:flex max-md:gap-0">
              {children}
            </ol>
            <motion.span
              aria-hidden="true"
              style={{left: fillLeft, width: fillWidth, scaleX: fillScale}}
              className="tl-v4-fill pointer-events-none absolute bottom-[47px] hidden h-0.5 origin-left bg-accent"
            />
            <motion.span aria-hidden="true" style={{x: headX}} className="tl-v4-head pointer-events-none absolute bottom-[48px] left-0 hidden w-0">
              <span className="absolute bottom-[13px] left-0 -translate-x-1/2 rounded-pill bg-ink px-2.5 py-[7px] font-mono text-[11px] leading-none whitespace-nowrap text-white tabular-nums">
                Role {active + 1} / {count}
              </span>
              <span className="absolute -bottom-[14px] left-0 h-[23px] w-0.5 -translate-x-1/2 bg-accent" />
              <span className="absolute -bottom-[6px] left-0 size-3 -translate-x-1/2 rounded-full border-2 border-white bg-accent" />
            </motion.span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
