import {Easing, interpolate, spring} from 'remotion';

/**
 * Shared motion vocabulary for the hero lab films. One set of curves keeps every direction calm and comparable:
 * - ARRIVE: things entering or settling (strong ease-out, no overshoot)
 * - MOVE: things travelling across the frame, and camera moves (ease-in-out)
 * - LEAVE: things exiting (ease-in, short)
 * - CALM: a critically damped spring for physical-feeling arrivals without bounce
 */
export const ARRIVE = Easing.bezier(0.23, 1, 0.32, 1);
export const MOVE = Easing.bezier(0.77, 0, 0.175, 1);
export const LEAVE = Easing.bezier(0.55, 0, 1, 0.45);
export const CALM = {damping: 200, mass: 1, stiffness: 120, overshootClamping: true} as const;

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 -> 1 between two frames with an easing curve, clamped on both sides. */
export const progress = (frame: number, from: number, to: number, easing: (t: number) => number = ARRIVE) =>
  interpolate(frame, [from, to], [0, 1], {...CLAMP, easing});

/** Maps a frame range onto any numeric range with an easing curve, clamped on both sides. */
export const tween = (frame: number, [from, to]: [number, number], [a, b]: [number, number], easing: (t: number) => number = ARRIVE) =>
  interpolate(frame, [from, to], [a, b], {...CLAMP, easing});

/** A critically damped spring (no bounce) that starts at `delay`, 0 -> 1. */
export const calmSpring = (frame: number, fps: number, delay = 0, durationInFrames?: number) =>
  spring({frame: frame - delay, fps, config: CALM, durationInFrames});

/** Seconds to frames at the lab films' frame rate. */
export const LAB_FPS = 30;
export const sec = (seconds: number) => Math.round(seconds * LAB_FPS);
