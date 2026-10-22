import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {MarkedTitle, ProcessScene} from '../layout';
import {Appear, Mark, MonoLabel, Reveal, SlideIn, WindowDots, cardStyle} from '../primitives';
import {fonts, theme} from '../theme';

const CONFETTI = Array.from({length: 18}, (_, i) => ({
  x: 40 + random(`cx-${i}`) * 920,
  size: 12 + Math.round(random(`cs-${i}`) * 10),
  delay: 44 + Math.round(random(`cd-${i}`) * 24),
  spin: 300 + random(`cr-${i}`) * 400,
  drift: (random(`cdx-${i}`) - 0.5) * 120,
  round: i % 2 === 0,
  color: [theme.accent, theme.lime, theme.ink, theme.accent][i % 4],
}));

const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {CONFETTI.map((c, i) => {
        const t = frame - c.delay;
        if (t < 0 || t > 78) return null;
        const y = interpolate(t, [0, 78], [-120, 840]);
        const opacity = interpolate(t, [0, 6, 60, 78], [0, 1, 1, 0]);
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: c.x + (c.drift * t) / 78,
              top: y,
              width: c.size,
              height: c.size,
              background: c.color,
              borderRadius: c.round ? '50%' : 3,
              transform: `rotate(${(c.spin * t) / 78}deg)`,
              opacity,
              zIndex: 8,
            }}
          />
        );
      })}
    </>
  );
};

const LiveDot: React.FC = () => {
  const frame = useCurrentFrame();
  const leg = Math.max(0, frame - 30) % 36;
  const ring = frame < 30 || frame > 30 + 36 * 4 ? 0 : leg / 36;
  return (
    <span style={{position: 'relative', width: 14, height: 14, display: 'inline-block'}}>
      <span
        style={{
          position: 'absolute',
          inset: -ring * 14,
          borderRadius: '50%',
          border: `2px solid ${theme.accent}`,
          opacity: ring > 0 ? 1 - ring : 0,
        }}
      />
      <span style={{position: 'absolute', inset: 0, borderRadius: '50%', background: theme.accent}} />
    </span>
  );
};

const Toast: React.FC<{x: number; y: number; w: number; delay: number; icon: React.ReactNode; title: string; sub: string}> = ({
  x,
  y,
  w,
  delay,
  icon,
  title,
  sub,
}) => (
  <SlideIn delay={delay} style={{position: 'absolute', left: x, top: y, width: w, zIndex: 6}}>
    <div style={{...cardStyle, padding: 18, display: 'flex', alignItems: 'center', gap: 16}}>
      {icon}
      <span style={{display: 'flex', flexDirection: 'column', gap: 5}}>
        <b style={{fontSize: 19}}>{title}</b>
        <MonoLabel size={14}>{sub}</MonoLabel>
      </span>
    </div>
  </SlideIn>
);

const iconBox = (bg: string, color: string, child: React.ReactNode) => (
  <span style={{width: 44, height: 44, borderRadius: 12, background: bg, color, display: 'grid', placeItems: 'center', flex: 'none'}}>{child}</span>
);

export const Live: React.FC = () => (
  <ProcessScene
    n="06"
    label="Live"
    title={<MarkedTitle before="And it's " marked="live." />}
    lede="Out in the world — fast, findable and ready for the next inquiry. We stay on for monitoring, updates and whatever comes next."
    tags={['Analytics', 'Monitoring', 'Care plan']}
  >
    <Confetti />

    {/* browser */}
    <Appear delay={10} style={{position: 'absolute', left: 0, top: 32, width: 820, height: 720}}>
      <div style={{...cardStyle, height: '100%', overflow: 'hidden'}}>
        <div style={{height: 78, borderBottom: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px'}}>
          <WindowDots />
          <div style={{flex: 1, height: 44, borderRadius: 99, background: '#F1F2F5', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px'}}>
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={theme.ink} strokeWidth={2.4}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <Reveal delay={24} duration={14}>
              <span style={{fontFamily: fonts.mono, fontSize: 17}}>cgdiomampo.dev</span>
            </Reveal>
          </div>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600, color: theme.accent}}>
            <LiveDot />
            Live
          </span>
        </div>
        <div style={{padding: 40, display: 'flex', flexDirection: 'column', gap: 24}}>
          <Appear delay={26}>
            <MonoLabel size={15}>WEB STUDIO · TAGUIG, PH</MonoLabel>
          </Appear>
          <Appear delay={30}>
            <div style={{fontFamily: fonts.display, fontSize: 54, fontWeight: 800, lineHeight: 0.98, letterSpacing: '-0.045em'}}>
              We build websites
              <br />
              that <Mark delay={52}>work.</Mark>
            </div>
          </Appear>
          <Appear delay={36} style={{display: 'flex', gap: 14}}>
            <span style={{padding: '14px 24px', borderRadius: 99, background: theme.ink, color: '#fff', fontSize: 17, fontWeight: 600}}>See my works</span>
            <span style={{padding: '14px 24px', borderRadius: 99, border: `1px solid ${theme.line}`, fontSize: 17, fontWeight: 600}}>Let&apos;s talk</span>
          </Appear>
          <Appear delay={42} style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14}}>
            <span style={{height: 150, borderRadius: 16, background: theme.tint}} />
            <span style={{height: 150, borderRadius: 16, background: theme.lime}} />
            <span style={{height: 150, borderRadius: 16, background: theme.ink}} />
          </Appear>
        </div>
      </div>
    </Appear>

    <Toast
      x={600}
      y={128}
      w={400}
      delay={42}
      title="Deployment ready"
      sub="production · just now"
      icon={iconBox(theme.ink, theme.lime, <span style={{fontSize: 22}}>✓</span>)}
    />
    <Toast
      x={640}
      y={304}
      w={360}
      delay={60}
      title="New project inquiry"
      sub="from the contact form"
      icon={iconBox(
        theme.accent,
        '#fff',
        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>,
      )}
    />
    <Toast
      x={580}
      y={480}
      w={400}
      delay={78}
      title="Uptime check passed"
      sub="all regions healthy"
      icon={iconBox(
        theme.lime,
        theme.ink,
        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>,
      )}
    />
  </ProcessScene>
);
