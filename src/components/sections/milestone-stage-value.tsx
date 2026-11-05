'use client';

import {type CSSProperties, type RefObject, useEffect, useRef} from 'react';
import {parseCountedValue} from '@/lib/milestone-value';

const COUNT_MS = 1000;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Runs a time-based count from `from` to `to` into the span each time `active` turns on. It is never tied to scroll
 * position, so a reader who stops scrolling never sees a half-counted number. Under reduced motion the stage never
 * pins, so this only runs where motion is allowed.
 */
function useCountUp(ref: RefObject<HTMLSpanElement | null>, from: number, to: number, active: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = String(to);
    if (!active || from === to) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      el.textContent = String(Math.round(from + (to - from) * easeOutCubic(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ref, from, to, active]);
}

/** A counted value like '40+': the digits count up, the suffix stays put. The final digits hold the width. */
function CountedValue({from, to, suffix, active}: {from: number; to: number; suffix: string; active: boolean}) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, from, to, active);
  return (
    <span className="ms-enter inline-block">
      <span className="inline-grid">
        <span className="invisible col-start-1 row-start-1">{to}</span>
        <span ref={ref} className="ms-count col-start-1 row-start-1 justify-self-end">
          {to}
        </span>
      </span>
      {suffix}
    </span>
  );
}

/** Splits text into user-perceived characters, so an emoji sequence or a letter with a combining mark stays whole. */
const graphemes = (text: string) => Array.from(new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(text), ({segment}) => segment);

/** A word value like 'CMS': each letter wipes up in turn. Spaces keep their width. */
function WordValue({value}: {value: string}) {
  return (
    <span>
      {graphemes(value).map((char, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: the letters of one value never reorder
          key={i}
          className="ms-char inline-block whitespace-pre"
          style={{'--i': i} as CSSProperties}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * The stage's big value with a lime highlighter bar under it. Screen readers get the plain value once; the animated
 * layers are aria-hidden.
 */
export function MilestoneStageValue({value, active}: {value: string; active: boolean}) {
  const counted = parseCountedValue(value);
  return (
    <p
      className="ms-value ms-stage-value relative m-0 w-fit font-display leading-[0.82] font-extrabold tracking-[-0.055em] whitespace-nowrap text-highlight-ink tabular-nums"
      // Code points, so a curly apostrophe counts once; sizes the value to fit its column (globals.css)
      style={{'--ms-chars': Math.max(2, [...value].length)} as CSSProperties}
    >
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="ms-bar absolute -inset-x-[0.06em] bottom-[0.04em] h-[0.2em] origin-left bg-highlight" />
      <span aria-hidden="true" className="relative pr-[0.04em]">
        {counted ? <CountedValue from={counted.from} to={counted.to} suffix={counted.suffix} active={active} /> : <WordValue value={value} />}
      </span>
    </p>
  );
}
