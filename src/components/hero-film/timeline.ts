/**
 * Single source of truth for the film's timing. There are two cuts:
 *  - DESKTOP_TIMELINE: the full ~30s landscape film
 *  - MOBILE_TIMELINE:  a faster ~26s portrait cut with phone-native scenes
 * The compositions and the page player both read from here, so chapter
 * buttons and progress segments always land on the right frame.
 */
export const FPS = 30;

export type TransitionKind = 'iris' | 'flip' | 'warp' | 'slice' | 'tilt' | 'zoom' | 'cube' | 'cubeUp';

export type SceneId = 'intro' | 'research' | 'design' | 'code' | 'qa' | 'deploy' | 'live' | 'brand';

export type SceneDef = {
  id: SceneId;
  /** Frames the scene occupies, including the transition overlaps on each side. */
  durationInFrames: number;
  /** How this scene enters (ignored for the first scene). */
  enter: TransitionKind | null;
  /** Chapter label shown in the HUD; null = not a chapter. */
  chapter: string | null;
};

export type Chapter = {index: number; number: string; label: string; startFrame: number; endFrame: number};

export type Timeline = {
  scenes: SceneDef[];
  transitionFrames: number;
  /** Absolute frame at which each scene starts (its entering transition begins). */
  starts: number[];
  durationInFrames: number;
  /** First frame of the final brand card. */
  brandStart: number;
  chapters: Chapter[];
};

export const makeTimeline = (scenes: SceneDef[], transitionFrames: number): Timeline => {
  const starts = scenes.reduce<number[]>((acc, _scene, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + scenes[i - 1].durationInFrames - transitionFrames);
    return acc;
  }, []);
  const durationInFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0) - (scenes.length - 1) * transitionFrames;
  const chapters = scenes.flatMap((scene, i) => {
    if (!scene.chapter) return [];
    const startFrame = starts[i];
    const endFrame = i + 1 < scenes.length ? starts[i + 1] : durationInFrames;
    return [{index: i, number: String(i).padStart(2, '0'), label: scene.chapter, startFrame, endFrame}];
  });
  return {scenes, transitionFrames, starts, durationInFrames, brandStart: starts[starts.length - 1], chapters};
};

export const DESKTOP_TIMELINE = makeTimeline(
  [
    {id: 'intro', durationInFrames: 105, enter: null, chapter: null},
    {id: 'research', durationInFrames: 145, enter: 'iris', chapter: 'Research'},
    {id: 'design', durationInFrames: 145, enter: 'flip', chapter: 'Design'},
    {id: 'code', durationInFrames: 150, enter: 'warp', chapter: 'Figma → Web'},
    {id: 'qa', durationInFrames: 145, enter: 'slice', chapter: 'QA'},
    {id: 'deploy', durationInFrames: 140, enter: 'tilt', chapter: 'Deploy'},
    {id: 'live', durationInFrames: 135, enter: 'zoom', chapter: 'Live'},
    // The last scene holds: the film stops here (no loop) with the CTAs visible.
    {id: 'brand', durationInFrames: 150, enter: 'cube', chapter: null},
  ],
  30,
);

/**
 * Phone cut: one idea per beat, ~4s each, shorter transitions. Vertical
 * transitions (tilt, cubeUp) read like a swipe on a tall screen.
 */
export const MOBILE_TIMELINE = makeTimeline(
  [
    {id: 'intro', durationInFrames: 90, enter: null, chapter: null},
    {id: 'research', durationInFrames: 120, enter: 'iris', chapter: 'Research'},
    {id: 'design', durationInFrames: 120, enter: 'flip', chapter: 'Design'},
    {id: 'code', durationInFrames: 125, enter: 'warp', chapter: 'Figma → Web'},
    {id: 'qa', durationInFrames: 120, enter: 'slice', chapter: 'QA'},
    {id: 'deploy', durationInFrames: 120, enter: 'tilt', chapter: 'Deploy'},
    {id: 'live', durationInFrames: 115, enter: 'zoom', chapter: 'Live'},
    {id: 'brand', durationInFrames: 140, enter: 'cubeUp', chapter: null},
  ],
  24,
);

/** Frame (inside the brand scene) when the CTA buttons have fully arrived. */
export const CTA_LOCAL_FRAME = 70;

/** Phones and tall windows get the mobile cut. Keep in sync with useLayout(). */
export const isPortrait = (width: number, height: number) => width < 860 || height > width * 0.95;

export const formatTimecode = (frame: number) => {
  const totalSeconds = Math.floor(frame / FPS);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
