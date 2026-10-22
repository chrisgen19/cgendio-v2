import type React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {MarkedTitle, ProcessScene} from '../layout';
import {Appear, cardStyle, MonoLabel, Pop, Reveal, useProgress, WindowDots} from '../primitives';
import {fonts, theme} from '../theme';

const c = theme.code;

const LOG: Array<{text: string; mark: string; color: string; at: number}> = [
  {mark: '$', text: ' git push origin main', color: c.str, at: 26},
  {mark: '→', text: ' Building on Vercel…', color: c.kw, at: 38},
  {mark: '  ✓', text: ' Dependencies installed', color: c.str, at: 48},
  {mark: '  ✓', text: ' Type check passed', color: c.str, at: 56},
  {mark: '  ✓', text: ' Compiled successfully', color: c.str, at: 64},
  {mark: '  ✓', text: ' Static pages generated', color: c.str, at: 72},
  {mark: '→', text: ' Deployed to production', color: c.kw, at: 82},
  {mark: '  ', text: 'https://cgdiomampo.dev', color: c.tag, at: 92},
];

/** Upward speed lines behind the globe — the "launch" beat. */
const Streak: React.FC<{x: number; delay: number; h: number; color: string}> = ({x, delay, h, color}) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  if (t < 0 || t > 3 * 40) return null;
  const leg = t % 40;
  const y = interpolate(leg, [0, 40], [240, -300]);
  const opacity = interpolate(leg, [0, 14, 40], [0, 1, 0]);
  return <div style={{position: 'absolute', left: x, top: 300 + y, width: 2, height: h, background: color, opacity}} />;
};

/** Edge node that pops in, then sends out one ring pulse. */
const Node: React.FC<{x: number; y: number; delay: number; dark?: boolean}> = ({x, y, delay, dark}) => {
  const ring = useProgress(delay + 10, delay + 40);
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      <div
        style={{
          position: 'absolute',
          left: -12 - ring * 22,
          top: -12 - ring * 22,
          width: 24 + ring * 44,
          height: 24 + ring * 44,
          borderRadius: '50%',
          border: `2px solid ${theme.accent}`,
          opacity: ring > 0 ? 1 - ring : 0,
        }}
      />
      <Pop delay={delay} style={{position: 'absolute', left: -12, top: -12}}>
        <span style={{display: 'block', width: 24, height: 24, borderRadius: '50%', background: dark ? theme.ink : theme.accent}} />
      </Pop>
    </div>
  );
};

export const Deploy: React.FC = () => {
  const bar = useProgress(30, 96, (t) => 1 - (1 - t) ** 2);
  return (
    <ProcessScene
      n="05"
      label="Deploy"
      title={<MarkedTitle before="Push. Build. " marked="Ship." />}
      lede="One push to main builds and deploys to Vercel's global edge — with a preview link for every change along the way."
      tags={['Git', 'CI checks', 'Vercel']}
    >
      {/* terminal */}
      <Appear delay={14} style={{position: 'absolute', left: 0, top: 30, width: 620, height: 740}}>
        <div
          style={{
            height: '100%',
            background: c.bg,
            borderRadius: 22,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            boxShadow: theme.shadowDeep,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <WindowDots dark />
            <span style={{fontFamily: fonts.mono, fontSize: 15, color: c.dim}}>~/cgdiomampo.dev — zsh</span>
          </div>
          <div style={{fontFamily: fonts.mono, fontSize: 21, lineHeight: 1.95, whiteSpace: 'pre', color: c.text}}>
            {LOG.map((l) => (
              <Reveal key={l.text} delay={l.at} duration={8} steps={20}>
                <span style={{color: l.color}}>{l.mark}</span>
                <span style={{color: l.text.startsWith('https') ? c.tag : c.text}}>{l.text}</span>
              </Reveal>
            ))}
          </div>
          <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: fonts.mono, fontSize: 15, color: c.dim}}>
              <span>production</span>
              <span>{bar >= 1 ? 'ready' : 'building'}</span>
            </div>
            <div style={{height: 10, borderRadius: 10, background: '#23262E', overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${bar * 100}%`, background: theme.lime, borderRadius: 10}} />
            </div>
          </div>
        </div>
      </Appear>

      <Streak x={720} delay={36} h={140} color={theme.accent} />
      <Streak x={800} delay={46} h={100} color={theme.lime} />
      <Streak x={920} delay={56} h={120} color={theme.accent} />

      {/* globe */}
      <Pop delay={26} style={{position: 'absolute', left: 664, top: 40, width: 330, height: 330}}>
        <svg aria-hidden="true" viewBox="0 0 100 100" width={330} height={330}>
          <circle cx="50" cy="50" r="46" fill="#fff" stroke="#CBD0DA" strokeWidth={0.6} />
          <ellipse cx="50" cy="50" rx="20" ry="46" fill="none" stroke="#DADDE4" strokeWidth={0.6} />
          <ellipse cx="50" cy="50" rx="36" ry="46" fill="none" stroke={theme.outline} strokeWidth={0.6} />
          <path d="M6 36h88M6 64h88M4 50h92" stroke={theme.outline} strokeWidth={0.6} />
        </svg>
        <Node x={100} y={100} delay={48} />
        <Node x={205} y={80} delay={54} />
        <Node x={172} y={186} delay={60} />
        <Node x={72} y={205} delay={66} dark />
        <Node x={245} y={218} delay={72} dark />
      </Pop>
      <Appear delay={60} style={{position: 'absolute', left: 664, top: 388, width: 330, textAlign: 'center'}}>
        <MonoLabel size={16}>GLOBAL EDGE NETWORK</MonoLabel>
      </Appear>

      {/* preview → production */}
      <Appear delay={66} style={{position: 'absolute', left: 664, top: 448, width: 330}}>
        <div style={{...cardStyle, padding: 22, display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10}}>
            <span style={{fontFamily: fonts.mono, fontSize: 15, padding: '10px 14px', borderRadius: 99, background: theme.wireSoft}}>Preview</span>
            <span style={{fontSize: 20}}>→</span>
            <span style={{fontFamily: fonts.mono, fontSize: 15, padding: '10px 14px', borderRadius: 99, background: theme.ink, color: '#fff'}}>
              Production
            </span>
          </div>
          <span style={{fontSize: 17, lineHeight: 1.4, color: theme.muted}}>
            Every change gets its own preview URL to review before it goes live.
          </span>
        </div>
      </Appear>
    </ProcessScene>
  );
};
