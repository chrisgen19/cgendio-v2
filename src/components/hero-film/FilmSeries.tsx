import {linearTiming, TransitionSeries} from '@remotion/transitions';
import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {film} from './presentations';
import {EASE_INOUT} from './primitives';
import {theme} from './theme';
import type {SceneId, Timeline} from './timeline';

/** Plays a timeline's scenes back to back, each entering with its own transition. */
export const FilmSeries: React.FC<{timeline: Timeline; render: (id: SceneId) => React.ReactNode}> = ({timeline, render}) => {
  const timing = linearTiming({durationInFrames: timeline.transitionFrames, easing: EASE_INOUT});
  return (
    <AbsoluteFill style={{backgroundColor: theme.stage}}>
      <TransitionSeries>
        {timeline.scenes.flatMap((scene) => {
          const nodes: React.ReactNode[] = [];
          if (scene.enter) {
            nodes.push(<TransitionSeries.Transition key={`${scene.id}-t`} presentation={film(scene.enter)} timing={timing} />);
          }
          nodes.push(
            <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames} name={scene.id}>
              {render(scene.id)}
            </TransitionSeries.Sequence>,
          );
          return nodes;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
