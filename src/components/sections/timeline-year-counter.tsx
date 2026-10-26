'use client';

import {useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/cn';

export type CounterStop = {
  /** The role's start year, or null when `when` couldn't be parsed (the digits then fade out) */
  year: number | null;
  when: string;
};

type TimelineYearCounterProps = {
  stops: CounterStop[];
  /** The id of the server-rendered <ol>; its <li>s get `data-tl-active` as they cross the reading line */
  listId: string;
};

// Each digit strip repeats 0 to 9 five times and rests in the middle copy, so a roll can wrap in either direction
const COPIES = 5;
const BASE = 20;
const STRIP = Array.from({length: COPIES * 10}, (_, i) => i % 10);

const mod10 = (n: number) => ((n % 10) + 10) % 10;

type DigitProps = {
  digit: number;
  /** The whole year this digit belongs to: comparing it with the last one sets the roll's direction */
  year: number;
};

/**
 * One fixed-width odometer cell. The strip moves by whole digits in the direction of time (down when the year went down),
 * wrapping like a real counter (2022 to 2019 turns the last digit 2, 1, 0, 9), then snaps back to the middle copy without
 * a transition. The direction comes from the years, not the list order, so a later year always rolls forwards.
 */
function Digit({digit, year}: DigitProps) {
  // `snap` turns the transition off for one move: the silent jump back to the middle copy
  const [strip, setStrip] = useState({pos: BASE + digit, snap: false});
  const shown = useRef({digit, year});

  useEffect(() => {
    const from = shown.current;
    shown.current = {digit, year};
    if (from.digit === digit) return;
    const steps = year < from.year ? -mod10(from.digit - digit) : mod10(digit - from.digit);
    setStrip(({pos}) => {
      const next = pos + steps;
      // Rolls interrupted again and again never reach transitionend; past the strip's ends, jump straight to the digit
      return next < 0 || next >= STRIP.length ? {pos: BASE + digit, snap: true} : {pos: next, snap: false};
    });
  }, [digit, year]);

  const settle = () => {
    setStrip((s) => (s.pos >= BASE && s.pos < BASE + 10 ? s : {pos: BASE + mod10(s.pos), snap: true}));
  };

  return (
    <span className="tl-cell">
      <span
        className="tl-strip"
        data-snap={strip.snap || undefined}
        style={{transform: `translate3d(0, ${-strip.pos}em, 0)`}}
        onTransitionEnd={settle}
      >
        {STRIP.map((d, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed strip that never reorders
          <span key={i}>{d}</span>
        ))}
      </span>
    </span>
  );
}

type OdometerProps = {
  year: number | null;
  className?: string;
};

/** Four rolling digit cells showing a year. A null year fades the cells out where they are. */
function Odometer({year, className}: OdometerProps) {
  // Keep the last real digits under a null year, so the cells fade out in place instead of rolling to 0000.
  // Updated during render (React's "storing information from previous renders" pattern), not in a ref.
  const [shownYear, setShownYear] = useState(year ?? 0);
  if (year !== null && year !== shownYear) setShownYear(year);
  const digits = String(shownYear).padStart(4, '0').slice(-4).split('').map(Number);
  return (
    <span className={cn('tl-odometer', className)} data-empty={year === null || undefined}>
      {digits.map((d, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: one cell per digit place
        <Digit key={i} digit={d} year={shownYear} />
      ))}
    </span>
  );
}

/**
 * Tracks which role sits on the reading line (45% down the viewport) and marks its <li> active. Entries are contiguous
 * (their spacing is padding), so exactly one spans the line at a time; above or below the list the last one stays.
 */
const useActiveEntry = (listId: string) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const items = Array.from(document.getElementById(listId)?.children ?? []);
    if (items.length === 0) return;
    const io = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) setActive(items.indexOf(record.target));
        }
      },
      {rootMargin: '-45% 0px -55% 0px'},
    );
    for (const item of items) io.observe(item);
    return () => io.disconnect();
  }, [listId]);

  useEffect(() => {
    const items = Array.from(document.getElementById(listId)?.children ?? []);
    items.forEach((item, i) => {
      item.toggleAttribute('data-tl-active', i === active);
    });
  }, [active, listId]);

  return active;
};

/** The giant sticky year beside the roles: the active role's start year in solid ink, the next one as an outlined ghost below. */
export function TimelineYearCounter({stops, listId}: TimelineYearCounterProps) {
  const active = useActiveEntry(listId);

  const current = stops[active];
  const next = stops[active + 1];
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div aria-hidden="true" className="tl-counter">
      <div className="border-t border-line pt-8">
        {/* 24px tall like each entry's date row, so the two dates sit level when the hairlines meet */}
        <div className="flex min-h-6 items-center gap-4 font-mono text-[13px] leading-none font-medium tracking-[0.08em] text-muted uppercase">
          <span className="text-ink tabular-nums">
            {pad(active + 1)} <span className="text-muted">/ {pad(stops.length)}</span>
          </span>
          <span className="grid">
            {stops.map((stop, i) => (
              <span key={stop.when + String(i)} className="tl-when col-start-1 row-start-1" data-on={i === active || undefined}>
                {stop.when}
              </span>
            ))}
          </span>
        </div>
      </div>
      <Odometer year={current?.year ?? null} className="tl-solid mt-5" />
      <div className="tl-ghost" data-empty={!next || undefined}>
        <Odometer year={next?.year ?? null} />
      </div>
    </div>
  );
}
