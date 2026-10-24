'use client';

import {type ReactNode, useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/cn';

type MarkProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The lime highlighter under a key word (in dark mode a translucent bar under lime text). The bar is drawn by default; only when JS runs and motion is
 * allowed (the `motion-js` variant) does it start collapsed and sweep in the first time it scrolls into view.
 *
 * The bar is the span's own background rather than a positioned child, so a long phrase wraps with the sentence and
 * `box-decoration-break: clone` gives each line its own bar, 0.06em past both ends (padding, cancelled by margin).
 * A background sits on the font's content area, not the line box, so its offset adds back half the leading:
 * 1.195em is Bricolage Grotesque's content height, which keeps the bar 0.07em above the line box bottom as before.
 */
export function Mark({children, className}: MarkProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      {threshold: 0.6},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      data-revealed={revealed || undefined}
      className={cn(
        '-mx-[0.06em] box-decoration-clone bg-[linear-gradient(var(--color-highlight),var(--color-highlight))] bg-size-[100%_0.36em] bg-position-[0_calc(100%_-_(1.195em_-_1lh)/2_-_0.07em)] bg-no-repeat px-[0.06em] text-highlight-ink',
        'motion-js:bg-size-[0%_0.36em] motion-js:transition-[background-size] motion-js:duration-700 motion-js:ease-mark motion-js:data-revealed:bg-size-[100%_0.36em]',
        className,
      )}
    >
      {children}
    </span>
  );
}
