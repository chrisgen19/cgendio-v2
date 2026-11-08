import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {ARRIVE, LEAVE, progress} from '../shared/motion';

/**
 * The two context moves of the film. Each is a leaf that reads the frame itself, so the (static) children passed in
 * keep their identity and don't re-render on every frame.
 */

type Offset = {x?: number; y?: number};

type AppearProps = {
  at: number;
  dur?: number;
  exit?: number;
  exitDur?: number;
  /** Where it arrives from (px offset from its place). */
  from?: Offset;
  /** Where it leaves to. */
  to?: Offset;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Fade in (and optionally out) with a short drift. Unmounted while invisible. */
export const Appear: React.FC<AppearProps> = ({at, dur = 12, exit, exitDur = 10, from = {y: 10}, to = {}, style, children}) => {
  const frame = useCurrentFrame();
  if (frame < at || (exit !== undefined && frame >= exit + exitDur)) return null;
  const pin = progress(frame, at, at + dur, ARRIVE);
  const pout = exit === undefined ? 0 : progress(frame, exit, exit + exitDur, LEAVE);
  const x = (1 - pin) * (from.x ?? 0) + pout * (to.x ?? 0);
  const y = (1 - pin) * (from.y ?? 0) + pout * (to.y ?? 0);
  return <div style={{...style, opacity: pin * (1 - pout), translate: `${x}px ${y}px`}}>{children}</div>;
};

/** Insets in px: top, right, bottom, left. */
export type Insets = [number, number, number, number];

type ClipProps = {
  at: number;
  dur?: number;
  exit?: number;
  exitDur?: number;
  /** The clip it opens from (px insets of its own box); it closes back to `closeTo` (default: the same). */
  openFrom: Insets;
  closeTo?: Insets;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Clip-path reveal from a smaller box to the full box, and back. Unmounted while closed. */
export const ClipReveal: React.FC<ClipProps> = ({at, dur = 16, exit, exitDur = 12, openFrom, closeTo = openFrom, radius = 0, style, children}) => {
  const frame = useCurrentFrame();
  if (frame < at || (exit !== undefined && frame >= exit + exitDur)) return null;
  const pin = progress(frame, at, at + dur, ARRIVE);
  const pout = exit === undefined ? 0 : progress(frame, exit, exit + exitDur, LEAVE);
  const inset = openFrom.map((v, i) => v * (1 - pin) + closeTo[i] * pout);
  return <div style={{...style, clipPath: `inset(${inset.map((v) => `${v}px`).join(' ')} round ${radius}px)`}}>{children}</div>;
};

/** A side reveal: insets that hide the whole box except a 0-width edge. */
export const fromSide = (side: 'left' | 'right' | 'top' | 'bottom', w: number, h: number): Insets => {
  if (side === 'left') return [0, w, 0, 0];
  if (side === 'right') return [0, 0, 0, w];
  if (side === 'top') return [0, 0, h, 0];
  return [h, 0, 0, 0];
};
