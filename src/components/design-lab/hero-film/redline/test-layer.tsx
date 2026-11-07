import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {Check} from '@/components/hero-film/primitives';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, progress} from '../shared/motion';
import {Appear, ClipReveal, fromSide, type Insets} from './anim';
import {type CardGeo, type Rect, type RedlineLayout, rectAt} from './geometry';
import {ProjectCard} from './project-card';
import type {Timing} from './timing';
import {EXIT} from './timing';

const GREEN = '#16A34A';

const Dots: React.FC<{size: number}> = ({size}) => (
  <div style={{display: 'flex', gap: size * 0.6, flex: 'none'}}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{width: size, height: size, borderRadius: size, background: theme.windowDot}} />
    ))}
  </div>
);

/** The address bar: localhost while testing, then the live domain with a status dot. */
const Address: React.FC<{T: Timing; size: number}> = ({T, size}) => {
  const frame = useCurrentFrame();
  const live = progress(frame, T.live, T.live + 10, ARRIVE);
  const text: React.CSSProperties = {gridArea: '1 / 1', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'};
  return (
    <div
      style={{
        display: 'grid',
        flex: 1,
        minWidth: 0,
        height: size + 10,
        padding: '0 8px',
        alignItems: 'center',
        borderRadius: 999,
        background: theme.field,
        fontFamily: fonts.mono,
        fontSize: size,
        color: theme.muted,
        overflow: 'hidden',
      }}
    >
      <span style={{...text, opacity: 1 - live}}>localhost:3000</span>
      <span style={{...text, opacity: live, color: theme.ink}}>
        <span style={{width: 6, height: 6, borderRadius: 3, background: GREEN, boxShadow: '0 0 0 3px rgba(22,163,74,.15)'}} />
        cgdiomampo.dev
      </span>
    </div>
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

/** Insets of a window that leave only the card's box visible, so the window opens out of the card. */
const cardInsets = (win: Rect, card: Rect): Insets => [
  card.y - win.y,
  win.x + win.w - (card.x + card.w),
  win.y + win.h - (card.y + card.h),
  card.x - win.x,
];

/** Beat 3 (desktop): the browser window opens out of the card. Also the phone frame in the phone cut. */
export const BrowserWindow: React.FC<{L: RedlineLayout; T: Timing}> = ({L, T}) => {
  const w = L.window;
  const c = rectAt(L.poses.test, L.card);
  const radius = L.portrait ? 22 : 12;
  return (
    <ClipReveal
      at={T.windowIn}
      dur={16}
      exit={T.collapse}
      exitDur={12}
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
            height: L.chrome,
            padding: '0 10px',
            background: theme.surface,
            borderBottom: `1px solid ${theme.line}`,
          }}
        >
          <Dots size={L.portrait ? 6 : 7} />
          <Address T={T} size={L.portrait ? 10 : 9} />
        </div>
        {L.portrait ? null : (
          <div style={{position: 'absolute', left: 16, top: L.chrome + 24, width: c.x - w.x - 34}}>
            <PageBars u={w.h / 243} />
          </div>
        )}
      </div>
    </ClipReveal>
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

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 34,
  padding: '0 14px 0 6px',
  borderRadius: 999,
  background: theme.surface,
  boxShadow: `inset 0 0 0 1px ${theme.line}`,
  fontFamily: fonts.body,
  fontWeight: 500,
  fontSize: 13,
  color: theme.ink,
  whiteSpace: 'nowrap',
};

/** Beat 3: the other viewports, the device ticks and the QA checks. */
export const TestLayer: React.FC<{L: RedlineLayout; T: Timing}> = ({L, T}) => (
  <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    {L.tablet ? <Device r={L.tablet} card={L.card} at={T.tabletIn} exit={T.testOut} kind="tablet" /> : null}
    {L.phone ? <Device r={L.phone} card={L.card} at={T.phoneIn} exit={T.testOut + 2} kind="phone" /> : null}
    {L.devices.map((d, i) => (
      <Appear
        key={d.label}
        at={T.ticks + i * 4}
        dur={10}
        exit={T.testOut + i * 2}
        from={{y: 6}}
        style={{position: 'absolute', left: d.x, top: L.devicesY, width: d.w, display: 'flex', justifyContent: 'center'}}
      >
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: fonts.mono, fontWeight: 500, fontSize: 12, color: theme.ink}}>
          <Check size={18} dark />
          {d.label}
        </span>
      </Appear>
    ))}
    <div
      style={{
        position: 'absolute',
        left: L.checks.x,
        top: L.checks.y,
        width: L.checks.w,
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: L.portrait ? 'column' : 'row',
        alignItems: L.portrait ? 'flex-start' : 'center',
        justifyContent: L.portrait ? 'flex-start' : 'center',
        gap: L.portrait ? 6 : 8,
      }}
    >
      {CHECKS.map((label, i) => (
        <Appear key={label} at={T.checks + i * 5} dur={10} exit={T.testOut + i} from={{y: 8}}>
          <span style={L.portrait ? {...pill, height: 22, padding: 0, boxShadow: 'none', background: 'transparent'} : pill}>
            <Check size={L.portrait ? 18 : 22} dark />
            {label}
          </span>
        </Appear>
      ))}
    </div>
  </div>
);

const STEPS = ['Push', 'Build', 'Ship'];

/** Progress along the deploy, drawn as a bar. */
const DeployBar: React.FC<{T: Timing}> = ({T}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{height: 4, borderRadius: 4, background: theme.wireSoft, overflow: 'hidden'}}>
      <div
        style={{
          height: '100%',
          background: theme.accent,
          transformOrigin: 'left center',
          scale: `${progress(frame, T.deploy + 4, T.live - 2, LEAVE)} 1`,
        }}
      />
    </div>
  );
};

/** Beat 4: push, build, ship, then the live status. */
export const ShipLayer: React.FC<{L: RedlineLayout; T: Timing}> = ({L, T}) => {
  const r = L.deploy;
  const span = T.live - T.deploy - 6;
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <ClipReveal
        at={T.deploy}
        dur={14}
        exit={T.collapse}
        exitDur={EXIT}
        openFrom={fromSide(L.portrait ? 'top' : 'left', r.w, r.h)}
        radius={16}
        style={{position: 'absolute', left: r.x, top: r.y, width: r.w}}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: L.portrait ? 10 : 12,
            padding: L.portrait ? 14 : 16,
            borderRadius: 16,
            background: theme.surface,
            boxShadow: `inset 0 0 0 1px ${theme.line}`,
            fontFamily: fonts.mono,
            fontSize: 12,
            color: theme.ink,
          }}
        >
          <span style={{color: theme.muted, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Deploy</span>
          <DeployBar T={T} />
          <div style={{display: 'flex', flexDirection: L.portrait ? 'row' : 'column', gap: L.portrait ? 16 : 9}}>
            {STEPS.map((step, i) => (
              <span key={step} style={{display: 'inline-flex', alignItems: 'center', gap: 7}}>
                <span style={{display: 'inline-flex', width: 18, height: 18, borderRadius: 9, boxShadow: `inset 0 0 0 1.5px ${theme.line}`}}>
                  <Appear at={T.deploy + 8 + Math.round((span * i) / 3)} dur={8} from={{y: 0}} style={{display: 'flex'}}>
                    <Check size={18} dark />
                  </Appear>
                </span>
                {step}
              </span>
            ))}
          </div>
          <Appear at={T.live} dur={10} from={{y: 6}}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: fonts.body, fontWeight: 600, fontSize: 14}}>
              <span style={{width: 8, height: 8, borderRadius: 4, background: GREEN, boxShadow: '0 0 0 4px rgba(22,163,74,.15)'}} />
              Live
            </span>
          </Appear>
        </div>
      </ClipReveal>
    </div>
  );
};
