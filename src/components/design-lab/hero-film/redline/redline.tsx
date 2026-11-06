import {DirectionStage} from '../direction-stage';
import {RedlineFilm} from './redline-film';

/** Direction 02: one project card carries every cut, from redlines to a live URL. */
export function Redline() {
  return (
    <DirectionStage>
      <RedlineFilm />
    </DirectionStage>
  );
}
