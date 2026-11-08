import type React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, progress} from '../shared/motion';
import {ClipReveal} from './anim';
import {type JourneyLayout, rectAt} from './geometry';
import {cardInsets, Dots} from './qa-layer';
import {EXIT, type Timing} from './timing';

const URL_TEXT = 'cgdiomampo.dev';

/** The live URL typed into the address bar. */
const TypedUrl: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [from, to], [0, URL_TEXT.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return <span>{URL_TEXT.slice(0, n)}</span>;
};

/** The status at the end of the address bar: a green dot and "Live". */
const LiveBadge: React.FC<{at: number; size: number}> = ({at, size}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, at + 10, ARRIVE);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flex: 'none',
        fontFamily: fonts.body,
        fontWeight: 600,
        fontSize: size + 1,
        color: theme.ink,
        opacity: p,
        translate: `${(1 - p) * 6}px 0px`,
      }}
    >
      <span style={{width: 8, height: 8, borderRadius: 4, background: '#16A34A', boxShadow: '0 0 0 4px rgba(22,163,74,.15)'}} />
      Live
    </span>
  );
};

/** The browser at the live URL, opened out of the card; it sits under the card. */
export const LiveWindow: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const V = T.live;
  const w = L.live.window;
  const card = rectAt(L.poses.live, L.card);
  const radius = L.portrait ? 22 : 14;
  const size = L.portrait ? 10.5 : 12;
  return (
    <ClipReveal
      at={V.window}
      dur={16}
      exit={V.out}
      exitDur={EXIT + 2}
      openFrom={cardInsets(w, card)}
      radius={radius}
      style={{position: 'absolute', left: w.x, top: w.y, width: w.w, height: w.h}}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: theme.preview,
          boxShadow: `inset 0 0 0 1px ${theme.line}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: L.live.chrome,
            padding: L.portrait ? '0 10px' : '0 14px',
            background: theme.surface,
            borderBottom: `1px solid ${theme.line}`,
          }}
        >
          {L.portrait ? null : <Dots size={8} />}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              height: size + 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 10px',
              borderRadius: 999,
              background: theme.field,
              fontFamily: fonts.mono,
              fontSize: size,
              color: theme.ink,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width={size}
              height={size}
              fill="none"
              style={{stroke: theme.muted, flex: 'none'}}
              strokeWidth={2.4}
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <TypedUrl from={V.typeFrom} to={V.typeTo} />
          </div>
          <LiveBadge at={V.dot} size={size} />
        </div>
      </div>
    </ClipReveal>
  );
};

const iconBox = (bg: string, color: string, size: number, child: React.ReactNode) => (
  <span style={{width: size, height: size, borderRadius: 10, background: bg, color, display: 'grid', placeItems: 'center', flex: 'none'}}>
    {child}
  </span>
);

const svgProps = {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round'} as const;

const TOASTS = [
  {
    title: 'Deployment ready',
    sub: 'production, just now',
    icon: (s: number) =>
      iconBox(
        theme.badge,
        theme.badgeInk,
        s,
        <svg aria-hidden="true" {...svgProps} width={s * 0.5} height={s * 0.5} strokeWidth={3}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>,
      ),
  },
  {
    title: 'New project inquiry',
    sub: 'from the contact form',
    icon: (s: number) =>
      iconBox(
        theme.accent,
        theme.onAccent,
        s,
        <svg aria-hidden="true" {...svgProps} width={s * 0.52} height={s * 0.52}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>,
      ),
  },
  {
    title: 'Uptime check passed',
    sub: 'all regions healthy',
    icon: (s: number) =>
      iconBox(
        theme.lime,
        theme.onLime,
        s,
        <svg aria-hidden="true" {...svgProps} width={s * 0.52} height={s * 0.52}>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>,
      ),
  },
];

const ToastBody: React.FC<{t: (typeof TOASTS)[number]; compact: boolean}> = ({t, compact}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: '100%',
      padding: compact ? '0 12px' : '0 14px',
      borderRadius: 16,
      background: theme.surface,
      boxShadow: `inset 0 0 0 1px ${theme.line}, ${theme.shadow}`,
      boxSizing: 'border-box',
    }}
  >
    {t.icon(compact ? 34 : 38)}
    <span style={{display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0}}>
      <b style={{fontFamily: fonts.body, fontWeight: 600, fontSize: compact ? 14 : 15, color: theme.ink, whiteSpace: 'nowrap'}}>{t.title}</b>
      <span style={{fontFamily: fonts.mono, fontSize: 11, color: theme.muted, whiteSpace: 'nowrap'}}>{t.sub}</span>
    </span>
  </div>
);

/**
 * A toast arriving from the right. On desktop the toasts stack downwards; on phones they are dealt onto one deck, the
 * older ones stepping back and peeking out above.
 */
const Toast: React.FC<{
  y: number;
  at: number;
  later: number[];
  deck: boolean;
  out: number;
  children: React.ReactNode;
  x: number;
  w: number;
  h: number;
}> = ({x, y, w, h, at, later, deck, out, children}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= out + EXIT) return null;
  const pin = progress(frame, at, at + 14, ARRIVE);
  const pout = progress(frame, out, out + EXIT, LEAVE);
  const depth = deck ? later.reduce((sum, l) => sum + progress(frame, l, l + 14, ARRIVE), 0) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: pin * (1 - pout),
        translate: `${(1 - pin) * 28}px ${-depth * 9}px`,
        scale: `${1 - depth * 0.05}`,
        transformOrigin: 'center top',
      }}
    >
      {children}
    </div>
  );
};

/** Live: the first notifications coming in over the stage, above the card. */
export const LiveToasts: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const V = T.live;
  const r = L.live.toasts;
  const h = L.portrait ? 58 : 64;
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {TOASTS.map((t, i) => (
        <Toast
          key={t.title}
          x={r.x}
          y={L.portrait ? r.y : r.y + i * (h + 12)}
          w={r.w}
          h={h}
          at={V.toasts[i]}
          later={V.toasts.slice(i + 1)}
          deck={L.portrait}
          out={V.out + i}
        >
          <ToastBody t={t} compact={L.portrait} />
        </Toast>
      ))}
    </div>
  );
};
