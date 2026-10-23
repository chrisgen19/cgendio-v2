import type React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {MarkedTitle} from '../../layout';
import {Appear, cardStyle, GrowX, Mark, MonoLabel, Pop, useProgress} from '../../primitives';
import {fonts, theme} from '../../theme';
import {MobileScene} from './MobileScene';

/** Blocks inside the 214 × 384 phone artboard: wireframe grey → final colour. */
const blocks = [
  {x: 16, y: 40, w: 182, h: 16, r: 4, color: theme.ink},
  {x: 16, y: 150, w: 92, h: 30, r: 99, color: theme.accent},
  {x: 16, y: 200, w: 182, h: 72, r: 10, color: theme.tint},
  {x: 16, y: 284, w: 87, h: 80, r: 10, color: theme.lime},
  {x: 111, y: 284, w: 87, h: 80, r: 10, color: theme.ink},
];

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const opts = {easing: Easing.bezier(0.6, 0, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const t = [14, 40, 60, 86, 108];
  // stays inside the 350px stage including the 96px name tag
  const x = interpolate(frame, t, [200, 80, 50, 236, 214], opts);
  const y = interpolate(frame, t, [330, 160, 170, 60, 112], opts);
  const opacity = interpolate(frame, [14, 20], [0, 1], opts);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px)`, opacity, zIndex: 10}}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width={26} height={26}>
        <path d="M3 2l7.5 19 2.4-7.6L20.5 11z" style={{fill: theme.accent}} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
      <span
        style={{
          display: 'inline-block',
          marginLeft: 16,
          padding: '5px 10px',
          borderRadius: 99,
          background: theme.accent,
          color: theme.onAccent,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Christian
      </span>
    </div>
  );
};

export const MobileDesign: React.FC = () => {
  const colour = useProgress(56, 78);
  return (
    <MobileScene
      n="02"
      label="Design"
      titleLines={2}
      title={<MarkedTitle before="Wireframes that " marked="grow up." markDelay={30} />}
      lede="Low-fi flows become a real design system in Figma."
    >
      {/* phone artboard */}
      <Appear delay={8} y={16} style={{position: 'absolute', left: 0, top: 0, width: 216, height: 400}}>
        <MonoLabel size={11} style={{display: 'block', marginBottom: 6}}>
          Home — iPhone
        </MonoLabel>
        <div style={{...cardStyle, position: 'relative', width: 216, height: 380, borderRadius: 30, overflow: 'hidden'}}>
          {blocks.map((b, i) => (
            <div key={i} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h}}>
              <GrowX delay={14 + i * 3} style={{position: 'absolute', inset: 0, borderRadius: b.r, background: theme.wire}} />
              <div style={{position: 'absolute', inset: 0, borderRadius: b.r, background: b.color, opacity: colour}} />
            </div>
          ))}
          {/* headline: grey bars first, real type after the colour pass */}
          <GrowX delay={18} style={{position: 'absolute', left: 16, top: 76, width: 170, height: 22, borderRadius: 4, background: theme.wire}} />
          <GrowX delay={21} style={{position: 'absolute', left: 16, top: 106, width: 120, height: 22, borderRadius: 4, background: theme.wire}} />
          <div
            style={{
              position: 'absolute',
              left: 16,
              top: 70,
              width: 190,
              height: 64,
              background: theme.surface,
              opacity: colour,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 25,
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
            }}
          >
            Websites that
            <br />
            <Mark delay={74}>actually work.</Mark>
          </div>
        </div>
      </Appear>

      {/* styles panel */}
      <div style={{position: 'absolute', left: 232, top: 20, width: 118, display: 'flex', flexDirection: 'column', gap: 14}}>
        <Appear delay={18}>
          <MonoLabel size={11}>STYLES</MonoLabel>
        </Appear>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 34px)', gap: 10}}>
          {[theme.accent, theme.lime, theme.brandInk, theme.white].map((c, i) => (
            <Pop key={c} delay={28 + i * 3}>
              <span style={{display: 'block', width: 34, height: 34, borderRadius: '50%', background: c, border: `1px solid ${theme.line}`}} />
            </Pop>
          ))}
        </div>
        <Appear delay={36}>
          <div style={{...cardStyle, borderRadius: 16, padding: 12}}>
            <div style={{fontFamily: fonts.display, fontSize: 46, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.05em'}}>Aa</div>
            <MonoLabel size={10} style={{display: 'block', marginTop: 6}}>
              Bricolage
            </MonoLabel>
          </div>
        </Appear>
        <div style={{display: 'flex', flexDirection: 'column', gap: 7}}>
          {[30, 50, 75, 100].map((w, i) => (
            <GrowX key={w} delay={42 + i * 3} style={{height: 8, width: `${w}%`, borderRadius: 8, background: theme.accent, opacity: 1 - i * 0.2}} />
          ))}
        </div>
        <Pop delay={62} style={{alignSelf: 'flex-start'}}>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              padding: '7px 10px',
              borderRadius: 99,
              background: theme.tint,
              color: theme.accent,
              whiteSpace: 'nowrap',
            }}
          >
            ◆ Button
          </span>
        </Pop>
      </div>

      <Cursor />
    </MobileScene>
  );
};
