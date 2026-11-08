/**
 * Frame cues for both cuts (30 fps). One transition grammar: only the project card moves (a 24-frame glide between
 * poses, a match cut), and every piece of context around it fades or clip-reveals while the card holds still.
 * Each beat's entrances start after the previous glide has settled.
 */
export const GLIDE = 24;
export const EXIT = 10;

export type Timing = {
  /** Name and claim. */
  claimIn: number;
  mark: number;
  cardIn: number;
  /** Beat 1, design: the card as a selected frame with redlines and token chips. */
  select: number;
  measures: number;
  chips: number;
  chipStagger: number;
  lime: number;
  designOut: number;
  glideToCode: number;
  /** Beat 2, build: the component code beside the card. */
  codeIn: number;
  codeLines: number;
  lineStagger: number;
  codeOut: number;
  glideToTest: number;
  /** Beat 3, test: the card in a browser window, then at three widths with QA ticks. */
  windowIn: number;
  tabletIn: number;
  phoneIn: number;
  ticks: number;
  checks: number;
  testOut: number;
  /** Beat 4, ship: push, build, ship, live. */
  deploy: number;
  live: number;
  collapse: number;
  glideToFinal: number;
  finalIn: number;
  end: number;
};

export const DESKTOP_TIMING: Timing = {
  claimIn: 0,
  mark: 20,
  cardIn: 8,
  select: 26,
  measures: 36,
  chips: 44,
  chipStagger: 6,
  lime: 80,
  designOut: 100,
  glideToCode: 112,
  codeIn: 138,
  codeLines: 148,
  lineStagger: 5,
  codeOut: 228,
  glideToTest: 240,
  windowIn: 266,
  tabletIn: 284,
  phoneIn: 289,
  ticks: 302,
  checks: 306,
  testOut: 344,
  deploy: 356,
  live: 382,
  collapse: 400,
  glideToFinal: 412,
  finalIn: 438,
  end: 464,
};

export const PHONE_TIMING: Timing = {
  claimIn: 0,
  mark: 18,
  cardIn: 6,
  select: 22,
  measures: 30,
  chips: 38,
  chipStagger: 5,
  lime: 60,
  designOut: 80,
  glideToCode: 90,
  codeIn: 116,
  codeLines: 124,
  lineStagger: 4,
  codeOut: 172,
  glideToTest: 182,
  windowIn: 208,
  tabletIn: 208,
  phoneIn: 208,
  ticks: 222,
  checks: 224,
  testOut: 258,
  deploy: 270,
  live: 294,
  collapse: 312,
  glideToFinal: 322,
  finalIn: 348,
  end: 372,
};
