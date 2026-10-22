import type React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {MarkedTitle} from '../../layout';
import {Appear, cardStyle, Mark, MonoLabel, Reveal, useSpringIn} from '../../primitives';
import {fonts, theme} from '../../theme';
import {MobileScene} from './MobileScene';

const CONFETTI = Array.from({length: 14}, (_, i) => ({
  x: 10 + random(`mx-${i}`) * 330,
  size: 8 + Math.round(random(`ms-${i}`) * 7),
  delay: 34 + Math.round(random(`md-${i}`) * 20),
  spin: 300 + random(`mr-${i}`) * 400,
  round: i % 2 === 0,
  color: [theme.accent, theme.lime, theme.ink, theme.accent][i % 4],
}));

const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {CONFETTI.map((c, i) => {
        const t = frame - c.delay;
        if (t < 0 || t > 64) return null;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: c.x,
              top: interpolate(t, [0, 64], [-40, 420]),
              width: c.size,
              height: c.size,
              background: c.color,
              borderRadius: c.round ? '50%' : 2,
              transform: `rotate(${(c.spin * t) / 64}deg)`,
              opacity: interpolate(t, [0, 5, 48, 64], [0, 1, 1, 0]),
              zIndex: 8,
            }}
          />
        );
      })}
    </>
  );
};

/** iOS-style notification dropping in from the top. */
const Notification: React.FC<{y: number; delay: number; icon: React.ReactNode; title: string; sub: string}> = ({y, delay, icon, title, sub}) => {
  const p = useSpringIn(delay, {damping: 16, stiffness: 140});
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: y,
        width: 350,
        zIndex: 6,
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * -70}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div
        style={{
          ...cardStyle,
          borderRadius: 18,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(255,255,255,.94)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {icon}
        <span style={{display: 'flex', flexDirection: 'column', gap: 3, flex: 1}}>
          <b style={{fontSize: 15}}>{title}</b>
          <MonoLabel size={11}>{sub}</MonoLabel>
        </span>
        <MonoLabel size={11}>now</MonoLabel>
      </div>
    </div>
  );
};

const iconBox = (bg: string, color: string, child: React.ReactNode) => (
  <span style={{width: 36, height: 36, borderRadius: 10, background: bg, color, display: 'grid', placeItems: 'center', flex: 'none'}}>{child}</span>
);

const LiveDot: React.FC = () => {
  const frame = useCurrentFrame();
  const leg = Math.max(0, frame - 20) % 30;
  const ring = frame < 20 || frame > 20 + 30 * 3 ? 0 : leg / 30;
  return (
    <span style={{position: 'relative', width: 10, height: 10, display: 'inline-block'}}>
      <span
        style={{position: 'absolute', inset: -ring * 10, borderRadius: '50%', border: `2px solid ${theme.accent}`, opacity: ring > 0 ? 1 - ring : 0}}
      />
      <span style={{position: 'absolute', inset: 0, borderRadius: '50%', background: theme.accent}} />
    </span>
  );
};

export const MobileLive: React.FC = () => (
  <MobileScene
    n="06"
    label="Live"
    titleLines={1}
    title={<MarkedTitle before="And it's " marked="live." markDelay={30} />}
    lede="Fast, findable and ready for the next inquiry — and we stay on to look after it."
  >
    <Confetti />

    {/* phone browser */}
    <Appear delay={8} style={{position: 'absolute', left: 40, top: 128, width: 270, height: 272}}>
      <div style={{...cardStyle, height: '100%', borderRadius: 26, overflow: 'hidden'}}>
        <div style={{height: 46, borderBottom: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px'}}>
          <div
            style={{flex: 1, height: 28, borderRadius: 99, background: '#F1F2F5', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px'}}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width={12} height={12} fill="none" stroke={theme.ink} strokeWidth={2.6}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <Reveal delay={16} duration={12}>
              <span style={{fontFamily: fonts.mono, fontSize: 12}}>cgdiomampo.dev</span>
            </Reveal>
          </div>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: theme.accent}}>
            <LiveDot />
            Live
          </span>
        </div>
        <div style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
          <MonoLabel size={10}>WEB STUDIO · TAGUIG, PH</MonoLabel>
          <div style={{fontFamily: fonts.display, fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.045em'}}>
            We build websites
            <br />
            that <Mark delay={36}>work.</Mark>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <span style={{padding: '9px 14px', borderRadius: 99, background: theme.ink, color: '#fff', fontSize: 12, fontWeight: 600}}>
              See my works
            </span>
            <span style={{padding: '9px 14px', borderRadius: 99, border: `1px solid ${theme.line}`, fontSize: 12, fontWeight: 600}}>
              Let&apos;s talk
            </span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8}}>
            <span style={{height: 50, borderRadius: 12, background: theme.tint}} />
            <span style={{height: 50, borderRadius: 12, background: theme.lime}} />
            <span style={{height: 50, borderRadius: 12, background: theme.ink}} />
          </div>
        </div>
      </div>
    </Appear>

    {/* notifications stack in from the top */}
    <Notification
      y={0}
      delay={30}
      title="Deployment ready"
      sub="production"
      icon={iconBox(theme.ink, theme.lime, <span style={{fontSize: 17}}>✓</span>)}
    />
    <Notification
      y={62}
      delay={46}
      title="New project inquiry"
      sub="contact form"
      icon={iconBox(
        theme.accent,
        '#fff',
        <svg aria-hidden="true" viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>,
      )}
    />
  </MobileScene>
);
