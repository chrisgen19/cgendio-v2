import type React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '@/components/hero-film/theme';
import {ARRIVE} from '../shared/motion';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type LeafProps = {at: number; dur?: number; style?: React.CSSProperties; children?: React.ReactNode};

/** Fades and settles into place once the camera has stopped. */
export const Arrive: React.FC<LeafProps & {y?: number}> = ({at, dur = 14, y = 16, style, children}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        ...style,
        opacity: interpolate(frame, [at, at + dur], [0, 1], {...CLAMP, easing: ARRIVE}),
        translate: `0 ${interpolate(frame, [at, at + dur], [y, 0], {...CLAMP, easing: ARRIVE})}px`,
      }}
    >
      {children}
    </div>
  );
};

/** Paints its content in with a clip from one edge: how work fills the board. */
export const Wipe: React.FC<LeafProps & {from?: 'left' | 'top'}> = ({at, dur = 14, from = 'left', style, children}) => {
  const frame = useCurrentFrame();
  const hidden = interpolate(frame, [at, at + dur], [100, 0], {...CLAMP, easing: ARRIVE});
  return <div style={{...style, clipPath: from === 'left' ? `inset(0 ${hidden}% 0 0)` : `inset(0 0 ${hidden}% 0)`}}>{children}</div>;
};

/** Fades out as the content that replaces it arrives. */
export const Fade: React.FC<LeafProps> = ({at, dur = 14, style, children}) => {
  const frame = useCurrentFrame();
  return <div style={{...style, opacity: interpolate(frame, [at, at + dur], [1, 0], {...CLAMP, easing: ARRIVE})}}>{children}</div>;
};

/** The site's lime highlighter: a bar under one word, drawn from the left. */
export const Highlight: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  return (
    <span style={{position: 'relative', display: 'inline-block', zIndex: 0, color: theme.markInk}}>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '-0.06em',
          right: '-0.06em',
          bottom: '0.07em',
          height: '0.36em',
          background: theme.mark,
          zIndex: -1,
          transformOrigin: 'left center',
          scale: `${interpolate(frame, [at, at + 16], [0, 1], {...CLAMP, easing: ARRIVE})} 1`,
        }}
      />
      {children}
    </span>
  );
};

/** Swaps one label for another with a short crossfade (the deploy status). */
export const Swap: React.FC<{at: number; before: React.ReactNode; after: React.ReactNode}> = ({at, before, after}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 10], [0, 1], {...CLAMP, easing: ARRIVE});
  return (
    <span style={{display: 'grid'}}>
      <span style={{gridArea: '1 / 1', opacity: 1 - p}}>{before}</span>
      <span style={{gridArea: '1 / 1', opacity: p}}>{after}</span>
    </span>
  );
};

/** A bar that fills from the left, then fades once its job is done (the build progress). */
export const Progress: React.FC<{at: number; end: number; color: string; height: number}> = ({at, end, color, height}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        height,
        background: color,
        transformOrigin: 'left center',
        scale: `${interpolate(frame, [at, end], [0, 1], {...CLAMP, easing: ARRIVE})} 1`,
        opacity: interpolate(frame, [end, end + 8], [1, 0], CLAMP),
      }}
    />
  );
};
