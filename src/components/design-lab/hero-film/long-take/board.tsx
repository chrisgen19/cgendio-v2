import type React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import type {LabFilmProps} from '../shared/film-player';
import {ARRIVE} from '../shared/motion';
import {Arrive, Highlight, Wipe} from './bits';
import {type CutSpec, cameraAt, posesFor, viewOf} from './layout';
import {LiveBody, ResearchBody, Section, WireframeBody} from './stations';

const BRAND_INK = '#0D0E12';

/** The board's title block: who I am and what I do, readable from the first second. */
const Title: React.FC<{cut: CutSpec}> = ({cut}) => {
  const {title, t} = cut;
  const last = title.lines.length - 1;
  return (
    <>
      <Arrive
        at={t.name}
        y={10}
        style={{
          position: 'absolute',
          left: title.x + 4,
          top: title.nameY,
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: title.nameSize,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.ink,
        }}
      >
        Christian Diomampo<span style={{color: theme.muted}}>, web developer</span>
      </Arrive>
      <div
        style={{
          position: 'absolute',
          left: title.x,
          top: title.headY,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: title.headSize,
          lineHeight: 0.96,
          letterSpacing: '-0.045em',
          color: theme.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {title.lines.map((line, i) => (
          <Arrive key={line} at={t.head + i * 4} y={28} dur={16}>
            {i === last ? (
              <>
                {line.replace(/work\.$/, '')}
                <Highlight at={t.mark}>work.</Highlight>
              </>
            ) : (
              line
            )}
          </Arrive>
        ))}
      </div>
      <Arrive
        at={t.lede}
        y={14}
        style={{
          position: 'absolute',
          left: title.x + 4,
          top: title.ledeY,
          width: title.ledeW,
          fontFamily: fonts.body,
          fontSize: title.ledeSize,
          lineHeight: 1.45,
          color: theme.muted,
        }}
      >
        One developer from first question to live URL. WordPress, WooCommerce, Next.js and React, built for the people who&apos;ll actually use them.
      </Arrive>
    </>
  );
};

/** The end of the route: a lime panel that holds "See my work" once the camera has pulled back. */
const CtaCell: React.FC<{cut: CutSpec}> = ({cut}) => {
  const c = cut.cells.cta;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: c.x,
          top: c.y,
          width: c.w,
          height: c.h,
          boxSizing: 'border-box',
          borderRadius: 28,
          border: `2px dashed ${theme.line}`,
        }}
      />
      <Wipe at={cut.t.cta} dur={16} style={{position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h}}>
        <div
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            borderRadius: 28,
            background: theme.lime,
            padding: cut.compact ? 34 : 40,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: cut.compact ? 54 : 52,
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
            color: theme.onLime,
          }}
        >
          Pixel to
          <br />
          production.
        </div>
      </Wipe>
    </>
  );
};

/** The whole board at camera scale 1. Static: only its leaves read the frame. */
const Board: React.FC<{cut: CutSpec}> = ({cut}) => {
  const {cells, compact} = cut;
  const inner = (w: number) => w - 4 - (compact ? 56 : 64);
  const bodyH = cells.s1.h - 4 - (compact ? 56 : 64);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: cut.board.w, height: cut.board.h}}>
      <div
        style={{
          position: 'absolute',
          left: -3000,
          top: -3000,
          width: cut.board.w + 6000,
          height: cut.board.h + 6000,
          backgroundImage: `radial-gradient(circle, ${theme.dot} 1.6px, transparent 2.1px)`,
          backgroundSize: '30px 30px',
        }}
      />
      <Title cut={cut} />
      <Section rect={cells.s1} n="01" label="Research" heading="Listen first. Build second." compact={compact}>
        <ResearchBody cut={cut} />
      </Section>
      <Section rect={cells.s2} n="02" label="Wireframe" heading="Wireframes that grow up." compact={compact}>
        <WireframeBody cut={cut} w={inner(cells.s2.w)} h={bodyH - (compact ? 98 : 104)} />
      </Section>
      <Section rect={cells.s3} n="03" label="Live" heading="Push. Build. Ship." compact={compact}>
        <LiveBody cut={cut} w={inner(cells.s3.w)} browserH={compact ? 236 : 270} />
      </Section>
      <CtaCell cut={cut} />
    </div>
  );
};

/** The only camera: one translate + scale on the board, between station poses. */
const Camera: React.FC<{cut: CutSpec; children: React.ReactNode}> = ({cut, children}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const view = cameraAt(frame, cut, width, height);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', translate: `${view.tx}px ${view.ty}px`, scale: view.s}}>
      {children}
    </div>
  );
};

/** Real, full-size buttons laid over the lime panel once the camera rests on the board. */
const CtaOverlay: React.FC<{cut: CutSpec} & LabFilmProps> = ({cut, worksHref, onReplay}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const view = viewOf(posesFor(cut, width, height).board, cut, width, height);
  const c = cut.cells.cta;
  const at = cut.t.ctaButtons;
  const shown = frame >= at;
  const pad = cut.compact ? 12 : 22;
  const arrive = (delay: number): React.CSSProperties => ({
    opacity: interpolate(frame, [at + delay, at + delay + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ARRIVE}),
    translate: `0 ${interpolate(frame, [at + delay, at + delay + 14], [12, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ARRIVE})}px`,
  });
  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B2BFF]';
  return (
    <div
      style={{
        position: 'absolute',
        left: view.tx + c.x * view.s,
        top: view.ty + c.y * view.s,
        width: c.w * view.s,
        height: c.h * view.s,
        boxSizing: 'border-box',
        padding: pad,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: cut.compact ? 'stretch' : 'flex-start',
        gap: cut.compact ? 8 : 10,
        visibility: shown ? 'visible' : 'hidden',
      }}
    >
      <a
        href={worksHref}
        className={`hover:bg-[#3B2BFF] ${focus}`}
        style={{
          ...arrive(0),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: cut.compact ? 44 : 52,
          padding: cut.compact ? '0 12px' : '0 26px',
          borderRadius: 999,
          background: BRAND_INK,
          color: '#FFFFFF',
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: cut.compact ? 15 : 16,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        See my work
      </a>
      <button
        type="button"
        onClick={onReplay}
        className={`hover:bg-white/50 ${focus}`}
        style={{
          ...arrive(5),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          height: 44,
          padding: cut.compact ? '0 12px' : '0 18px',
          borderRadius: 999,
          border: `1.5px solid ${BRAND_INK}`,
          background: 'transparent',
          color: BRAND_INK,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: cut.compact ? 14 : 15,
          cursor: 'pointer',
        }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Replay
      </button>
    </div>
  );
};

/** One cut of the film: the board under the camera, with the CTA laid over its final pose. */
export const LongTakeCut: React.FC<LabFilmProps & {cut: CutSpec}> = ({cut, worksHref, onReplay}) => (
  <AbsoluteFill style={{background: theme.stage, overflow: 'hidden', fontFamily: fonts.body}}>
    <Camera cut={cut}>
      <Board cut={cut} />
    </Camera>
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: cut.safe.top * 0.9,
        background: `linear-gradient(${theme.stage}, transparent)`,
      }}
    />
    <CtaOverlay cut={cut} worksHref={worksHref} onReplay={onReplay} />
  </AbsoluteFill>
);
