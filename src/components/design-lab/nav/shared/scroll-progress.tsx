'use client';

import {useEffect, useRef} from 'react';
import {cn} from '@/lib/cn';
import styles from './scroll-progress.module.css';

/**
 * How far the reader is through the page, as a bar that fills from the left. Decorative — it repeats what the
 * scrollbar already says — so it carries `aria-hidden` and no role.
 *
 * Give it a height, a colour and a position from `className`; it brings only the fill.
 */
export function ScrollProgress({className}: {className?: string}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (CSS.supports('animation-timeline', 'scroll()')) return;
    const bar = ref.current;
    if (!bar) return;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--nav-progress', String(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className={cn(styles.bar, className)} />;
}
