import type {FilmChapter} from '../shared/film-player';

/**
 * Frame cues for both cuts (30 fps), built from one set of offsets so the phone cut is the same film, a little faster.
 * One transition grammar: between beats only the project card moves (a GLIDE-frame match cut). Each beat's context
 * leaves (EXIT frames) before the glide and arrives after the card settles at the beat's `start`.
 */
export const GLIDE = 24;
export const EXIT = 10;

export type Timing = {
  claimIn: number;
  mark: number;
  cardIn: number;
  research: {start: number; search: number; typeFrom: number; typeTo: number; personas: number[]; tags: number; tagStagger: number; out: number};
  design: {
    glide: number;
    start: number;
    wire: number;
    select: number;
    measures: number;
    styled: number;
    chips: number;
    chipStagger: number;
    cursor: number;
    lime: number;
    out: number;
  };
  code: {glide: number; start: number; panel: number; lines: number; lineStagger: number; ticks: [number, number]; out: number};
  qa: {
    glide: number;
    start: number;
    window: number;
    tablet: number;
    phone: number;
    devices: number;
    checks: number;
    tickStagger: number;
    out: number;
  };
  deploy: {
    glide: number;
    start: number;
    panel: number;
    lines: number;
    lineStagger: number;
    barFrom: number;
    barTo: number;
    preview: number;
    production: number;
    note: number;
    out: number;
  };
  live: {glide: number; start: number; window: number; typeFrom: number; typeTo: number; dot: number; toasts: number[]; out: number};
  final: {glide: number; start: number};
  chapters: FilmChapter[];
  /** First frame of the final rest (the glide into it): Skip lands here. */
  restFrame: number;
  end: number;
};

/** `k` scales every offset inside a beat (1 on desktop); glides and exits keep their length so the motion feels the same. */
const build = (k: number): Timing => {
  const f = (n: number) => Math.round(n * k);
  const next = (out: number) => out + EXIT + 2;

  const rs = f(48);
  const research = {
    start: rs,
    search: rs + 2,
    typeFrom: rs + f(12),
    typeTo: rs + f(44),
    personas: [rs + f(48), rs + f(60), rs + f(72)],
    tags: rs + f(84),
    tagStagger: Math.max(3, f(4)),
    out: rs + f(122),
  };

  const dg = next(research.out);
  const ds = dg + GLIDE;
  const design = {
    glide: dg,
    start: ds,
    wire: ds + 2,
    select: ds + f(8),
    measures: ds + f(16),
    styled: ds + f(30),
    chips: ds + f(42),
    chipStagger: f(5),
    cursor: ds + f(36),
    lime: ds + f(66),
    out: ds + f(100),
  };

  const cg = next(design.out);
  const cs = cg + GLIDE;
  const code = {
    glide: cg,
    start: cs,
    panel: cs + 2,
    lines: cs + f(10),
    lineStagger: f(5),
    ticks: [cs + f(80), cs + f(86)] as [number, number],
    out: cs + f(106),
  };

  const qg = next(code.out);
  const qs = qg + GLIDE;
  const qa = {
    glide: qg,
    start: qs,
    window: qs + 2,
    tablet: qs + f(18),
    phone: qs + f(23),
    devices: qs + f(34),
    checks: qs + f(42),
    tickStagger: f(8),
    out: qs + f(104),
  };

  const pg = next(qa.out);
  const ps = pg + GLIDE;
  const deploy = {
    glide: pg,
    start: ps,
    panel: ps + 2,
    lines: ps + f(10),
    lineStagger: f(7),
    barFrom: ps + f(14),
    barTo: ps + f(74),
    preview: ps + f(56),
    production: ps + f(78),
    note: ps + f(86),
    out: ps + f(112),
  };

  const lg = next(deploy.out);
  const ls = lg + GLIDE;
  const live = {
    glide: lg,
    start: ls,
    window: ls + 2,
    typeFrom: ls + f(12),
    typeTo: ls + f(26),
    dot: ls + f(28),
    toasts: [ls + f(32), ls + f(46), ls + f(60)],
    out: ls + f(96),
  };

  const fg = next(live.out);
  const final = {glide: fg, start: fg + GLIDE + 2};

  return {
    claimIn: 0,
    mark: f(20),
    cardIn: f(8),
    research,
    design,
    code,
    qa,
    deploy,
    live,
    final,
    chapters: [
      {label: 'Research', startFrame: rs},
      {label: 'Design', startFrame: dg},
      {label: 'Figma to Web', startFrame: cg},
      {label: 'QA', startFrame: qg},
      {label: 'Deploy', startFrame: pg},
      {label: 'Live', startFrame: lg},
    ],
    restFrame: fg,
    end: final.start + 44,
  };
};

export const DESKTOP_TIMING = build(1);
export const PHONE_TIMING = build(0.82);
