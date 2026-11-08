import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, progress} from '../shared/motion';
import {Appear} from './anim';
import {type Chip, type Measure, type RedlineLayout, rectAt} from './geometry';
import type {Timing} from './timing';
import {EXIT} from './timing';

const LINE = 1.5;

/** A straight hairline from a to b, drawn from a. */
const lineStyle = (ax: number, ay: number, bx: number, by: number, p: number, color: string): React.CSSProperties => ({
  position: 'absolute',
  left: ax,
  top: ay - LINE / 2,
  width: Math.hypot(bx - ax, by - ay),
  height: LINE,
  background: color,
  transformOrigin: `0 ${LINE / 2}px`,
  rotate: `${Math.atan2(by - ay, bx - ax)}rad`,
  scale: `${p} 1`,
});

const labelStyle: React.CSSProperties = {
  position: 'absolute',
  fontFamily: fonts.mono,
  fontWeight: 500,
  fontSize: 11,
  lineHeight: '18px',
  padding: '0 6px',
  borderRadius: 5,
  whiteSpace: 'nowrap',
};

/** One redline measurement: the line with end ticks, then its value. The marked one gets the lime highlighter. */
const MeasureMark: React.FC<{m: Measure; at: number; lime: number; exit: number}> = ({m, at, lime, exit}) => {
  const frame = useCurrentFrame();
  if (frame >= exit + EXIT) return null;
  const p = progress(frame, at, at + 12, ARRIVE);
  const out = 1 - progress(frame, exit, exit + EXIT, LEAVE);
  const label = progress(frame, at + 6, at + 16, ARRIVE);
  const vertical = Math.abs(m.to.x - m.from.x) < 1;
  const tick = (x: number, y: number): React.CSSProperties => ({
    position: 'absolute',
    left: vertical ? x - 5 : x - LINE / 2,
    top: vertical ? y - LINE / 2 : y - 5,
    width: vertical ? 10 : LINE,
    height: vertical ? LINE : 10,
    background: theme.accent,
    opacity: p > 0 ? 1 : 0,
  });
  const midX = (m.from.x + m.to.x) / 2;
  const midY = (m.from.y + m.to.y) / 2;
  const hl = progress(frame, lime, lime + 14, ARRIVE);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <div style={lineStyle(m.from.x, m.from.y, m.to.x, m.to.y, p, theme.accent)} />
      <div style={tick(m.from.x, m.from.y)} />
      <div style={{...tick(m.to.x, m.to.y), opacity: p >= 1 ? 1 : 0}} />
      <div
        style={{
          ...labelStyle,
          left: vertical ? midX + 8 : m.from.x - 8,
          top: midY - 9,
          translate: vertical ? '0 0' : '-100% 0',
          opacity: label,
          background: m.marked ? 'transparent' : theme.accent,
          color: m.marked ? theme.markInk : theme.onAccent,
          boxShadow: m.marked ? `inset 0 0 0 1px ${theme.accent}` : 'none',
          zIndex: 0,
        }}
      >
        {m.marked ? (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 5,
              background: theme.mark,
              zIndex: -1,
              transformOrigin: 'left center',
              scale: `${hl} 1`,
            }}
          />
        ) : null}
        <span style={{color: m.marked ? undefined : theme.onAccent}}>{m.label}</span>
      </div>
    </div>
  );
};

/** A token chip with a leader line to the part of the card it describes. Leaves by sliding into the card. */
const TokenChip: React.FC<{c: Chip; at: number; exit: number; toward: {x: number; y: number}}> = ({c, at, exit, toward}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= exit + EXIT) return null;
  const p = progress(frame, at, at + 12, ARRIVE);
  const lead = progress(frame, at + 4, at + 16, ARRIVE);
  const out = progress(frame, exit, exit + EXIT, LEAVE);
  const dx = (toward.x - c.at.x) * 0.3 * out;
  const dy = (toward.y - c.at.y) * 0.3 * out;
  const edgeX = c.side === 'left' ? c.at.x : c.at.x;
  const drift = (1 - p) * (c.side === 'left' ? -10 : 10);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, translate: `${dx}px ${dy}px`}}>
      <div style={{...lineStyle(edgeX, c.at.y, c.anchor.x, c.anchor.y, lead, theme.accent), height: 1, opacity: 0.7}} />
      <div
        style={{
          position: 'absolute',
          left: c.anchor.x - 3,
          top: c.anchor.y - 3,
          width: 6,
          height: 6,
          borderRadius: 3,
          background: theme.accent,
          opacity: lead,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: c.at.x,
          top: c.at.y,
          translate: `${c.side === 'left' ? `calc(-100% + ${drift}px)` : `${drift}px`} -50%`,
          opacity: p,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 28,
          padding: '0 11px 0 9px',
          borderRadius: 999,
          background: theme.surface,
          boxShadow: `inset 0 0 0 1px ${theme.line}, ${theme.shadow}`,
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: 11,
          color: theme.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {c.swatch ? (
          <span style={{width: 12, height: 12, borderRadius: 4, background: theme[c.swatch], boxShadow: `inset 0 0 0 1px ${theme.muted}`}} />
        ) : null}
        {c.label}
      </div>
    </div>
  );
};

/** Beat 1: the card selected as a design frame, measured and annotated with its tokens. */
export const DesignLayer: React.FC<{L: RedlineLayout; T: Timing}> = ({L, T}) => {
  const r = rectAt(L.poses.design, L.card);
  const centre = {x: r.x + r.w / 2, y: r.y + r.h / 2};
  const handle = (x: number, y: number): React.CSSProperties => ({
    position: 'absolute',
    left: x - 4,
    top: y - 4,
    width: 8,
    height: 8,
    background: theme.surface,
    boxShadow: `inset 0 0 0 1.5px ${theme.accent}`,
  });
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <Appear at={T.select} dur={10} from={{y: 0}} exit={T.designOut} style={{position: 'absolute', inset: 0}}>
        <div
          style={{position: 'absolute', left: r.x - 1, top: r.y - 1, width: r.w + 2, height: r.h + 2, boxShadow: `inset 0 0 0 1.5px ${theme.accent}`}}
        />
        <div style={handle(r.x, r.y)} />
        <div style={handle(r.x + r.w, r.y)} />
        <div style={handle(r.x, r.y + r.h)} />
        <div style={handle(r.x + r.w, r.y + r.h)} />
        <div style={{...labelStyle, left: r.x - 6, top: r.y - 28, color: theme.accent}}>Project card</div>
        <div style={{...labelStyle, left: centre.x, top: r.y + r.h + 10, translate: '-50% 0', background: theme.accent, color: theme.onAccent}}>
          {L.card.w} × {L.card.h}
        </div>
      </Appear>
      {L.measures.map((m, i) => (
        <MeasureMark key={m.label} m={m} at={T.measures + i * 6} lime={T.lime} exit={T.designOut} />
      ))}
      {L.chips.map((c, i) => (
        <TokenChip key={c.label} c={c} at={T.chips + i * T.chipStagger} exit={T.designOut + (i % 3) * 2} toward={centre} />
      ))}
    </div>
  );
};
