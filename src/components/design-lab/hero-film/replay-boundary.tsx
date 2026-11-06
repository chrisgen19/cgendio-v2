'use client';

import {type ReactNode, useEffect, useState} from 'react';

export const REPLAY_EVENT = 'hero-lab:replay';

/** Remounts its children when the lab toolbar's Replay is pressed, so a direction restarts without a page reload. */
export function ReplayBoundary({children}: {children: ReactNode}) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    const onReplay = () => setRun((n) => n + 1);
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, []);
  return <div key={run}>{children}</div>;
}
