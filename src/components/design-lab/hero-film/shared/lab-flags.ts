'use client';

import {useEffect, useState} from 'react';

export type LabFlags = {
  /** `?f=<frame>`: seek to this frame and stay paused (deterministic screenshots). */
  frame: number | null;
  /** `?rm=1`, or the OS setting: behave as under prefers-reduced-motion. */
  reducedMotion: boolean;
  /** `?embed=1`: rendered inside the toolbar's phone frame, so hide the lab chrome. */
  embed: boolean;
};

const readFlags = (): LabFlags => {
  const params = new URLSearchParams(window.location.search);
  const f = params.get('f');
  const frame = f !== null && /^\d+$/.test(f) ? Number(f) : null;
  return {
    frame,
    reducedMotion: params.get('rm') === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    embed: params.get('embed') === '1',
  };
};

/** Lab-only URL flags, read after hydration (null until then, so server and client render the same first pass). */
export const useLabFlags = (): LabFlags | null => {
  const [flags, setFlags] = useState<LabFlags | null>(null);
  useEffect(() => setFlags(readFlags()), []);
  return flags;
};
