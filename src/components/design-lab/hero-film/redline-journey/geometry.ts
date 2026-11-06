/**
 * Where everything sits, in composition pixels (the Player sizes the composition to the hero, so these are real
 * on-screen sizes). The card is authored once at a base size; every beat is a pose (centre + scale) of that card,
 * and each beat's context is laid out around the pose it frames.
 */
export type Rect = {x: number; y: number; w: number; h: number};
export type Point = {x: number; y: number};
export type Pose = {cx: number; cy: number; s: number};

export type CardGeo = {
  w: number;
  h: number;
  pad: number;
  tagSize: number;
  thumb: Rect;
  meta: Rect;
  title: Rect;
  tags: Rect;
  button: Rect;
};

export type CardPart = 'card' | 'thumb' | 'meta' | 'title' | 'tags' | 'button';

export type Measure = {from: Point; to: Point; label: string; marked?: boolean};
/** A colour chip names its token only; the swatch is resolved from the theme, so it follows dark mode. */
export type ChipToken = 'lime' | 'accent' | 'ink';
export type Chip = {label: string; swatch?: ChipToken; at: Point; side: 'left' | 'right'; anchor: Point};
/** A persona note: pinned beside the card on desktop, dealt onto a deck under it on phones. */
export type Note = {rect: Rect; rot: number; side: 'left' | 'right' | 'deck'; anchor: Point};

export type PoseName = 'brief' | 'design' | 'code' | 'test' | 'deploy' | 'live' | 'final';

export type JourneyLayout = {
  portrait: boolean;
  width: number;
  height: number;
  column: Rect;
  claimSize: number;
  ledeSize: number;
  slotHeight: number;
  stage: Rect;
  card: CardGeo;
  poses: Record<PoseName, Pose>;
  research: {search: Rect; notes: Note[]; tagsY: number};
  measures: Measure[];
  chips: Chip[];
  /** The "Christian" cursor: where it enters, and the measurement label it clicks. */
  cursor: {from: Point; via: Point; to: Point};
  code: Rect;
  codeFont: number;
  qa: {
    window: Rect;
    chrome: number;
    tablet: Rect | null;
    phone: Rect | null;
    devices: {label: string; x: number; w: number}[];
    devicesY: number;
    checks: Rect;
  };
  deploy: {terminal: Rect; font: number; status: Rect; note: Rect};
  live: {window: Rect; chrome: number; toasts: Rect};
  final: {services: Rect | null};
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const cardGeometry = (w: number, thumbH: number, pad: number, tagSize: number): CardGeo => {
  const thumb = {x: 12, y: 12, w: w - 24, h: thumbH};
  const meta = {x: pad, y: thumb.y + thumbH + 20, w: w - pad * 2, h: 14};
  const title = {x: pad, y: meta.y + 22, w: w - pad * 2, h: 28};
  const tags = {x: pad, y: title.y + 46, w: w - pad * 2, h: 26};
  const button = {x: pad, y: tags.y + 46, w: w - pad * 2, h: 52};
  return {w, h: button.y + button.h + pad, pad, tagSize, thumb, meta, title, tags, button};
};

/** A point in card coordinates, on screen at a pose. */
export const toScreen = (pose: Pose, card: CardGeo, x: number, y: number): Point => ({
  x: pose.cx + (x - card.w / 2) * pose.s,
  y: pose.cy + (y - card.h / 2) * pose.s,
});

/** A rect in card coordinates (the whole card by default), on screen at a pose. */
export const rectAt = (pose: Pose, card: CardGeo, r: Rect = {x: 0, y: 0, w: card.w, h: card.h}): Rect => {
  const p = toScreen(pose, card, r.x, r.y);
  return {x: p.x, y: p.y, w: r.w * pose.s, h: r.h * pose.s};
};

export const partRect = (card: CardGeo, part: CardPart): Rect => (part === 'card' ? {x: 0, y: 0, w: card.w, h: card.h} : card[part]);

/** The centre of the lime highlighter bar inside the thumbnail (see Thumb in project-card.tsx). */
const thumbLime = (card: CardGeo): Point => {
  const u = card.thumb.h / 196;
  return {x: card.thumb.x + 60 * u + card.thumb.w * 0.095, y: card.thumb.y + 95.5 * u};
};

/** The padding redline runs through the gap between the title and the tags, so its ticks never touch a glyph. */
const padY = (card: CardGeo) => (card.title.y + card.title.h + card.tags.y) / 2;

/** Just past the end of 'Selected work' (Bricolage 700 at 28px is about 186px wide). */
const titleEnd = (card: CardGeo) => card.pad + 204;

/** Where the cursor clicks: the middle of the marked measurement's label (it sits left of the line, 8px clear). */
const markedLabel = (m: Measure): Point => ({x: m.from.x - 20, y: (m.from.y + m.to.y) / 2});

const desktopLayout = (width: number, height: number): JourneyLayout => {
  const padX = width < 1200 ? 40 : 56;
  const padTop = 104;
  const padBottom = 92;
  const innerW = Math.min(width - padX * 2, 1320);
  const x0 = (width - innerW) / 2;
  const colW = clamp(innerW * 0.4, 360, 540);
  const gap = clamp(innerW * 0.04, 32, 56);
  const stage = {x: x0 + colW + gap, y: padTop, w: innerW - colW - gap, h: height - padTop - padBottom};
  const card = cardGeometry(380, 196, 24, 11);
  const sx = stage.x + stage.w / 2;
  const sy = stage.y + stage.h / 2;
  const right = stage.x + stage.w;

  // Research: the query above the brief frame, persona notes pinned either side, the research tags below
  const briefS = Math.min(0.62, (stage.h - 230) / card.h, (stage.w - 470) / card.w);
  const searchW = Math.min(460, stage.w - 120);
  const groupH = 52 + 32 + card.h * briefS + 24 + 30;
  const searchY = sy - groupH / 2;
  const brief: Pose = {cx: sx, cy: searchY + 52 + 32 + (card.h * briefS) / 2, s: briefS};
  const bRect = rectAt(brief, card);
  const noteW = Math.min(214, (stage.w - bRect.w) / 2 - 38);
  const leftX = bRect.x - 18 - noteW;
  const rightX = bRect.x + bRect.w + 18;
  const pin = (y: number, side: 'left' | 'right'): Point => ({x: side === 'left' ? bRect.x : bRect.x + bRect.w, y});
  const notes: Note[] = [
    {rect: {x: leftX, y: bRect.y - 8, w: noteW, h: 112}, rot: -2, side: 'left', anchor: pin(bRect.y + 48, 'left')},
    {rect: {x: rightX, y: bRect.y + 44, w: noteW, h: 112}, rot: 2, side: 'right', anchor: pin(bRect.y + 100, 'right')},
    {rect: {x: leftX, y: bRect.y + 138, w: noteW, h: 112}, rot: -1, side: 'left', anchor: pin(bRect.y + 194, 'left')},
  ];

  // Design: the card centred, redlines on it, token chips on both sides
  const design: Pose = {cx: sx, cy: sy + 4, s: Math.min(1, (stage.h - 170) / card.h, (stage.w - 420) / card.w)};
  const d = (x: number, y: number) => toScreen(design, card, x, y);
  const dRect = rectAt(design, card);
  const chipLeft = dRect.x - 40;
  const chipRight = dRect.x + dRect.w + 52;
  const measures: Measure[] = [
    {from: d(0, padY(card)), to: d(card.pad, padY(card)), label: String(card.pad), marked: true},
    {from: d(card.w - 70, card.thumb.y + card.thumb.h), to: d(card.w - 70, card.meta.y), label: '20'},
    {from: d(card.w + 16, card.button.y), to: d(card.w + 16, card.button.y + card.button.h), label: String(card.button.h)},
  ];
  const chips: Chip[] = [
    {label: 'lime', swatch: 'lime', side: 'left', at: {x: chipLeft, y: d(0, 70).y}, anchor: d(thumbLime(card).x, thumbLime(card).y)},
    {label: 'accent', swatch: 'accent', side: 'left', at: {x: chipLeft, y: d(0, 170).y}, anchor: d(card.pad - 5, card.meta.y + 7)},
    {label: 'ink', swatch: 'ink', side: 'left', at: {x: chipLeft, y: d(0, card.button.y + 26).y}, anchor: d(card.pad + 60, card.button.y + 26)},
    {label: 'radius 22px', side: 'right', at: {x: chipRight, y: d(0, 30).y}, anchor: d(card.w - 7, 7)},
    {label: 'Bricolage 700 / 28', side: 'right', at: {x: chipRight, y: d(0, card.title.y + 14).y}, anchor: d(titleEnd(card), card.title.y + 14)},
    {label: 'Geist Mono 11', side: 'right', at: {x: chipRight, y: d(0, card.tags.y + 13).y}, anchor: d(card.w - 38, card.tags.y + 13)},
  ];
  const target = markedLabel(measures[0]);
  const cursor = {from: {x: right - 70, y: stage.y + stage.h - 70}, via: {x: dRect.x + dRect.w * 0.35, y: dRect.y + dRect.h + 26}, to: target};

  // Figma to Web: the card on the left of the stage, the code panel beside it, a gap for the tokens to travel
  const codeS = Math.min(0.6, (stage.h - 120) / card.h);
  const code: Pose = {cx: stage.x + 28 + (card.w * codeS) / 2, cy: sy, s: codeS};
  const codeX = stage.x + 28 + card.w * codeS + 64;
  const codeW = right - 28 - codeX;
  const codeFont = clamp((codeW - 72) / (46 * 0.6), 10, 12.5);
  const codeH = 13 * Math.round(codeFont * 1.7) + 36 + 28 + 40;
  const codeRect = {x: codeX, y: sy - codeH / 2, w: codeW, h: codeH};

  // QA: a browser window, a tablet and a phone side by side, the checks below
  const rowW = stage.w - 56;
  const vGap = 16;
  const dW = rowW * 0.54;
  const tW = rowW * 0.27;
  const pW = rowW - dW - tW - vGap * 2;
  const dH = dW * 0.66;
  const tH = tW * 1.3;
  const pH = pW * 1.95;
  const blockH = Math.max(dH, tH, pH) + 44 + 92;
  const rowBottom = Math.min(sy + dH / 2, stage.y + stage.h - (blockH - Math.max(dH, tH, pH)) - 16);
  const chrome = 24;
  const win = {x: stage.x + 28, y: rowBottom - dH, w: dW, h: dH};
  const testS = (dH - chrome - 28) / card.h;
  const test: Pose = {cx: win.x + win.w - 14 - (card.w * testS) / 2, cy: win.y + chrome + (dH - chrome) / 2, s: testS};
  const tablet = {x: win.x + dW + vGap, y: rowBottom - tH, w: tW, h: tH};
  const phone = {x: tablet.x + tW + vGap, y: rowBottom - pH, w: pW, h: pH};

  // Deploy: the card on the right with its preview/production status above, the terminal on the left
  const depS = Math.min(0.6, (stage.h - 200) / card.h);
  const depW = card.w * depS;
  const deploy: Pose = {cx: right - 44 - depW / 2, cy: sy + 14, s: depS};
  const depRect = rectAt(deploy, card);
  const termFont = 13;
  const termH = 40 + 22 + 8 * Math.round(termFont * 1.9) + 18 + 46;
  const terminal = {x: stage.x + 28, y: sy - termH / 2, w: depRect.x - 44 - (stage.x + 28), h: termH};

  // Live: a browser at the live URL; the card on the left of the page, notifications stacking on the right
  const liveS = Math.min(0.8, (stage.h - 210) / card.h);
  const liveChrome = 40;
  const liveH = card.h * liveS + liveChrome + 56;
  const liveWin = {x: stage.x + 28, y: sy - liveH / 2, w: stage.w - 56, h: liveH};
  const live: Pose = {cx: liveWin.x + 32 + (card.w * liveS) / 2, cy: liveWin.y + liveChrome + (liveH - liveChrome) / 2, s: liveS};
  const toastX = liveWin.x + 32 + card.w * liveS + 28;

  const finalS = Math.min(1.12, (stage.h - 120) / card.h, (stage.w - 140) / card.w);

  return {
    portrait: false,
    width,
    height,
    column: {x: x0, y: stage.y, w: colW, h: stage.h},
    claimSize: Math.round(clamp(colW * 0.124, 44, 68)),
    ledeSize: 18,
    slotHeight: 172,
    stage,
    card,
    poses: {brief, design, code, test, deploy, live, final: {cx: sx, cy: sy - 10, s: finalS}},
    research: {search: {x: sx - searchW / 2, y: searchY, w: searchW, h: 52}, notes, tagsY: bRect.y + bRect.h + 24},
    measures,
    chips,
    cursor,
    code: codeRect,
    codeFont,
    qa: {
      window: win,
      chrome,
      tablet,
      phone,
      devices: [
        {label: 'Desktop', x: win.x, w: dW},
        {label: 'Tablet', x: tablet.x, w: tW},
        {label: 'Phone', x: phone.x, w: pW},
      ],
      devicesY: rowBottom + 12,
      checks: {x: stage.x + 28, y: rowBottom + 48, w: rowW, h: 88},
    },
    deploy: {
      terminal,
      font: termFont,
      status: {x: depRect.x - 20, y: depRect.y - 54, w: depRect.w + 40, h: 36},
      note: {x: depRect.x - 10, y: depRect.y + depRect.h + 18, w: depRect.w + 20, h: 60},
    },
    live: {window: liveWin, chrome: liveChrome, toasts: {x: toastX, y: liveWin.y + liveChrome + 28, w: liveWin.x + liveWin.w - 28 - toastX, h: 0}},
    final: {services: null},
  };
};

const phoneLayout = (width: number, height: number): JourneyLayout => {
  const padX = 20;
  const top = 84;
  const colW = width - padX * 2;
  const claimSize = Math.round(Math.min(36, colW * 0.103));
  const slotHeight = 96;
  // The claim is balanced across lines; Bricolage 700 averages about 0.45em per character
  const claimLines = Math.ceil(42 / (colW / (claimSize * 0.45)));
  const textBottom = top + 16 + 12 + Math.ceil(claimSize * 0.98 * claimLines) + 16 + slotHeight;
  // The phone HUD (chapter label, Skip and the segment row) takes about 92px at the bottom
  const stage = {x: 16, y: textBottom + 12, w: width - 32, h: height - 100 - (textBottom + 12)};
  const card = cardGeometry(330, 150, 20, 10.5);
  const sx = stage.x + stage.w / 2;
  const sy = stage.y + stage.h / 2;
  const right = stage.x + stage.w;

  // Research: query, brief frame, then a deck the personas are dealt onto, the tags last
  const briefS = Math.min(0.48, (stage.h - 210) / card.h);
  const noteH = 84;
  const rGroup = 40 + 12 + card.h * briefS + 22 + noteH + 12 + 26;
  const rTop = stage.y + Math.max(8, (stage.h - rGroup) / 2);
  const brief: Pose = {cx: sx, cy: rTop + 52 + (card.h * briefS) / 2, s: briefS};
  const deckY = rTop + 52 + card.h * briefS + 22;
  const deck = {x: stage.x + 20, y: deckY, w: stage.w - 40, h: noteH};
  const notes: Note[] = [0, 1, 2].map(() => ({rect: deck, rot: 0, side: 'deck', anchor: {x: sx, y: deckY}}));

  // Design: the card centred, chips above and below it
  const design: Pose = {cx: sx, cy: sy, s: Math.min(0.7, (stage.h - 170) / card.h)};
  const d = (x: number, y: number) => toScreen(design, card, x, y);
  const dRect = rectAt(design, card);
  const above = dRect.y - 44;
  const below = dRect.y + dRect.h + 44;
  const measures: Measure[] = [
    {from: d(0, padY(card)), to: d(card.pad, padY(card)), label: String(card.pad), marked: true},
    {from: d(card.w + 14, card.button.y), to: d(card.w + 14, card.button.y + card.button.h), label: String(card.button.h)},
  ];
  const chips: Chip[] = [
    {label: 'lime', swatch: 'lime', side: 'left', at: {x: sx - 6, y: above}, anchor: d(thumbLime(card).x, thumbLime(card).y)},
    {label: 'radius 22px', side: 'right', at: {x: sx + 6, y: above}, anchor: d(card.w - 7, 7)},
    {label: 'ink', swatch: 'ink', side: 'left', at: {x: sx - 6, y: below}, anchor: d(card.pad + 60, card.button.y + card.button.h - 4)},
    // The button label is Geist 600; the leader stays on the button's lower edge, clear of the text
    {label: 'Geist 600 / 16', side: 'right', at: {x: sx + 6, y: below}, anchor: d(card.w - 80, card.button.y + card.button.h - 4)},
  ];
  const cursor = {
    from: {x: right - 30, y: stage.y + stage.h - 30},
    via: {x: dRect.x + dRect.w * 0.3, y: dRect.y + dRect.h + 16},
    to: markedLabel(measures[0]),
  };

  // Figma to Web: the card small, the code below it, the pair centred on the stage
  const codeS = 0.42;
  const codeH = Math.min(9 * 17 + 28 + 16 + 30, stage.h - card.h * codeS - 50);
  const groupTop = stage.y + (stage.h - (card.h * codeS + 28 + codeH)) / 2;
  const code: Pose = {cx: sx, cy: groupTop + (card.h * codeS) / 2, s: codeS};
  const codeRect = {x: stage.x + 12, y: groupTop + card.h * codeS + 28, w: stage.w - 24, h: codeH};

  // QA: the card inside a phone browser frame, the three widths, then the checks
  const chrome = 28;
  const testS = 0.5;
  const frameW = card.w * testS + 20;
  const frameH = chrome + card.h * testS + 10;
  const qGroup = frameH + 12 + 22 + 12 + 5 * 24;
  const qTop = stage.y + Math.max(10, (stage.h - qGroup) / 2);
  const win = {x: sx - frameW / 2, y: qTop, w: frameW, h: frameH};
  const test: Pose = {cx: sx, cy: win.y + chrome + (card.h * testS) / 2, s: testS};
  const devicesY = win.y + frameH + 12;
  const third = (stage.w - 28) / 3;

  // Deploy: the card top left with its status beside it, the terminal below
  const depS = 0.4;
  const termFont = 10.5;
  const termH = 28 + 14 + 8 * Math.round(termFont * 1.7) + 10 + 34;
  const pGroup = card.h * depS + 16 + termH;
  const pTop = stage.y + Math.max(8, (stage.h - pGroup) / 2);
  const deploy: Pose = {cx: stage.x + 14 + (card.w * depS) / 2, cy: pTop + (card.h * depS) / 2, s: depS};
  const statusX = stage.x + 14 + card.w * depS + 16;

  // Live: the card in a phone frame at the live URL, notifications dealt onto a deck under it
  const liveS = 0.54;
  const liveChrome = 30;
  const liveW = card.w * liveS + 20;
  const liveH = liveChrome + card.h * liveS + 10;
  const lGroup = liveH + 30 + 58;
  const lTop = stage.y + Math.max(6, (stage.h - lGroup) / 2 + 8);
  const liveWin = {x: sx - liveW / 2, y: lTop, w: liveW, h: liveH};
  const live: Pose = {cx: sx, cy: lTop + liveChrome + (card.h * liveS) / 2, s: liveS};

  // Rest: the card at full tap size, the services and Replay underneath
  // 0.85 keeps the button at a 44px target; the services and Replay take two rows under the card
  const finalS = Math.max(0.85, Math.min(0.94, (stage.h - 112) / card.h));
  const finalTop = stage.y + Math.max(8, (stage.h - card.h * finalS - 100) / 2);

  return {
    portrait: true,
    width,
    height,
    column: {x: padX, y: top, w: colW, h: textBottom - top},
    claimSize,
    ledeSize: 15,
    slotHeight,
    stage,
    card,
    poses: {
      brief,
      design,
      code,
      test,
      deploy,
      live,
      final: {cx: sx, cy: finalTop + (card.h * finalS) / 2, s: finalS},
    },
    research: {search: {x: stage.x + 12, y: rTop, w: stage.w - 24, h: 40}, notes, tagsY: deckY + noteH + 12},
    measures,
    chips,
    cursor,
    code: codeRect,
    codeFont: 10,
    qa: {
      window: win,
      chrome,
      tablet: null,
      phone: null,
      devices: [
        {label: 'Desktop', x: stage.x + 14, w: third},
        {label: 'Tablet', x: stage.x + 14 + third, w: third},
        {label: 'Phone', x: stage.x + 14 + third * 2, w: third},
      ],
      devicesY,
      checks: {x: stage.x + 40, y: devicesY + 34, w: stage.w - 80, h: 5 * 24},
    },
    deploy: {
      terminal: {x: stage.x + 12, y: pTop + card.h * depS + 16, w: stage.w - 24, h: termH},
      font: termFont,
      status: {x: statusX, y: pTop + 4, w: right - 14 - statusX, h: card.h * depS - 8},
      note: {x: statusX, y: pTop + 94, w: right - 14 - statusX, h: card.h * depS - 94},
    },
    live: {window: liveWin, chrome: liveChrome, toasts: {x: stage.x + 22, y: lTop + liveH + 26, w: stage.w - 44, h: 58}},
    final: {services: {x: stage.x + 10, y: finalTop + card.h * finalS + 14, w: stage.w - 20, h: 0}},
  };
};

export const computeLayout = (width: number, height: number, portrait: boolean): JourneyLayout =>
  portrait ? phoneLayout(width, height) : desktopLayout(width, height);
