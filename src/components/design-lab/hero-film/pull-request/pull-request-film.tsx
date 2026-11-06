'use client';

import type React from 'react';
import {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '@/components/hero-film/theme';
import {FilmPlayer, type LabFilmProps} from '../shared/film-player';
import {MOVE, progress} from '../shared/motion';
import {type Cut, CutContext, DESKTOP_SIZES, MOBILE_SIZES, useCut} from './cut-context';
import {LiveSite} from './live-site';
import {PrPage} from './pr-page';
import {DESKTOP_TIMING, desktopGeometry, enter, MOBILE_TIMING, mobileGeometry, scrollAt} from './timeline';

/**
 * The film's one transition: the preview thumbnail scales up through the frame until it is the live site.
 * Everything uses a single fixed point `f`, so the PR page (scaling by `c`) and the thumbnail (scaling by `s0 * c`)
 * move as one camera, and the thumbnail lands on the full frame exactly.
 */
const Camera: React.FC<{page: React.ReactNode; live: React.ReactNode}> = ({page, live}) => {
  const frame = useCurrentFrame();
  const {t, g} = useCut();
  const {k, ox, oy, thumb, width, height} = g;
  const [z0, z1] = t.zoom;

  const s0 = (k * thumb.w) / width;
  const restX = ox + k * thumb.x;
  const restY = oy + k * (thumb.y - g.scroll);
  const fx = restX / (1 - s0);
  const fy = restY / (1 - s0);
  const radius = k * g.radius;

  if (frame >= z1) {
    return <AbsoluteFill>{live}</AbsoluteFill>;
  }

  if (frame >= z0) {
    const c = interpolate(frame, [z0, z1], [1, 1 / s0], {
      easing: MOVE,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      output: 'perceptual-scale',
    });
    const s = s0 * c;
    const r = (radius * (1 - progress(frame, z0, z1, MOVE))) / s;
    return (
      <>
        <AbsoluteFill aria-hidden="true" style={{transformOrigin: `${fx}px ${fy}px`, scale: c}}>
          {page}
        </AbsoluteFill>
        <div
          inert
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            transformOrigin: '0 0',
            translate: `${fx * (1 - s)}px ${fy * (1 - s)}px`,
            scale: s,
            clipPath: `inset(0 round ${r}px)`,
          }}
        >
          {live}
        </div>
      </>
    );
  }

  const showLive = frame >= t.preview;
  const {opacity, dy} = enter(frame, t.preview);
  const built = progress(frame, t.build[0], t.build[1], MOVE);
  const y = oy + k * (thumb.y + dy - scrollAt(t, g, frame));
  return (
    <>
      <AbsoluteFill aria-hidden="true">{page}</AbsoluteFill>
      {showLive ? (
        <div
          inert
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            transformOrigin: '0 0',
            translate: `${restX}px ${y}px`,
            scale: s0,
            opacity,
            clipPath: `inset(0 0 ${(1 - built) * 100}% 0 round ${radius / s0}px)`,
          }}
        >
          {live}
        </div>
      ) : null}
    </>
  );
};

const CutRoot: React.FC<LabFilmProps & {portrait: boolean}> = ({worksHref, onReplay, portrait}) => {
  const {width, height} = useVideoConfig();
  const cut: Cut = useMemo(
    () =>
      portrait
        ? {t: MOBILE_TIMING, g: mobileGeometry(width, height), sz: MOBILE_SIZES}
        : {t: DESKTOP_TIMING, g: desktopGeometry(width, height), sz: DESKTOP_SIZES},
    [portrait, width, height],
  );
  const page = useMemo(() => <PrPage />, []);
  const live = useMemo(() => <LiveSite worksHref={worksHref} onReplay={onReplay} />, [worksHref, onReplay]);
  return (
    <CutContext.Provider value={cut}>
      <AbsoluteFill style={{background: theme.stage, overflow: 'hidden'}}>
        <Camera page={page} live={live} />
      </AbsoluteFill>
    </CutContext.Provider>
  );
};

const DesktopCut: React.FC<LabFilmProps> = (props) => <CutRoot {...props} portrait={false} />;
const MobileCut: React.FC<LabFilmProps> = (props) => <CutRoot {...props} portrait />;

export function PullRequestFilm() {
  return (
    <FilmPlayer
      desktop={{component: DesktopCut, durationInFrames: DESKTOP_TIMING.duration}}
      mobile={{component: MobileCut, durationInFrames: MOBILE_TIMING.duration}}
      label="Hero film: the pull request"
      description="A pull request by Christian Diomampo titled feat: launch the new site. Its description reads: I design, build and ship websites that work. A short code diff appears, then a preview deployment of the site. Five checks pass one by one: lint, types, accessibility (WCAG 2.2 AA), Core Web Vitals and cross-browser. The pull request is merged, and the preview grows to fill the screen as the live site, with a link to see my work."
    />
  );
}
