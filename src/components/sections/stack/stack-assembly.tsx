'use client';

import {useEffect} from 'react';

type StackAssemblyProps = {
  /** The id of the stack's `<ol>`. */
  targetId: string;
};

const SCROLL_DRIVEN = '(animation-timeline: view()) and (animation-range: entry)';

/**
 * Fallback for browsers without scroll-driven animations (Firefox): plays the assembly once, on a clock, when the
 * stack scrolls into view. Browsers with `animation-timeline: view()` run it from CSS alone and this does nothing.
 * The plates are only hidden after `data-stack-fallback` is set, so nothing disappears without JavaScript.
 */
export function StackAssembly({targetId}: StackAssemblyProps) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || CSS.supports(SCROLL_DRIVEN) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already scrolled past (a reload halfway down the page): show it assembled
    if (el.getBoundingClientRect().bottom < 0) return;

    el.setAttribute('data-stack-fallback', '');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.setAttribute('data-assembled', '');
        io.disconnect();
      },
      {threshold: 0.45},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);

  return null;
}
