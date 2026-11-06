'use client';

import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FilmPlayer, type LabFilmProps} from '../shared/film-player';
import {tween} from '../shared/motion';

/** Smoke test for the shared player; replaced by the real direction. */
function Probe(_props: LabFilmProps) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{display: 'grid', placeItems: 'center', fontFamily: 'var(--font-geist-mono)', color: 'var(--film-ink, #0D0E12)'}}>
      <div style={{translate: `${tween(frame, [0, 60], [-200, 0])}px 0`}}>frame {frame}</div>
    </AbsoluteFill>
  );
}

export function LongTakeFilm() {
  return (
    <FilmPlayer
      desktop={{component: Probe, durationInFrames: 120}}
      mobile={{component: Probe, durationInFrames: 120}}
      label="Hero film: the long take"
      description="Placeholder film."
    />
  );
}
