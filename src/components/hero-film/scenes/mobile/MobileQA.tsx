import type React from 'react';
import {MarkedTitle} from '../../layout';
import {Appear, Check, cardStyle, MonoLabel, Pop, useProgress} from '../../primitives';
import {theme} from '../../theme';
import {MiniPage, Scan} from '../QA';
import {MobileScene} from './MobileScene';

const checks = ['Every breakpoint', 'WCAG 2.2 AA', 'Core Web Vitals', 'Cross-browser', 'Forms & CRM'];

const Ring: React.FC<{delay: number; label: string}> = ({delay, label}) => {
  const p = useProgress(delay, delay + 30, (t) => 1 - (1 - t) ** 3);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1}}>
      <span style={{position: 'relative', width: 46, height: 46}}>
        <svg aria-hidden="true" viewBox="0 0 40 40" width={46} height={46} style={{transform: 'rotate(-90deg)'}}>
          <circle cx="20" cy="20" r="16" fill="none" style={{stroke: theme.wire}} strokeWidth={4} />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            style={{stroke: theme.accent}}
            strokeWidth={4}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - p * 100}
          />
        </svg>
        <Pop delay={delay + 30} style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            style={{stroke: theme.accent}}
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </Pop>
      </span>
      <span style={{fontSize: 12, textAlign: 'center'}}>{label}</span>
    </div>
  );
};

export const MobileQA: React.FC = () => (
  <MobileScene
    n="04"
    label="QA"
    titleLines={2}
    title={<MarkedTitle before="Tested like it's " marked="launch day." markDelay={30} />}
    lede="Every screen, browser and form — checked before it ships."
  >
    {/* phone under test */}
    <Appear delay={10} style={{position: 'absolute', left: 0, top: 0, width: 132, height: 262}}>
      <div style={{...cardStyle, borderRadius: 26, height: '100%', padding: 11, overflow: 'hidden', position: 'relative'}}>
        <MiniPage scale={0.62} />
        <Scan delay={20} />
      </div>
    </Appear>

    {/* checklist */}
    <Appear delay={16} style={{position: 'absolute', left: 146, top: 0, width: 204, height: 262}}>
      <div style={{...cardStyle, borderRadius: 18, height: '100%', padding: 16, display: 'flex', flexDirection: 'column', gap: 13}}>
        <MonoLabel size={11}>QA CHECKLIST</MonoLabel>
        {checks.map((label, i) => (
          <div key={label} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5}}>
            <Pop delay={30 + i * 7}>
              <Check size={22} />
            </Pop>
            {label}
          </div>
        ))}
      </div>
    </Appear>

    {/* quality gate */}
    <Appear delay={24} style={{position: 'absolute', left: 0, top: 278, width: 350, height: 122}}>
      <div style={{...cardStyle, borderRadius: 18, height: '100%', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8}}>
        <MonoLabel size={11} style={{paddingLeft: 6}}>
          QUALITY GATE
        </MonoLabel>
        <div style={{display: 'flex', gap: 4}}>
          <Ring delay={34} label="Speed" />
          <Ring delay={39} label="Access" />
          <Ring delay={44} label="Practices" />
          <Ring delay={49} label="SEO" />
        </div>
      </div>
    </Appear>
  </MobileScene>
);
