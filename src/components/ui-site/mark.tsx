'use client';

import {type ReactNode, useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/cn';

type MarkProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The lime highlighter under a key word. The bar is drawn by default; only when JS runs and motion is
 * allowed (the `motion-js` variant) does it start collapsed and sweep in the first time it scrolls into view.
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
    <span ref={ref} data-revealed={revealed || undefined} className={cn('group relative z-0 inline-block', className)}>
      {children}
      <span
        aria-hidden="true"
        className="absolute -right-[0.06em] bottom-[0.07em] -left-[0.06em] -z-10 h-[0.36em] origin-left bg-lime motion-js:scale-x-0 motion-js:transition-transform motion-js:duration-700 motion-js:ease-mark motion-js:group-data-revealed:scale-x-100"
      />
    </span>
  );
}
