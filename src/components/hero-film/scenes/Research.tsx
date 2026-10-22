import React from 'react';
import {MarkedTitle, ProcessScene} from '../layout';
import {Abs, Appear, Check, GrowX, GrowY, MonoLabel, Pop, Reveal, cardStyle} from '../primitives';
import {fonts, theme} from '../theme';

const personas = [
  {x: 30, y: 160, rot: -4, n: '01', name: 'Recruiter', need: 'Wants proof of skill, fast.', dot: theme.tint, delay: 36},
  {x: 350, y: 208, rot: 3, n: '02', name: 'Client', need: 'Wants it live, on brand and on budget.', dot: theme.lime, delay: 44},
  {x: 670, y: 152, rot: -2, n: '03', name: 'Visitor', need: 'Wants it to load and make sense.', dot: theme.ink, delay: 52},
];

const bars = [34, 50, 44, 66, 58, 82, 100];

export const Research: React.FC = () => (
  <ProcessScene
    n="01"
    label="Research"
    title={<MarkedTitle before="Listen " marked="first." after={<><br />Build second.</>} />}
    lede="Goals, audiences, competitors and analytics get mapped before a single pixel — so every screen has a reason to exist."
    tags={['Personas', 'Sitemap', 'Content plan']}
  >
    {/* search query being typed */}
    <Appear delay={12} style={{position: 'absolute', left: 40, top: 8, width: 740}}>
      <div style={{...cardStyle, height: 96, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px'}}>
        <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke={theme.ink} strokeWidth={2.2} strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <Reveal delay={26} duration={26}>
          <span style={{fontFamily: fonts.mono, fontSize: 25, whiteSpace: 'nowrap'}}>who visits — and what do they need?</span>
        </Reveal>
      </div>
    </Appear>

    {/* persona cards */}
    {personas.map((p) => (
      <Abs key={p.n} x={p.x} y={p.y} w={300} style={{transform: `rotate(${p.rot}deg)`}}>
        <Pop delay={p.delay}>
          <div style={{...cardStyle, padding: 24, display: 'flex', flexDirection: 'column', gap: 11}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <span style={{width: 34, height: 34, borderRadius: '50%', background: p.dot}} />
              <MonoLabel size={15}>PERSONA {p.n}</MonoLabel>
            </div>
            <span style={{fontFamily: fonts.display, fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em'}}>{p.name}</span>
            <span style={{fontSize: 20, lineHeight: 1.35, color: theme.muted}}>{p.need}</span>
          </div>
        </Pop>
      </Abs>
    ))}

    {/* audience chart */}
    <Appear delay={46} style={{position: 'absolute', left: 30, top: 464, width: 570, height: 320}}>
      <div style={{...cardStyle, height: '100%', padding: 26, display: 'flex', flexDirection: 'column', gap: 20}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <MonoLabel size={17} color={theme.ink}>Audience insights</MonoLabel>
          <MonoLabel size={17}>last 90 days</MonoLabel>
        </div>
        <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 16}}>
          {bars.map((h, i) => (
            <GrowY
              key={i}
              delay={54 + i * 3}
              style={{flex: 1, height: `${h}%`, borderRadius: 8, background: i === bars.length - 1 ? theme.accent : '#DCDFE6'}}
            />
          ))}
        </div>
      </div>
    </Appear>

    {/* competitor audit */}
    <Appear delay={52} style={{position: 'absolute', left: 630, top: 464, width: 340, height: 320}}>
      <div style={{...cardStyle, height: '100%', padding: 26, display: 'flex', flexDirection: 'column', gap: 26}}>
        <MonoLabel size={17} color={theme.ink}>Competitor audit</MonoLabel>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <GrowX delay={60 + i * 5} style={{flex: 1, height: 16, borderRadius: 10, background: theme.wire}} />
            <Pop delay={76 + i * 6}>
              <Check size={30} dark />
            </Pop>
          </div>
        ))}
      </div>
    </Appear>
  </ProcessScene>
);
