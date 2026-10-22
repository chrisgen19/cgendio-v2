import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {MarkedTitle, ProcessScene} from '../layout';
import {Appear, MonoLabel, Pop, Reveal, SlideIn, Tag, WindowDots, cardStyle} from '../primitives';
import {fonts, theme} from '../theme';

const c = theme.code;

/** Each line is an array of [text, colour] tokens. */
const LINES: Array<Array<[string, string]>> = [
  [['export function', c.kw], [' Button() {', c.text]],
  [['  return', c.kw], [' (', c.text]],
  [['    <', c.text], ['a', c.tag], [' href=', c.text], ['"/contact"', c.str]],
  [['      className=', c.text], ['"rounded-full', c.str]],
  [['        bg-accent px-6 py-3"', c.str], ['>', c.text]],
  [['      Start a project →', c.text]],
  [['    </', c.text], ['a', c.tag], ['>', c.text]],
  [['  )', c.text]],
  [['}', c.text]],
];

/** Design tokens travelling from the Figma frame into the editor. */
const TokenBeam: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 385, top: 318, width: 70, height: 20}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 9, height: 2, background: theme.line}} />
      {[0, 1, 2, 3].map((i) => {
        const local = (frame - 36 - i * 11) % 34;
        const active = frame > 36 + i * 11 && frame < 130;
        const x = interpolate(local, [0, 34], [0, 70]);
        const opacity = active ? interpolate(local, [0, 6, 28, 34], [0, 1, 1, 0]) : 0;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x - 10,
              top: 0,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: i % 2 ? theme.lime : theme.accent,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

export const FigmaToWeb: React.FC = () => (
  <ProcessScene
    n="03"
    label="Figma → Web"
    title={<MarkedTitle before="Pixel to " marked="production." />}
    lede="Every frame becomes typed, reusable components — Next.js and React, or a custom WordPress theme, wired straight from Figma."
    tags={['Next.js', 'TypeScript', 'Tailwind', 'Builder.io']}
  >
    {/* Figma frame */}
    <SlideIn delay={14} distance={-260} style={{position: 'absolute', left: 0, top: 64, width: 380, height: 528}}>
      <div style={{...cardStyle, height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 20}}>
        <MonoLabel size={15}>FRAME · Button/Primary</MonoLabel>
        <div style={{flex: 1, borderRadius: 14, background: '#F3F4F7', display: 'grid', placeItems: 'center'}}>
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              padding: '16px 26px',
              borderRadius: 99,
              background: theme.accent,
              color: '#fff',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Start a project →
            <Pop delay={34} style={{position: 'absolute', inset: -10}}>
              <span style={{position: 'absolute', inset: 0, border: `1.5px dashed ${theme.accent}`, borderRadius: 99}} />
            </Pop>
          </span>
        </div>
        <div style={{fontFamily: fonts.mono, fontSize: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
          {[
            ['Variant', 'Primary'],
            ['Size', 'Large'],
            ['Radius', 'Full'],
          ].map(([k, v]) => (
            <div key={k} style={{display: 'flex', justifyContent: 'space-between'}}>
              <span style={{color: theme.muted}}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideIn>

    <TokenBeam />

    {/* Editor */}
    <Appear delay={20} style={{position: 'absolute', left: 460, top: 0, width: 540, height: 624}}>
      <div
        style={{
          height: '100%',
          background: c.bg,
          borderRadius: 22,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: theme.shadowDeep,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <WindowDots dark />
          <span style={{fontFamily: fonts.mono, fontSize: 15, color: '#fff', padding: '8px 14px', background: c.chrome, borderRadius: 8}}>Button.tsx</span>
          <span style={{fontFamily: fonts.mono, fontSize: 15, color: c.dim}}>page.tsx</span>
        </div>
        <div style={{fontFamily: fonts.mono, fontSize: 18.5, lineHeight: 1.75, whiteSpace: 'pre', color: c.text}}>
          {LINES.map((tokens, i) => (
            <Reveal key={i} delay={30 + i * 7} duration={9} steps={18}>
              <span style={{color: c.dim}}>{String(i + 1).padStart(2, ' ')}  </span>
              {tokens.map(([text, color], j) => (
                <span key={j} style={{color}}>
                  {text}
                </span>
              ))}
            </Reveal>
          ))}
        </div>
        <Appear delay={96} y={8} style={{marginTop: 'auto'}}>
          <span style={{fontFamily: fonts.mono, fontSize: 15, color: c.str}}>✓ 0 type errors · ✓ matches Figma</span>
        </Appear>
      </div>
    </Appear>

    {/* stack chips */}
    <div style={{position: 'absolute', left: 0, top: 676, width: 1000, display: 'flex', flexWrap: 'wrap', gap: 12}}>
      {['Figma MCP', 'Design tokens', 'Components'].map((t, i) => (
        <Pop key={t} delay={66 + i * 4}>
          <Tag size={16}>{t}</Tag>
        </Pop>
      ))}
      <Pop delay={80}>
        <Tag size={16} inverted>
          WordPress or Next.js
        </Tag>
      </Pop>
    </div>
  </ProcessScene>
);
