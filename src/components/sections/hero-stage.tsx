'use client';

import dynamic from 'next/dynamic';
import {type ReactNode, useCallback, useEffect, useState} from 'react';
import {cn} from '@/lib/cn';

// Remotion is heavy and client-only: its chunk is only fetched once HeroPlayer renders (see useIdleAfterLoad)
const HeroPlayer = dynamic(() => import('@/components/hero-film/HeroPlayer').then((m) => m.HeroPlayer), {ssr: false});

/**
 * True once the page has loaded and the main thread is idle (or after 2s at most). Starting Remotion then keeps its
 * parse and first render out of the window where the static frame paints and the page becomes interactive.
 */
const useIdleAfterLoad = () => {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let handle = 0;
    const schedule = () => {
      handle = window.requestIdleCallback
        ? window.requestIdleCallback(() => setIdle(true), {timeout: 2000})
        : window.setTimeout(() => setIdle(true), 200);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, {once: true});
    return () => {
      window.removeEventListener('load', schedule);
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);
  return idle;
};

type HeroStageProps = {
  worksHref: string;
  /** Server-rendered first frame, shown on top until the Player has its first frame. */
  children: ReactNode;
};

export function HeroStage({worksHref, children}: HeroStageProps) {
  const [ready, setReady] = useState(false);
  const onFirstFrame = useCallback(() => setReady(true), []);
  const loadFilm = useIdleAfterLoad();

  return (
    <>
      <div className="absolute inset-0">{loadFilm ? <HeroPlayer worksHref={worksHref} onFirstFrame={onFirstFrame} /> : null}</div>
      <div
        aria-hidden={ready || undefined}
        className={cn(
          'absolute inset-0 z-10 transition-opacity duration-400 motion-reduce:transition-none',
          ready && 'pointer-events-none opacity-0',
        )}
      >
        {children}
      </div>
    </>
  );
}
