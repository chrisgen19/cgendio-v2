import {ImageResponse} from 'next/og';
import {OG_FONTS} from './fonts';

/*
 * The share card for posts and case studies (the home page uses the hero poster instead). Colours are the light
 * tokens from globals.css: next/og renders inline styles only.
 */

export const OG_SIZE = {width: 1200, height: 630};

const INK = '#0D0E12';
const MUTED = '#565B67';
const LIME = '#D7FF3D';

/** Longer titles step down so they fit in three lines. */
const titleSize = (title: string) => (title.length <= 36 ? 88 : title.length <= 64 ? 70 : 56);

type OgCardProps = {
  /** Mono uppercase line above the title, e.g. "Blog · Next.js". */
  eyebrow: string;
  title: string;
};

/** 1200x630 card: eyebrow, title with the lime highlighter under its last word, and the cg logo on a dot grid. */
export const ogCard = ({eyebrow, title}: OgCardProps) => {
  const size = titleSize(title);
  const words = title.split(/\s+/);
  const last = words.pop();
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        backgroundColor: '#FFFFFF',
        backgroundImage: 'radial-gradient(circle, #E1E4EA 1px, transparent 1.3px)',
        backgroundSize: '26px 26px',
        color: INK,
      }}
    >
      <div style={{display: 'flex', fontFamily: 'Geist Mono', fontSize: 24, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED}}>
        {eyebrow}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: 1000,
          fontFamily: 'Bricolage Grotesque',
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: `${-0.04 * size}px`,
        }}
      >
        {words.map((word, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: words of one static title; repeats are possible
          <span key={index} style={{marginRight: size * 0.24}}>
            {word}
          </span>
        ))}
        <span style={{position: 'relative', display: 'flex'}}>
          <span
            style={{position: 'absolute', left: -size * 0.06, right: -size * 0.06, bottom: size * 0.07, height: size * 0.36, backgroundColor: LIME}}
          />
          <span style={{position: 'relative'}}>{last}</span>
        </span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: INK,
            color: LIME,
            fontFamily: 'Bricolage Grotesque',
            fontSize: 28,
            letterSpacing: '-1px',
          }}
        >
          cg
        </div>
        <div style={{display: 'flex', fontFamily: 'Geist', fontSize: 30}}>cgdiomampo.dev</div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [...OG_FONTS],
    },
  );
};
