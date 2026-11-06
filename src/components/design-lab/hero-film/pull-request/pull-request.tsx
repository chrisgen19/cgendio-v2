import {DirectionStage} from '../direction-stage';
import {PullRequestFilm} from './pull-request-film';

/** Direction 03: the build told as a pull request, from diff to merged, then the preview zooms up into the live site. */
export function PullRequest() {
  return (
    <DirectionStage>
      <PullRequestFilm />
    </DirectionStage>
  );
}
