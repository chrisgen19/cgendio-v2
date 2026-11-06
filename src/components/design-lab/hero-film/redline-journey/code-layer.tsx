import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, MOVE, progress} from '../shared/motion';
import {Appear, ClipReveal, fromSide} from './anim';
import {type CardPart, type JourneyLayout, type Point, partRect, rectAt} from './geometry';
import {EXIT, type Timing} from './timing';

type Kind = 'kw' | 'str' | 'tag' | 'dim' | 'txt';
type Line = {t: [Kind, string][]; part?: CardPart};

const COLOR: Record<Kind, string> = {kw: theme.code.kw, str: theme.code.str, tag: theme.code.tag, dim: theme.code.dim, txt: theme.code.text};

const open = (indent: string, tag: string, attrs: [Kind, string][] = [], close = '>'): [Kind, string][] => [
  ['txt', indent],
  ['dim', '<'],
  ['tag', tag],
  ...attrs,
  ['dim', close],
];
const attr = (name: string, value: string, isString = true): [Kind, string][] =>
  isString
    ? [
        ['kw', ` ${name}`],
        ['dim', '='],
        ['str', `"${value}"`],
      ]
    : [
        ['kw', ` ${name}`],
        ['dim', '={'],
        ['txt', value],
        ['dim', '}'],
      ];
const close = (indent: string, tag: string): [Kind, string][] => [
  ['txt', indent],
  ['dim', '</'],
  ['tag', tag],
  ['dim', '>'],
];

const DESKTOP_CODE: Line[] = [
  {
    t: [
      ['kw', 'export function '],
      ['txt', 'ProjectCard'],
      ['dim', '() {'],
    ],
  },
  {
    t: [
      ['txt', '  '],
      ['kw', 'return'],
      ['dim', ' ('],
    ],
  },
  {t: open('    ', 'article', attr('className', 'rounded-card')), part: 'card'},
  {t: open('      ', 'Thumb', attr('src', 'cover', false), ' />'), part: 'thumb'},
  {t: [...open('      ', 'p', attr('className', 'font-mono')), ['dim', '{'], ['txt', 'url'], ['dim', '}'], ...close('', 'p')], part: 'meta'},
  {t: open('      ', 'h3', attr('className', 'font-display')), part: 'title'},
  {t: [['txt', '        Selected work']]},
  {t: close('      ', 'h3')},
  {t: open('      ', 'Tags', attr('items', 'stack', false), ' />'), part: 'tags'},
  {t: [...open('      ', 'Button', attr('href', '#work')), ['txt', 'See my work'], ...close('', 'Button')], part: 'button'},
  {t: close('    ', 'article')},
  {
    t: [
      ['txt', '  '],
      ['dim', ');'],
    ],
  },
  {t: [['dim', '}']]},
];

const PHONE_CODE: Line[] = [
  {t: open('', 'article', attr('className', 'rounded-card')), part: 'card'},
  {t: open('  ', 'Thumb', attr('src', 'cover', false), ' />'), part: 'thumb'},
  {t: [...open('  ', 'p'), ['dim', '{'], ['txt', 'url'], ['dim', '}'], ...close('', 'p')], part: 'meta'},
  {t: [...open('  ', 'h3'), ['txt', 'Selected work'], ...close('', 'h3')], part: 'title'},
  {t: open('  ', 'Tags', attr('items', 'stack', false), ' />'), part: 'tags'},
  {t: open('  ', 'Button', attr('href', '#work')), part: 'button'},
  {t: [['txt', '    See my work']]},
  {t: close('  ', 'Button')},
  {t: close('', 'article')},
];

/** One line of code, wiped in from the left. */
const CodeLine: React.FC<{line: Line; n: number; at: number; lineH: number}> = ({line, n, at, lineH}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, at + 8, ARRIVE);
  return (
    <div style={{display: 'flex', height: lineH, alignItems: 'center', opacity: p > 0 ? 1 : 0}}>
      <span style={{width: '2.4em', flex: 'none', color: theme.code.dim, opacity: 0.6}}>{n}</span>
      <span style={{whiteSpace: 'pre', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
        {line.t.map(([kind, text], i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static tokens of a static line
          <span key={i} style={{color: COLOR[kind]}}>
            {text}
          </span>
        ))}
      </span>
    </div>
  );
};

/** The part of the card a line of code describes: outlined as its line is written, dimmed when the next part starts. */
const PartOutline: React.FC<{L: JourneyLayout; part: CardPart; from: number; next: number | null; out: number}> = ({L, part, from, next, out}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= out + EXIT) return null;
  const dim = next === null ? 0 : progress(frame, next, next + 8, ARRIVE) * 0.7;
  const o = progress(frame, from, from + 8, ARRIVE) * (1 - dim) * (1 - progress(frame, out, out + EXIT, LEAVE));
  const r = rectAt(L.poses.code, L.card, partRect(L.card, part));
  const pad = part === 'card' ? 5 : 3;
  const radius = part === 'card' ? 22 * L.poses.code.s + pad : part === 'thumb' ? 14 * L.poses.code.s + pad : part === 'meta' ? 5 : 999;
  return (
    <div
      style={{
        position: 'absolute',
        left: r.x - pad,
        top: r.y - pad,
        width: r.w + pad * 2,
        height: r.h + pad * 2,
        borderRadius: radius,
        boxShadow: `0 0 0 ${part === 'card' ? 1.5 : 2}px ${theme.accent}`,
        opacity: o,
      }}
    />
  );
};

/** The parts that send a token across (spaced so no more than two dots are in flight), and the token's colour. */
const DOT: Partial<Record<CardPart, string>> = {thumb: theme.lime, title: theme.accent, button: theme.ink};

/** A design token leaving its part of the card and landing on the line of code that uses it (translate only). */
const TokenDot: React.FC<{from: Point; to: Point; at: number; color: string}> = ({from, to, at, color}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 20) return null;
  const p = progress(frame, at, at + 16, MOVE);
  const o = progress(frame, at, at + 3, ARRIVE) * (1 - progress(frame, at + 15, at + 20, LEAVE));
  return (
    <div
      style={{
        position: 'absolute',
        left: -6,
        top: -6,
        width: 12,
        height: 12,
        borderRadius: 6,
        background: color,
        boxShadow: `0 0 0 2px ${theme.surface}, 0 0 0 3px ${theme.accent}`,
        opacity: o,
        translate: `${from.x + (to.x - from.x) * p}px ${from.y + (to.y - from.y) * p}px`,
      }}
    />
  );
};

const Tick: React.FC<{label: string}> = ({label}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color: theme.code.str}}>
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
    {label}
  </span>
);

/** Figma to Web: the component's JSX, line by line; each line outlines its part and pulls that part's token across. */
export const CodeLayer: React.FC<{L: JourneyLayout; T: Timing}> = ({L, T}) => {
  const C = T.code;
  const lines = L.portrait ? PHONE_CODE : DESKTOP_CODE;
  const lineH = Math.round(L.codeFont * 1.7);
  const r = L.code;
  const chrome = L.portrait ? 28 : 36;
  const padTop = L.portrait ? 8 : 14;
  const cues = lines.flatMap((line, i) => (line.part ? [{part: line.part, i, at: C.lines + i * C.lineStagger}] : []));
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <ClipReveal
        at={C.panel}
        dur={14}
        exit={C.out}
        exitDur={EXIT}
        openFrom={fromSide(L.portrait ? 'top' : 'left', r.w, r.h)}
        radius={18}
        style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            background: theme.code.bg,
            boxShadow: theme.shadowDeep,
            overflow: 'hidden',
            fontFamily: fonts.mono,
            fontSize: L.codeFont,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12, height: chrome, padding: '0 14px', background: theme.code.chrome}}>
            <div style={{display: 'flex', gap: 6}}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{width: 9, height: 9, borderRadius: 5, background: theme.code.dots}} />
              ))}
            </div>
            <span style={{color: theme.code.dim, fontSize: 11}}>project-card.tsx</span>
          </div>
          <div style={{padding: L.portrait ? `${padTop}px 10px` : `${padTop}px 16px`}}>
            {lines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <CodeLine key={i} line={line} n={i + 1} at={C.lines + i * C.lineStagger} lineH={lineH} />
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: L.portrait ? 30 : 40,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: L.portrait ? '0 12px' : '0 18px',
              borderTop: `1px solid ${theme.code.chrome}`,
              fontSize: L.portrait ? 10.5 : 12,
            }}
          >
            <Appear at={C.ticks[0]} dur={10} from={{y: 6}}>
              <Tick label="0 type errors" />
            </Appear>
            <Appear at={C.ticks[1]} dur={10} from={{y: 6}}>
              <Tick label="matches Figma" />
            </Appear>
          </div>
        </div>
      </ClipReveal>
      {cues.map((cue, i) => (
        <PartOutline key={cue.part} L={L} part={cue.part} from={cue.at} next={cues[i + 1]?.at ?? null} out={C.out} />
      ))}
      {cues.map((cue) => {
        const color = DOT[cue.part];
        if (!color) return null;
        const pr = rectAt(L.poses.code, L.card, partRect(L.card, cue.part));
        const from = {x: pr.x + pr.w / 2, y: pr.y + pr.h / 2};
        const to = {x: r.x + (L.portrait ? 16 : 22), y: r.y + chrome + padTop + cue.i * lineH + lineH / 2};
        return <TokenDot key={cue.part} from={from} to={to} at={cue.at - 4} color={color} />;
      })}
    </div>
  );
};
