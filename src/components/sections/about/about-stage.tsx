'use client';

import {type ReactNode, useEffect, useRef} from 'react';

type AboutStageProps = {
  children: ReactNode;
  className?: string;
};

/** Writes the real frame-to-canvas distances into the redline labels. */
const measureGuides = (root: HTMLElement) => {
  const frame = root.querySelector<HTMLElement>('[data-frame]');
  if (!frame) return;
  for (const label of root.querySelectorAll<HTMLElement>('[data-measure]')) {
    label.textContent = String(Math.round(label.dataset.measure === 'top' ? frame.offsetTop : frame.offsetLeft));
  }
};

/** The entry's length (globals.css: the last pin lands at about 2.1s), after which the stage is disarmed */
const ENTRY_MS = 2400;

/** Lights up every element of one fact (its pin and its panel row), or none. */
const lightUp = (root: HTMLElement, key: string | null) => {
  for (const el of root.querySelectorAll<HTMLElement>('[data-fact]')) el.toggleAttribute('data-on', el.dataset.fact === key);
};

/**
 * Runs the canvas and its inspect panel (both server-rendered children):
 * - the entry: armed (`data-armed`, which hides the pieces in globals.css) only with motion allowed and while the stage
 *   is still below the fold, then played (`data-play`) once it scrolls into view, and disarmed when it is done, so a
 *   later layout change (a pin hidden and shown again across 860px) never replays part of it. Without JavaScript, with
 *   reduced motion, or on a reload with the stage already in view, everything simply shows in its final state.
 * - the link between a pin and its panel row: a mouse over either (or keyboard focus inside a row) lights up both;
 *   Escape or leaving clears it.
 * - the redline numbers, kept true to the layout on resize.
 */
export function AboutStage({children, className}: AboutStageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const canvas = root?.querySelector<HTMLElement>('[data-canvas]');
    if (!root || !canvas) return;

    const resize = new ResizeObserver(() => measureGuides(root));
    resize.observe(canvas);

    let entry: IntersectionObserver | undefined;
    let done: number | undefined;
    const rect = canvas.getBoundingClientRect();
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && rect.top > window.innerHeight) {
      root.setAttribute('data-armed', '');
      entry = new IntersectionObserver(
        ([e]) => {
          if (!e?.isIntersecting) return;
          root.setAttribute('data-play', '');
          entry?.disconnect();
          done = window.setTimeout(() => {
            root.removeAttribute('data-armed');
            root.removeAttribute('data-play');
          }, ENTRY_MS);
        },
        {threshold: 0.35},
      );
      entry.observe(canvas);
    }

    const factOf = (target: EventTarget | null) =>
      target instanceof Element ? (target.closest<HTMLElement>('[data-fact]')?.dataset.fact ?? null) : null;
    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') lightUp(root, factOf(e.target));
    };
    const onLeave = () => lightUp(root, null);
    const onFocusIn = (e: FocusEvent) => lightUp(root, factOf(e.target));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lightUp(root, null);
    };

    root.addEventListener('pointerover', onPointerOver);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onLeave);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      resize.disconnect();
      entry?.disconnect();
      window.clearTimeout(done);
      root.removeEventListener('pointerover', onPointerOver);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onLeave);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div ref={ref} data-about-stage className={className}>
      {children}
    </div>
  );
}
