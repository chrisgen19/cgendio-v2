'use client';

import type React from 'react';
import {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '@/components/hero-film/theme';
import {isPortrait} from '@/components/hero-film/timeline';
import {FilmPlayer, type LabFilmProps} from '../shared/film-player';
import {ARRIVE, MOVE, progress} from '../shared/motion';
import {ClaimColumn, ReplayButton} from './claim';
import {CodeLayer} from './code-layer';
import {DesignLayer} from './design-layer';
import {computeLayout, type RedlineLayout} from './geometry';
import {ProjectCard} from './project-card';
import {BrowserWindow, ShipLayer, TestLayer} from './test-layer';
import {DESKTOP_TIMING, GLIDE, PHONE_TIMING, type Timing} from './timing';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * The only thing that moves across cuts: the card glides between its four poses (match cuts). Everything else in the
 * film appears and leaves around it while it holds still.
 */
const CardTrack: React.FC<{L: RedlineLayout; T: Timing; children: React.ReactNode}> = ({L, T, children}) => {
  const frame = useCurrentFrame();
  const {design, code, test, final} = L.poses;
  const keys = [T.glideToCode, T.glideToCode + GLIDE, T.glideToTest, T.glideToTest + GLIDE, T.glideToFinal, T.glideToFinal + GLIDE];
  const easing = [MOVE, Easing.linear, MOVE, Easing.linear, MOVE];
  const enter = progress(frame, T.cardIn, T.cardIn + 16, ARRIVE);
  const cx = interpolate(frame, keys, [design.cx, code.cx, code.cx, test.cx, test.cx, final.cx], {...CLAMP, easing});
  const cy = interpolate(frame, keys, [design.cy, code.cy, code.cy, test.cy, test.cy, final.cy], {...CLAMP, easing});
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: enter,
        translate: `${cx}px ${cy + (1 - enter) * 16}px`,
        scale: interpolate(frame, keys, [design.s, code.s, code.s, test.s, test.s, final.s], {...CLAMP, easing, output: 'perceptual-scale'}),
      }}
    >
      <div style={{position: 'absolute', left: -L.card.w / 2, top: -L.card.h / 2}}>{children}</div>
    </div>
  );
};

/** The dot-grid stage the card lives on, from the first frame to the last. */
const StagePanel: React.FC<{L: RedlineLayout}> = ({L}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: L.stage.x,
      top: L.stage.y,
      width: L.stage.w,
      height: L.stage.h,
      borderRadius: 28,
      background: `radial-gradient(circle, ${theme.dot} 1px, transparent 1.3px) 0 0 / 26px 26px, ${theme.canvas}`,
      boxShadow: `inset 0 0 0 1px ${theme.line}`,
    }}
  />
);

const Film: React.FC<LabFilmProps & {T: Timing}> = ({worksHref, onReplay, T}) => {
  const {width, height} = useVideoConfig();
  const L = useMemo(() => computeLayout(width, height, isPortrait(width, height)), [width, height]);
  return (
    <AbsoluteFill style={{background: theme.stage, color: theme.ink}}>
      <StagePanel L={L} />
      <BrowserWindow L={L} T={T} />
      <TestLayer L={L} T={T} />
      <ShipLayer L={L} T={T} />
      <CodeLayer L={L} T={T} />
      <CardTrack L={L} T={T}>
        <ProjectCard geo={L.card} href={worksHref} liveAt={T.finalIn} />
      </CardTrack>
      <DesignLayer L={L} T={T} />
      <ClaimColumn L={L} T={T} />
      <ReplayButton L={L} T={T} onReplay={onReplay} />
    </AbsoluteFill>
  );
};

const DesktopCut: React.FC<LabFilmProps> = (props) => <Film {...props} T={DESKTOP_TIMING} />;
const PhoneCut: React.FC<LabFilmProps> = (props) => <Film {...props} T={PHONE_TIMING} />;

export function RedlineFilm() {
  return (
    <FilmPlayer
      desktop={{component: DesktopCut, durationInFrames: DESKTOP_TIMING.end}}
      mobile={{component: PhoneCut, durationInFrames: PHONE_TIMING.end}}
      label="Hero film: redline to render"
      description="One project card goes from a redlined design frame to component code, renders in a browser at desktop, tablet and phone widths with every QA check passing, ships live, and settles beside my claim: I design, build and ship websites that work. Its button, See my work, links to my projects."
    />
  );
}
