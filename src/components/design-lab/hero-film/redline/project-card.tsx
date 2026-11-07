import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import type {CardGeo, Rect} from './geometry';

const STACK = ['WordPress', 'WooCommerce', 'Next.js', 'React'];

const abs = (r: Rect): React.CSSProperties => ({position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h});

/** A tiny page inside the thumbnail: nav, a two-line headline with the highlighter, a button and an image block. */
const Thumb: React.FC<{rect: Rect}> = ({rect}) => {
  const u = rect.h / 196;
  const bar = (left: number, top: number, w: string, h: number, background: string): React.CSSProperties => ({
    position: 'absolute',
    left: left * u,
    top: top * u,
    width: w,
    height: h * u,
    borderRadius: 999,
    background,
  });
  return (
    <div style={{...abs(rect), borderRadius: 14, background: theme.tint, overflow: 'hidden'}}>
      <div style={{...bar(16, 16, `${14 * u}px`, 14, theme.ink), borderRadius: 4 * u}} />
      <div style={bar(230, 20, '9%', 6, theme.bar)} />
      <div style={bar(270, 20, '9%', 6, theme.bar)} />
      <div style={bar(16, 62, '46%', 14, theme.ink)} />
      <div style={bar(16, 84, '30%', 14, theme.ink)} />
      <div style={{...bar(60, 92, '19%', 7, theme.lime), borderRadius: 0}} />
      <div style={bar(16, 112, '40%', 6, theme.bar)} />
      <div style={bar(16, 124, '32%', 6, theme.bar)} />
      <div style={bar(16, 146, '20%', 20, theme.accent)} />
      <div
        style={{
          position: 'absolute',
          right: 16 * u,
          top: 50 * u,
          width: '33%',
          bottom: 22 * u,
          borderRadius: 12 * u,
          background: theme.surface,
          border: `1px solid ${theme.line}`,
        }}
      />
    </div>
  );
};

type ProjectCardProps = {
  geo: CardGeo;
  /** With an href the button is the real "See my work" link; without it the card is decorative. */
  href?: string;
  /** The frame the link goes live. Before it the card is still moving or shrunk below a 44px target, so the button is decorative. */
  liveAt?: number;
};

const buttonClass =
  'bg-(--btn-bg) text-(--btn-fg) hover:bg-(--btn-hover-bg) hover:text-(--btn-hover-fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** The card's button: a decorative pill until `liveAt`, then the real link (a leaf, so only it re-renders per frame). */
const CardButton: React.FC<{style: React.CSSProperties; href?: string; liveAt: number}> = ({style, href, liveAt}) => {
  const frame = useCurrentFrame();
  if (href && frame >= liveAt) {
    return (
      <a href={href} className={buttonClass} style={style}>
        See my work
      </a>
    );
  }
  return (
    <span aria-hidden className="bg-(--btn-bg) text-(--btn-fg)" style={style}>
      See my work
    </span>
  );
};

/** The one object of the film: a project card, authored once at its base size and posed by scale and translate. */
export const ProjectCard: React.FC<ProjectCardProps> = ({geo, href, liveAt = 0}) => {
  const buttonStyle = {
    ...abs(geo.button),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 1,
    textDecoration: 'none',
    '--btn-bg': theme.ink,
    '--btn-fg': theme.onInk,
    '--btn-hover-bg': theme.accent,
    '--btn-hover-fg': theme.onAccent,
  } as React.CSSProperties;
  return (
    <div
      style={{
        position: 'relative',
        width: geo.w,
        height: geo.h,
        background: theme.surface,
        borderRadius: 22,
        boxShadow: `0 0 0 1px ${theme.line}, ${theme.shadow}`,
      }}
    >
      <Thumb rect={geo.thumb} />
      <div aria-hidden style={{...abs(geo.meta), fontFamily: fonts.mono, fontWeight: 500, fontSize: 12, lineHeight: '14px', color: theme.accent}}>
        cgdiomampo.dev/projects
      </div>
      <div
        aria-hidden
        style={{
          ...abs(geo.title),
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 28,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: theme.ink,
        }}
      >
        Selected work
      </div>
      <div aria-hidden style={{...abs(geo.tags), display: 'flex', gap: 5}}>
        {STACK.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: geo.tags.h,
              padding: '0 8px',
              borderRadius: 999,
              boxShadow: `inset 0 0 0 1px ${theme.line}`,
              fontFamily: fonts.mono,
              fontWeight: 500,
              fontSize: geo.tagSize,
              color: theme.ink,
              whiteSpace: 'nowrap',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <CardButton style={buttonStyle} href={href} liveAt={liveAt} />
    </div>
  );
};
