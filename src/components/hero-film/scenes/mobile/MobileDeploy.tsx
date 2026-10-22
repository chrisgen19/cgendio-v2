import type React from 'react';
import {MarkedTitle} from '../../layout';
import {Appear, cardStyle, MonoLabel, Pop, Reveal, useProgress, WindowDots} from '../../primitives';
import {fonts, theme} from '../../theme';
import {MobileScene} from './MobileScene';

const c = theme.code;

const LOG: Array<{mark: string; text: string; color: string; at: number}> = [
  {mark: '$', text: ' git push origin main', color: c.str, at: 16},
  {mark: '→', text: ' Building on Vercel…', color: c.kw, at: 26},
  {mark: '  ✓', text: ' Type check passed', color: c.str, at: 34},
  {mark: '  ✓', text: ' Compiled successfully', color: c.str, at: 41},
  {mark: '  ✓', text: ' Static pages generated', color: c.str, at: 48},
  {mark: '→', text: ' Deployed to production', color: c.kw, at: 57},
];

/** Edge node with one ring pulse. */
const Node: React.FC<{x: number; y: number; delay: number; dark?: boolean}> = ({x, y, delay, dark}) => {
  const ring = useProgress(delay + 8, delay + 32);
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      <div
        style={{
          position: 'absolute',
          left: -7 - ring * 14,
          top: -7 - ring * 14,
          width: 14 + ring * 28,
          height: 14 + ring * 28,
          borderRadius: '50%',
          border: `2px solid ${theme.accent}`,
          opacity: ring > 0 ? 1 - ring : 0,
        }}
      />
      <Pop delay={delay} style={{position: 'absolute', left: -7, top: -7}}>
        <span style={{display: 'block', width: 14, height: 14, borderRadius: '50%', background: dark ? theme.ink : theme.accent}} />
      </Pop>
    </div>
  );
};

export const MobileDeploy: React.FC = () => {
  const bar = useProgress(20, 70, (t) => 1 - (1 - t) ** 2);
  return (
    <MobileScene
      n="05"
      label="Deploy"
      titleLines={2}
      title={<MarkedTitle before="Push. Build. " marked="Ship." markDelay={30} />}
      lede="One push to main — built and live on Vercel's edge."
    >
      {/* terminal */}
      <Appear delay={10} style={{position: 'absolute', left: 0, top: 0, width: 350, height: 250}}>
        <div
          style={{
            height: '100%',
            background: c.bg,
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: theme.shadowDeep,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <WindowDots dark size={9} />
            <span style={{fontFamily: fonts.mono, fontSize: 11, color: c.dim}}>~/cgdiomampo.dev</span>
          </div>
          <div style={{fontFamily: fonts.mono, fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre', color: c.text}}>
            {LOG.map((l) => (
              <Reveal key={l.text} delay={l.at} duration={7} steps={18}>
                <span style={{color: l.color}}>{l.mark}</span>
                {l.text}
              </Reveal>
            ))}
          </div>
          <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: fonts.mono, fontSize: 11, color: c.dim}}>
              <span>production</span>
              <span>{bar >= 1 ? 'ready' : 'building'}</span>
            </div>
            <div style={{height: 7, borderRadius: 7, background: '#23262E', overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${bar * 100}%`, background: theme.lime, borderRadius: 7}} />
            </div>
          </div>
        </div>
      </Appear>

      {/* globe */}
      <Pop delay={30} style={{position: 'absolute', left: 0, top: 268, width: 132, height: 132}}>
        <svg aria-hidden="true" viewBox="0 0 100 100" width={132} height={132}>
          <circle cx="50" cy="50" r="46" fill="#fff" stroke="#CBD0DA" strokeWidth={1} />
          <ellipse cx="50" cy="50" rx="20" ry="46" fill="none" stroke="#DADDE4" strokeWidth={1} />
          <ellipse cx="50" cy="50" rx="36" ry="46" fill="none" stroke={theme.outline} strokeWidth={1} />
          <path d="M6 36h88M6 64h88M4 50h92" stroke={theme.outline} strokeWidth={1} />
        </svg>
        <Node x={40} y={40} delay={44} />
        <Node x={84} y={32} delay={49} />
        <Node x={70} y={76} delay={54} />
        <Node x={30} y={84} delay={59} dark />
      </Pop>

      {/* preview → production */}
      <Appear delay={46} style={{position: 'absolute', left: 146, top: 278, width: 204}}>
        <div style={{...cardStyle, borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
          <MonoLabel size={10}>EVERY CHANGE</MonoLabel>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <span style={{fontFamily: fonts.mono, fontSize: 11, padding: '7px 9px', borderRadius: 99, background: theme.wireSoft}}>Preview</span>
            <span style={{fontSize: 14}}>→</span>
            <span style={{fontFamily: fonts.mono, fontSize: 11, padding: '7px 9px', borderRadius: 99, background: theme.ink, color: '#fff'}}>
              Live
            </span>
          </div>
          <span style={{fontSize: 13, lineHeight: 1.35, color: theme.muted}}>Reviewed on its own URL first.</span>
        </div>
      </Appear>
    </MobileScene>
  );
};
