'use client';

import type React from 'react';
import {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '@/components/hero-film/theme';
import {isPortrait} from '@/components/hero-film/timeline';
import {FilmPlayer, type LabFilmProps} from '../shared/film-player';
import {ARRIVE, MOVE, progress} from '../shared/motion';
import {Appear} from './anim';
import {ClaimColumn, ServiceTags} from './claim';
import {CodeLayer} from './code-layer';
import {DeployLayer} from './deploy-layer';
import {DesignLayer} from './design-layer';
import {computeLayout, type JourneyLayout, type PoseName} from './geometry';
import {LiveToasts, LiveWindow} from './live-layer';
import {ProjectCard} from './project-card';
import {QALayer} from './qa-layer';
import {ResearchLayer} from './research-layer';
import {DESKTOP_TIMING, GLIDE, PHONE_TIMING, type Timing} from './timing';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const ORDER: PoseName[] = ['brief', 'design', 'code', 'test', 'deploy', 'live', 'final'];

/**
 * The only thing that moves across cuts: the card glides between its seven poses (match cuts). Everything else in the
 * film appears and leaves around it while it holds still.
 */
const CardTrack: React.FC<{L: JourneyLayout; T: Timing; children: React.ReactNode}> = ({L, T, children}) => {
  const frame = useCurrentFrame();
  const glides = [T.design.glide, T.code.glide, T.qa.glide, T.deploy.glide, T.live.glide, T.final.glide];
  const keys = glides.flatMap((g) => [g, g + GLIDE]);
  const easing = keys.slice(1).map((_, i) => (i % 2 === 0 ? MOVE : Easing.linear));
  const track = (pick: (name: PoseName) => number) =>
    ORDER.flatMap((name, i) => (i === 0 || i === ORDER.length - 1 ? [pick(name)] : [pick(name), pick(name)]));
  const enter = progress(frame, T.cardIn, T.cardIn + 16, ARRIVE);
  const cx = interpolate(
    frame,
    keys,
    track((n) => L.poses[n].cx),
    {...CLAMP, easing},
  );
  const cy = interpolate(
    frame,
    keys,
    track((n) => L.poses[n].cy),
    {...CLAMP, easing},
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: enter,
        translate: `${cx}px ${cy + (1 - enter) * 16}px`,
        scale: interpolate(
          frame,
          keys,
          track((n) => L.poses[n].s),
          {...CLAMP, easing, output: 'perceptual-scale'},
        ),
      }}
    >
      <div style={{position: 'absolute', left: -L.card.w / 2, top: -L.card.h / 2}}>{children}</div>
    </div>
  );
};

/**
 * Dot colour for the stage. The shared --film-dot token is nearly the dark canvas colour, so the grid vanished in dark
 * mode; mixing from the themed ink keeps it close to #E1E4EA in light mode and visible in dark mode.
 */
const STAGE_DOT = `color-mix(in srgb, ${theme.ink} 11%, transparent)`;

/** The dot-grid stage the card lives on, from the first frame to the last. */
const StagePanel: React.FC<{L: JourneyLayout}> = ({L}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: L.stage.x,
      top: L.stage.y,
      width: L.stage.w,
      height: L.stage.h,
      borderRadius: 28,
      background: `radial-gradient(circle, ${STAGE_DOT} 1px, transparent 1.3px) 0 0 / 26px 26px, ${theme.canvas}`,
      boxShadow: `inset 0 0 0 1px ${theme.line}`,
    }}
  />
);

/**
 * The rest on phones: the services under the card (desktop shows them in the claim column). Replay is the HUD's play
 * button, which turns into Replay once the film ends, so the film has no second one.
 */
const RestLayer: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const services = L.final.services;
  if (!services) return null;
  return (
    <Appear
      at={T.final.start + 4}
      dur={14}
      from={{y: 8}}
      style={{
        position: 'absolute',
        left: services.x,
        top: services.y,
        width: services.w,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <ServiceTags size={11} />
    </Appear>
  );
};

const Film: React.FC<LabFilmProps & {T: Timing}> = ({worksHref, T}) => {
  const {width, height} = useVideoConfig();
  const L = useMemo(() => computeLayout(width, height, isPortrait(width, height)), [width, height]);
  return (
    <AbsoluteFill style={{background: theme.stage, color: theme.ink}}>
      <StagePanel L={L} />
      <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <QALayer L={L} T={T} />
        <LiveWindow L={L} T={T} />
        <DeployLayer L={L} T={T} />
      </div>
      <CardTrack L={L} T={T}>
        <ProjectCard geo={L.card} href={worksHref} liveAt={T.final.start} build={{wire: T.design.wire, styled: T.design.styled}} />
      </CardTrack>
      <ResearchLayer L={L} T={T} />
      <DesignLayer L={L} T={T} />
      <CodeLayer L={L} T={T} />
      <LiveToasts L={L} T={T} />
      <ClaimColumn L={L} T={T} />
      <RestLayer L={L} T={T} />
    </AbsoluteFill>
  );
};

const DesktopCut: React.FC<LabFilmProps> = (props) => <Film {...props} T={DESKTOP_TIMING} />;
const PhoneCut: React.FC<LabFilmProps> = (props) => <Film {...props} T={PHONE_TIMING} />;

export function JourneyFilm() {
  return (
    <FilmPlayer
      desktop={{component: DesktopCut, durationInFrames: DESKTOP_TIMING.end, chapters: DESKTOP_TIMING.chapters, restFrame: DESKTOP_TIMING.restFrame}}
      mobile={{component: PhoneCut, durationInFrames: PHONE_TIMING.end, chapters: PHONE_TIMING.chapters, restFrame: PHONE_TIMING.restFrame}}
      label="Hero film: the full journey"
      description="One project card goes the whole way: an empty brief shaped by research into who visits and what they need, wireframed and redlined in Figma, written as a component, tested at desktop, tablet and phone widths with every QA check passing, pushed and deployed, and live at its URL as the first notifications arrive. It settles beside my claim: I design, build and ship websites that work. Its button, See my work, links to my projects."
    />
  );
}
