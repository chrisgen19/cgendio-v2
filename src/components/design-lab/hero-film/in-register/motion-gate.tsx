'use client';

import type {ReactNode} from 'react';
import {useLabFlags} from '../shared/lab-flags';

/**
 * The scroll track. Sets `data-rm` under `?rm=1` (or the OS setting), which switches the CSS to the static,
 * in-register final state. CSS alone already covers the OS setting and browsers without scroll timelines.
 */
export function MotionGate({className, children}: {className: string; children: ReactNode}) {
  const flags = useLabFlags();
  return (
    <div className={className} data-rm={flags?.reducedMotion ? '' : undefined}>
      {children}
    </div>
  );
}
