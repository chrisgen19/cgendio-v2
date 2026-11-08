import {MOVE, progress, tween} from '../shared/motion';

/** Frame marks for one cut. Every beat reads from here, so the PR page and the live site layer stay in sync. */
export type CutTiming = {
  duration: number;
  /** PR header (title, author, status pill). */
  title: number;
  description: number;
  /** First diff line, then one line every `diffStep` frames. */
  diff: number;
  diffStep: number;
  /** Phone only: the camera scrolls the PR page up to the preview card and checks. */
  scroll: [number, number] | null;
  /** The preview deployment card enters. */
  preview: number;
  /** The thumbnail renders top to bottom; the card reads "Ready" at the end. */
  build: [number, number];
  /** The checks box enters 12 frames before `checks`, then each check runs for `checkRun` frames. */
  checks: number;
  checkStep: number;
  checkRun: number;
  /** The merge button is pressed, then the PR reads "Merged". */
  merge: number;
  merged: number;
  /** The one transition: the thumbnail scales up through the frame and becomes the live site. */
  zoom: [number, number];
  /** The highlighter under "work", after the zoom has settled. */
  mark: number;
};

export const DESKTOP_TIMING: CutTiming = {
  duration: 405,
  title: 0,
  description: 10,
  diff: 30,
  diffStep: 5,
  scroll: null,
  preview: 84,
  build: [96, 120],
  checks: 136,
  checkStep: 15,
  checkRun: 17,
  merge: 230,
  merged: 238,
  zoom: [256, 284],
  mark: 294,
};

export const MOBILE_TIMING: CutTiming = {
  duration: 334,
  title: 0,
  description: 10,
  diff: 28,
  diffStep: 5,
  // The camera starts moving before the preview card fades in, so the card never sits low on the page under the HUD
  scroll: [78, 104],
  preview: 88,
  build: [98, 120],
  checks: 148,
  checkStep: 13,
  checkRun: 15,
  merge: 226,
  merged: 233,
  zoom: [248, 274],
  mark: 284,
};

export const CHECKS = ['Lint', 'Types', 'Accessibility (WCAG 2.2 AA)', 'Core Web Vitals', 'Cross-browser'] as const;

export type CheckState = 'queued' | 'running' | 'passed';

export const checkState = (t: CutTiming, i: number, frame: number): CheckState => {
  const start = t.checks + i * t.checkStep;
  if (frame >= start + t.checkRun) return 'passed';
  if (frame >= start) return 'running';
  return 'queued';
};

export const allPassedAt = (t: CutTiming) => t.checks + (CHECKS.length - 1) * t.checkStep + t.checkRun;

/** Entrance used by every PR element: 14 frames, fade plus a short rise. */
export const enter = (frame: number, at: number, distance = 14) => ({
  opacity: progress(frame, at, at + 12),
  dy: tween(frame, [at, at + 14], [distance, 0]),
});

/** Phone camera: how far (in design px) the PR page has scrolled up at this frame. */
export const scrollAt = (t: CutTiming, g: Geometry, frame: number) => (t.scroll ? tween(frame, t.scroll, [0, g.scroll], MOVE) : 0);

export type Rect = {x: number; y: number; w: number; h: number};

/**
 * The PR page is authored on a fixed design box (1440x900 landscape, 390 wide portrait) and scaled by `k` to fit the
 * composition. The thumbnail rect is in design units; the live site layer converts it to screen pixels.
 */
export type Geometry = {
  portrait: boolean;
  width: number;
  height: number;
  k: number;
  ox: number;
  oy: number;
  boxW: number;
  boxH: number;
  thumb: Rect;
  /** Thumbnail corner radius, design px. */
  radius: number;
  /** Phone camera scroll distance, design px. */
  scroll: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Desktop design box layout (design px). */
export const DESK = {
  padX: 96,
  colTop: 152,
  leftW: 720,
  rightX: 856,
  rightW: 488,
  cardPad: 16,
  cardHead: 52,
} as const;

export const desktopGeometry = (width: number, height: number): Geometry => {
  const boxW = 1440;
  const boxH = 900;
  const k = clamp(Math.min(width / boxW, height / boxH), 0.66, 1.3);
  const tw = DESK.rightW - DESK.cardPad * 2;
  return {
    portrait: false,
    width,
    height,
    k,
    ox: (width - boxW * k) / 2,
    oy: (height - boxH * k) / 2,
    boxW,
    boxH,
    thumb: {x: DESK.rightX + DESK.cardPad, y: DESK.colTop + DESK.cardHead, w: tw, h: (tw * height) / width},
    radius: 12,
    scroll: 0,
  };
};

/** Phone design box layout (design px). */
export const PHONE = {
  padX: 20,
  previewTop: 578,
  cardPad: 12,
  thumbW: 124,
  /** Where the preview card sits once the camera has scrolled. */
  previewRest: 96,
} as const;

export const mobileGeometry = (width: number, height: number): Geometry => {
  const boxW = 390;
  const k = clamp(Math.min(width / boxW, height / 760), 0.8, 1.25);
  const boxH = height / k;
  return {
    portrait: true,
    width,
    height,
    k,
    ox: (width - boxW * k) / 2,
    oy: 0,
    boxW,
    boxH,
    thumb: {x: PHONE.padX + PHONE.cardPad, y: PHONE.previewTop + PHONE.cardPad, w: PHONE.thumbW, h: (PHONE.thumbW * height) / width},
    radius: 10,
    scroll: PHONE.previewTop - PHONE.previewRest,
  };
};
