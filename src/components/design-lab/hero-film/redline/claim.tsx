import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, progress} from '../shared/motion';
import {Appear} from './anim';
import type {RedlineLayout} from './geometry';
import type {Timing} from './timing';

/** The lime highlighter under one word, drawn from the left. */
const Mark: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  return (
    <span style={{position: 'relative', display: 'inline-block', zIndex: 0, color: theme.markInk}}>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '-0.06em',
          right: '-0.06em',
          bottom: '0.07em',
          height: '0.36em',
          background: theme.mark,
          zIndex: -1,
          transformOrigin: 'left center',
          scale: `${progress(frame, at, at + 16, ARRIVE)} 1`,
        }}
      />
      {children}
    </span>
  );
};

type Step = {n: string; label: string; line: string; at: (t: Timing) => number};

/** What each beat is called, in order; each caption leaves as the next one arrives. */
const STEPS: Step[] = [
  {n: '01', label: 'Design', line: 'Wireframes that grow up.', at: (t) => t.cardIn + 14},
  {n: '02', label: 'Build', line: 'Pixel to production.', at: (t) => t.codeIn},
  {n: '03', label: 'Test', line: "Tested like it's launch day.", at: (t) => t.windowIn},
  {n: '04', label: 'Ship', line: 'Push. Build. Ship.', at: (t) => t.testOut + 2},
  {n: '04', label: 'Ship', line: "And it's live.", at: (t) => t.live},
];

const LEDE =
  "One developer from first question to live URL. WordPress, WooCommerce, Next.js and React, built for the people who'll actually use them.";

/** Name and claim from the first second; the beat captions, then the lede, in the slot below. */
export const ClaimColumn: React.FC<{L: RedlineLayout; T: Timing}> = ({L, T}) => {
  const lineSize = L.portrait ? 18 : 22;
  return (
    <div
      style={{
        position: 'absolute',
        left: L.column.x,
        top: L.column.y,
        width: L.column.w,
        height: L.column.h,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: L.portrait ? 'flex-start' : 'center',
        gap: L.portrait ? 12 : 20,
      }}
    >
      <Appear at={T.claimIn} dur={12} from={{y: 8}}>
        <p
          style={{
            margin: 0,
            fontFamily: fonts.mono,
            fontWeight: 500,
            fontSize: L.portrait ? 12 : 13,
            lineHeight: '16px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.muted,
          }}
        >
          Christian Diomampo, web developer
        </p>
      </Appear>
      <Appear at={T.claimIn + 4} dur={16} from={{y: 16}}>
        <p
          style={{
            margin: 0,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: L.claimSize,
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
            color: theme.ink,
            textWrap: 'balance',
          }}
        >
          I design, build &amp; ship websites that <Mark at={T.mark}>work.</Mark>
        </p>
      </Appear>
      <div style={{position: 'relative', height: L.slotHeight, marginTop: L.portrait ? 4 : 8}}>
        {STEPS.map((step, i) => {
          const next = STEPS[i + 1];
          return (
            <Appear
              key={step.line}
              at={step.at(T)}
              exit={(next ? next.at(T) : T.finalIn) - 10}
              from={{y: 10}}
              to={{y: -8}}
              style={{position: 'absolute', inset: 0}}
            >
              <p style={{margin: 0, display: 'flex', gap: 10, fontFamily: fonts.mono, fontWeight: 500, fontSize: 13, letterSpacing: '0.08em'}}>
                <span style={{color: theme.accent}}>{step.n}</span>
                <span style={{color: theme.muted, textTransform: 'uppercase'}}>{step.label}</span>
              </p>
              <p
                style={{
                  margin: '10px 0 0',
                  fontFamily: fonts.display,
                  fontWeight: 600,
                  fontSize: lineSize,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: theme.ink,
                }}
              >
                {step.line}
              </p>
            </Appear>
          );
        })}
        <Appear at={T.finalIn} dur={14} from={{y: 10}} style={{position: 'absolute', inset: 0}}>
          <p style={{margin: 0, maxWidth: 520, fontFamily: fonts.body, fontSize: L.ledeSize, lineHeight: 1.55, color: theme.muted}}>{LEDE}</p>
        </Appear>
      </div>
    </div>
  );
};

/** Restarts the film; sits in the corner of the stage it replays. */
export const ReplayButton: React.FC<{L: RedlineLayout; T: Timing; onReplay: () => void}> = ({L, T, onReplay}) => {
  if (!L.replay) return null;
  return (
    <Appear at={T.finalIn + 6} dur={12} from={{y: 6}} style={{position: 'absolute', left: L.replay.x, top: L.replay.y}}>
      <button
        type="button"
        onClick={onReplay}
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-(--rl-line) bg-(--rl-surface) px-4 font-body text-[14px] font-semibold text-(--rl-ink) hover:border-(--rl-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{'--rl-line': theme.line, '--rl-surface': theme.surface, '--rl-ink': theme.ink} as React.CSSProperties}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Replay
      </button>
    </Appear>
  );
};
