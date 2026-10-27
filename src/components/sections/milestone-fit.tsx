'use client';

import {useEffect} from 'react';

/** Sets `--ms-fit` on one value so it fits the room its line leaves it, or clears it when the CSS estimate already fits. */
const fitValue = (value: HTMLElement) => {
  const line = value.closest('li');
  if (!line) return;
  value.style.removeProperty('--ms-fit');
  const room = line.clientWidth - Number.parseFloat(getComputedStyle(value).getPropertyValue('--ms-reserve'));
  // The display face's optical size widens its glyphs as it shrinks, so one ratio falls short: re-measure a few times
  let fit = 1;
  for (let i = 0; i < 4; i++) {
    const width = value.getBoundingClientRect().width;
    if (width <= room) break;
    // Rounded down, so sub-pixel rounding never leaves it a hair too wide
    fit = Math.floor(fit * (room / width) * 1000) / 1000;
    value.style.setProperty('--ms-fit', String(fit));
  }
};

/**
 * Corrects the milestone values' CSS size estimate, which counts characters and so runs short for wide glyphs (an admin
 * value like "WOOCOMMERCE"). Measures each value and shrinks only the ones that overflow their line, so values that fit
 * keep their size and nothing shifts. Refits when a line or value changes size: resizes, and the web font arriving.
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
      const line = value.closest('li');
      if (line) observer.observe(line);
    }
    return () => observer.disconnect();
  }, [sectionId]);

  return null;
}
