import React from 'react';
import {FilmSeries} from './FilmSeries';
import {Brand, type BrandProps} from './scenes/Brand';
import {Deploy} from './scenes/Deploy';
import {Design} from './scenes/Design';
import {FigmaToWeb} from './scenes/FigmaToWeb';
import {Intro} from './scenes/Intro';
import {Live} from './scenes/Live';
import {QA} from './scenes/QA';
import {Research} from './scenes/Research';
import {DESKTOP_TIMELINE, type SceneId} from './timeline';

export type HeroFilmProps = BrandProps;

/**
 * Desktop / landscape cut: research → design → Figma to web → QA → deploy →
 * live → brand. Runs once; the last scene holds with the calls to action.
 */
export const HeroFilm: React.FC<HeroFilmProps> = ({worksHref, onReplay}) => {
  const render = (id: SceneId) => {
    switch (id) {
      case 'intro':
        return <Intro />;
      case 'research':
        return <Research />;
      case 'design':
        return <Design />;
      case 'code':
        return <FigmaToWeb />;
      case 'qa':
        return <QA />;
      case 'deploy':
        return <Deploy />;
      case 'live':
        return <Live />;
      case 'brand':
        return <Brand worksHref={worksHref} onReplay={onReplay} />;
    }
  };
  return <FilmSeries timeline={DESKTOP_TIMELINE} render={render} />;
};
