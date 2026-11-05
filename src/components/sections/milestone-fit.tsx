'use client';

import {useEffect} from 'react';

// Each pass closes most of the remaining gap; the cap only guards against a value that never settles
const MAX_PASSES = 10;

/** Sets `--ms-fit` on one value so it fits its column (the value's parent), or clears it when the CSS estimate already fits. */
const fitValue = (value: HTMLElement) => {
  const column = value.parentElement;
  if (!column) return;
  value.style.removeProperty('--ms-fit');
  const room = column.clientWidth;
  // A hidden layout (the static list while the stage is pinned, or the other way round) has nothing to fit yet
  if (room === 0) return;
  // The display face's optical size widens its glyphs as it shrinks, so one ratio falls short: re-measure until it fits
  let fit = 1;
  for (let i = 0; i < MAX_PASSES; i++) {
    const width = value.getBoundingClientRect().width;
    if (width <= room) break;
    // Aim half a pixel inside and round down, so sub-pixel rendering never leaves it a hair too wide
    fit = Math.floor(fit * ((room - 0.5) / width) * 1000) / 1000;
    value.style.setProperty('--ms-fit', String(fit));
  }
};

/**
 * Corrects the milestone values' CSS size estimate, which counts characters and so runs short for wide glyphs (an admin
 * value like "WOOCOMMERCE"). Measures each value and shrinks only the ones that overflow their column, so values that
 * fit keep their size and nothing shifts. Refits when a column or value changes size: resizes, the web font arriving,
 * and the static list and pinned stage swapping when the window height or motion setting changes.
 */
export function MilestoneFit({sectionId}: {sectionId: string}) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const values = [...section.querySelectorAll<HTMLElement>('.ms-value')];
    // Setting --ms-fit resizes the value and fires the observer once more; the refit lands on the same size and stops
    const observer = new ResizeObserver(() => {
      for (const value of values) fitValue(value);
    });
    for (const value of values) {
      observer.observe(value);
      if (value.parentElement) observer.observe(value.parentElement);
    }
    return () => observer.disconnect();
  }, [sectionId]);

  return null;
}
