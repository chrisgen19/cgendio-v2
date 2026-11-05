'use client';

import {type CSSProperties, type RefObject, useCallback, useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/cn';
import type {Milestone} from '@/server/content-schema';
import {MilestoneStageRail} from './milestone-stage-rail';
import {MilestoneStageValue} from './milestone-stage-value';

// Scroll distance each milestone holds the stage for, in svh. Kept short so the pin never drags.
const STEP_SVH = 45;

// The stage arms once the track's top has scrolled above this share of the viewport
const ARM_AT = 0.45;

// Matches the globals.css query that shows the pinned stage, so the stage re-measures when it starts showing
const PINNED_QUERY = '(scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-height: 600px)';

const pad = (n: number) => String(n).padStart(2, '0');

type StageState = {
  /** The milestone the scroll position points at */
  active: number;
  /** Whether a milestone shows at all. The server renders it armed, so the first milestone shows before hydration. */
  armed: boolean;
  /** Whether showing a milestone plays its entrance. Off until the stage is reached or the milestone changes. */
  animate: boolean;
};

type StageRefs = {
  track: RefObject<HTMLDivElement | null>;
  sticky: RefObject<HTMLDivElement | null>;
  fill: RefObject<HTMLSpanElement | null>;
};

/**
 * Tracks how far the pinned track has scrolled (0 to 1). The rail fill is written straight to the DOM every frame;
 * React only re-renders when the state changes. Native scrolling is never intercepted. The first milestone shows from
 * the server render on; if the stage is still below the fold once the client runs, it hides and plays its entrance
 * when the reader reaches it, and if the reader is already looking at it, it stays put without replaying.
 */
function useStageProgress({track: trackRef, sticky: stickyRef, fill: fillRef}: StageRefs, count: number) {
  const [state, setState] = useState<StageState>({active: 0, armed: true, animate: false});

  useEffect(() => {
    let frame = 0;
    let first = true;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      const sticky = stickyRef.current;
      // The static list is showing instead (reduced motion or a short window): measure once the stage shows
      if (!track || !sticky || track.offsetParent === null) return;
      const rect = track.getBoundingClientRect();
      // The sticky wrapper is 100svh, which a phone's innerHeight passes once its toolbar hides
      const distance = Math.max(1, rect.height - sticky.offsetHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`;
      const active = Math.min(count - 1, Math.floor(progress * count));
      const reached = rect.top < window.innerHeight * ARM_AT;
      const isFirst = first;
      first = false;
      setState((prev) => {
        let {armed, animate} = prev;
        if (isFirst) armed = reached;
        else if (!armed && reached) {
          armed = true;
          animate = true;
        }
        if (armed && active !== prev.active) animate = true;
        if (active === prev.active && armed === prev.armed && animate === prev.animate) return prev;
        return {active, armed, animate};
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const pinnedQuery = window.matchMedia(PINNED_QUERY);
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    pinnedQuery.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      pinnedQuery.removeEventListener('change', schedule);
    };
  }, [trackRef, stickyRef, fillRef, count]);

  return state;
}

/**
 * Publishes the panel's real height to the track as --ms-panel-real, so the track's margins keep the pinned panel at
 * the section's normal gaps when long admin text makes it taller than its design height. If even the tallest panel the
 * viewport allows can't hold a slide, the slide list becomes scrollable; only then, as scrolling would clip the value's
 * highlighter bar and entrance.
 */
function usePanelFit(
  trackRef: RefObject<HTMLDivElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  listRef: RefObject<HTMLOListElement | null>,
) {
  useEffect(() => {
    const track = trackRef.current;
    const panel = panelRef.current;
    const list = listRef.current;
    if (!track || !panel || !list) return;
    const observer = new ResizeObserver(() => {
      // Zero while the static list shows instead; the CSS default stands
      if (!panel.offsetHeight) return;
      track.style.setProperty('--ms-panel-real', `${panel.offsetHeight}px`);
      list.toggleAttribute('data-overflow', list.scrollHeight > list.clientHeight + 1);
    });
    observer.observe(panel);
    for (const slide of list.children) observer.observe(slide);
    return () => observer.disconnect();
  }, [trackRef, panelRef, listRef]);
}

type StageSlideProps = {
  milestone: Milestone;
  shown: boolean;
  /** Plays the entrance (the globals.css .ms-slide[data-active] rules) */
  animate: boolean;
};

/** One milestone on the stage. All of them stay in the DOM (for screen readers and find in page); only one shows. */
function StageSlide({milestone, shown, animate}: StageSlideProps) {
  return (
    <li
      data-shown={shown || undefined}
      data-active={(shown && animate) || undefined}
      className={cn(
        'ms-slide col-start-1 row-start-1 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-end gap-14 transition-opacity duration-200',
        'max-md:flex max-md:flex-col max-md:items-stretch max-md:justify-end max-md:gap-6',
        shown ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div className="@container min-w-0">
        <MilestoneStageValue value={milestone.value} active={shown && animate} />
      </div>
      <div className="flex max-w-[460px] flex-col gap-4 pb-[0.4em] max-md:gap-3 max-md:pb-0">
        <h3
          className="ms-rise m-0 font-display text-[clamp(26px,3vw,40px)] leading-[1.05] font-bold tracking-[-0.03em] text-ink"
          style={{'--i': 0} as CSSProperties}
        >
          {milestone.title}
        </h3>
        <p className="ms-rise m-0 text-lg leading-[1.55] text-muted max-md:text-base" style={{'--i': 1} as CSSProperties}>
          {milestone.description}
        </p>
      </div>
    </li>
  );
}

/**
 * The pinned stage: a tall track with a sticky, viewport-centred panel inside. Scrolling through the track moves the
 * rail and swaps the milestone; the rail buttons scroll the page to a milestone's stretch. CSS shows it only with JS,
 * motion allowed and a tall enough window (globals.css `.ms-pinned`).
 */
export function MilestoneStage({milestones}: {milestones: Milestone[]}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const count = milestones.length;
  const {active, armed, animate} = useStageProgress({track: trackRef, sticky: stickyRef, fill: fillRef}, count);
  usePanelFit(trackRef, panelRef, listRef);
  const current = milestones[active];

  const jump = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const sticky = stickyRef.current;
      if (!track || !sticky) return;
      const top = track.getBoundingClientRect().top + window.scrollY;
      const distance = track.offsetHeight - sticky.offsetHeight;
      window.scrollTo({top: top + (distance * (index + 0.5)) / count, behavior: 'smooth'});
    },
    [count],
  );

  return (
    <div ref={trackRef} className="ms-pinned ms-track pointer-events-none relative" style={{height: `calc(100svh + ${(count - 1) * STEP_SVH}svh)`}}>
      <div ref={stickyRef} className="sticky top-0 flex h-svh items-center">
        <div
          ref={panelRef}
          className="ms-panel dot-grid pointer-events-auto flex w-full flex-col gap-10 rounded-panel border border-line px-12 pt-10 pb-8 shadow-(--shadow-card) max-md:gap-6 max-md:px-5 max-md:pt-6 max-md:pb-4"
        >
          <div
            aria-hidden="true"
            className="flex items-center justify-between font-mono text-xs leading-none font-medium tracking-[0.08em] text-muted uppercase"
          >
            <span>{current?.kind}</span>
            <span className="tabular-nums">
              <span className="text-ink">{pad(active + 1)}</span> / {pad(count)}
            </span>
          </div>
          {/* Grows to the tallest slide; scrolls only if that would pass the viewport (usePanelFit sets data-overflow) */}
          <ol ref={listRef} className="m-0 grid min-h-0 flex-1 list-none p-0 data-overflow:overflow-y-auto">
            {milestones.map((m, i) => (
              <StageSlide key={m.order} milestone={m} shown={armed && i === active} animate={animate} />
            ))}
          </ol>
          <MilestoneStageRail milestones={milestones} active={armed ? active : -1} fillRef={fillRef} onJump={jump} />
        </div>
      </div>
    </div>
  );
}
