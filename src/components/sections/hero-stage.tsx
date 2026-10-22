'use client';

import dynamic from 'next/dynamic';
import {type ReactNode, useCallback, useState} from 'react';
import {cn} from '@/lib/cn';

// Remotion is heavy and client-only: load it after hydration so it never blocks the first paint
const HeroPlayer = dynamic(() => import('@/components/hero-film/HeroPlayer').then((m) => m.HeroPlayer), {ssr: false});

type HeroStageProps = {
  worksHref: string;
  /** Server-rendered first frame, shown on top until the Player has its first frame. */
  children: ReactNode;
};

export function HeroStage({worksHref, children}: HeroStageProps) {
  const [ready, setReady] = useState(false);
  const onFirstFrame = useCallback(() => setReady(true), []);

  return (
    <>
      <div className="absolute inset-0">
        <HeroPlayer worksHref={worksHref} onFirstFrame={onFirstFrame} />
      </div>
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
