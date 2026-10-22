import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Appear, EASE_INOUT, Mark, Tag} from './primitives';
import {fonts, theme} from './theme';
import {isPortrait} from './timeline';

/** Every scene's illustration is authored on this fixed canvas, then scaled to fit. */
export const VIZ_W = 1000;
export const VIZ_H = 800;

/**
 * The player sizes the composition to the hero section in CSS pixels, so
 * these tokens are real on-screen sizes. Portrait = phones / tall windows.
 */
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const portrait = isPortrait(width, height);
  const padX = portrait ? 20 : width < 1200 ? 40 : 56;
  const padTop = portrait ? 88 : 112;
  const padBottom = portrait ? 104 : 116;
  const innerW = Math.min(width - padX * 2, 1320);
  const innerH = height - padTop - padBottom;
  return {
    width,
    height,
    portrait,
    padX,
    padTop,
    padBottom,
    innerW,
    innerH,
    title: portrait ? Math.min(44, width * 0.105) : Math.round(Math.min(78, Math.max(46, width * 0.05))),
    lede: portrait ? 16 : 18,
    tag: portrait ? 11 : 12,
    step: portrait ? 12 : 13,
  };
};

/* ------------------------------------------------------------------ */

const Sweep: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 40) return null;
  const left = interpolate(frame, [2, 34], [-30, 130], {
    easing: EASE_INOUT,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: '-10%',
        bottom: '-10%',
        left: `${left}%`,
        width: '16%',
        background: theme.lime,
        transform: 'skewX(-18deg)',
        mixBlendMode: 'multiply',
        zIndex: 20,
      }}
    />
  );
};

const BgNumber: React.FC<{text: string; size?: number}> = ({text, size}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, height} = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [60, -60]);
  const fontSize = size ?? Math.round(height * 0.55);
  return (
    <div
      style={{
        position: 'absolute',
        right: '-1%',
        bottom: '-16%',
        fontFamily: fonts.display,
        fontWeight: 800,
        fontSize,
        lineHeight: 1,
        letterSpacing: '-0.06em',
        color: 'transparent',
        WebkitTextStroke: `1.5px ${theme.outline}`,
        transform: `translateX(${drift}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** White stage with a dot grid, a giant outlined number and the lime sweep. */
export const SceneShell: React.FC<{
  number?: string;
  numberSize?: number;
  sweep?: boolean;
  children: React.ReactNode;
}> = ({number, numberSize, sweep = true, children}) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.white,
      backgroundImage: `radial-gradient(circle, ${theme.dot} 1px, transparent 1.3px)`,
      backgroundSize: '26px 26px',
      overflow: 'hidden',
      fontFamily: fonts.body,
      color: theme.ink,
    }}
  >
    {number ? <BgNumber text={number} size={numberSize} /> : null}
    {children}
    {sweep ? <Sweep /> : null}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */

export const StepLabel: React.FC<{n: string; label: string; size: number}> = ({n, label, size}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: fonts.mono,
      fontWeight: 500,
      fontSize: size,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.muted,
    }}
  >
    <b
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        minWidth: size * 2.8,
        height: size * 2,
        padding: '0 9px',
        borderRadius: 999,
        background: theme.ink,
        color: theme.white,
        fontWeight: 500,
      }}
    >
      {n}
    </b>
    {label}
  </span>
);

export const Headline: React.FC<{size: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  size,
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: fonts.display,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: '-0.04em',
      color: theme.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Title with the highlighter on its key word: `before` <Mark>`marked`</Mark> `after`. */
export const MarkedTitle: React.FC<{before?: React.ReactNode; marked: string; after?: React.ReactNode; markDelay?: number}> = ({
  before,
  marked,
  after,
  markDelay = 38,
}) => (
  <>
    {before}
    <Mark delay={markDelay}>{marked}</Mark>
    {after}
  </>
);

/**
 * The two-zone layout used by the six process scenes: copy on the left (or
 * top on phones) and a 1000 × 800 illustration on the right (or below),
 * scaled to fit and given a slow camera push for a filmic feel.
 */
export const ProcessScene: React.FC<{
  n: string;
  label: string;
  title: React.ReactNode;
  lede: string;
  tags: string[];
  children: React.ReactNode;
}> = ({n, label, title, lede, tags, children}) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const gap = L.portrait ? 24 : 56;
  const textW = L.portrait ? L.innerW : Math.round(L.innerW * 0.4);
  const vizZoneW = L.portrait ? L.innerW : L.innerW - textW - gap;
  const vizZoneH = L.portrait ? Math.max(160, L.innerH * 0.5) : L.innerH;
  const scale = Math.min(vizZoneW / VIZ_W, vizZoneH / VIZ_H);

  const push = interpolate(frame, [0, durationInFrames], [1, 1.04]);
  const orbit = interpolate(frame, [0, durationInFrames], [-4, 3]);

  return (
    <SceneShell number={n}>
      <AbsoluteFill
        style={{
          padding: `${L.padTop}px ${L.padX}px ${L.padBottom}px`,
          display: 'flex',
          flexDirection: L.portrait ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
        }}
      >
        <div
          style={{
            width: textW,
            maxWidth: L.portrait ? undefined : 500,
            display: 'flex',
            flexDirection: 'column',
            gap: L.portrait ? 12 : 20,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Appear delay={12}>
            <StepLabel n={n} label={label} size={L.step} />
          </Appear>
          <Appear delay={17}>
            <Headline size={L.title}>{title}</Headline>
          </Appear>
          <Appear delay={24}>
            <p style={{margin: 0, fontSize: L.lede, lineHeight: 1.55, color: theme.muted, maxWidth: 440}}>{lede}</p>
          </Appear>
          <Appear delay={30} style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            {tags.map((t) => (
              <Tag key={t} size={L.tag}>
                {t}
              </Tag>
            ))}
          </Appear>
        </div>

        <div style={{width: VIZ_W * scale, height: VIZ_H * scale, perspective: 2000, flex: 'none', position: 'relative', zIndex: 2}}>
          <div
            style={{
              position: 'relative',
              width: VIZ_W,
              height: VIZ_H,
              transformOrigin: '0 0',
              transform: `scale(${scale}) translate(${VIZ_W / 2}px, ${VIZ_H / 2}px) scale(${push}) rotateY(${orbit}deg) translate(${-VIZ_W / 2}px, ${-VIZ_H / 2}px)`,
            }}
          >
            {children}
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
