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

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Tracks how far the pinned track has scrolled (0 to 1). The rail fill is written straight to the DOM every frame;
 * React only re-renders when the active milestone changes. Native scrolling is never intercepted. Returns -1 until the
 * stage is mostly in view, so the first milestone plays its entrance where the reader can see it.
 */
function useStageProgress(trackRef: RefObject<HTMLDivElement | null>, fillRef: RefObject<HTMLSpanElement | null>, count: number) {
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      // The static list is showing instead (reduced motion or a short window): nothing to track
      if (!track || track.offsetParent === null) return;
      const rect = track.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`;
      setActive(Math.min(count - 1, Math.floor(progress * count)));
      if (rect.top < window.innerHeight * ARM_AT) setArmed(true);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [trackRef, fillRef, count]);

  return armed ? active : -1;
}

/** One milestone on the stage. All of them stay in the DOM (for screen readers and find in page); only the active one shows. */
function StageSlide({milestone, active}: {milestone: Milestone; active: boolean}) {
  return (
    <li
      data-active={active || undefined}
      className={cn(
        'ms-slide col-start-1 row-start-1 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-end gap-14 transition-opacity duration-200',
        'max-md:flex max-md:flex-col max-md:items-stretch max-md:justify-end max-md:gap-6',
        active ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div className="@container min-w-0">
        <MilestoneStageValue value={milestone.value} active={active} />
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
  const fillRef = useRef<HTMLSpanElement>(null);
  const count = milestones.length;
  const active = useStageProgress(trackRef, fillRef, count);
  const shown = Math.max(0, active);
  const current = milestones[shown];

  const jump = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const top = track.getBoundingClientRect().top + window.scrollY;
      const distance = track.offsetHeight - window.innerHeight;
      window.scrollTo({top: top + (distance * (index + 0.5)) / count, behavior: 'smooth'});
    },
    [count],
  );

  return (
    <div ref={trackRef} className="ms-pinned ms-track pointer-events-none relative" style={{height: `calc(100svh + ${(count - 1) * STEP_SVH}svh)`}}>
      <div className="sticky top-0 flex h-svh items-center">
        <div className="ms-panel dot-grid pointer-events-auto flex w-full flex-col gap-10 rounded-panel border border-line px-12 pt-10 pb-8 shadow-(--shadow-card) max-md:gap-6 max-md:px-5 max-md:pt-6 max-md:pb-4">
          <div
            aria-hidden="true"
            className="flex items-center justify-between font-mono text-xs leading-none font-medium tracking-[0.08em] text-muted uppercase"
          >
            <span>{current?.kind}</span>
            <span className="tabular-nums">
              <span className="text-ink">{pad(shown + 1)}</span> / {pad(count)}
            </span>
          </div>
          <ol className="m-0 grid min-h-0 flex-1 list-none p-0">
            {milestones.map((m, i) => (
              <StageSlide key={m.order} milestone={m} active={i === active} />
            ))}
          </ol>
          <MilestoneStageRail milestones={milestones} active={active} fillRef={fillRef} onJump={jump} />
        </div>
      </div>
    </div>
  );
}
