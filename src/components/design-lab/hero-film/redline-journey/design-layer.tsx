import type React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, MOVE, progress} from '../shared/motion';
import {Appear} from './anim';
import {type Chip, type JourneyLayout, type Measure, type Point, rectAt} from './geometry';
import {EXIT, type Timing} from './timing';

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

/** My cursor: it comes in from the corner, clicks the padding measurement, the highlighter lands on it, and it fades. */
const Cursor: React.FC<{path: {from: Point; via: Point; to: Point}; at: number; click: number; exit: number; flip: boolean}> = ({
  path,
  at,
  click,
  exit,
  flip,
}) => {
  const frame = useCurrentFrame();
  // It leaves once it has clicked, so the highlighted value and the card's tags stay clear
  const gone = click + 22;
  if (frame < at || frame >= Math.min(gone, exit + EXIT)) return null;
  const keys = [at, at + 16, click - 2];
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: MOVE} as const;
  const x = interpolate(frame, keys, [path.from.x, path.via.x, path.to.x], opts);
  const y = interpolate(frame, keys, [path.from.y, path.via.y, path.to.y], opts);
  const press = progress(frame, click - 2, click + 1, ARRIVE) * (1 - progress(frame, click + 2, click + 8, ARRIVE));
  const o = progress(frame, at, at + 8, ARRIVE) * (1 - progress(frame, Math.min(click + 10, exit), Math.min(gone, exit + EXIT), LEAVE));
  // On phones there's no room beside the card, so the name pill would sit on the tags: it names the cursor on the way
  // in and is gone before the arrow lands. On desktop it hangs left of the arrow, off the card, and stays.
  const nameOpacity = flip ? 1 : 1 - progress(frame, click - 14, click - 6, LEAVE);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, translate: `${x}px ${y}px`, opacity: o, zIndex: 3}}>
      <div style={{position: 'relative', scale: `${1 - press * 0.12}`, transformOrigin: '3px 2px'}}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width={22} height={22} style={{display: 'block', marginLeft: -3, marginTop: -2}}>
          <path d="M3 2l7.5 19 2.4-7.6L20.5 11z" style={{fill: theme.accent, stroke: theme.surface}} strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
        <span
          style={{
            position: 'absolute',
            top: 18,
            // On desktop the label hangs to the left of the arrow, off the card it is pointing at
            ...(flip ? {right: 6} : {left: 14}),
            padding: '3px 9px',
            borderRadius: 999,
            background: theme.accent,
            color: theme.onAccent,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 12,
            whiteSpace: 'nowrap',
            opacity: nameOpacity,
          }}
        >
          Christian
        </span>
      </div>
    </div>
  );
};

/** Design: the wireframe turns into the card, which is selected, measured and annotated with its tokens. */
export const DesignLayer: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const D = T.design;
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
      <Appear at={D.select} dur={10} from={{y: 0}} exit={D.out} style={{position: 'absolute', inset: 0}}>
        <div
          style={{position: 'absolute', left: r.x - 1, top: r.y - 1, width: r.w + 2, height: r.h + 2, boxShadow: `inset 0 0 0 1.5px ${theme.accent}`}}
        />
        <div style={handle(r.x, r.y)} />
        <div style={handle(r.x + r.w, r.y)} />
        <div style={handle(r.x, r.y + r.h)} />
        <div style={handle(r.x + r.w, r.y + r.h)} />
        <div style={{...labelStyle, left: r.x - 6, top: r.y - 28, color: theme.accent}}>Project card</div>
        {L.portrait ? null : (
          <div style={{...labelStyle, left: centre.x, top: r.y + r.h + 10, translate: '-50% 0', background: theme.accent, color: theme.onAccent}}>
            {L.card.w} × {L.card.h}
          </div>
        )}
      </Appear>
      {L.measures.map((m, i) => (
        <MeasureMark key={m.label} m={m} at={D.measures + i * 6} lime={D.lime} exit={D.out} />
      ))}
      {L.chips.map((c, i) => (
        <TokenChip key={c.label} c={c} at={D.chips + i * D.chipStagger} exit={D.out + (i % 3) * 2} toward={centre} />
      ))}
      <Cursor path={L.cursor} at={D.cursor} click={D.lime} exit={D.out} flip={!L.portrait} />
    </div>
  );
};
