'use client';

import {type CSSProperties, type ReactNode, useEffect, useRef} from 'react';
import styles from './reveal.module.css';

/** A progressive enhancement: content remains visible when JavaScript or animation is unavailable. */
export function Reveal({children, className, delay = 0}: {children: ReactNode; className?: string; delay?: number}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || !window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.visible = 'true';
            observer.unobserve(node);
          }
        }
      },
      {threshold: 0.08},
    );
    if (node.getBoundingClientRect().top > window.innerHeight) node.dataset.visible = 'false';
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} className={`${styles.reveal} ${className ?? ''}`} style={{'--reveal-delay': `${delay}ms`} as CSSProperties}>
      {children}
    </div>
  );
}
