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
  phone: boolean;
  /** Board cells */
  cellW: number;
  cellH: number;
  gap: number;
  rowGap: number;
  font: number;
  /** Name cells */
  nameW: number;
  nameH: number;
  nameGap: number;
  nameFont: number;
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
  const gutter = phone ? 0 : clamp(width * 0.04, 24, 72);
  const gap = phone ? 2 : 4;
  const rowGap = phone ? 5 : 6;
  const nameGap = phone ? 3 : 5;
  const ratio = phone ? 1.75 : 1.5;
  const inner = width - gutter * 2 - (phone ? 20 : 48);
  let cellW = Math.floor((inner - (script.cols - 1) * gap) / script.cols);
  if (!phone) {
    // Name cells are 1.5x board cells; leave room above and below for the footer
    const perCell = 1.5 * 1.45 + script.rows * ratio;
    cellW = Math.min(cellW, 46, Math.floor((height - 330) / perCell));
  }
  const gridW = script.cols * cellW + (script.cols - 1) * gap;
  const nameW = phone ? Math.min(48, Math.floor((gridW - (script.nameCols - 1) * nameGap) / script.nameCols)) : Math.round(cellW * 1.5);
  const cellH = Math.round(cellW * ratio);
  const nameH = Math.round(nameW * 1.45);
  return {
    phone,
    cellW,
    cellH,
    gap,
    rowGap,
    font: Math.round(cellH * 0.72),
    nameW,
    nameH,
    nameGap,
    nameFont: Math.round(nameH * 0.76),
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

/** The call to the gate: a real link laid over the CTA row once it has flapped in. */
const GateLink: React.FC<{href: string; at: number; top: number; width: number; height: number}> = ({href, at, top, width, height}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <a
      href={href}
      className="absolute rounded-[3px] outline-offset-2 hover:outline-2 hover:outline-(--dep-face) focus-visible:outline-2 focus-visible:outline-(--dep-focus-housing)"
      style={{left: 0, top, width, height}}
    >
      <span className="sr-only">See my work</span>
    </a>
  );
};

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
          <div
            style={{
              display: 'flex',
              flexDirection: phone ? 'column' : 'row',
              alignItems: phone ? 'flex-start' : 'flex-end',
              justifyContent: 'space-between',
              gap: phone ? 10 : 24,
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: g.rowGap + 2}}>
              {script.name.map((tracks, r) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: name lines are fixed
                <FlapRow key={r} tracks={tracks} w={g.nameW} h={g.nameH} gap={g.nameGap} fontSize={g.nameFont} />
              ))}
            </div>
            <div style={{paddingBottom: phone ? 0 : 4}}>{domain}</div>
          </div>

          <div aria-hidden style={{position: 'relative', height: g.label + 18, marginTop: phone ? 16 : 26}}>
            {script.columns.map((col) => (
              <Reveal
                key={col.label}
                from={cues.headsIn}
                until={cues.headsOut}
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

          <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: g.rowGap}}>
            {script.board.map((tracks, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: board rows are fixed
              <FlapRow key={r} tracks={tracks} w={g.cellW} h={g.cellH} gap={g.gap} fontSize={g.font} />
            ))}
            {/* The phone row is shorter than 44px: the link grows evenly around it to keep the touch target */}
            <GateLink
              href={worksHref}
              at={cues.ctaAt}
              top={cues.ctaRow * pitch - Math.max(0, (44 - g.cellH) / 2)}
              width={g.gridW}
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
