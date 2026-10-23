import type React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {MarkedTitle, ProcessScene} from '../layout';
import {Appear, cardStyle, GrowX, Mark, MonoLabel, Pop, useProgress, WindowDots} from '../primitives';
import {fonts, theme} from '../theme';

/** Positions inside the 600 × 640 artboard. */
const blocks = [
  {x: 36, y: 38, w: 528, h: 38, r: 6, color: theme.ink},
  {x: 36, y: 128, w: 430, h: 58, r: 6, color: null},
  {x: 36, y: 205, w: 312, h: 58, r: 6, color: null},
  {x: 36, y: 300, w: 156, h: 52, r: 99, color: theme.accent},
  {x: 36, y: 410, w: 162, h: 180, r: 12, color: theme.tint},
  {x: 220, y: 410, w: 162, h: 180, r: 12, color: theme.lime},
  {x: 404, y: 410, w: 160, h: 180, r: 12, color: theme.ink},
];

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const opts = {easing: Easing.bezier(0.6, 0, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const times = [18, 50, 74, 104, 128];
  const x = interpolate(frame, times, [600, 180, 130, 760, 700], opts);
  const y = interpolate(frame, times, [600, 300, 410, 200, 260], opts);
  const opacity = interpolate(frame, [18, 26], [0, 1], opts);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px)`, opacity, zIndex: 10}}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width={36} height={36}>
        <path d="M3 2l7.5 19 2.4-7.6L20.5 11z" style={{fill: theme.accent}} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
      <span
        style={{
          display: 'inline-block',
          marginLeft: 24,
          padding: '7px 14px',
          borderRadius: 99,
          background: theme.accent,
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Christian
      </span>
    </div>
  );
};

export const Design: React.FC = () => {
  // wireframe → full colour, crossfading around 2.4s into the scene
  const colour = useProgress(70, 96);

  return (
    <ProcessScene
      n="02"
      label="Design"
      title={<MarkedTitle before="Wireframes that " marked="grow up." />}
      lede="Low-fi flows become a real design system in Figma — type, colour, spacing and components your brand can keep using."
      tags={['Wireframes', 'Design system', 'Prototype']}
    >
      <Appear delay={8} y={16} style={{position: 'absolute', inset: 0}}>
        <div style={{...cardStyle, position: 'absolute', inset: 0, overflow: 'hidden', background: theme.canvas}}>
          {/* toolbar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 64,
              background: theme.surface,
              borderBottom: `1px solid ${theme.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 26px',
            }}
          >
            <WindowDots />
            <MonoLabel size={16}>Home / Desktop — 1440</MonoLabel>
            <MonoLabel size={16}>100%</MonoLabel>
          </div>

          {/* artboard */}
          <div
            style={{
              position: 'absolute',
              left: 40,
              top: 112,
              width: 600,
              height: 640,
              background: theme.surface,
              border: `1px solid ${theme.line}`,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {blocks.map((b, i) => (
              <div key={i} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h}}>
                <GrowX delay={20 + i * 4} style={{position: 'absolute', inset: 0, borderRadius: b.r, background: theme.wire}} />
                {b.color ? <div style={{position: 'absolute', inset: 0, borderRadius: b.r, background: b.color, opacity: colour}} /> : null}
              </div>
            ))}
            {/* real headline replaces the two grey text bars */}
            <div
              style={{
                position: 'absolute',
                left: 36,
                top: 118,
                width: 528,
                height: 160,
                background: theme.surface,
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 54,
                lineHeight: 1.12,
                letterSpacing: '-0.04em',
                opacity: colour,
              }}
            >
              <div>Websites that</div>
              <div style={{display: 'inline-block'}}>
                <Mark delay={88}>actually work.</Mark>
              </div>
            </div>
          </div>

          {/* styles panel */}
          <div style={{position: 'absolute', left: 680, top: 112, width: 280, display: 'flex', flexDirection: 'column', gap: 22}}>
            <Appear delay={26}>
              <MonoLabel size={16}>STYLES</MonoLabel>
            </Appear>
            <div style={{display: 'flex', gap: 12}}>
              {[theme.accent, theme.lime, theme.brandInk, theme.white].map((c, i) => (
                <Pop key={c} delay={40 + i * 3}>
                  <span style={{display: 'block', width: 46, height: 46, borderRadius: '50%', background: c, border: `1px solid ${theme.line}`}} />
                </Pop>
              ))}
            </div>
            <Appear delay={48}>
              <div style={{...cardStyle, padding: 20}}>
                <div style={{fontFamily: fonts.display, fontSize: 80, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.05em'}}>Aa</div>
                <MonoLabel size={15} style={{display: 'block', marginTop: 10}}>
                  Bricolage / Geist
                </MonoLabel>
              </div>
            </Appear>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              {[30, 50, 75, 100].map((w, i) => (
                <GrowX
                  key={w}
                  delay={56 + i * 3}
                  style={{height: 12, width: `${w}%`, borderRadius: 10, background: theme.accent, opacity: 1 - i * 0.2}}
                />
              ))}
            </div>
            <Pop delay={76} style={{alignSelf: 'flex-start'}}>
              <span
                style={{fontFamily: fonts.mono, fontSize: 15, padding: '10px 16px', borderRadius: 99, background: theme.tint, color: theme.accent}}
              >
                ◆ Button / Primary
              </span>
            </Pop>
          </div>

          <Cursor />
        </div>
      </Appear>
    </ProcessScene>
  );
};
