import type React from 'react';
import {theme} from '@/components/hero-film/theme';
import {Wipe} from './bits';

/** Blocks of a small marketing page, as fractions of the mock's width and height: [x, y, w, h]. */
type Box = [number, number, number, number];

const NAV: Box = [0.04, 0.05, 0.92, 0.1];
const H1A: Box = [0.04, 0.23, 0.46, 0.085];
const H1B: Box = [0.04, 0.345, 0.34, 0.085];
const LEDE: Box[] = [
  [0.04, 0.48, 0.47, 0.035],
  [0.04, 0.54, 0.38, 0.035],
];
const BTN: Box = [0.04, 0.63, 0.22, 0.09];
const IMG: Box = [0.56, 0.23, 0.4, 0.49];
const CARDS: Box[] = [
  [0.04, 0.78, 0.28, 0.17],
  [0.36, 0.78, 0.28, 0.17],
  [0.68, 0.78, 0.28, 0.17],
];
const CARD_ICONS = [theme.lime, theme.accent, theme.ink];

type MockProps = {
  w: number;
  h: number;
  /** First frame of the styled fill; null keeps the wireframe, a negative frame shows the finished page. */
  fillAt: number | null;
};

const place = ([x, y, bw, bh]: Box, w: number, h: number): React.CSSProperties => ({
  position: 'absolute',
  left: x * w,
  top: y * h,
  width: bw * w,
  height: bh * h,
});

/** One block: the grey wire underneath, the styled version wiped over it. */
const Block: React.FC<{box: Box; w: number; h: number; at: number | null; wire?: React.ReactNode; children: React.ReactNode}> = ({
  box,
  w,
  h,
  at,
  wire,
  children,
}) => (
  <div style={place(box, w, h)}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 4, background: theme.wire}}>{wire}</div>
    {at === null ? null : (
      <Wipe at={at} style={{position: 'absolute', inset: 0}}>
        {children}
      </Wipe>
    )}
  </div>
);

const fill: React.CSSProperties = {position: 'absolute', inset: 0};

/** A wireframe that fills into a styled page, block by block. The same page is the built site in the browser. */
export const PageMock: React.FC<MockProps> = ({w, h, fillAt}) => {
  const at = (offset: number) => (fillAt === null ? null : fillAt + offset);
  return (
    <div style={{position: 'relative', width: w, height: h, background: theme.canvas, overflow: 'hidden'}}>
      <Block box={NAV} w={w} h={h} at={at(0)}>
        <div
          style={{
            ...fill,
            borderRadius: 6,
            background: theme.surface,
            border: `1px solid ${theme.line}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4%',
            padding: '0 3%',
          }}
        >
          <span style={{height: '56%', aspectRatio: '1', borderRadius: 4, background: theme.badge}} />
          <span style={{flex: 1}} />
          {[0.1, 0.12, 0.09].map((bw) => (
            <span key={bw} style={{width: `${bw * 100}%`, height: '18%', borderRadius: 3, background: theme.bar}} />
          ))}
        </div>
      </Block>
      <Block box={H1A} w={w} h={h} at={at(4)}>
        <div style={{...fill, borderRadius: 4, background: theme.ink}} />
      </Block>
      <Block box={H1B} w={w} h={h} at={at(6)}>
        <div style={{position: 'absolute', left: '-4%', bottom: '-14%', width: '82%', height: '50%', background: theme.lime}} />
        <div style={{...fill, borderRadius: 4, background: theme.ink, right: '10%'}} />
      </Block>
      {LEDE.map((box, i) => (
        <Block key={box[1]} box={box} w={w} h={h} at={at(9 + i * 2)}>
          <div style={{...fill, borderRadius: 3, background: theme.muted, opacity: 0.55}} />
        </Block>
      ))}
      <Block box={BTN} w={w} h={h} at={at(13)}>
        <div style={{...fill, borderRadius: 999, background: theme.accent, display: 'grid', placeItems: 'center'}}>
          <span style={{width: '50%', height: '18%', borderRadius: 3, background: theme.onAccent}} />
        </div>
      </Block>
      <Block
        box={IMG}
        w={w}
        h={h}
        at={at(15)}
        wire={
          <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{display: 'block'}}>
            <path d="M0 0 L100 100 M100 0 L0 100" stroke={theme.bar} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          </svg>
        }
      >
        <div style={{...fill, borderRadius: 8, background: theme.tint, overflow: 'hidden'}}>
          <span
            style={{position: 'absolute', right: '12%', top: '14%', width: '30%', aspectRatio: '1', borderRadius: '50%', background: theme.accent}}
          />
          <span style={{position: 'absolute', left: '10%', bottom: '12%', width: '52%', height: '30%', borderRadius: 6, background: theme.lime}} />
        </div>
      </Block>
      {CARDS.map((box, i) => (
        <Block key={box[0]} box={box} w={w} h={h} at={at(18 + i * 3)}>
          <div
            style={{
              ...fill,
              borderRadius: 6,
              background: theme.surface,
              border: `1px solid ${theme.line}`,
              padding: '9% 10%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14%',
            }}
          >
            <span style={{width: '22%', aspectRatio: '1', borderRadius: 4, background: CARD_ICONS[i]}} />
            <span style={{width: '80%', height: '12%', borderRadius: 3, background: theme.bar}} />
          </div>
        </Block>
      ))}
    </div>
  );
};
