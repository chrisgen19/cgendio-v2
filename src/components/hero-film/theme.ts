import {loadVariableFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadGeist} from '@remotion/google-fonts/Geist';
import {loadFont as loadGeistMono} from '@remotion/google-fonts/GeistMono';
import {getRemotionEnvironment} from 'remotion';

/**
 * In the website's <Player> the film uses the page's next/font files through
 * their CSS variables, so nothing is downloaded twice and the static first
 * frame hands over to the film without a font change.
 *
 * Studio and `remotion render` have no Next.js page around them, so there the
 * fonts load through Remotion, which delays each frame until they're ready.
 * Bricolage loads as the variable font so optical sizing matches the site.
 */
const loadFamilies = () => {
  const {isStudio, isRendering} = getRemotionEnvironment();
  if (!isStudio && !isRendering) {
    return {display: 'var(--font-bricolage)', body: 'var(--font-geist)', mono: 'var(--font-geist-mono)'};
  }
  return {
    display: loadBricolage('normal', {subsets: ['latin']}).fontFamily,
    body: loadGeist('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']}).fontFamily,
    mono: loadGeistMono('normal', {weights: ['400', '500'], subsets: ['latin']}).fontFamily,
  };
};

const families = loadFamilies();

export const fonts = {
  display: `${families.display}, system-ui, sans-serif`,
  body: `${families.body}, system-ui, sans-serif`,
  mono: `${families.mono}, ui-monospace, monospace`,
} as const;

/**
 * A colour the site's dark mode can change. The page sets `--film-<name>` under `:root[data-theme="dark"]`
 * (src/app/globals.css), and the Player renders in the page's DOM, so the film follows the theme without re-rendering.
 * Light mode, Studio and `remotion render` have no such variable and use the light value.
 */
const themed = (name: string, light: string) => `var(--film-${name}, ${light})`;

export const theme = {
  /** Text, and ink-filled shapes (they turn light in dark mode, like the site's primary button). */
  ink: themed('ink', '#0D0E12'),
  muted: themed('muted', '#565B67'),
  line: themed('line', '#E3E5EA'),
  ground: '#F5F6F8',
  /** Plain white in both themes: text and strokes on accent fills, the white palette swatch. */
  white: '#FFFFFF',
  /** The dot-grid stage behind every scene. */
  stage: themed('stage', '#FFFFFF'),
  /** Cards, panels and browser frames. */
  surface: themed('surface', '#FFFFFF'),
  /** Translucent cards over the stage (the mobile toasts). */
  glass: themed('glass', 'rgba(255,255,255,.94)'),
  /** Soft fills inside a surface: the component preview, the design canvas and the address bar. */
  preview: themed('preview', '#F3F4F7'),
  canvas: themed('canvas', '#FBFBFC'),
  field: themed('field', '#F1F2F5'),
  /** Text on ink-filled shapes. */
  onInk: themed('on-ink', '#FFFFFF'),
  /** Text and icons on accent fills: white on #3B2BFF, ink on the lighter dark-mode accent (white there is only 3:1). */
  onAccent: themed('on-accent', '#FFFFFF'),
  /** Check badges and icon squares: ink with a lime tick in light mode, lime with an ink tick in dark mode. */
  badge: themed('badge', '#0D0E12'),
  badgeInk: themed('badge-ink', '#D7FF3D'),
  lime: '#D7FF3D',
  /** Ink on lime fills, in both themes. */
  onLime: '#0D0E12',
  /** The ink swatch in the Design scene's palette: always the brand ink. */
  brandInk: '#0D0E12',
  accent: themed('accent', '#3B2BFF'),
  tint: themed('tint', '#ECEBFF'),
  wire: themed('wire', '#E6E8EE'),
  wireSoft: themed('wire-soft', '#EEF0F4'),
  bar: themed('bar', '#DCDFE6'),
  dot: themed('dot', '#E1E4EA'),
  outline: themed('outline', '#E4E7ED'),
  windowDot: themed('window-dot', '#D5D8DF'),
  globe: themed('globe', '#CBD0DA'),
  globeSoft: themed('globe-soft', '#DADDE4'),
  /** The highlighter: solid lime under ink in light mode; a translucent bar under lime text in dark mode. */
  mark: themed('mark', '#D7FF3D'),
  markInk: themed('mark-ink', 'currentColor'),
  /** The lime sweep between scenes multiplies on white and screens on the dark stage. */
  sweepBlend: themed('sweep-blend', 'multiply'),
  code: {
    bg: themed('code-bg', '#0D0E12'),
    chrome: themed('code-chrome', '#1C1E25'),
    dots: '#3A3D46',
    /** The deploy progress track. */
    track: '#23262E',
    text: '#E8E9EE',
    kw: '#B9B2FF',
    str: '#D7FF3D',
    tag: '#7FD4FF',
    dim: '#7C818E',
  },
  shadow: themed('shadow', '0 1px 0 rgba(13,14,18,.04), 0 18px 40px -18px rgba(13,14,18,.22)'),
  shadowDeep: themed('shadow-deep', '0 30px 60px -24px rgba(13,14,18,.5)'),
} as const;
