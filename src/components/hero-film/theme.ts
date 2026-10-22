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

export const theme = {
  ink: '#0D0E12',
  muted: '#565B67',
  line: '#E3E5EA',
  ground: '#F5F6F8',
  white: '#FFFFFF',
  lime: '#D7FF3D',
  accent: '#3B2BFF',
  tint: '#ECEBFF',
  wire: '#E6E8EE',
  wireSoft: '#EEF0F4',
  dot: '#E1E4EA',
  outline: '#E4E7ED',
  code: {
    bg: '#0D0E12',
    chrome: '#1C1E25',
    dots: '#3A3D46',
    text: '#E8E9EE',
    kw: '#B9B2FF',
    str: '#D7FF3D',
    tag: '#7FD4FF',
    dim: '#7C818E',
  },
  shadow: '0 1px 0 rgba(13,14,18,.04), 0 18px 40px -18px rgba(13,14,18,.22)',
  shadowDeep: '0 30px 60px -24px rgba(13,14,18,.5)',
} as const;
