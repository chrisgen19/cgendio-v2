import React from 'react';
import {Composition} from 'remotion';
import {HeroFilm} from '../components/hero-film/HeroFilm';
import {HeroFilmMobile} from '../components/hero-film/HeroFilmMobile';
import {DESKTOP_TIMELINE, FPS, MOBILE_TIMELINE} from '../components/hero-film/timeline';

/**
 * Remotion Studio / CLI entry — for previewing scenes frame by frame and
 * exporting MP4s or poster stills. The website itself uses <HeroPlayer>,
 * which picks the desktop or mobile cut from the hero's size.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HeroFilm"
      component={HeroFilm}
      durationInFrames={DESKTOP_TIMELINE.durationInFrames}
      fps={FPS}
      width={1440}
      height={820}
      defaultProps={{worksHref: '#work'}}
    />
    {/* Phone cut at a typical modern phone (iPhone 14/15 class). */}
    <Composition
      id="HeroFilmMobile"
      component={HeroFilmMobile}
      durationInFrames={MOBILE_TIMELINE.durationInFrames}
      fps={FPS}
      width={390}
      height={844}
      defaultProps={{worksHref: '#work'}}
    />
    {/* Small / short phone — checks the compact layout (lede hidden, smaller stage). */}
    <Composition
      id="HeroFilmMobileSmall"
      component={HeroFilmMobile}
      durationInFrames={MOBILE_TIMELINE.durationInFrames}
      fps={FPS}
      width={360}
      height={640}
      defaultProps={{worksHref: '#work'}}
    />
  </>
);
