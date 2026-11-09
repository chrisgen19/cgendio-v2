'use client';

import {type CSSProperties, useEffect, useRef} from 'react';
import {cn} from '@/lib/cn';

/** The gap between groups on the ruler, in tick pitches. */
const GROUP_GAP = 1.6;
const TICK_HEIGHT = 14;

/** Works out where the 36 ticks sit on the ruler, as a percentage of its width, from the size of each group. */
const layoutTicks = (groupSizes: readonly number[]) => {
  const total = groupSizes.reduce((sum, size) => sum + size, 0);
  const span = total - 1 + (groupSizes.length - 1) * GROUP_GAP;
  let index = 0;
  return groupSizes.flatMap((size, group) =>
    Array.from({length: size}, (_, position) => {
      const tick = {index, major: position === 0, left: ((index + group * GROUP_GAP) / span) * 100};
      index += 1;
      return tick;
    }),
  );
};

/**
 * Writes where each tick has to travel: --tx and --ty to its tool's slot, and --stretch, the scale that makes it reach
 * that row while its top is still on the ruler. Without JS none of this runs and the list simply opens.
 */
const measure = (track: HTMLElement) => {
  const details = track.closest('details');
  if (!details) return;
  const origin = track.getBoundingClientRect();
  for (const tick of track.querySelectorAll<HTMLElement>('[data-tick]')) {
    const slot = details.querySelector(`[data-slot="${tick.dataset.tick}"]`)?.getBoundingClientRect();
    // A slot with no size has not been laid out: leave the tick where it is rather than send it to the corner
    if (!slot || slot.height === 0) continue;
    const y = slot.top - origin.top;
    tick.style.setProperty('--tx', `${slot.left - origin.left - tick.offsetLeft}px`);
    tick.style.setProperty('--ty', `${y}px`);
    tick.style.setProperty('--stretch', String((y + TICK_HEIGHT) / TICK_HEIGHT));
  }
};

/**
 * The ruler: a hairline with one tick per tool, a longer one at the start of each group. Decorative, the real content
 * is the list in the panel. It sets data-anim during the summary's click, before the details changes state, so the
 * motion only ever answers a click (opening by find-in-page, for one, just appears).
 */
export function StackRulerTicks({groupSizes}: {groupSizes: readonly number[]}) {
  const trackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const details = track?.closest('details');
    const summary = details?.querySelector('summary');
    if (!track || !details || !summary) return;

    const remeasure = () => measure(track);
    const onClick = () => {
      remeasure();
      details.dataset.anim = details.open ? 'close' : 'open';
    };
    remeasure();
    void document.fonts.ready.then(remeasure);
    const observer = new ResizeObserver(remeasure);
    observer.observe(track);
    summary.addEventListener('click', onClick);
    details.addEventListener('toggle', remeasure);
    return () => {
      observer.disconnect();
      summary.removeEventListener('click', onClick);
      details.removeEventListener('toggle', remeasure);
    };
  }, []);

  return (
    <span ref={trackRef} aria-hidden="true" className="relative col-span-full block h-3.5 md:col-span-1 md:mt-3.5 md:col-start-2 md:row-start-1">
      <span className="absolute inset-x-0 top-0 h-px bg-muted/40" />
      {layoutTicks(groupSizes).map(({index, major, left}) => (
        <span
          key={index}
          data-tick={index}
          style={{left: `${left}%`, '--i': index, '--rest': major ? 0.86 : 0.5} as CSSProperties}
          className={cn('stack-ruler-tick', major ? 'bg-muted' : 'bg-muted/50')}
        />
      ))}
    </span>
  );
}
