import type React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {MarkedTitle, ProcessScene} from '../layout';
import {Appear, Check, cardStyle, MonoLabel, Pop, useProgress, WindowDots} from '../primitives';
import {theme} from '../theme';

/** A horizontal scan line sweeping the device twice. */
export const Scan: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);
  const cycle = 48;
  const phase = Math.min(t, cycle * 2);
  const leg = phase % cycle;
  const forward = Math.floor(phase / cycle) % 2 === 0;
  const p = interpolate(leg, [0, cycle], [0, 1]);
  const top = 6 + (forward ? p : 1 - p) * 88;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${top}%`,
        height: 2,
        background: theme.accent,
        opacity: frame < delay || t > cycle * 2 ? 0 : 1,
      }}
    />
  );
};

export const MiniPage: React.FC<{scale?: number}> = ({scale = 1}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 14 * scale}}>
    <span style={{height: 70 * scale, borderRadius: 10, background: theme.tint}} />
    <span style={{height: 16 * scale, width: '72%', borderRadius: 10, background: theme.wire}} />
    <span style={{height: 16 * scale, width: '50%', borderRadius: 10, background: theme.wire}} />
    <div style={{display: 'flex', gap: 12 * scale}}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{flex: 1, height: 64 * scale, borderRadius: 10, background: theme.wireSoft}} />
      ))}
    </div>
  </div>
);

const Ring: React.FC<{delay: number; label: string}> = ({delay, label}) => {
  const p = useProgress(delay, delay + 40, (t) => 1 - (1 - t) ** 3);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <span style={{position: 'relative', width: 62, height: 62, flex: 'none'}}>
        <svg aria-hidden="true" viewBox="0 0 40 40" width={62} height={62} style={{transform: 'rotate(-90deg)'}}>
          <circle cx="20" cy="20" r="16" fill="none" stroke={theme.wire} strokeWidth={4} />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={theme.accent}
            strokeWidth={4}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - p * 100}
          />
        </svg>
        <Pop delay={delay + 40} style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={22}
            height={22}
            fill="none"
            stroke={theme.accent}
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </Pop>
      </span>
      <span style={{fontSize: 19}}>{label}</span>
    </div>
  );
};

const checks = ['Responsive at every breakpoint', 'Accessibility (WCAG 2.2 AA)', 'Core Web Vitals', 'Cross-browser', 'Forms & integrations'];

export const QA: React.FC = () => (
  <ProcessScene
    n="04"
    label="QA"
    title={<MarkedTitle before="Tested like it's " marked="launch day." />}
    lede="Every breakpoint, browser and form gets checked — plus accessibility and Core Web Vitals — before anything ships."
    tags={['Responsive', 'WCAG 2.2 AA', 'Web Vitals']}
  >
    {/* desktop */}
    <Appear delay={14} style={{position: 'absolute', left: 0, top: 16, width: 540, height: 416}}>
      <div style={{...cardStyle, height: '100%', overflow: 'hidden', position: 'relative'}}>
        <div style={{height: 50, borderBottom: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', padding: '0 20px'}}>
          <WindowDots />
        </div>
        <div style={{padding: 24}}>
          <MiniPage />
        </div>
        <Scan delay={30} />
      </div>
    </Appear>
    {/* tablet */}
    <Appear delay={20} style={{position: 'absolute', left: 580, top: 48, width: 220, height: 368}}>
      <div style={{...cardStyle, borderRadius: 24, height: '100%', padding: 16, overflow: 'hidden', position: 'relative'}}>
        <MiniPage scale={0.8} />
        <Scan delay={36} />
      </div>
    </Appear>
    {/* phone */}
    <Appear delay={26} style={{position: 'absolute', left: 840, top: 96, width: 150, height: 320}}>
      <div style={{...cardStyle, borderRadius: 28, height: '100%', padding: 12, overflow: 'hidden', position: 'relative'}}>
        <MiniPage scale={0.62} />
        <Scan delay={42} />
      </div>
    </Appear>

    {/* checklist */}
    <Appear delay={30} style={{position: 'absolute', left: 0, top: 472, width: 540, height: 328}}>
      <div style={{...cardStyle, height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 15}}>
        <MonoLabel size={16}>QA CHECKLIST</MonoLabel>
        {checks.map((label, i) => (
          <div key={label} style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 19}}>
            <Pop delay={48 + i * 9}>
              <Check size={28} />
            </Pop>
            {label}
          </div>
        ))}
      </div>
    </Appear>

    {/* quality gate */}
    <Appear delay={36} style={{position: 'absolute', left: 580, top: 472, width: 420, height: 328}}>
      <div style={{...cardStyle, height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 20}}>
        <MonoLabel size={16}>QUALITY GATE</MonoLabel>
        <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, alignContent: 'center'}}>
          <Ring delay={48} label="Performance" />
          <Ring delay={54} label="Accessibility" />
          <Ring delay={60} label="Best practices" />
          <Ring delay={66} label="SEO" />
        </div>
      </div>
    </Appear>
  </ProcessScene>
);
