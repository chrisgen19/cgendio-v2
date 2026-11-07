/**
 * The departures board as data: what every flap shows and when it flips. Pure functions, computed once per cut at
 * module load, so the film only looks up a cell's state for the current frame.
 */

export type Tone = 'plain' | 'live' | 'cta';
export type Glyph = {ch: string; tone: Tone};

/** One flip run: glyphs[0] is what the flap showed before, the last glyph is where it lands. */
type Segment = {start: number; glyphs: Glyph[]};
export type Track = Segment[];

/** Frames per single flap (top half falls, bottom half lands). */
export const FLIP = 5;

/** The drum order of a real split-flap unit: a flap can only move forward through it. */
const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,&'-";
const BLANK: Glyph = {ch: ' ', tone: 'plain'};

/** Small deterministic hash, so the stagger jitter and glyph counts never change between renders. */
const hash = (a: number, b: number, c: number) => {
  const n = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return n - Math.floor(n);
};

/** Picks 2 or 3 glyphs between two drum positions, the way a flap passes through them on its way. */
const intermediates = (from: Glyph, to: Glyph, seed: number, spin: number): Glyph[] => {
  if (from.ch === to.ch) return [];
  const a = Math.max(0, DRUM.indexOf(from.ch));
  const b = Math.max(0, DRUM.indexOf(to.ch));
  const dist = (b - a + DRUM.length) % DRUM.length;
  const count = Math.min(dist - 1, spin === 2 ? 2 : seed > 0.5 ? 3 : 2);
  const out: Glyph[] = [];
  for (let k = 1; k <= count; k++) {
    out.push({ch: DRUM[(a + Math.round((dist * k) / (count + 1))) % DRUM.length], tone: to.tone});
  }
  return out;
};

type Key = {at: number; glyph: Glyph; spin: number};

/** Collects writes per cell, then compiles them into flip segments that never overlap. */
export class BoardWriter {
  private keys: Key[][][];

  constructor(
    private rows: number,
    private cols: number,
  ) {
    this.keys = Array.from({length: rows}, () => Array.from({length: cols}, () => []));
  }

  /**
   * Writes `text` from `col` onwards, padded with blanks to `width`. Character i starts flipping at
   * `at + i * stagger` plus up to 2 frames of jitter, so a row ripples left to right like a real board. `spin` caps the
   * glyphs passed on the way (2, or 2 to 3 by default).
   */
  write(row: number, col: number, text: string, at: number, {width = text.length, tone = 'plain' as Tone, stagger = 1, spin = 3} = {}) {
    const padded = text.toUpperCase().padEnd(width, ' ');
    for (let i = 0; i < width; i++) {
      const jitter = Math.floor(hash(row, col + i, at) * 3);
      this.keys[row][col + i].push({at: Math.round(at + i * stagger + jitter), glyph: {ch: padded[i], tone}, spin});
    }
  }

  compile(): Track[][] {
    return this.keys.map((row, r) =>
      row.map((keys, c) => {
        const track: Track = [];
        let current = BLANK;
        let free = 0;
        for (const [k, key] of [...keys].sort((x, y) => x.at - y.at).entries()) {
          if (key.glyph.ch === current.ch && key.glyph.tone === current.tone) continue;
          const glyphs = [current, ...intermediates(current, key.glyph, hash(r, c, k + 1), key.spin), key.glyph];
          const start = Math.max(key.at, free);
          track.push({start, glyphs});
          free = start + (glyphs.length - 1) * FLIP;
          current = key.glyph;
        }
        return track;
      }),
    );
  }

  get size() {
    return {rows: this.rows, cols: this.cols};
  }
}

export type CellState = {from: Glyph; to: Glyph; t: number};

/** What a flap shows at `frame`: idle (t = 0, from === to) or mid-flip from one glyph to the next. */
export const cellAt = (track: Track, frame: number): CellState => {
  let current = BLANK;
  for (const seg of track) {
    if (frame < seg.start) break;
    const steps = seg.glyphs.length - 1;
    const elapsed = frame - seg.start;
    if (elapsed >= steps * FLIP) {
      current = seg.glyphs[steps];
      continue;
    }
    const i = Math.floor(elapsed / FLIP);
    return {from: seg.glyphs[i], to: seg.glyphs[i + 1], t: (elapsed - i * FLIP) / FLIP};
  }
  return {from: current, to: current, t: 0};
};

/** A column group on the board, in cells. */
export type Column = {label: string; start: number; width: number};

export type CutScript = {
  durationInFrames: number;
  /** Columns of the build grid */
  cols: number;
  nameCols: number;
  claimCols: number;
  /** Header rows: my name, then the claim on the larger flaps, both settled in the first ~2s */
  name: Track[][];
  claim: Track[][];
  /** The builds rolling through the pipeline, then the call to the gate on the last row */
  board: Track[][];
  columns: Column[];
  /** Frames for the painted (non-flap) parts, and where the call to the gate sits. */
  cues: {domainIn: number; headsIn: number; ctaRow: number; ctaAt: number; ctaCols: number; ledeIn: number; footerIn: number};
};

const STATUSES = ['IDEA', 'DESIGN', 'BUILD', 'LIVE'] as const;
const CTA = 'See my work';

const desktopScript = (): CutScript => {
  const route = {start: 0, width: 18};
  const status = {start: 19, width: 8};
  const cols = status.start + status.width;
  const builds = ['WooCommerce store', 'Next.js web app', 'WordPress theme', 'Landing page'];

  const name = new BoardWriter(1, 18);
  name.write(0, 0, 'Christian Diomampo', 4);

  // The claim is the headline: two rows of larger flaps, readable by ~2s
  const claimCols = 22;
  const claim = new BoardWriter(2, claimCols);
  claim.write(0, 0, 'I design, build & ship', 12, {width: claimCols});
  claim.write(1, 0, 'websites that work.', 18, {width: claimCols});

  const ctaRow = builds.length;
  const board = new BoardWriter(builds.length + 1, cols);
  builds.forEach((what, r) => {
    const at = 62 + r * 7;
    board.write(r, route.start, what, at, {width: route.width});
    board.write(r, status.start, STATUSES[0], at + 19, {width: status.width});
  });
  // Every build moves through the pipeline, one row after another
  STATUSES.slice(1).forEach((s, step) => {
    for (let r = 0; r < builds.length; r++) {
      board.write(r, status.start, s, 120 + step * 30 + r * 5, {width: status.width, tone: s === 'LIVE' ? 'live' : 'plain', spin: 2});
    }
  });
  // The call to the gate: only the label and one blank flap either side turn yellow
  const ctaAt = 224;
  const ctaCols = CTA.length + 2;
  board.write(ctaRow, 0, ` ${CTA} `, ctaAt, {width: ctaCols, tone: 'cta'});
  board.write(ctaRow, status.start, 'Boarding', ctaAt + 12, {width: status.width});

  return {
    durationInFrames: 330,
    cols,
    nameCols: 18,
    claimCols,
    name: name.compile(),
    claim: claim.compile(),
    board: board.compile(),
    columns: [
      {label: 'What I build', ...route},
      {label: 'Status', ...status},
    ],
    cues: {domainIn: 30, headsIn: 54, ctaRow, ctaAt, ctaCols, ledeIn: 78, footerIn: ctaAt + 30},
  };
};

const mobileScript = (): CutScript => {
  const route = {start: 0, width: 9};
  const status = {start: 10, width: 6};
  const cols = status.start + status.width;
  const builds = ['Woo store', 'Next app', 'WP theme', 'One-pager'];

  const name = new BoardWriter(2, 9);
  name.write(0, 0, 'Christian', 4, {width: 9});
  name.write(1, 0, 'Diomampo', 10, {width: 9});

  const claimCols = 15;
  const claim = new BoardWriter(3, claimCols);
  claim.write(0, 0, 'I design, build', 10, {width: claimCols});
  claim.write(1, 0, '& ship websites', 15, {width: claimCols});
  claim.write(2, 0, 'that work.', 20, {width: claimCols});

  const ctaRow = builds.length;
  const board = new BoardWriter(builds.length + 1, cols);
  builds.forEach((what, r) => {
    const at = 58 + r * 6;
    board.write(r, route.start, what, at, {width: route.width});
    board.write(r, status.start, STATUSES[0], at + 10, {width: status.width});
  });
  STATUSES.slice(1).forEach((s, step) => {
    for (let r = 0; r < builds.length; r++) {
      board.write(r, status.start, s, 100 + step * 26 + r * 4, {width: status.width, tone: s === 'LIVE' ? 'live' : 'plain', spin: 2});
    }
  });
  const ctaAt = 192;
  const ctaCols = CTA.length + 2;
  board.write(ctaRow, 0, ` ${CTA} `, ctaAt, {width: ctaCols, tone: 'cta'});

  return {
    durationInFrames: 300,
    cols,
    nameCols: 9,
    claimCols,
    name: name.compile(),
    claim: claim.compile(),
    board: board.compile(),
    columns: [
      {label: 'What I build', ...route},
      {label: 'Status', ...status},
    ],
    cues: {domainIn: 28, headsIn: 50, ctaRow, ctaAt, ctaCols, ledeIn: 76, footerIn: ctaAt + 28},
  };
};

export const DESKTOP_SCRIPT = desktopScript();
export const MOBILE_SCRIPT = mobileScript();
