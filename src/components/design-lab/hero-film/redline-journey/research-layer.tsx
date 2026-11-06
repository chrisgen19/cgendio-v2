import type React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, progress} from '../shared/motion';
import {Appear, ClipReveal, fromSide} from './anim';
import type {JourneyLayout, Note} from './geometry';
import {EXIT, type Timing} from './timing';

const QUERY = 'who visits, and what do they need?';

const PERSONAS = [
  {n: '01', name: 'Recruiter', need: 'Wants proof of skill, fast.', dot: theme.tint},
  {n: '02', name: 'Client', need: 'Wants it live, on brand and on budget.', dot: theme.lime},
  {n: '03', name: 'Visitor', need: 'Wants it to load and make sense.', dot: theme.ink},
];

const TAGS = ['Goals', 'Audiences', 'Competitors', 'Analytics'];

/** The query, typed a character at a time, with a blinking caret while it types. */
const Typed: React.FC<{from: number; to: number; size: number}> = ({from, to, size}) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [from, to], [0, QUERY.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const caret = frame < to + 24 && Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={{fontFamily: fonts.mono, fontSize: size, color: theme.ink, whiteSpace: 'nowrap'}}>
      {QUERY.slice(0, n)}
      <span
        style={{
          display: 'inline-block',
          width: 2,
          height: size * 1.2,
          marginLeft: 2,
          verticalAlign: 'middle',
          background: theme.accent,
          opacity: caret ? 1 : 0,
        }}
      />
    </span>
  );
};

const SearchField: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const r = L.research.search;
  const R = T.research;
  return (
    <ClipReveal
      at={R.search}
      dur={16}
      exit={R.out}
      exitDur={EXIT}
      openFrom={fromSide('left', r.w, r.h)}
      radius={r.h / 2}
      style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          gap: L.portrait ? 10 : 14,
          padding: L.portrait ? '0 16px' : '0 22px',
          borderRadius: 999,
          background: theme.surface,
          boxShadow: `inset 0 0 0 1px ${theme.line}`,
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="none"
          style={{stroke: theme.muted}}
          strokeWidth={2.2}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <Typed from={R.typeFrom} to={R.typeTo} size={L.portrait ? 12 : 14} />
      </div>
    </ClipReveal>
  );
};

/** One persona's content; `compact` lays it out for the phone deck. */
const PersonaBody: React.FC<{p: (typeof PERSONAS)[number]; compact: boolean}> = ({p, compact}) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? 4 : 6,
      padding: compact ? '12px 16px' : '14px 16px',
      borderRadius: 16,
      background: theme.surface,
      boxShadow: `inset 0 0 0 1px ${theme.line}, ${theme.shadow}`,
      boxSizing: 'border-box',
    }}
  >
    <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: p.dot, boxShadow: `inset 0 0 0 1px ${theme.line}`}} />
      <span style={{fontFamily: fonts.mono, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', color: theme.muted}}>Persona {p.n}</span>
    </span>
    <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: compact ? 18 : 21, letterSpacing: '-0.03em', color: theme.ink}}>
      {p.name}
    </span>
    <span style={{fontFamily: fonts.body, fontSize: 13, lineHeight: 1.35, color: theme.muted}}>{p.need}</span>
  </div>
);

/** Desktop: a note drifts in from its side, then a short pin line ties it to the brief. */
const PinnedNote: React.FC<{note: Note; at: number; out: number; children: React.ReactNode}> = ({note, at, out, children}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= out + EXIT) return null;
  const pin = progress(frame, at, at + 14, ARRIVE);
  const lead = progress(frame, at + 8, at + 18, ARRIVE);
  const pout = progress(frame, out, out + EXIT, LEAVE);
  const dir = note.side === 'left' ? -1 : 1;
  const edgeX = note.side === 'left' ? note.rect.x + note.rect.w : note.rect.x;
  const lineX = Math.min(edgeX, note.anchor.x);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - pout}}>
      <div
        style={{
          position: 'absolute',
          left: lineX,
          top: note.anchor.y - 0.5,
          width: Math.abs(note.anchor.x - edgeX),
          height: 1,
          background: theme.accent,
          transformOrigin: note.side === 'left' ? 'left center' : 'right center',
          scale: `${lead} 1`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: note.anchor.x - 4,
          top: note.anchor.y - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          background: theme.accent,
          opacity: lead,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: note.rect.x,
          top: note.rect.y,
          width: note.rect.w,
          height: note.rect.h,
          rotate: `${note.rot}deg`,
          opacity: pin,
          translate: `${(1 - pin) * 18 * dir}px 0px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Phones: each persona is dealt onto a deck; the ones underneath step back and peek out above it. */
const DeckNote: React.FC<{note: Note; at: number; later: number[]; out: number; children: React.ReactNode}> = ({note, at, later, out, children}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= out + EXIT) return null;
  const pin = progress(frame, at, at + 14, ARRIVE);
  const pout = progress(frame, out, out + EXIT, LEAVE);
  const depth = later.reduce((sum, l) => sum + progress(frame, l, l + 14, ARRIVE), 0);
  return (
    <div
      style={{
        position: 'absolute',
        left: note.rect.x,
        top: note.rect.y,
        width: note.rect.w,
        height: note.rect.h,
        opacity: pin * (1 - pout),
        translate: `0px ${(1 - pin) * 16 - depth * 9}px`,
        scale: `${1 - depth * 0.05}`,
        transformOrigin: 'center top',
      }}
    >
      {children}
    </div>
  );
};

const tag: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0 10px',
  borderRadius: 999,
  background: theme.surface,
  boxShadow: `inset 0 0 0 1px ${theme.line}`,
  fontFamily: fonts.mono,
  fontWeight: 500,
  color: theme.ink,
  whiteSpace: 'nowrap',
};

/** Research: the query, the three personas around the brief, and what gets mapped. */
export const ResearchLayer: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const R = T.research;
  const s = L.stage;
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <SearchField L={L} T={T} />
      {PERSONAS.map((p, i) => {
        const note = L.research.notes[i];
        const body = <PersonaBody key={p.n} p={p} compact={L.portrait} />;
        return L.portrait ? (
          <DeckNote key={p.n} note={note} at={R.personas[i]} later={R.personas.slice(i + 1)} out={R.out}>
            {body}
          </DeckNote>
        ) : (
          <PinnedNote key={p.n} note={note} at={R.personas[i]} out={R.out + i}>
            {body}
          </PinnedNote>
        );
      })}
      <div style={{position: 'absolute', left: s.x, top: L.research.tagsY, width: s.w, display: 'flex', justifyContent: 'center', gap: 6}}>
        {TAGS.map((t, i) => (
          <Appear key={t} at={R.tags + i * R.tagStagger} dur={10} exit={R.out + i} from={{y: 8}}>
            <span style={{...tag, height: L.portrait ? 26 : 30, fontSize: L.portrait ? 11 : 12}}>{t}</span>
          </Appear>
        ))}
      </div>
    </div>
  );
};
