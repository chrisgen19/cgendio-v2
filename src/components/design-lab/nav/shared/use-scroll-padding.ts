'use client';

import {useEffect} from 'react';

/**
 * Reserves the sticky header's height on the scroll container, so an in-page link ("Work") lands the section below
 * the header instead of behind it. Without it the first 72-84px of every section the nav points at is hidden, which
 * is the one way a sticky header can be actively worse than a header that scrolls away.
 *
 * Not folded into `useHeaderState` because each direction is a different height, and because a header that docks to
 * the bottom edge on phones needs the room at the other end instead.
 *
 * @param height The header's own height in px. The extra 16px is breathing room above the heading it lands on.
 */
export const useScrollPaddingTop = (height: number) => {
  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = `${height + 16}px`;
    return () => {
      document.documentElement.style.scrollPaddingTop = '';
    };
  }, [height]);
};
