import type React from 'react';
import {type CSSProperties, type ReactNode, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {LabFilmProps} from '../shared/film-player';
import {ARRIVE, LEAVE, progress, tween} from '../shared/motion';
import {type CutScript, cellAt, DESKTOP_SCRIPT, MOBILE_SCRIPT, type Track} from './board-script';
import {FlapCell} from './flap-cell';

const FLAP_FONT = 'var(--font-dep-flap), "Arial Narrow", sans-serif';
const PLATE_FONT = 'var(--font-dep-plate), Arial, sans-serif';

type Geometry = {
  /** Build grid and name cells */
  cellW: number;
  cellH: number;
  gap: number;
  rowGap: number;
  font: number;
  /** Claim cells: the same grid width split into fewer, larger flaps */
  claimW: number;
  claimH: number;
  claimGap: number;
  claimFont: number;
  /** Housing padding and the width of the cell grid inside it */
  pad: number;
  gridW: number;
  label: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Sizes every cell from the composition size. Desktop: a framed board that fills the width without overflowing the
 * height. Phone: the housing runs edge to edge, so the cells get every pixel of the 390px width.
 */
const measure = (width: number, height: number, script: CutScript, phone: boolean): Geometry => {
  const {cols, claimCols} = script;
  const gutter = phone ? 0 : clamp(width * 0.04, 24, 72);
  const gap = phone ? 2 : 4;
  const minClaimGap = phone ? 2 : 5;
  const ratio = phone ? 1.75 : 1.5;
  const claimRatio = phone ? 1.85 : 1.5;
  const inner = width - gutter * 2 - (phone ? 20 : 48);
  let cellW = Math.floor((inner - (cols - 1) * gap) / cols);
  if (!phone) {
    // Name and build rows at the board size, claim rows at ~cols/claimCols of it; leave room for the lede below
    const perCell = ratio * (script.name.length + script.board.length) + (claimRatio * script.claim.length * cols) / claimCols;
    cellW = Math.min(cellW, 46, Math.floor((height - 390) / perCell));
  }
  const gridW = cols * cellW + (cols - 1) * gap;
  const cellH = Math.round(cellW * ratio);
  const claimW = Math.floor((gridW - (claimCols - 1) * minClaimGap) / claimCols);
  // Spread the rounding remainder over the gaps, so the claim rows end flush with the grid
  const claimGap = (gridW - claimCols * claimW) / (claimCols - 1);
  const claimH = Math.round(claimW * claimRatio);
  return {
    cellW,
    cellH,
    gap,
    rowGap: phone ? 5 : 6,
    font: Math.round(cellH * 0.72),
    claimW,
    claimH,
    claimGap,
    claimFont: Math.round(claimH * 0.72),
    pad: phone ? Math.floor((width - gridW) / 2) : 24,
    gridW,
    label: phone ? 14 : 15,
  };
};

type RowProps = {tracks: Track[]; w: number; h: number; gap: number; fontSize: number};

/** One row of flaps. The only frame subscriber for its cells: cells at rest keep identical props and skip rendering. */
const FlapRow: React.FC<RowProps> = ({tracks, w, h, gap, fontSize}) => {
  const frame = useCurrentFrame();
  return (
    <div aria-hidden style={{display: 'flex', gap}}>
      {tracks.map((track, i) => {
        const {from, to, t} = cellAt(track, frame);
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: cells are fixed positions on the board
          <FlapCell key={i} fromCh={from.ch} fromTone={from.tone} toCh={to.ch} toTone={to.tone} t={t} w={w} h={h} fontSize={fontSize} />
        );
      })}
    </div>
  );
};

type RevealProps = {from: number; until?: number; children: ReactNode; style?: CSSProperties; rise?: number};

/** Painted parts of the board (not flaps) fade in once, and optionally out: opacity and a short rise only. */
const Reveal: React.FC<RevealProps> = ({from, until, children, style, rise = 6}) => {
  const frame = useCurrentFrame();
  const out = until === undefined ? 0 : progress(frame, until, until + 10, LEAVE);
  return (
    <div
      style={{
        ...style,
        opacity: progress(frame, from, from + 14) * (1 - out),
        translate: `0 ${tween(frame, [from, from + 14], [rise, 0], ARRIVE)}px`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * The call to the gate: a real link laid over the yellow cells only, once they have flapped in. Hover and focus also
 * swap the tiles to ink with yellow type (through the board's `--dep-cta-now` vars), so it reads as a button.
 */
const GateLink: React.FC<{href: string; at: number; top: number; width: number; height: number}> = ({href, at, top, width, height}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <a
      href={href}
      data-gate=""
      className="absolute rounded-[4px] outline-offset-3 hover:outline-2 hover:outline-(--dep-cta) focus-visible:outline-2 focus-visible:outline-(--dep-focus-housing)"
      style={{left: 0, top, width, height}}
    >
      <span className="sr-only">See my work</span>
    </a>
  );
};

/** While the gate link is hovered or focused, the CTA flaps invert: ink tiles, yellow type. */
const GATE_HOVER =
  'has-[a[data-gate]:hover]:[--dep-cta-now:var(--dep-cta-ink)] has-[a[data-gate]:hover]:[--dep-cta-ink-now:var(--dep-cta)] has-[a[data-gate]:focus-visible]:[--dep-cta-now:var(--dep-cta-ink)] has-[a[data-gate]:focus-visible]:[--dep-cta-ink-now:var(--dep-cta)]';

const ReplayButton: React.FC<{onReplay: () => void; phone: boolean}> = ({onReplay, phone}) => (
  <button
    type="button"
    onClick={onReplay}
    className="inline-flex h-11 items-center gap-2 rounded-md border border-(--dep-rule) px-4 text-(--dep-text) hover:border-(--dep-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--dep-focus)"
    style={{fontFamily: PLATE_FONT, fontSize: phone ? 15 : 16, fontWeight: 500, background: 'transparent', cursor: 'pointer'}}
  >
    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
    Replay
  </button>
);

const LEDE =
  "One developer from first question to live URL. WordPress, WooCommerce, Next.js and React, built for the people who'll actually use them.";

type BoardFilmProps = LabFilmProps & {script: CutScript; phone: boolean};

const BoardFilm: React.FC<BoardFilmProps> = ({script, phone, worksHref, onReplay}) => {
  const {width, height} = useVideoConfig();
  const g = useMemo(() => measure(width, height, script, phone), [width, height, script, phone]);
  const {cues} = script;
  const pitch = g.cellH + g.rowGap;
  const housingW = phone ? width : g.gridW + g.pad * 2;

  const domain = (
    <Reveal
      from={cues.domainIn}
      style={{fontFamily: PLATE_FONT, fontSize: g.label + 1, fontWeight: 500, color: 'var(--dep-plate-ink)', letterSpacing: '0.01em'}}
    >
      cgdiomampo.dev
    </Reveal>
  );

  return (
    <AbsoluteFill style={{background: 'var(--dep-stage)', alignItems: 'center', justifyContent: 'center', paddingBottom: phone ? 40 : 24}}>
      <div style={{width: housingW}}>
        <div
          style={{
            background: 'var(--dep-housing)',
            borderRadius: phone ? 0 : 14,
            padding: phone ? `${g.pad + 8}px ${g.pad}px` : g.pad,
            boxShadow: phone ? undefined : 'inset 0 0 0 1px var(--dep-housing-edge), 0 40px 70px -40px rgba(6, 9, 15, 0.55)',
            fontFamily: FLAP_FONT,
            fontWeight: 600,
          }}
        >
          <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: g.rowGap}}>
              {script.name.map((tracks, r) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: name lines are fixed
                <FlapRow key={r} tracks={tracks} w={g.cellW} h={g.cellH} gap={g.gap} fontSize={g.font} />
              ))}
            </div>
            <div style={{paddingBottom: phone ? 2 : 4}}>{domain}</div>
          </div>

          {/* The claim: the larger flaps, settled within the first ~2s while the builds roll in beneath it */}
          <div style={{display: 'flex', flexDirection: 'column', gap: g.rowGap, marginTop: phone ? 14 : 20}}>
            {script.claim.map((tracks, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: claim lines are fixed
              <FlapRow key={r} tracks={tracks} w={g.claimW} h={g.claimH} gap={g.claimGap} fontSize={g.claimFont} />
            ))}
          </div>

          <div aria-hidden style={{position: 'relative', height: g.label + 14, marginTop: phone ? 16 : 24}}>
            {script.columns.map((col) => (
              <Reveal
                key={col.label}
                from={cues.headsIn}
                style={{
                  position: 'absolute',
                  left: col.start * (g.cellW + g.gap),
                  top: 0,
                  fontFamily: PLATE_FONT,
                  fontSize: g.label,
                  fontWeight: 500,
                  color: 'var(--dep-plate-ink)',
                }}
              >
                {col.label}
              </Reveal>
            ))}
          </div>

          <div className={GATE_HOVER} style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: g.rowGap}}>
            {script.board.map((tracks, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: board rows are fixed
              <FlapRow key={r} tracks={tracks} w={g.cellW} h={g.cellH} gap={g.gap} fontSize={g.font} />
            ))}
            {/* The phone row is shorter than 44px: the link grows evenly around it to keep the touch target */}
            <GateLink
              href={worksHref}
              at={cues.ctaAt}
              top={cues.ctaRow * pitch - Math.max(0, (44 - g.cellH) / 2)}
              width={cues.ctaCols * (g.cellW + g.gap) - g.gap}
              height={Math.max(44, g.cellH)}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: phone ? 'column' : 'row',
            alignItems: phone ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: phone ? 16 : 32,
            marginTop: phone ? 20 : 30,
            paddingInline: phone ? 20 : 4,
          }}
        >
          <Reveal from={cues.ledeIn} rise={8}>
            <p
              style={{
                margin: 0,
                maxWidth: phone ? undefined : '54ch',
                fontFamily: PLATE_FONT,
                fontSize: phone ? 16 : 18,
                lineHeight: 1.5,
                color: 'var(--dep-text)',
              }}
            >
              {LEDE}
            </p>
          </Reveal>
          <Reveal from={cues.footerIn} rise={8}>
            <ReplayButton onReplay={onReplay} phone={phone} />
          </Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DeparturesDesktop: React.FC<LabFilmProps> = (props) => <BoardFilm {...props} script={DESKTOP_SCRIPT} phone={false} />;
export const DeparturesMobile: React.FC<LabFilmProps> = (props) => <BoardFilm {...props} script={MOBILE_SCRIPT} phone />;

export const DESKTOP_DURATION = DESKTOP_SCRIPT.durationInFrames;
export const MOBILE_DURATION = MOBILE_SCRIPT.durationInFrames;
