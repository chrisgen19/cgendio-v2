/**
 * One page theme's colours for a project card in its client's brand tint: the card background, the accent (number,
 * rule and glyph), the button fill and the button label.
 */
export type BrandShades = {
  background: string;
  accent: string;
  button: string;
  onButton: string;
};

/** A card's shades on the light page and on the dark page. */
export type BrandPalette = {
  light: BrandShades;
  dark: BrandShades;
};

type Mode = {
  /** The surface the tint is washed into */
  base: string;
  /** The tint's share of the background */
  amount: number;
  /** Where the accent and button move until they pass: ink on the light page, white on the dark one */
  toward: string;
};

const INK = '#0d0e12';
const WHITE = '#ffffff';
// Today's tint recipe on the light page; the dark page washes into the dark `white` surface (globals.css)
const LIGHT: Mode = {base: WHITE, amount: 0.12, toward: INK};
const DARK: Mode = {base: '#15171d', amount: 0.22, toward: WHITE};
/** How finely a colour moves toward ink or white when it needs more contrast */
const STEPS = 50;

const channels = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

/** `color` mixed into `base`, `amount` (0 to 1) being color's share, as CSS `color-mix(in srgb, ...)` does. */
export const mixHex = (color: string, base: string, amount: number): string => {
  const b = channels(base);
  return `#${channels(color)
    .map((c, i) => Math.round(c * amount + b[i] * (1 - amount)))
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;
};

const luminance = (hex: string) => {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** The WCAG contrast ratio of two `#rrggbb` colours, from 1 to 21. */
export const contrastRatio = (a: string, b: string): number => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

// White or ink, whichever reads better on the fill
const labelOn = (fill: string) => (contrastRatio(fill, WHITE) >= contrastRatio(fill, INK) ? WHITE : INK);

const shades = (brand: string, tint: string, {base, amount, toward}: Mode): BrandShades => {
  const background = mixHex(tint, base, amount);
  let accent = brand;
  for (let s = 0; s <= STEPS && contrastRatio(accent, background) < 4.5; s++) accent = mixHex(toward, brand, s / STEPS);
  // The brand fill when it stands out from the card (3:1), else the accent; then darker or lighter until its label passes
  let button = contrastRatio(brand, background) >= 3 ? brand : accent;
  for (let s = 0; s <= STEPS && contrastRatio(button, labelOn(button)) < 4.5; s++) button = mixHex(toward, button, 1 / STEPS);
  return {background, accent, button, onButton: labelOn(button)};
};

/**
 * A project card's colours from its brand colour and optional tint colour (`#rrggbb`, any case). The background is the
 * tint (or the brand colour) washed into the page surface; the accent and button are the brand colour, moved toward
 * ink or white until they pass WCAG AA (4.5:1 for text, 3:1 for the button fill against the card).
 */
export const brandPalette = (brandColor: string, brandTint?: string | null): BrandPalette => {
  const brand = brandColor.toLowerCase();
  const tint = (brandTint ?? brandColor).toLowerCase();
  return {light: shades(brand, tint, LIGHT), dark: shades(brand, tint, DARK)};
};
