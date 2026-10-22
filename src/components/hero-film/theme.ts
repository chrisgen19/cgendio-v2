import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadGeist} from '@remotion/google-fonts/Geist';
import {loadFont as loadGeistMono} from '@remotion/google-fonts/GeistMono';

/**
 * Fonts are loaded through Remotion so the film looks identical in the
 * in-page <Player> and in an MP4 rendered with `npx remotion render`.
 * Remotion delays each frame until the fonts are ready.
 */
const display = loadBricolage('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
const body = loadGeist('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
const mono = loadGeistMono('normal', {weights: ['400', '500'], subsets: ['latin']});

export const fonts = {
  display: `${display.fontFamily}, system-ui, sans-serif`,
  body: `${body.fontFamily}, system-ui, sans-serif`,
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
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
