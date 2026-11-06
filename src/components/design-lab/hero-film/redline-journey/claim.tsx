import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, progress} from '../shared/motion';
import {Appear} from './anim';
import type {JourneyLayout} from './geometry';
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

type Step = {n: string; label: string; line: string; sub: string; at: (t: Timing) => number; out: (t: Timing) => number};

/**
 * What each beat is called, in order. A caption leaves with its beat's context, before the card glides, and the next
 * one arrives once the glide has settled, so the column and the card never move at the same time.
 */
const STEPS: Step[] = [
  {
    n: '01',
    label: 'Research',
    line: 'Listen first. Build second.',
    sub: 'Goals, users and competitors, mapped before a single pixel.',
    at: (t) => t.research.start,
    out: (t) => t.research.out,
  },
  {
    n: '02',
    label: 'Design',
    line: 'Wireframes that grow up.',
    sub: 'Low-fi flows become a real design system in Figma.',
    at: (t) => t.design.start,
    out: (t) => t.design.out,
  },
  {
    n: '03',
    label: 'Figma to Web',
    line: 'Pixel to production.',
    sub: 'Figma frames become typed, reusable components.',
    at: (t) => t.code.start,
    out: (t) => t.code.out,
  },
  {
    n: '04',
    label: 'QA',
    line: "Tested like it's launch day.",
    sub: 'Every screen, browser and form, checked before it ships.',
    at: (t) => t.qa.start,
    out: (t) => t.qa.out,
  },
  {
    n: '05',
    label: 'Deploy',
    line: 'Push. Build. Ship.',
    sub: "One push to main, built and live on Vercel's edge.",
    at: (t) => t.deploy.start,
    out: (t) => t.deploy.out,
  },
  {
    n: '06',
    label: 'Live',
    line: "And it's live.",
    sub: 'Fast, findable and ready for the next inquiry, and I stay on to look after it.',
    at: (t) => t.live.start,
    out: (t) => t.live.out,
  },
];

const LEDE =
  "One developer from first question to live URL. WordPress, WooCommerce, Next.js and React, built for the people who'll actually use them.";

export const SERVICES = ['WordPress & WooCommerce', 'Next.js & React', 'Migrations & redesigns'];

/** The services from the brand card, as site tags; `trailing` (the phone's Replay) wraps in line after them. */
export const ServiceTags: React.FC<{size: number; trailing?: React.ReactNode}> = ({size, trailing}) => (
  <ul style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, margin: 0, padding: 0, listStyle: 'none'}}>
    {SERVICES.map((s) => (
      <li
        key={s}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: size * 2.5,
          padding: `0 ${Math.round(size * 0.9)}px`,
          borderRadius: 999,
          background: theme.surface,
          boxShadow: `inset 0 0 0 1px ${theme.line}`,
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: size,
          color: theme.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {s}
      </li>
    ))}
    {trailing ? <li style={{display: 'inline-flex'}}>{trailing}</li> : null}
  </ul>
);

/** Name and claim from the first second; the beat captions, then the lede, in the slot below. */
export const ClaimColumn: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const lineSize = L.portrait ? 18 : 24;
  const subSize = L.portrait ? 13 : 16;
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
        {STEPS.map((step) => (
          <Appear key={step.label} at={step.at(T)} exit={step.out(T)} from={{y: 10}} to={{y: -8}} style={{position: 'absolute', inset: 0}}>
            <p
              style={{
                margin: 0,
                display: 'flex',
                gap: 10,
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: L.portrait ? 12 : 13,
                lineHeight: '16px',
                letterSpacing: '0.08em',
              }}
            >
              <span style={{color: theme.accent}}>{step.n}</span>
              <span style={{color: theme.muted, textTransform: 'uppercase'}}>{step.label}</span>
            </p>
            <p
              style={{
                margin: `${L.portrait ? 8 : 12}px 0 0`,
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
            <p
              style={{
                margin: `${L.portrait ? 4 : 8}px 0 0`,
                maxWidth: 440,
                fontFamily: fonts.body,
                fontSize: subSize,
                lineHeight: 1.45,
                color: theme.muted,
                textWrap: 'pretty',
              }}
            >
              {step.sub}
            </p>
          </Appear>
        ))}
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 18}}>
          <Appear at={T.final.start} dur={14} from={{y: 10}}>
            <p style={{margin: 0, maxWidth: 520, fontFamily: fonts.body, fontSize: L.ledeSize, lineHeight: 1.55, color: theme.muted}}>{LEDE}</p>
          </Appear>
          {L.portrait ? null : (
            <Appear at={T.final.start + 6} dur={14} from={{y: 8}}>
              <ServiceTags size={12} />
            </Appear>
          )}
        </div>
      </div>
    </div>
  );
};

/** Restarts the film. */
export const ReplayButton: React.FC<{onReplay: () => void}> = ({onReplay}) => (
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
);
