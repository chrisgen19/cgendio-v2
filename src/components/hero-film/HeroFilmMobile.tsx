import type React from 'react';
import {FilmSeries} from './FilmSeries';
import type {HeroFilmProps} from './HeroFilm';
import {Brand} from './scenes/Brand';
import {Intro} from './scenes/Intro';
import {MobileDeploy} from './scenes/mobile/MobileDeploy';
import {MobileDesign} from './scenes/mobile/MobileDesign';
import {MobileFigmaToWeb} from './scenes/mobile/MobileFigmaToWeb';
import {MobileLive} from './scenes/mobile/MobileLive';
import {MobileQA} from './scenes/mobile/MobileQA';
import {MobileResearch} from './scenes/mobile/MobileResearch';
import {MOBILE_TIMELINE, type SceneId} from './timeline';

/**
 * Phone cut (~26s). Same story and brand card as the desktop film, but the
 * six process scenes are redrawn at phone scale so every label stays
 * readable, with shorter copy and a faster edit.
 */
export const HeroFilmMobile: React.FC<HeroFilmProps> = ({worksHref, onReplay}) => {
  const render = (id: SceneId) => {
    switch (id) {
      case 'intro':
        return <Intro />;
      case 'research':
        return <MobileResearch />;
      case 'design':
        return <MobileDesign />;
      case 'code':
        return <MobileFigmaToWeb />;
      case 'qa':
        return <MobileQA />;
      case 'deploy':
        return <MobileDeploy />;
      case 'live':
        return <MobileLive />;
      case 'brand':
        return <Brand worksHref={worksHref} onReplay={onReplay} />;
    }
  };
  return <FilmSeries timeline={MOBILE_TIMELINE} render={render} />;
};
