import type React from 'react';
import {useCurrentFrame} from 'remotion';
import {fonts, theme} from '@/components/hero-film/theme';
import {ARRIVE, LEAVE, progress} from '../shared/motion';
import {ClipReveal, fromSide} from './anim';
import {type CardPart, partRect, type RedlineLayout, rectAt} from './geometry';
import type {Timing} from './timing';
import {EXIT} from './timing';

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
const PartOutline: React.FC<{L: RedlineLayout; part: CardPart; from: number; next: number | null; out: number}> = ({L, part, from, next, out}) => {
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

/** Beat 2: the redlines become the component's JSX, line by line, each line outlining its part of the card. */
export const CodeLayer: React.FC<{L: RedlineLayout; T: Timing}> = ({L, T}) => {
  const lines = L.portrait ? PHONE_CODE : DESKTOP_CODE;
  const lineH = Math.round(L.codeFont * 1.7);
  const r = L.code;
  const cues = lines.flatMap((line, i) => (line.part ? [{part: line.part, at: T.codeLines + i * T.lineStagger}] : []));
  return (
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <ClipReveal
        at={T.codeIn}
        dur={14}
        exit={T.codeOut}
        exitDur={EXIT}
        openFrom={fromSide('left', r.w, r.h)}
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
          <div
            style={{display: 'flex', alignItems: 'center', gap: 12, height: L.portrait ? 28 : 36, padding: '0 14px', background: theme.code.chrome}}
          >
            <div style={{display: 'flex', gap: 6}}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{width: 9, height: 9, borderRadius: 5, background: theme.code.dots}} />
              ))}
            </div>
            <span style={{color: theme.code.dim, fontSize: 11}}>project-card.tsx</span>
          </div>
          <div style={{padding: L.portrait ? '8px 10px' : '14px 16px'}}>
            {lines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              <CodeLine key={i} line={line} n={i + 1} at={T.codeLines + i * T.lineStagger} lineH={lineH} />
            ))}
          </div>
        </div>
      </ClipReveal>
      {cues.map((cue, i) => (
        <PartOutline key={cue.part} L={L} part={cue.part} from={cue.at} next={cues[i + 1]?.at ?? null} out={T.codeOut} />
      ))}
    </div>
  );
};
