'use client';

import {type ReactNode, useLayoutEffect, useRef, useState} from 'react';

/** The reading line, as a fraction of the viewport height from the top. The rail's fill tip always sits on it. */
const READING_LINE = 0.6;

type Geometry = {
  /** The rail's top (the first dot's centre) below the stage's top edge */
  offset: number;
  /** First dot centre to last dot centre */
  height: number;
  /** Each stop's position along the rail, 0 (first dot) to 1 (last dot) */
  stops: number[];
  viewport: number;
};

type TimelineV1StageProps = {
  className?: string;
  children: ReactNode;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Arms the scroll-drawn rail. Renders the grid that holds the intro and the list, plus one continuous rail that runs from
 * the first dot's centre to the last one's (measured, so it follows the content). Its progress is one number: how far the
 * reading line has travelled down the rail. Browsers with scroll-driven animations draw the fill on the compositor from
 * the same range (globals.css); the rest get it as `--tl1-p`. Stops light from that same number, so the dots and the line
 * never disagree, and unlight on the way back up.
 *
 * Does nothing with reduced motion: the server HTML is already the finished state (rail drawn, every stop lit).
 */
export function TimelineV1Stage({className, children}: TimelineV1StageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  // Arm before the first paint after hydration, so nothing blinks from lit to unlit while visible
  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setArmed(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const rail = railRef.current;
    if (!armed || !stage || !rail) return;

    const cssDriven = CSS.supports('animation-timeline: view()');
    const count = stage.querySelector<HTMLElement>('[data-tl1-count]');
    let items: HTMLElement[] = [];
    let ticks: HTMLElement[] = [];
    let geo: Geometry | null = null;
    let lit = -1;
    let frame = 0;

    // Layout reads: on arm and whenever the stage resizes (fonts, viewport, content edits). Re-queries the stops so a
    // refreshed list is never driven from stale nodes.
    const measure = () => {
      items = Array.from(stage.querySelectorAll<HTMLElement>('[data-tl1-stop]'));
      ticks = Array.from(stage.querySelectorAll<HTMLElement>('[data-tl1-tick]'));
      const nodes = Array.from(stage.querySelectorAll<HTMLElement>('[data-tl1-node]'));
      const first = nodes[0];
      const last = nodes.at(-1);
      if (!first || !last) return;
      const base = stage.getBoundingClientRect();
      const centre = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return {x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top};
      };
      const top = centre(first);
      const height = Math.max(1, centre(last).y - top.y);
      rail.style.left = `${top.x}px`;
      rail.style.top = `${top.y}px`;
      rail.style.height = `${height}px`;
      geo = {offset: top.y, height, stops: nodes.map((node) => (centre(node).y - top.y) / height), viewport: window.innerHeight};
      lit = -1;
    };

    // One rect read at the start of the frame, before any write, so it never forces a layout. Reading the stage's
    // live position (not a cached document offset) keeps the stops in step with the CSS fill when content above the
    // section shifts it (late images, fonts) without resizing the stage.
    const update = () => {
      frame = 0;
      if (!geo) return;
      const railTop = stage.getBoundingClientRect().top + geo.offset;
      const p = clamp01((geo.viewport * READING_LINE - railTop) / geo.height);
      if (!cssDriven) stage.style.setProperty('--tl1-p', p.toFixed(4));
      stage.toggleAttribute('data-moving', p > 0 && p < 1);
      const reached = p > 0 ? geo.stops.filter((stop) => p >= stop - 0.002).length : 0;
      if (reached === lit) return;
      lit = reached;
      items.forEach((item, i) => {
        item.toggleAttribute('data-reached', i < reached);
      });
      ticks.forEach((tick, i) => {
        tick.toggleAttribute('data-reached', i < reached);
      });
      if (count) count.textContent = pad(reached);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    // The first frame lands without transitions, so stops below the line simply start unlit
    stage.setAttribute('data-settling', '');
    measure();
    update();
    let settle = requestAnimationFrame(() => {
      settle = requestAnimationFrame(() => stage.removeAttribute('data-settling'));
    });

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(stage);
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settle);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      stage.removeAttribute('data-moving');
      stage.removeAttribute('data-settling');
      stage.style.removeProperty('--tl1-p');
      for (const el of [...items, ...ticks]) el.removeAttribute('data-reached');
      if (count) count.textContent = pad(items.length);
    };
  }, [armed]);

  return (
    <div ref={stageRef} data-armed={armed || undefined} className={className}>
      {children}
      <div ref={railRef} aria-hidden="true" className="tl1-rail">
        <span className="tl1-fill" />
        <span className="tl1-head-track">
          <span className="tl1-head" />
        </span>
      </div>
    </div>
  );
}
