/**
 * Where everything sits, in composition pixels (the Player sizes the composition to the hero, so these are real
 * on-screen sizes). The card is authored once at a base size; every beat is a pose (centre + scale) of that card,
 * and the context of each beat is laid out around the pose it frames.
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

export type RedlineLayout = {
  portrait: boolean;
  width: number;
  height: number;
  column: Rect;
  claimSize: number;
  ledeSize: number;
  slotHeight: number;
  stage: Rect;
  card: CardGeo;
  poses: {design: Pose; code: Pose; test: Pose; final: Pose};
  measures: Measure[];
  chips: Chip[];
  code: Rect;
  codeFont: number;
  /** The browser window around the card in the test beat (a phone frame in the phone cut). */
  window: Rect;
  chrome: number;
  tablet: Rect | null;
  phone: Rect | null;
  devices: {label: string; x: number; w: number}[];
  devicesY: number;
  checks: Rect;
  deploy: Rect;
  replay: Point | null;
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

const desktopLayout = (width: number, height: number): RedlineLayout => {
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

  // Beat 1: the card centred, redlines on it, token chips on both sides
  const design: Pose = {cx: sx, cy: sy + 4, s: Math.min(1, (stage.h - 170) / card.h, (stage.w - 420) / card.w)};
  const d = (x: number, y: number) => toScreen(design, card, x, y);
  const dRect = rectAt(design, card);
  const leftX = dRect.x - 40;
  const rightX = dRect.x + dRect.w + 52;
  const measures: Measure[] = [
    {from: d(0, padY(card)), to: d(card.pad, padY(card)), label: String(card.pad), marked: true},
    {from: d(card.w - 70, card.thumb.y + card.thumb.h), to: d(card.w - 70, card.meta.y), label: '20'},
    {from: d(card.w + 16, card.button.y), to: d(card.w + 16, card.button.y + card.button.h), label: String(card.button.h)},
  ];
  const chips: Chip[] = [
    {label: 'lime', swatch: 'lime', side: 'left', at: {x: leftX, y: d(0, 70).y}, anchor: d(thumbLime(card).x, thumbLime(card).y)},
    {label: 'accent', swatch: 'accent', side: 'left', at: {x: leftX, y: d(0, 170).y}, anchor: d(card.pad - 5, card.meta.y + 7)},
    {label: 'ink', swatch: 'ink', side: 'left', at: {x: leftX, y: d(0, card.button.y + 26).y}, anchor: d(card.pad + 60, card.button.y + 26)},
    {label: 'radius 22px', side: 'right', at: {x: rightX, y: d(0, 30).y}, anchor: d(card.w - 7, 7)},
    {label: 'Bricolage 700 / 28', side: 'right', at: {x: rightX, y: d(0, card.title.y + 14).y}, anchor: d(titleEnd(card), card.title.y + 14)},
    {label: 'Geist Mono 11', side: 'right', at: {x: rightX, y: d(0, card.tags.y + 13).y}, anchor: d(card.w - 38, card.tags.y + 13)},
  ];

  // Beat 2: the card on the left of the stage, the code panel beside it
  const codeS = Math.min(0.7, (stage.h - 120) / card.h);
  const code: Pose = {cx: stage.x + 28 + (card.w * codeS) / 2, cy: sy, s: codeS};
  const codeX = stage.x + 28 + card.w * codeS + 24;
  const codeW = stage.x + stage.w - 28 - codeX;
  const codeFont = clamp((codeW - 72) / (46 * 0.6), 10, 12.5);
  const codeH = 13 * codeFont * 1.7 + 36 + 28;
  const codeRect = {x: codeX, y: sy - codeH / 2, w: codeW, h: codeH};

  // Beat 3: a browser window, a tablet and a phone side by side, QA checks below
  const rowW = stage.w - 56;
  const vGap = 16;
  const dW = rowW * 0.54;
  const tW = rowW * 0.27;
  const pW = rowW - dW - tW - vGap * 2;
  const dH = dW * 0.66;
  const tH = tW * 1.3;
  const pH = pW * 1.95;
  const blockH = Math.max(dH, tH, pH) + 44 + 92;
  // The window sits on the stage's centre line, so the ship beat (window and deploy panel only) stays balanced
  const rowBottom = Math.min(sy + dH / 2, stage.y + stage.h - (blockH - Math.max(dH, tH, pH)) - 16);
  const chrome = 24;
  const win = {x: stage.x + 28, y: rowBottom - dH, w: dW, h: dH};
  const testS = (dH - chrome - 28) / card.h;
  const test: Pose = {cx: win.x + win.w - 14 - (card.w * testS) / 2, cy: win.y + chrome + (dH - chrome) / 2, s: testS};
  const tablet = {x: win.x + dW + vGap, y: rowBottom - tH, w: tW, h: tH};
  const phone = {x: tablet.x + tW + vGap, y: rowBottom - pH, w: pW, h: pH};

  const finalS = Math.min(1.12, (stage.h - 120) / card.h, (stage.w - 140) / card.w);

  return {
    portrait: false,
    width,
    height,
    column: {x: x0, y: stage.y, w: colW, h: stage.h},
    claimSize: Math.round(clamp(colW * 0.124, 44, 68)),
    ledeSize: 18,
    slotHeight: 116,
    stage,
    card,
    poses: {design, code, test, final: {cx: sx, cy: sy - 10, s: finalS}},
    measures,
    chips,
    code: codeRect,
    codeFont,
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
    deploy: {x: tablet.x, y: win.y, w: tW + vGap + pW, h: dH},
    replay: {x: stage.x + 20, y: stage.y + stage.h - 20 - 44},
  };
};

const phoneLayout = (width: number, height: number): RedlineLayout => {
  const padX = 20;
  const top = 84;
  const colW = width - padX * 2;
  const claimSize = Math.round(Math.min(36, colW * 0.103));
  const slotHeight = 96;
  // The claim is balanced across lines; Bricolage 700 averages about 0.45em per character
  const claimLines = Math.ceil(42 / (colW / (claimSize * 0.45)));
  const textBottom = top + 16 + 12 + Math.ceil(claimSize * 0.98 * claimLines) + 16 + slotHeight;
  const stage = {x: 16, y: textBottom + 12, w: width - 32, h: height - 76 - (textBottom + 12)};
  const card = cardGeometry(330, 150, 20, 10.5);
  const sx = stage.x + stage.w / 2;
  const sy = stage.y + stage.h / 2;

  // Beat 1: the card centred, chips above and below it
  const design: Pose = {cx: sx, cy: sy, s: Math.min(0.7, (stage.h - 170) / card.h)};
  const d = (x: number, y: number) => toScreen(design, card, x, y);
  const dRect = rectAt(design, card);
  const above = dRect.y - 50;
  const below = dRect.y + dRect.h + 50;
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

  // Beat 2: the card small, the code below it, the pair centred on the stage (9 lines at 10px plus chrome and padding)
  const codeS = 0.46;
  const codeH = Math.min(9 * 17 + 28 + 16, stage.h - card.h * codeS - 42);
  const groupTop = stage.y + (stage.h - (card.h * codeS + 14 + codeH)) / 2;
  const code: Pose = {cx: sx, cy: groupTop + (card.h * codeS) / 2, s: codeS};
  const codeRect = {x: stage.x + 12, y: groupTop + card.h * codeS + 14, w: stage.w - 24, h: codeH};

  // Beat 3: the card inside a phone browser frame, QA checks below
  const chrome = 28;
  const testS = 0.58;
  const frameW = card.w * testS + 20;
  const frameH = chrome + card.h * testS + 10;
  const win = {x: sx - frameW / 2, y: stage.y + 14, w: frameW, h: frameH};
  const test: Pose = {cx: sx, cy: win.y + chrome + (card.h * testS) / 2, s: testS};
  const checksY = win.y + frameH + 14;

  const finalS = Math.min(0.94, (stage.h - 36) / card.h, (stage.w - 24) / card.w);

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
    poses: {design, code, test, final: {cx: sx, cy: sy, s: finalS}},
    measures,
    chips,
    code: codeRect,
    codeFont: 10,
    window: win,
    chrome,
    tablet: null,
    phone: null,
    devices: [],
    devicesY: 0,
    checks: {x: stage.x + 14, y: checksY, w: stage.w - 28, h: stage.y + stage.h - 12 - checksY},
    deploy: {x: stage.x + 14, y: checksY, w: stage.w - 28, h: stage.y + stage.h - 12 - checksY},
    replay: null,
  };
};

export const computeLayout = (width: number, height: number, portrait: boolean): RedlineLayout =>
  portrait ? phoneLayout(width, height) : desktopLayout(width, height);
