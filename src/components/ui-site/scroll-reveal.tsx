'use client';

import {useEffect} from 'react';

/**
 * Fades `[data-reveal]` elements in the first time they scroll into view. Mounted once per page; the styles live in
 * globals.css and only apply after `reveal-ready` is on <html>, so without JavaScript (or with reduced motion, which the
 * CSS also checks) everything is simply visible. Elements already on screen at start-up are marked revealed first, so
 * nothing in view blinks out.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', '');
          io.unobserve(entry.target);
        }
      },
      {rootMargin: '0px 0px -10% 0px'},
    );

    for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.setAttribute('data-revealed', '');
      else io.observe(el);
    }
    root.classList.add('reveal-ready');

    return () => {
      io.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}
