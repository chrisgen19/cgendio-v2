import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, progress, tween} from '../shared/motion';
import {useCut} from './cut-context';
import {allPassedAt, CHECKS, type CheckState, checkState, enter} from './timeline';

/* Shared bits ---------------------------------------------------------------------------------------------------- */

/** Fades and lifts its children in at `at`. The one entrance used across the PR page. */
export const Enter: React.FC<{at: number; distance?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  at,
  distance,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const {opacity, dy} = enter(frame, at, distance);
  return <div style={{...style, opacity, translate: `0 ${dy}px`}}>{children}</div>;
};

export const card: React.CSSProperties = {
  background: theme.surface,
  border: `1px solid ${theme.line}`,
  borderRadius: 18,
  boxShadow: theme.shadow,
};

/** The "cg" logo square from the site header. */
export const Avatar: React.FC<{size: number}> = ({size}) => (
  <span
    style={{
      display: 'inline-grid',
      placeItems: 'center',
      flex: 'none',
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.3),
      background: theme.badge,
      color: theme.badgeInk,
      fontFamily: fonts.display,
      fontWeight: 800,
      fontSize: Math.round(size * 0.44),
      letterSpacing: '-0.04em',
      lineHeight: 1,
    }}
  >
    cg
  </span>
);

const pill = (size: number): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  height: Math.round(size * 2),
  padding: `0 ${Math.round(size * 0.85)}px`,
  borderRadius: 999,
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1,
  whiteSpace: 'nowrap',
});

const BranchIcon: React.FC<{size: number}> = ({size}) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
    <circle cx="4" cy="3.5" r="1.8" />
    <circle cx="4" cy="12.5" r="1.8" />
    <circle cx="12" cy="5.5" r="1.8" />
    <path d="M4 5.3v5.4M12 7.3c0 3-4 2.5-8 3.4" />
  </svg>
);

const MergeIcon: React.FC<{size: number}> = ({size}) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
    <circle cx="4" cy="3.5" r="1.8" />
    <circle cx="4" cy="12.5" r="1.8" />
    <circle cx="12" cy="12.5" r="1.8" />
    <path d="M4 5.3v5.4M4.8 5c1 3.5 3.6 5.4 5.4 6.5" />
  </svg>
);

/** "Open" until the merge, then "Merged" in lime: the one lime surface before the live site. */
export const StatusPill: React.FC<{size: number}> = ({size}) => {
  const frame = useCurrentFrame();
  const {t} = useCut();
  const m = progress(frame, t.merged, t.merged + 10);
  return (
    <span style={{position: 'relative', display: 'inline-grid'}}>
      <span style={{...pill(size), gridArea: '1 / 1', background: theme.tint, color: theme.accent, opacity: 1 - m}}>
        <BranchIcon size={size + 1} />
        Open
      </span>
      <span
        style={{
          ...pill(size),
          gridArea: '1 / 1',
          background: theme.lime,
          color: theme.onLime,
          opacity: m,
          scale: tween(frame, [t.merged, t.merged + 12], [0.86, 1]),
        }}
      >
        <MergeIcon size={size + 1} />
        Merged
      </span>
    </span>
  );
};

const mono = (size: number, color: string = theme.muted): React.CSSProperties => ({fontFamily: fonts.mono, fontSize: size, color, lineHeight: 1.3});

const Branch: React.FC<{name: string; size: number}> = ({name, size}) => (
  <span style={{...mono(size, theme.accent), background: theme.tint, borderRadius: 6, padding: '3px 7px', whiteSpace: 'nowrap'}}>{name}</span>
);

/* Header ---------------------------------------------------------------------------------------------------------- */

/**
 * "wants to merge into main" until the merge, then "merged into main", alongside the status pill. The two lines have
 * different widths, so the old one leaves before the new one arrives instead of overlapping mid-crossfade.
 */
const MergeLine: React.FC = () => {
  const frame = useCurrentFrame();
  const {t, sz, g} = useCut();
  const out = progress(frame, t.merged - 2, t.merged + 4, LEAVE);
  const m = progress(frame, t.merged + 4, t.merged + 12);
  const line = (verb: string, opacity: number): React.ReactNode => (
    <span style={{gridArea: '1 / 1', opacity}}>
      <b style={{color: theme.ink, fontWeight: 600}}>Christian Diomampo</b> {verb} into <Branch name="main" size={sz.mono} />
      {g.portrait ? null : (
        <>
          {' '}
          from <Branch name="feat/launch" size={sz.mono} />
        </>
      )}
    </span>
  );
  return (
    <span style={{display: 'inline-grid', fontSize: sz.body, color: theme.muted, lineHeight: 1.45}}>
      {line('wants to merge', 1 - out)}
      {line('merged', m)}
    </span>
  );
};

export const PrHeader: React.FC = () => {
  const {t, sz, g} = useCut();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: g.portrait ? 10 : 12}}>
      <Enter at={t.title}>
        <span style={mono(sz.mono)}>cgdiomampo / site</span>
      </Enter>
      <Enter at={t.title + 3}>
        <h2
          style={{
            margin: 0,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: sz.title,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            color: theme.ink,
          }}
        >
          feat: launch the new site
        </h2>
      </Enter>
      <Enter at={t.title + 6} style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: g.portrait ? 8 : 12, marginTop: 4}}>
        <StatusPill size={sz.small} />
        <MergeLine />
      </Enter>
    </div>
  );
};

/* Description ----------------------------------------------------------------------------------------------------- */

export const Description: React.FC = () => {
  const {t, sz, g} = useCut();
  const pad = g.portrait ? 14 : 16;
  return (
    <Enter at={t.description} style={{...card, padding: `${pad}px ${pad + 2}px`, display: 'flex', flexDirection: 'column', gap: g.portrait ? 8 : 10}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <Avatar size={g.portrait ? 26 : 30} />
        <span style={{fontSize: sz.small, color: theme.muted}}>
          <b style={{color: theme.ink, fontWeight: 600}}>Christian Diomampo</b> opened this pull request
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: sz.claim,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: theme.ink,
          textWrap: 'balance',
        }}
      >
        I design, build &amp; ship websites that work.
      </p>
      <p style={{margin: 0, fontSize: sz.body, lineHeight: 1.5, color: theme.muted}}>
        One developer from first question to live URL. WordPress, WooCommerce, Next.js and React.
      </p>
    </Enter>
  );
};

/* Diff ------------------------------------------------------------------------------------------------------------ */

type Kind = 'ctx' | 'del' | 'add';
type Part = [string, string];

const c = theme.code;
const DIFF: {kind: Kind; parts: Part[]}[] = [
  {
    kind: 'ctx',
    parts: [
      ['<', c.dim],
      ['section', c.tag],
      [' id', c.kw],
      ['=', c.dim],
      ['"hero"', c.str],
      ['>', c.dim],
    ],
  },
  {kind: 'del', parts: [['  <h1>Coming soon</h1>', c.dim]]},
  {
    kind: 'add',
    parts: [
      ['  <', c.dim],
      ['h1', c.tag],
      ['>', c.dim],
    ],
  },
  {kind: 'add', parts: [['    I design, build & ship', c.text]]},
  {
    kind: 'add',
    parts: [
      ['    websites that ', c.text],
      ['<', c.dim],
      ['Mark', c.tag],
      ['>', c.dim],
      ['work.', c.str],
      ['</', c.dim],
      ['Mark', c.tag],
      ['>', c.dim],
    ],
  },
  {
    kind: 'add',
    parts: [
      ['  </', c.dim],
      ['h1', c.tag],
      ['>', c.dim],
    ],
  },
  {
    kind: 'add',
    parts: [
      ['  <', c.dim],
      ['a', c.tag],
      [' href', c.kw],
      ['=', c.dim],
      ['"#work"', c.str],
      ['>', c.dim],
      ['See my work', c.text],
      ['</', c.dim],
      ['a', c.tag],
      ['>', c.dim],
    ],
  },
];

const SIGN: Record<Kind, string> = {ctx: ' ', del: '-', add: '+'};

const DiffLine: React.FC<{at: number; kind: Kind; parts: Part[]; n: number}> = ({at, kind, parts, n}) => {
  const frame = useCurrentFrame();
  const {sz} = useCut();
  const p = progress(frame, at, at + 10);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: sz.diffLine,
        paddingRight: 12,
        background: kind === 'add' ? 'rgba(215,255,61,.07)' : 'transparent',
        opacity: p,
        translate: `${tween(frame, [at, at + 12], [-10, 0])}px 0`,
        whiteSpace: 'pre',
      }}
    >
      <span style={{width: sz.diff * 2.4, flex: 'none', textAlign: 'right', color: c.dim, opacity: 0.6, paddingRight: 10}}>
        {kind === 'del' ? '' : n}
      </span>
      <span style={{width: sz.diff * 1.4, flex: 'none', color: kind === 'add' ? c.str : c.dim}}>{SIGN[kind]}</span>
      <span style={{textDecoration: kind === 'del' ? 'line-through' : 'none'}}>
        {parts.map(([text, color], i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static token list
          <span key={i} style={{color}}>
            {text}
          </span>
        ))}
      </span>
    </div>
  );
};

export const Diff: React.FC = () => {
  const {t, sz, g} = useCut();
  const adds = DIFF.filter((l) => l.kind === 'add').length;
  const dels = DIFF.filter((l) => l.kind === 'del').length;
  let n = 11;
  return (
    <Enter
      at={t.diff - 8}
      style={{
        background: c.bg,
        // Only the dark theme defines --film-line, so the panel gets an edge there and none on the light stage
        border: '1px solid var(--film-line, transparent)',
        borderRadius: g.portrait ? 14 : 18,
        overflow: 'hidden',
        fontFamily: fonts.mono,
        fontSize: sz.diff,
        boxShadow: theme.shadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: g.portrait ? 32 : 40,
          padding: `0 ${g.portrait ? 12 : 16}px`,
          background: c.chrome,
          color: c.text,
          fontSize: sz.mono,
        }}
      >
        <span>src/app/page.tsx</span>
        <span>
          <span style={{color: c.str}}>+{adds}</span> <span style={{color: c.dim}}>-{dels}</span>
        </span>
      </div>
      <div style={{padding: `${g.portrait ? 6 : 8}px 0`}}>
        {DIFF.map((line, i) => {
          const num = line.kind === 'del' ? n : n++;
          return (
            <DiffLine key={`${line.kind}-${num}-${line.parts[0][0]}`} at={t.diff + i * t.diffStep} kind={line.kind} parts={line.parts} n={num} />
          );
        })}
      </div>
    </Enter>
  );
};

/* Checks ---------------------------------------------------------------------------------------------------------- */

/** Ink circle with a lime tick (the site's badge), a spinning accent arc, or a quiet ring. */
const CheckIcon: React.FC<{state: CheckState; passAt: number; size: number}> = ({state, passAt, size}) => {
  const frame = useCurrentFrame();
  if (state === 'passed') {
    return (
      <span
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: size,
          height: size,
          borderRadius: 999,
          background: theme.badge,
          color: theme.badgeInk,
          scale: tween(frame, [passAt, passAt + 10], [0.55, 1], ARRIVE),
        }}
      >
        <svg
          viewBox="0 0 16 16"
          width={size * 0.62}
          height={size * 0.62}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
    );
  }
  if (state === 'running') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: 999,
          border: `2px solid ${theme.line}`,
          borderTopColor: theme.accent,
          rotate: `${frame * 14}deg`,
        }}
      />
    );
  }
  return <span style={{display: 'inline-block', width: size, height: size, borderRadius: 999, border: `2px dashed ${theme.bar}`}} />;
};

const STATE_TEXT: Record<CheckState, string> = {queued: 'Queued', running: 'Running', passed: 'Passed'};

const CheckRow: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const {t, sz} = useCut();
  const state = checkState(t, i, frame);
  const passAt = t.checks + i * t.checkStep + t.checkRun;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, height: sz.row}}>
      <CheckIcon state={state} passAt={passAt} size={Math.round(sz.body * 1.3)} />
      <span style={{flex: 1, fontSize: sz.body, fontWeight: 500, color: state === 'queued' ? theme.muted : theme.ink}}>{CHECKS[i]}</span>
      <span style={{...mono(sz.mono, state === 'running' ? theme.accent : theme.muted)}}>{STATE_TEXT[state]}</span>
    </div>
  );
};

const ChecksTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {t, sz} = useCut();
  const done = progress(frame, allPassedAt(t), allPassedAt(t) + 10);
  const base: React.CSSProperties = {gridArea: '1 / 1', fontSize: sz.body + 1, fontWeight: 600, color: theme.ink};
  return (
    <span style={{display: 'inline-grid'}}>
      <span style={{...base, opacity: 1 - done}}>Running checks</span>
      <span style={{...base, opacity: done}}>All checks have passed</span>
    </span>
  );
};

const MergeRow: React.FC = () => {
  const frame = useCurrentFrame();
  const {t, sz} = useCut();
  const ready = progress(frame, allPassedAt(t), allPassedAt(t) + 10);
  const press = frame < t.merge + 4 ? tween(frame, [t.merge, t.merge + 4], [1, 0.95]) : tween(frame, [t.merge + 4, t.merge + 12], [0.95, 1]);
  // The button leaves before the merged state arrives, so the two never overlap
  const gone = progress(frame, t.merged - 4, t.merged + 2, LEAVE);
  const merged = progress(frame, t.merged + 2, t.merged + 12);
  const h = 40;
  return (
    <div style={{display: 'grid', alignItems: 'center', height: h}}>
      <span
        style={{
          gridArea: '1 / 1',
          justifySelf: 'start',
          ...pill(sz.small),
          height: h,
          padding: '0 18px',
          background: theme.ink,
          color: theme.onInk,
          opacity: (0.35 + 0.65 * ready) * (1 - gone),
          scale: press,
        }}
      >
        <MergeIcon size={sz.small + 2} />
        Merge pull request
      </span>
      <span
        style={{
          gridArea: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: merged,
          translate: `0 ${tween(frame, [t.merged + 2, t.merged + 14], [8, 0])}px`,
        }}
      >
        <span style={{...pill(sz.small), background: theme.lime, color: theme.onLime}}>
          <MergeIcon size={sz.small + 1} />
          Merged
        </span>
        <span style={{fontSize: sz.body, color: theme.muted}}>
          into <Branch name="main" size={sz.mono} />, going live
        </span>
      </span>
    </div>
  );
};

export const ChecksBox: React.FC = () => {
  const {t, g} = useCut();
  const pad = g.portrait ? 14 : 18;
  return (
    <Enter at={t.checks - 12} style={{...card, padding: `${pad - 4}px ${pad + 2}px ${pad}px`, display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', height: 36, borderBottom: `1px solid ${theme.line}`, marginBottom: 6}}>
        <ChecksTitle />
      </div>
      {CHECKS.map((name, i) => (
        <CheckRow key={name} i={i} />
      ))}
      <div style={{borderTop: `1px solid ${theme.line}`, marginTop: 8, paddingTop: pad - 4}}>
        <MergeRow />
      </div>
    </Enter>
  );
};

/* Preview deployment ---------------------------------------------------------------------------------------------- */

const BuildStatus: React.FC = () => {
  const frame = useCurrentFrame();
  const {t, sz} = useCut();
  const ready = progress(frame, t.build[1], t.build[1] + 8);
  const base: React.CSSProperties = {...pill(sz.small - 1), gridArea: '1 / 1', justifySelf: 'start'};
  return (
    <span style={{display: 'inline-grid'}}>
      <span style={{...base, background: theme.field, color: theme.muted, opacity: 1 - ready}}>
        <span style={{width: 7, height: 7, borderRadius: 99, background: theme.accent}} />
        Building
      </span>
      <span style={{...base, background: theme.field, color: theme.ink, opacity: ready}}>
        <span style={{width: 7, height: 7, borderRadius: 99, background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,.18)'}} />
        Ready
      </span>
    </span>
  );
};

/** Empty slot under the live site layer: a quiet skeleton that the render wipes over. */
export const ThumbSlot: React.FC<{w: number; h: number; radius: number}> = ({w, h, radius}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: radius,
      background: theme.preview,
      outline: `1px solid ${theme.line}`,
      display: 'flex',
      flexDirection: 'column',
      gap: Math.round(h * 0.05),
      padding: Math.round(w * 0.08),
      overflow: 'hidden',
    }}
  >
    <span style={{width: '30%', height: Math.max(6, h * 0.035), borderRadius: 99, background: theme.wire}} />
    <span style={{marginTop: h * 0.12, width: '78%', height: Math.max(10, h * 0.07), borderRadius: 6, background: theme.wire}} />
    <span style={{width: '56%', height: Math.max(10, h * 0.07), borderRadius: 6, background: theme.wire}} />
    <span style={{width: '64%', height: Math.max(6, h * 0.03), borderRadius: 99, background: theme.wireSoft}} />
  </div>
);

export const PreviewHead: React.FC = () => {
  const {sz} = useCut();
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10}}>
      <span style={{fontSize: sz.body, fontWeight: 600, color: theme.ink}}>Preview deployment</span>
      <BuildStatus />
    </div>
  );
};

export const PreviewUrl: React.FC = () => {
  const {sz} = useCut();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <span style={mono(sz.mono, theme.ink)}>preview.cgdiomampo.dev</span>
      <span style={{fontSize: sz.small, color: theme.accent, fontWeight: 500}}>Visit preview</span>
    </div>
  );
};

/** The PR's labels, which double as what I build. */
export const LabelTags: React.FC<{size: number; gap?: number}> = ({size, gap = 8}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap}}>
    {['WordPress', 'WooCommerce', 'Next.js', 'React'].map((label) => (
      <span
        key={label}
        style={{
          ...mono(size, theme.ink),
          fontWeight: 500,
          padding: `${Math.round(size * 0.6)}px ${Math.round(size * 0.9)}px`,
          borderRadius: 999,
          background: theme.surface,
          border: `1px solid ${theme.line}`,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    ))}
  </div>
);

/** Desktop sidebar block under the preview card. */
export const Labels: React.FC = () => {
  const {t, sz} = useCut();
  return (
    <Enter at={t.preview + 8} style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <span style={{fontSize: sz.small, fontWeight: 600, color: theme.ink}}>Labels</span>
      <LabelTags size={12} />
    </Enter>
  );
};
