import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import type React from 'react';
import {useMemo} from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {TransitionKind} from './timeline';

type Props = {kind: TransitionKind};
type Dir = 'entering' | 'exiting';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Seven "camera" transitions. `p` runs 0 → 1 over the transition for both
 * the entering and the exiting scene; each kind choreographs the pair.
 */
const getStyle = (kind: TransitionKind, dir: Dir, p: number): React.CSSProperties => {
  const entering = dir === 'entering';
  switch (kind) {
    // Circular reveal blooming from where the illustration sits.
    case 'iris':
      return entering
        ? {clipPath: `circle(${p * 140}% at 70% 55%)`}
        : {transform: `scale(${1 - 0.1 * p})`, opacity: 1 - 0.8 * p, filter: `blur(${6 * p}px)`};

    // Full card flip with a mid-air dip in scale.
    case 'flip': {
      const dip = 1 - 0.2 * Math.sin(Math.PI * p);
      return {
        backfaceVisibility: 'hidden',
        transform: entering ? `rotateY(${-180 + 180 * p}deg) scale(${dip})` : `rotateY(${180 * p}deg) scale(${dip})`,
      };
    }

    // Hyperspace: the new scene flies in from deep z, the old one past the camera.
    case 'warp':
      return entering
        ? {
            transform: `translateZ(${-1400 * (1 - p)}px) rotateX(${48 * (1 - p)}deg) rotateZ(${-6 * (1 - p)}deg)`,
            opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
            filter: `blur(${interpolate(p, [0, 0.6], [16, 0], clamp)}px)`,
          }
        : {
            transform: `translateZ(${700 * p}px) rotateX(${-10 * p}deg)`,
            opacity: 1 - p,
            filter: `blur(${10 * p}px)`,
          };

    // Diagonal blade wipe.
    case 'slice':
      return entering
        ? {clipPath: `polygon(0 0, ${140 * p}% 0, ${-40 + 140 * p}% 100%, -40% 100%)`}
        : {transform: `translateX(${-14 * p}%) skewX(${6 * p}deg)`, opacity: 1 - p};

    // The new scene drops down like a hinged panel, with a small overshoot.
    case 'tilt':
      return entering
        ? {
            transformOrigin: '50% 0',
            transform: `rotateX(${interpolate(p, [0, 0.75, 1], [-88, 7, 0])}deg)`,
            opacity: interpolate(p, [0, 0.55], [0, 1], clamp),
          }
        : {
            transformOrigin: '50% 100%',
            transform: `rotateX(${60 * p}deg) translateY(${12 * p}%)`,
            opacity: 1 - p,
          };

    // Crash zoom from oversized + blurred.
    case 'zoom':
      return entering
        ? {
            transform: `scale(${2.8 - 1.8 * p}) rotate(${4 * (1 - p)}deg)`,
            opacity: p,
            filter: `blur(${18 * (1 - p)}px)`,
          }
        : {transform: `scale(${1 - 0.45 * p}) rotate(${-3 * p}deg)`, opacity: 1 - p};

    // Vertical cube turn — the phone cut's brand reveal, like a swipe up.
    case 'cubeUp':
      return entering
        ? {transformOrigin: '50% 0', transform: `translateY(${100 * (1 - p)}%) rotateX(${-90 * (1 - p)}deg)`}
        : {
            transformOrigin: '50% 100%',
            transform: `translateY(${-100 * p}%) rotateX(${90 * p}deg)`,
            filter: `brightness(${1 - 0.12 * p})`,
          };

    // 3D cube turn for the brand reveal.
    case 'cube':
      return entering
        ? {transformOrigin: '0 50%', transform: `translateX(${100 * (1 - p)}%) rotateY(${90 * (1 - p)}deg)`}
        : {
            transformOrigin: '100% 50%',
            transform: `translateX(${-100 * p}%) rotateY(${-90 * p}deg)`,
            filter: `brightness(${1 - 0.12 * p})`,
          };
  }
};

const FilmPresentation: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const style = useMemo(
    () => getStyle(passedProps.kind, presentationDirection, presentationProgress),
    [passedProps.kind, presentationDirection, presentationProgress],
  );
  return (
    <AbsoluteFill style={{perspective: 1800, perspectiveOrigin: '50% 45%'}}>
      <AbsoluteFill style={{...style, willChange: 'transform, opacity, clip-path'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const film = (kind: TransitionKind): TransitionPresentation<Props> => ({
  component: FilmPresentation,
  props: {kind},
});
