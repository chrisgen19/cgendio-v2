import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {Check} from '@/components/hero-film/primitives';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, progress} from '../shared/motion';
import {Appear, ClipReveal, fromSide, type Insets} from './anim';
import {type CardGeo, type JourneyLayout, type Rect, rectAt} from './geometry';
import {ProjectCard} from './project-card';
import {EXIT, type Timing} from './timing';

export const Dots: React.FC<{size: number}> = ({size}) => (
  <div style={{display: 'flex', gap: size * 0.6, flex: 'none'}}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{width: size, height: size, borderRadius: size, background: theme.windowDot}} />
    ))}
  </div>
);

/** Insets of a window that leave only the card's box visible, so the window opens out of the card. */
export const cardInsets = (win: Rect, card: Rect): Insets => [
  card.y - win.y,
  win.x + win.w - (card.x + card.w),
  win.y + win.h - (card.y + card.h),
  card.x - win.x,
];

const bar = (w: string | number, h: number, background: string, extra?: React.CSSProperties): React.CSSProperties => ({
  width: w,
  height: h,
  borderRadius: 999,
  background,
  flex: 'none',
  ...extra,
});

/** The page around the card in the desktop window: my claim as wireframe bars, as on the real hero. */
const PageBars: React.FC<{u: number}> = ({u}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 7 * u}}>
    <div style={bar('40%', 5 * u, theme.bar)} />
    <div style={bar('92%', 13 * u, theme.ink, {marginTop: 4 * u})} />
    <div style={bar('80%', 13 * u, theme.ink)} />
    <div style={{position: 'relative', width: '58%', height: 13 * u}}>
      <div style={{position: 'absolute', left: '50%', right: '-8%', bottom: -2 * u, height: 6 * u, background: theme.lime}} />
      <div style={{position: 'relative', ...bar('100%', 13 * u, theme.ink)}} />
    </div>
    <div style={bar('86%', 5 * u, theme.bar, {marginTop: 6 * u})} />
    <div style={bar('70%', 5 * u, theme.bar)} />
  </div>
);

/** The browser window opens out of the card (a phone frame in the phone cut). */
const TestWindow: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const w = L.qa.window;
  const c = rectAt(L.poses.test, L.card);
  const radius = L.portrait ? 22 : 12;
  const size = L.portrait ? 10 : 9;
  return (
    <ClipReveal
      at={T.qa.window}
      dur={16}
      exit={T.qa.out}
      exitDur={EXIT + 2}
      openFrom={cardInsets(w, c)}
      radius={radius}
      style={{position: 'absolute', left: w.x, top: w.y, width: w.w, height: w.h}}
    >
      <div
        aria-hidden
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
            height: L.qa.chrome,
            padding: '0 10px',
            background: theme.surface,
            borderBottom: `1px solid ${theme.line}`,
          }}
        >
          <Dots size={L.portrait ? 6 : 7} />
          <div
            style={{
              flex: 1,
              height: size + 10,
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              borderRadius: 999,
              background: theme.field,
              fontFamily: fonts.mono,
              fontSize: size,
              color: theme.muted,
            }}
          >
            localhost:3000
          </div>
        </div>
        {L.portrait ? null : (
          <div style={{position: 'absolute', left: 16, top: L.qa.chrome + 24, width: c.x - w.x - 34}}>
            <PageBars u={w.h / 243} />
          </div>
        )}
      </div>
    </ClipReveal>
  );
};

/** A static, scaled copy of the card for the other viewports. */
const CardCopy: React.FC<{card: CardGeo; width: number}> = ({card, width}) => {
  const s = width / card.w;
  return (
    <div style={{width, height: card.h * s, position: 'relative', flex: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', scale: `${s}`}}>
        <ProjectCard geo={card} />
      </div>
    </div>
  );
};

/** A tablet or phone viewport showing the same card, opened from its left edge. */
const Device: React.FC<{r: Rect; card: CardGeo; at: number; exit: number; kind: 'tablet' | 'phone'}> = ({r, card, at, exit, kind}) => {
  const radius = kind === 'tablet' ? 14 : 16;
  const inner = kind === 'tablet' ? 12 : 7;
  return (
    <ClipReveal
      at={at}
      dur={14}
      exit={exit}
      exitDur={EXIT}
      openFrom={fromSide('left', r.w, r.h)}
      radius={radius}
      style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: theme.preview,
          boxShadow: `inset 0 0 0 1px ${theme.line}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: inner,
        }}
      >
        <div
          style={{
            alignSelf: 'stretch',
            height: kind === 'tablet' ? 20 : 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: kind === 'tablet' ? 'flex-start' : 'center',
            padding: '0 8px',
            background: theme.surface,
            borderBottom: `1px solid ${theme.line}`,
          }}
        >
          {kind === 'tablet' ? <Dots size={5} /> : <span style={bar(22, 4, theme.windowDot)} />}
        </div>
        <div style={{alignSelf: 'stretch', padding: `0 ${inner}px`, display: 'flex', flexDirection: 'column', gap: 4}}>
          <div style={bar('80%', kind === 'tablet' ? 7 : 5, theme.ink)} />
          <div style={bar('55%', kind === 'tablet' ? 7 : 5, theme.ink)} />
        </div>
        <CardCopy card={card} width={r.w - inner * 2} />
      </div>
    </ClipReveal>
  );
};

const CHECKS = ['Responsive at every breakpoint', 'Accessibility (WCAG 2.2 AA)', 'Core Web Vitals', 'Cross-browser', 'Forms & integrations'];

/** An empty ring that fills with a check at `at` (opacity and scale only, no overshoot). */
const Tick: React.FC<{at: number; size: number}> = ({at, size}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, at + 10, ARRIVE);
  return (
    <span style={{position: 'relative', display: 'inline-block', width: size, height: size, flex: 'none'}}>
      <span style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 0 1.5px ${theme.bar}`}} />
      <span style={{position: 'absolute', inset: 0, display: 'grid', opacity: p, scale: `${0.6 + 0.4 * p}`}}>
        <Check size={size} dark />
      </span>
    </span>
  );
};

/** QA: the other viewports, the device ticks and the five checks, ticked in order. */
export const QALayer: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const Q = T.qa;
  const pillH = L.portrait ? 22 : 34;
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <TestWindow L={L} T={T} />
      {L.qa.tablet ? <Device r={L.qa.tablet} card={L.card} at={Q.tablet} exit={Q.out} kind="tablet" /> : null}
      {L.qa.phone ? <Device r={L.qa.phone} card={L.card} at={Q.phone} exit={Q.out + 2} kind="phone" /> : null}
      {L.qa.devices.map((d, i) => (
        <Appear
          key={d.label}
          at={Q.devices + i * 4}
          dur={10}
          exit={Q.out + i * 2}
          from={{y: 6}}
          style={{position: 'absolute', left: d.x, top: L.qa.devicesY, width: d.w, display: 'flex', justifyContent: 'center'}}
        >
          <span
            style={{display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: fonts.mono, fontWeight: 500, fontSize: 12, color: theme.ink}}
          >
            <Check size={18} dark />
            {d.label}
          </span>
        </Appear>
      ))}
      <div
        style={{
          position: 'absolute',
          left: L.qa.checks.x,
          top: L.qa.checks.y,
          width: L.qa.checks.w,
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: L.portrait ? 'column' : 'row',
          alignItems: L.portrait ? 'flex-start' : 'center',
          justifyContent: L.portrait ? 'flex-start' : 'center',
          gap: L.portrait ? 2 : 8,
        }}
      >
        {CHECKS.map((label, i) => (
          <Appear key={label} at={Q.checks + i * 2} dur={10} exit={Q.out + i} from={{y: 8}}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: pillH,
                padding: L.portrait ? 0 : '0 14px 0 6px',
                borderRadius: 999,
                background: L.portrait ? 'transparent' : theme.surface,
                boxShadow: L.portrait ? 'none' : `inset 0 0 0 1px ${theme.line}`,
                fontFamily: fonts.body,
                fontWeight: 500,
                fontSize: 13,
                color: theme.ink,
                whiteSpace: 'nowrap',
              }}
            >
              <Tick at={Q.checks + 10 + i * Q.tickStagger} size={L.portrait ? 18 : 22} />
              {label}
            </span>
          </Appear>
        ))}
      </div>
    </div>
  );
};
