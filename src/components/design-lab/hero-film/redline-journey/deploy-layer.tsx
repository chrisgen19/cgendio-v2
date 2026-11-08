import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, progress} from '../shared/motion';
import {Appear, ClipReveal, fromSide} from './anim';
import type {JourneyLayout} from './geometry';
import {EXIT, type Timing} from './timing';

const c = theme.code;

const LOG: {mark: string; text: string; markColor: string; textColor?: string}[] = [
  {mark: '$', text: ' git push origin main', markColor: c.str},
  {mark: '→', text: ' Building on Vercel...', markColor: c.kw},
  {mark: '  ✓', text: ' Dependencies installed', markColor: c.str},
  {mark: '  ✓', text: ' Type check passed', markColor: c.str},
  {mark: '  ✓', text: ' Compiled successfully', markColor: c.str},
  {mark: '  ✓', text: ' Static pages generated', markColor: c.str},
  {mark: '→', text: ' Deployed to production', markColor: c.kw},
  {mark: '  ', text: 'https://cgdiomampo.dev', markColor: c.dim, textColor: c.tag},
];

/** One log line, wiped in from the left. */
const LogLine: React.FC<{line: (typeof LOG)[number]; at: number; h: number}> = ({line, at, h}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, at + 8, ARRIVE);
  if (p <= 0) return <div style={{height: h}} />;
  return (
    <div style={{height: h, display: 'flex', alignItems: 'center', whiteSpace: 'pre', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
      <span style={{color: line.markColor}}>{line.mark}</span>
      <span style={{color: line.textColor ?? c.text}}>{line.text}</span>
    </div>
  );
};

/** The build's progress (scaleX) and its state. */
const BuildBar: React.FC<{from: number; to: number; size: number}> = ({from, to, size}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, to, (t) => 1 - (1 - t) ** 2);
  const ready = frame >= to;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: size, color: c.dim}}>
        <span>production</span>
        <span style={{display: 'grid'}}>
          <span style={{gridArea: '1 / 1', textAlign: 'right', opacity: ready ? 0 : 1}}>building</span>
          <span style={{gridArea: '1 / 1', textAlign: 'right', opacity: ready ? 1 : 0, color: c.str}}>ready</span>
        </span>
      </div>
      <div style={{height: 6, borderRadius: 6, background: c.track, overflow: 'hidden'}}>
        <div style={{height: '100%', borderRadius: 6, background: theme.lime, transformOrigin: 'left center', scale: `${p} 1`}} />
      </div>
    </div>
  );
};

const Terminal: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const D = T.deploy;
  const r = L.deploy.terminal;
  const lineH = Math.round(L.deploy.font * (L.portrait ? 1.7 : 1.9));
  return (
    <ClipReveal
      at={D.panel}
      dur={14}
      exit={D.out}
      exitDur={EXIT}
      openFrom={fromSide(L.portrait ? 'top' : 'left', r.w, r.h)}
      radius={18}
      style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 18,
          background: c.bg,
          boxShadow: theme.shadowDeep,
          overflow: 'hidden',
          fontFamily: fonts.mono,
          fontSize: L.deploy.font,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: L.portrait ? 28 : 40,
            padding: '0 14px',
            background: c.chrome,
            flex: 'none',
          }}
        >
          <div style={{display: 'flex', gap: 6}}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{width: 9, height: 9, borderRadius: 5, background: c.dots}} />
            ))}
          </div>
          <span style={{color: c.dim, fontSize: 11}}>~/cgdiomampo.dev</span>
        </div>
        <div style={{padding: L.portrait ? '7px 12px 0' : '11px 18px 0'}}>
          {LOG.map((line, i) => (
            <LogLine key={line.text} line={line} at={D.lines + i * D.lineStagger} h={lineH} />
          ))}
        </div>
        <div style={{marginTop: 'auto', padding: L.portrait ? '0 12px 10px' : '0 18px 16px'}}>
          <BuildBar from={D.barFrom} to={D.barTo} size={L.portrait ? 10 : 12} />
        </div>
      </div>
    </ClipReveal>
  );
};

const pill = (size: number): React.CSSProperties => ({
  gridArea: '1 / 1',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  height: size * 2.4,
  padding: `0 ${size}px`,
  borderRadius: 999,
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: size,
  whiteSpace: 'nowrap',
});

/** Production: an outlined slot until the deploy lands, then the filled pill with a live dot. */
const ProductionPill: React.FC<{at: number; size: number}> = ({at, size}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, at + 10, ARRIVE);
  return (
    <span style={{display: 'inline-grid'}}>
      <span style={{...pill(size), color: theme.muted, boxShadow: `inset 0 0 0 1px ${theme.line}`, background: theme.surface, opacity: 1 - p}}>
        Production
      </span>
      <span style={{...pill(size), background: theme.ink, color: theme.onInk, opacity: p}}>
        <span style={{width: 7, height: 7, borderRadius: 4, background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,.15)'}} />
        Production
      </span>
    </span>
  );
};

/** Deploy: the terminal on one side; on the card's side, its preview then production status, and the review note. */
export const DeployLayer: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const D = T.deploy;
  const st = L.deploy.status;
  const note = L.deploy.note;
  const size = L.portrait ? 11 : 12;
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <Terminal L={L} T={T} />
      <Appear
        at={D.preview}
        dur={12}
        exit={D.out}
        from={{y: 8}}
        style={{
          position: 'absolute',
          left: st.x,
          top: st.y,
          width: st.w,
          display: 'flex',
          flexDirection: L.portrait ? 'column' : 'row',
          alignItems: L.portrait ? 'flex-start' : 'center',
          justifyContent: L.portrait ? 'flex-start' : 'center',
          gap: L.portrait ? 6 : 10,
        }}
      >
        <span style={{display: 'inline-grid'}}>
          <span style={{...pill(size), background: theme.tint, color: theme.accent}}>Preview</span>
        </span>
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 1,
            color: theme.muted,
            rotate: L.portrait ? '90deg' : '0deg',
            marginLeft: L.portrait ? 18 : 0,
          }}
        >
          →
        </span>
        <ProductionPill at={D.production} size={size} />
      </Appear>
      <Appear at={D.note} dur={12} exit={D.out + 2} from={{y: 8}} style={{position: 'absolute', left: note.x, top: note.y, width: note.w}}>
        <p
          style={{
            margin: 0,
            fontFamily: fonts.body,
            fontSize: L.portrait ? 12 : 14,
            lineHeight: L.portrait ? 1.4 : 1.45,
            color: theme.muted,
            textAlign: L.portrait ? 'left' : 'center',
            textWrap: 'balance',
          }}
        >
          Every change gets its own preview URL to review before it goes live.
        </p>
      </Appear>
    </div>
  );
};
