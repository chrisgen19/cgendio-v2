import {interpolate} from 'remotion';
import {MOVE} from '../shared/motion';

/**
 * The long take: one board, one camera. Everything below is in board units (CSS px at camera scale 1). The camera
 * is a translate + scale on the board container; its poses are worked out from the composition size, so the same
 * board frames itself on any hero size.
 */

export type Rect = {x: number; y: number; w: number; h: number};
export type PoseId = 'board' | 's1' | 's2' | 's3';
type Move = {from: number; to: number; pose: PoseId};
type Pose = {cx: number; cy: number; s: number};

export type Timings = {
  name: number;
  head: number;
  mark: number;
  lede: number;
  s1: number;
  s1Tags: number | null;
  s2: number;
  s3Bar: number;
  s3Page: number;
  s3Toast: number;
  s3Checks: number;
  cta: number;
  ctaButtons: number;
};

export type CutSpec = {
  compact: boolean;
  board: {w: number; h: number};
  title: {
    x: number;
    nameY: number;
    nameSize: number;
    headY: number;
    headSize: number;
    lines: string[];
    ledeY: number;
    ledeSize: number;
    ledeW: number;
  };
  cells: {s1: Rect; s2: Rect; s3: Rect; cta: Rect};
  /** Screen-space margins the camera keeps clear: the site header on top, the film HUD at the bottom. */
  safe: {top: number; bottom: number; side: number};
  maxZoom: number;
  /** Where a station sits in the frame: centred, or pinned under the header so the board above stays out of shot. */
  anchor: 'center' | 'top';
  moves: Move[];
  t: Timings;
  duration: number;
};

export const DESKTOP: CutSpec = {
  compact: false,
  board: {w: 2400, h: 1470},
  title: {
    x: 100,
    nameY: 92,
    nameSize: 28,
    headY: 146,
    headSize: 200,
    lines: ['I design, build & ship', 'websites that work.'],
    ledeY: 570,
    ledeSize: 36,
    ledeW: 1380,
  },
  cells: {
    s1: {x: 100, y: 850, w: 505, h: 560},
    s2: {x: 665, y: 850, w: 505, h: 560},
    s3: {x: 1230, y: 850, w: 505, h: 560},
    cta: {x: 1795, y: 850, w: 505, h: 560},
  },
  safe: {top: 96, bottom: 96, side: 56},
  maxZoom: 1.3,
  anchor: 'center',
  moves: [
    {from: 54, to: 84, pose: 's1'},
    {from: 148, to: 174, pose: 's2'},
    {from: 234, to: 260, pose: 's3'},
    {from: 336, to: 366, pose: 'board'},
  ],
  t: {
    name: 0,
    head: 3,
    mark: 20,
    lede: 12,
    s1: 88,
    s1Tags: 106,
    s2: 178,
    s3Bar: 264,
    s3Page: 280,
    s3Toast: 294,
    s3Checks: 302,
    cta: 368,
    ctaButtons: 376,
  },
  duration: 410,
};

export const PHONE: CutSpec = {
  compact: true,
  board: {w: 960, h: 1920},
  title: {
    x: 40,
    nameY: 40,
    nameSize: 26,
    headY: 88,
    headSize: 92,
    lines: ['I design, build', '& ship websites', 'that work.'],
    ledeY: 384,
    ledeSize: 44,
    ledeW: 880,
  },
  cells: {
    s1: {x: 40, y: 780, w: 420, h: 520},
    s2: {x: 500, y: 780, w: 420, h: 520},
    s3: {x: 40, y: 1360, w: 420, h: 520},
    cta: {x: 500, y: 1360, w: 420, h: 520},
  },
  safe: {top: 84, bottom: 96, side: 16},
  maxZoom: 1.2,
  anchor: 'top',
  moves: [
    {from: 44, to: 70, pose: 's1'},
    {from: 120, to: 144, pose: 's2'},
    {from: 192, to: 218, pose: 's3'},
    {from: 278, to: 306, pose: 'board'},
  ],
  t: {
    name: 0,
    head: 3,
    mark: 18,
    lede: 10,
    s1: 74,
    s1Tags: null,
    s2: 148,
    s3Bar: 222,
    s3Page: 238,
    s3Toast: 250,
    s3Checks: 256,
    cta: 308,
    ctaButtons: 314,
  },
  duration: 340,
};

/** The section plus its tab above, with a little air: what the camera frames at a station. */
const around = (c: Rect): Rect => ({x: c.x - 24, y: c.y - 72, w: c.w + 48, h: c.h + 100});

export const posesFor = (cut: CutSpec, width: number, height: number): Record<PoseId, Pose> => {
  const {top, bottom, side} = cut.safe;
  const safeH = height - top - bottom;
  const fit = (r: Rect, max: number, anchor: CutSpec['anchor']): Pose => {
    const s = Math.min((width - side * 2) / r.w, safeH / r.h, max);
    return {s, cx: r.x + r.w / 2, cy: anchor === 'top' ? r.y + safeH / 2 / s : r.y + r.h / 2};
  };
  return {
    board: fit({x: 0, y: 0, ...cut.board}, 4, 'center'),
    s1: fit(around(cut.cells.s1), cut.maxZoom, cut.anchor),
    s2: fit(around(cut.cells.s2), cut.maxZoom, cut.anchor),
    s3: fit(around(cut.cells.s3), cut.maxZoom, cut.anchor),
  };
};

export type View = {s: number; tx: number; ty: number};

/** Board-to-screen transform for a pose: the pose's centre lands in the centre of the safe area. */
export const viewOf = (pose: Pose, cut: CutSpec, width: number, height: number): View => ({
  s: pose.s,
  tx: width / 2 - pose.cx * pose.s,
  ty: cut.safe.top + (height - cut.safe.top - cut.safe.bottom) / 2 - pose.cy * pose.s,
});

/** Station-to-station moves pull back slightly mid-way, like a hand-held glide; zooms in and out go straight. */
const DIP = 0.12;

/** The camera at a frame: holds between moves, glides with MOVE during them. */
export const cameraAt = (frame: number, cut: CutSpec, width: number, height: number): View => {
  const poses = posesFor(cut, width, height);
  let current: PoseId = 'board';
  for (const move of cut.moves) {
    if (frame < move.from) break;
    if (frame >= move.to) {
      current = move.pose;
      continue;
    }
    const a = poses[current];
    const b = poses[move.pose];
    const range = [move.from, move.to];
    const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: MOVE} as const;
    const t = interpolate(frame, range, [0, 1], opts);
    const dip = current !== 'board' && move.pose !== 'board' ? 1 - DIP * Math.sin(Math.PI * t) : 1;
    const pose: Pose = {
      cx: interpolate(frame, range, [a.cx, b.cx], opts),
      cy: interpolate(frame, range, [a.cy, b.cy], opts),
      s: interpolate(frame, range, [a.s, b.s], {...opts, output: 'perceptual-scale'}) * dip,
    };
    return viewOf(pose, cut, width, height);
  }
  return viewOf(poses[current], cut, width, height);
};
