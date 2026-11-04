'use client';

import {type PointerEvent, type ReactNode, useEffect, useRef} from 'react';

/** Tilt only where it reads as a physical object: a fine pointer, motion allowed, and the two-column layout. */
const TILT_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 1080px)';
const MAX_X = 7;
const MAX_Y = 9;

const clearTilt = (el: HTMLElement | null) => {
  if (!el) return;
  for (const prop of ['--rx', '--ry', '--sx', '--sy']) el.style.removeProperty(prop);
};

/**
 * Wraps the card in a stage that tilts it toward the pointer (CSS variables written once per frame) and lifts it on
 * hover or keyboard focus. The tilt follows the media query live, so turning on reduced motion stops it at once.
 */
export function TiltCard({children}: {children: ReactNode}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);
  const frame = useRef(0);

  useEffect(() => {
    const query = window.matchMedia(TILT_QUERY);
    const sync = () => {
      enabled.current = query.matches;
      if (!query.matches) {
        // A frame queued by the last pointer move would otherwise write the tilt back
        cancelAnimationFrame(frame.current);
        clearTilt(cardRef.current);
      }
    };
    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!enabled.current || event.pointerType !== 'mouse' || !el) return;
    const box = el.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - box.top) / box.height, 0), 1);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${((0.5 - y) * 2 * MAX_X).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * 2 * MAX_Y).toFixed(2)}deg`);
      el.style.setProperty('--sx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--sy', `${(y * 100).toFixed(1)}%`);
    });
  };

  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    clearTilt(cardRef.current);
  };

  return (
    <div onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className="group/card [perspective:1100px]">
      <div
        ref={cardRef}
        className="relative [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-[transform,translate,rotate] duration-300 ease-out will-change-transform group-hover/card:-translate-y-2 focus-within:-translate-y-2 lg:-rotate-2 lg:group-hover/card:rotate-0 lg:focus-within:rotate-0 motion-reduce:transition-none motion-reduce:group-hover/card:translate-y-0 motion-reduce:focus-within:translate-y-0"
      >
        {children}
        {/* A soft sheen that follows the pointer, only while tilting */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-card bg-[radial-gradient(circle_at_var(--sx,50%)_var(--sy,0%),rgba(255,255,255,0.14),transparent_55%)] opacity-0 transition-opacity duration-300 motion-safe:group-hover/card:opacity-100"
        />
      </div>
    </div>
  );
}
