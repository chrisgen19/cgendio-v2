import type React from 'react';
import {MarkedTitle} from '../../layout';
import {Abs, Appear, cardStyle, GrowY, MonoLabel, Pop, Reveal} from '../../primitives';
import {fonts, theme} from '../../theme';
import {MobileScene} from './MobileScene';

/** A cascading deck: each card covers the one behind it below its name, so every persona's name stays readable. */
const personas = [
  {x: 0, y: 66, rot: -2, n: '01', name: 'Recruiter', need: 'Wants proof of skill, fast.', dot: theme.tint, delay: 26},
  {x: 46, y: 116, rot: 1.5, n: '02', name: 'Client', need: 'Wants it live, on budget.', dot: theme.lime, delay: 32},
  {x: 92, y: 166, rot: -1, n: '03', name: 'Visitor', need: 'Wants it fast and clear.', dot: theme.ink, delay: 38},
];

const bars = [34, 50, 44, 66, 58, 82, 100];

export const MobileResearch: React.FC = () => (
  <MobileScene
    n="01"
    label="Research"
    titleLines={2}
    title={
      <MarkedTitle
        before="Listen "
        marked="first."
        after={
          <>
            <br />
            Build second.
          </>
        }
        markDelay={30}
      />
    }
    lede="Goals, users and competitors — mapped before a single pixel."
  >
    {/* search query */}
    <Appear delay={10} style={{position: 'absolute', left: 0, top: 0, width: 350}}>
      <div style={{...cardStyle, height: 52, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px'}}>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width={20}
          height={20}
          fill="none"
          style={{stroke: theme.ink}}
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <Reveal delay={18} duration={20} steps={22}>
          <span style={{fontFamily: fonts.mono, fontSize: 15, whiteSpace: 'nowrap'}}>who visits — and why?</span>
        </Reveal>
      </div>
    </Appear>

    {/* fanned persona deck */}
    {personas.map((p) => (
      <Abs key={p.n} x={p.x} y={p.y} w={258} style={{transform: `rotate(${p.rot}deg)`}}>
        <Pop delay={p.delay}>
          {/* name sits on the top line so it stays visible when the next card overlaps */}
          <div style={{...cardStyle, borderRadius: 18, padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 6}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <span style={{width: 18, height: 18, borderRadius: '50%', background: p.dot, border: `1px solid ${theme.line}`, flex: 'none'}} />
              <span style={{fontFamily: fonts.display, fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', flex: 1}}>{p.name}</span>
              <MonoLabel size={11}>{p.n}</MonoLabel>
            </div>
            <span style={{fontSize: 14, lineHeight: 1.35, color: theme.muted}}>{p.need}</span>
          </div>
        </Pop>
      </Abs>
    ))}

    {/* audience chart */}
    <Appear delay={40} style={{position: 'absolute', left: 0, top: 286, width: 350, height: 114}}>
      <div style={{...cardStyle, borderRadius: 18, height: '100%', padding: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <MonoLabel size={12} color={theme.ink}>
            Audience insights
          </MonoLabel>
          <MonoLabel size={12}>90 days</MonoLabel>
        </div>
        <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8}}>
          {bars.map((h, i) => (
            <GrowY
              key={i}
              delay={46 + i * 3}
              style={{flex: 1, height: `${h}%`, borderRadius: 5, background: i === bars.length - 1 ? theme.accent : theme.bar}}
            />
          ))}
        </div>
      </div>
    </Appear>
  </MobileScene>
);
