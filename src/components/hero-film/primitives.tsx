import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts, theme} from './theme';

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

export const EASE_INOUT = Easing.bezier(0.7, 0, 0.2, 1);
export const EASE_OUT = Easing.bezier(0.2, 0.8, 0.2, 1);

type SpringCfg = {damping?: number; stiffness?: number; mass?: number};

const SMOOTH: SpringCfg = {damping: 200};
const BOUNCY: SpringCfg = {damping: 12, stiffness: 170, mass: 0.6};

/** 0 → 1 spring that starts `delay` frames into the current sequence. */
export const useSpringIn = (delay: number, config: SpringCfg = SMOOTH) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

/** Linear 0 → 1 between two local frames, clamped, with optional easing. */
export const useProgress = (from: number, to: number, easing: (t: number) => number = (t) => t) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, to], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

type BoxProps = {
  delay?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Fade + rise. */
export const Appear: React.FC<BoxProps & {y?: number}> = ({delay = 0, y = 28, style, children}) => {
  const p = useSpringIn(delay);
  return (
    <div style={{...style, opacity: p, transform: `translateY(${(1 - p) * y}px)`}}>{children}</div>
  );
};

/** Springy scale-in. */
export const Pop: React.FC<BoxProps> = ({delay = 0, style, children}) => {
  const p = useSpringIn(delay, BOUNCY);
  const scale = interpolate(p, [0, 1], [0.55, 1]);
  return (
    <div style={{...style, opacity: Math.min(1, p * 2), transform: `scale(${scale})`}}>{children}</div>
  );
};

/** Slide in from the right with a slight tilt (toasts, cards). */
export const SlideIn: React.FC<BoxProps & {distance?: number}> = ({delay = 0, distance = 300, style, children}) => {
  const p = useSpringIn(delay, {damping: 18, stiffness: 120});
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, p * 1.5),
        transform: `translateX(${(1 - p) * distance}px) rotate(${(1 - p) * 4}deg)`,
      }}
    >
      {children}
    </div>
  );
};

/** Typewriter-style left-to-right reveal, quantised into steps. */
export const Reveal: React.FC<BoxProps & {duration?: number; steps?: number}> = ({
  delay = 0,
  duration = 20,
  steps = 26,
  style,
  children,
}) => {
  const p = useProgress(delay, delay + duration);
  const q = Math.floor(p * steps) / steps;
  return <div style={{...style, clipPath: `inset(0 ${100 - q * 100}% 0 0)`}}>{children}</div>;
};

/** Bar that grows horizontally from its left edge. */
export const GrowX: React.FC<BoxProps> = ({delay = 0, style}) => {
  const p = useSpringIn(delay);
  return <div style={{...style, transform: `scaleX(${p})`, transformOrigin: 'left center'}} />;
};

/** Bar that grows vertically from its bottom edge, with a little overshoot. */
export const GrowY: React.FC<BoxProps> = ({delay = 0, style}) => {
  const p = useSpringIn(delay, {damping: 14, stiffness: 120});
  return <div style={{...style, transform: `scaleY(${p})`, transformOrigin: 'center bottom'}} />;
};

/** Absolutely positioned box in the 1000 × 800 viz coordinate space. */
export const Abs: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);

/* ------------------------------------------------------------------ */
/* Visual atoms                                                        */
/* ------------------------------------------------------------------ */

/** The signature lime highlighter swipe. */
export const Mark: React.FC<{delay: number; children: React.ReactNode}> = ({delay, children}) => {
  const p = useSpringIn(delay, {damping: 30, stiffness: 140});
  return (
    <span style={{position: 'relative', display: 'inline-block', zIndex: 0}}>
      <span
        style={{
          position: 'absolute',
          left: '-0.06em',
          right: '-0.06em',
          bottom: '0.07em',
          height: '0.36em',
          background: theme.lime,
          zIndex: -1,
          transform: `scaleX(${p})`,
          transformOrigin: 'left center',
        }}
      />
      {children}
    </span>
  );
};

export const cardStyle: React.CSSProperties = {
  background: theme.white,
  border: `1px solid ${theme.line}`,
  borderRadius: 22,
  boxShadow: theme.shadow,
};

export const WindowDots: React.FC<{dark?: boolean; size?: number}> = ({dark, size = 13}) => (
  <div style={{display: 'flex', gap: size * 0.7}}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{width: size, height: size, borderRadius: '50%', background: dark ? theme.code.dots : '#D5D8DF'}}
      />
    ))}
  </div>
);

export const Check: React.FC<{size?: number; dark?: boolean}> = ({size = 28, dark}) => (
  <span
    style={{
      width: size,
      height: size,
      flex: 'none',
      borderRadius: '50%',
      background: dark ? theme.ink : theme.accent,
      color: dark ? theme.lime : theme.white,
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  </span>
);

export const Tag: React.FC<{children: React.ReactNode; size?: number; inverted?: boolean}> = ({
  children,
  size = 13,
  inverted,
}) => (
  <span
    style={{
      fontFamily: fonts.mono,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1,
      padding: `${size * 0.65}px ${size * 0.9}px`,
      borderRadius: 999,
      border: `1px solid ${inverted ? theme.ink : theme.line}`,
      background: inverted ? theme.ink : theme.white,
      color: inverted ? theme.white : theme.ink,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

export const MonoLabel: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({
  children,
  size = 16,
  color = theme.muted,
  style,
}) => (
  <span style={{fontFamily: fonts.mono, fontSize: size, color, letterSpacing: '0.04em', ...style}}>{children}</span>
);
