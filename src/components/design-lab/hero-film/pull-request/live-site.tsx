import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, MOVE, tween} from '../shared/motion';
import {useCut} from './cut-context';
import {dotGrid} from './pr-page';
import {Avatar, StatusPill} from './pr-parts';
import {CHECKS, type CutTiming, checkState} from './timeline';

const LIVE_GREEN = '#16A34A';

/** The lime highlighter under one word, drawn left to right once the zoom has settled. */
const Mark: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {t} = useCut();
  return (
    <span style={{position: 'relative', display: 'inline-block', zIndex: 0, color: theme.markInk}}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-0.06em',
          right: '-0.06em',
          bottom: '0.07em',
          height: '0.36em',
          background: theme.mark,
          zIndex: -1,
          transformOrigin: 'left center',
          scale: `${tween(frame, [t.mark, t.mark + 16], [0, 1], MOVE)} 1`,
        }}
      />
      {children}
    </span>
  );
};

const LiveDot: React.FC<{size?: number}> = ({size = 8}) => (
  <span
    style={{
      flex: 'none',
      width: size,
      height: size,
      borderRadius: 99,
      background: LIVE_GREEN,
      boxShadow: '0 0 0 4px rgba(22,163,74,.15)',
    }}
  />
);

const Tick: React.FC<{size: number; on: boolean; at: number}> = ({size, on, at}) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        flex: 'none',
        width: size,
        height: size,
        borderRadius: 99,
        background: on ? theme.badge : 'transparent',
        border: on ? 'none' : `2px dashed ${theme.bar}`,
        color: theme.badgeInk,
        scale: on ? tween(frame, [at, at + 10], [0.55, 1], ARRIVE) : 1,
      }}
    >
      {on ? (
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
      ) : null}
    </span>
  );
};

/** Mirrors the PR, so the thumbnail is a true live preview: checks tick and the pill turns lime as they do above. */
const ReceiptRow: React.FC<{i: number; t: CutTiming}> = ({i, t}) => {
  const frame = useCurrentFrame();
  const on = checkState(t, i, frame) === 'passed';
  return (
    <li style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500, color: theme.ink}}>
      <Tick size={20} on={on} at={t.checks + i * t.checkStep + t.checkRun} />
      {CHECKS[i]}
    </li>
  );
};

const Receipt: React.FC<{width: number}> = ({width}) => {
  const {t} = useCut();
  return (
    <div
      style={{
        width,
        flex: 'none',
        background: theme.surface,
        border: `1px solid ${theme.line}`,
        borderRadius: 22,
        boxShadow: theme.shadow,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <StatusPill size={13} />
        <span style={{fontFamily: fonts.mono, fontSize: 12, color: theme.muted}}>feat/launch into main</span>
      </div>
      <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 24, lineHeight: 1.1, letterSpacing: '-0.03em', color: theme.ink}}>
        feat: launch the new site
      </span>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: '16px 0',
          borderTop: `1px solid ${theme.line}`,
          borderBottom: `1px solid ${theme.line}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {CHECKS.map((name, i) => (
          <ReceiptRow key={name} i={i} t={t} />
        ))}
      </ul>
      <span style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: theme.muted}}>
        <LiveDot />
        Live at <span style={{fontFamily: fonts.mono, fontSize: 13, color: theme.ink}}>cgdiomampo.dev</span>
      </span>
    </div>
  );
};

/** Phone version of the receipt: one line under the lede. */
const ReceiptLine: React.FC = () => {
  const frame = useCurrentFrame();
  const {t} = useCut();
  const merged = frame >= t.merged;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: theme.muted}}>
      <StatusPill size={12} />
      <span>{merged ? "All checks passed. And it's live." : 'Checks running'}</span>
    </div>
  );
};

const Arrow = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ReplayIcon = () => (
  <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const btn = (compact: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  minHeight: compact ? 48 : 52,
  padding: compact ? '0 20px' : '0 24px',
  borderRadius: 999,
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: compact ? 14.5 : 15,
  lineHeight: 1,
  textDecoration: 'none',
  cursor: 'pointer',
  border: '1px solid transparent',
});

const Actions: React.FC<{worksHref: string; onReplay: () => void; compact: boolean}> = ({worksHref, onReplay, compact}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: compact ? 10 : 12}}>
    <a href={worksHref} className={FOCUS} style={{...btn(compact), background: theme.ink, color: theme.onInk}}>
      See my work <Arrow />
    </a>
    <button
      type="button"
      onClick={onReplay}
      className={FOCUS}
      style={{...btn(compact), background: theme.surface, color: theme.ink, borderColor: theme.line}}
    >
      <ReplayIcon />
      Replay
    </button>
  </div>
);

const Byline: React.FC<{compact: boolean}> = ({compact}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Avatar size={compact ? 36 : 40} />
    <span style={{display: 'flex', flexDirection: 'column', gap: 3}}>
      <span style={{fontSize: compact ? 15 : 16, fontWeight: 600, color: theme.ink, letterSpacing: '-0.01em'}}>Christian Diomampo</span>
      <span style={{fontFamily: fonts.mono, fontSize: compact ? 12 : 13, color: theme.muted}}>cgdiomampo.dev</span>
    </span>
  </div>
);

const Headline: React.FC<{size: number; lines: boolean}> = ({size, lines}) => (
  <p
    style={{
      margin: 0,
      fontFamily: fonts.display,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 0.98,
      letterSpacing: '-0.04em',
      color: theme.ink,
    }}
  >
    I design, build &amp; ship{lines ? <br /> : ' '}websites that <Mark>work.</Mark>
  </p>
);

const LEDE =
  "One developer from first question to live URL. WordPress, WooCommerce, Next.js and React, built for the people who'll actually use them.";

/**
 * The live site: the film's final rest frame, and (scaled down) the preview thumbnail. Laid out for the real
 * composition size, so the zoom ends on exactly the frame reduced-motion visitors open on.
 */
export const LiveSite: React.FC<{worksHref: string; onReplay: () => void}> = ({worksHref, onReplay}) => {
  const {g} = useCut();
  const {width, height, portrait} = g;

  if (portrait) {
    const size = Math.min(48, Math.round(width * 0.118));
    return (
      <div style={{position: 'absolute', inset: 0, ...dotGrid, fontFamily: fonts.body}}>
        <div
          style={{
            position: 'absolute',
            inset: `0 20px ${Math.round(height * 0.11)}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 22,
          }}
        >
          <Byline compact />
          <Headline size={size} lines={false} />
          <p style={{margin: 0, fontSize: 16, lineHeight: 1.55, color: theme.muted, maxWidth: 360}}>{LEDE}</p>
          <ReceiptLine />
          <Actions worksHref={worksHref} onReplay={onReplay} compact />
        </div>
      </div>
    );
  }

  const innerW = Math.min(width - 112, 1320);
  const showReceipt = width >= 1160;
  const receiptW = Math.min(400, Math.round(innerW * 0.3));
  const leftW = showReceipt ? innerW - receiptW - 72 : innerW;
  const size = Math.round(Math.min(96, Math.max(48, leftW / 9.4), height * 0.105));
  return (
    <div style={{position: 'absolute', inset: 0, ...dotGrid, fontFamily: fonts.body}}>
      <div
        style={{
          position: 'absolute',
          left: (width - innerW) / 2,
          width: innerW,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 72,
        }}
      >
        <div style={{width: leftW, display: 'flex', flexDirection: 'column', gap: 28}}>
          <Byline compact={false} />
          <Headline size={size} lines />
          <p style={{margin: 0, fontSize: 19, lineHeight: 1.55, color: theme.muted, maxWidth: 560}}>{LEDE}</p>
          <div style={{marginTop: 6}}>
            <Actions worksHref={worksHref} onReplay={onReplay} compact={false} />
          </div>
        </div>
        {showReceipt ? <Receipt width={receiptW} /> : null}
      </div>
    </div>
  );
};
