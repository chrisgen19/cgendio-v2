'use client';

import {useEffect} from 'react';

/**
 * Arms the span chart's entrance: marks every `[data-tl2-grow]` in the section `data-armed` (which hides the bars, see
 * the v2 block in globals.css) and `data-in` once 40% of it is on screen, which grows them in. Nothing is armed under
 * reduced motion or without JavaScript, so the server HTML (full bars) is the final state.
 */
export function TimelineV2Grow({sectionId}: {sectionId: string}) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = document.querySelectorAll<HTMLElement>(`#${sectionId} [data-tl2-grow]:not([data-in])`);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }
      },
      {threshold: 0.4},
    );
    for (const el of targets) el.setAttribute('data-armed', '');
    // Commit the hidden state before anything can be marked in view, or charts already on screen skip their transition
    for (const el of targets) el.getBoundingClientRect();
    for (const el of targets) io.observe(el);
    return () => io.disconnect();
  }, [sectionId]);

  return null;
}
