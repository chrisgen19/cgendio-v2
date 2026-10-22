import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {MarkedTitle} from '../../layout';
import {Appear, MonoLabel, Pop, Reveal, WindowDots, cardStyle} from '../../primitives';
import {fonts, theme} from '../../theme';
import {MobileScene} from './MobileScene';

const c = theme.code;

const LINES: Array<Array<[string, string]>> = [
  [['export function', c.kw], [' Button() {', c.text]],
  [['  return', c.kw], [' (', c.text]],
  [['    <', c.text], ['a', c.tag], [' className=', c.text], ['"btn"', c.str], ['>', c.text]],
  [['      Start a project →', c.text]],
  [['    </', c.text], ['a', c.tag], ['>', c.text]],
  [['  )', c.text]],
  [['}', c.text]],
];

/** Tokens dropping from the Figma frame into the editor. */
const TokenDrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 165, top: 128, width: 20, height: 44}}>
      <div style={{position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: theme.line}} />
      {[0, 1, 2].map((i) => {
        const local = (frame - 28 - i * 9) % 26;
        const active = frame > 28 + i * 9 && frame < 105;
        const y = interpolate(local, [0, 26], [-6, 40]);
        const opacity = active ? interpolate(local, [0, 5, 20, 26], [0, 1, 1, 0]) : 0;
        return (
          <span
            key={i}
            style={{position: 'absolute', left: 3, top: y, width: 14, height: 14, borderRadius: '50%', background: i % 2 ? theme.lime : theme.accent, opacity}}
          />
        );
      })}
    </div>
  );
};

export const MobileFigmaToWeb: React.FC = () => (
  <MobileScene
    n="03"
    label="Figma → Web"
    titleLines={2}
    title={<MarkedTitle before="Pixel to " marked="production." markDelay={30} />}
    lede="Figma frames become typed, reusable components."
  >
    {/* Figma frame */}
    <Appear delay={10} style={{position: 'absolute', left: 0, top: 0, width: 350, height: 120}}>
      <div style={{...cardStyle, borderRadius: 18, height: '100%', padding: 14, display: 'flex', gap: 14}}>
        <div style={{flex: 1, borderRadius: 12, background: '#F3F4F7', display: 'grid', placeItems: 'center'}}>
          <span style={{position: 'relative', display: 'inline-flex', padding: '10px 16px', borderRadius: 99, background: theme.accent, color: '#fff', fontSize: 14, fontWeight: 600}}>
            Start a project →
            <Pop delay={26} style={{position: 'absolute', inset: -7}}>
              <span style={{position: 'absolute', inset: 0, border: `1.5px dashed ${theme.accent}`, borderRadius: 99}} />
            </Pop>
          </span>
        </div>
        <div style={{width: 104, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, fontFamily: fonts.mono, fontSize: 11}}>
          <MonoLabel size={10}>FRAME</MonoLabel>
          <span>Button/Primary</span>
          <span style={{color: theme.muted}}>Size · Large</span>
          <span style={{color: theme.muted}}>Radius · Full</span>
        </div>
      </div>
    </Appear>

    <TokenDrop />

    {/* editor */}
    <Appear delay={18} style={{position: 'absolute', left: 0, top: 176, width: 350, height: 224}}>
      <div style={{height: '100%', background: c.bg, borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: theme.shadowDeep}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <WindowDots dark size={9} />
          <span style={{fontFamily: fonts.mono, fontSize: 11, color: '#fff', padding: '5px 9px', background: c.chrome, borderRadius: 6}}>Button.tsx</span>
        </div>
        <div style={{fontFamily: fonts.mono, fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre', color: c.text}}>
          {LINES.map((tokens, i) => (
            <Reveal key={i} delay={26 + i * 6} duration={7} steps={14}>
              {tokens.map(([text, color], j) => (
                <span key={j} style={{color}}>
                  {text}
                </span>
              ))}
            </Reveal>
          ))}
        </div>
        <Appear delay={76} y={6} style={{marginTop: 'auto'}}>
          <span style={{fontFamily: fonts.mono, fontSize: 11.5, color: c.str}}>✓ 0 type errors · ✓ matches Figma</span>
        </Appear>
      </div>
    </Appear>
  </MobileScene>
);
