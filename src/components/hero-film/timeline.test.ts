import {describe, expect, it} from 'vitest';
import {DESKTOP_TIMELINE, FPS, formatTimecode, isPortrait, MOBILE_TIMELINE, makeTimeline} from './timeline';

/* Expected frames are written out by hand, not recomputed, so a change to a scene length shows up here on purpose. */

describe('makeTimeline', () => {
  it('overlaps each scene with the next by the transition length', () => {
    const timeline = makeTimeline(
      [
        {id: 'intro', durationInFrames: 10, enter: null, chapter: null},
        {id: 'research', durationInFrames: 20, enter: 'iris', chapter: 'Research'},
        {id: 'brand', durationInFrames: 30, enter: 'cube', chapter: null},
      ],
      5,
    );
    expect(timeline.starts).toEqual([0, 5, 20]);
    expect(timeline.durationInFrames).toBe(50);
    expect(timeline.brandStart).toBe(20);
    expect(timeline.chapters).toEqual([{index: 1, number: '01', label: 'Research', startFrame: 5, endFrame: 20}]);
  });
});

describe('DESKTOP_TIMELINE', () => {
  it('runs 905 frames (about 30s) and the brand card starts at 755', () => {
    expect(DESKTOP_TIMELINE.starts).toEqual([0, 75, 190, 305, 425, 540, 650, 755]);
    expect(DESKTOP_TIMELINE.durationInFrames).toBe(905);
    expect(DESKTOP_TIMELINE.brandStart).toBe(755);
    // package.json's remotion:poster renders frame 904: the last frame, the brand card
    expect(DESKTOP_TIMELINE.durationInFrames - 1).toBe(904);
  });

  it('has six chapters, each ending where the next begins', () => {
    expect(DESKTOP_TIMELINE.chapters.map((c) => [c.number, c.label, c.startFrame, c.endFrame])).toEqual([
      ['01', 'Research', 75, 190],
      ['02', 'Design', 190, 305],
      ['03', 'Figma → Web', 305, 425],
      ['04', 'QA', 425, 540],
      ['05', 'Deploy', 540, 650],
      ['06', 'Live', 650, 755],
    ]);
  });
});

describe('MOBILE_TIMELINE', () => {
  it('runs 782 frames (about 26s) and the brand card starts at 642', () => {
    expect(MOBILE_TIMELINE.starts).toEqual([0, 66, 162, 258, 359, 455, 551, 642]);
    expect(MOBILE_TIMELINE.durationInFrames).toBe(782);
    expect(MOBILE_TIMELINE.brandStart).toBe(642);
  });

  it('has the same six chapters as the desktop cut', () => {
    expect(MOBILE_TIMELINE.chapters.map((c) => [c.label, c.startFrame, c.endFrame])).toEqual([
      ['Research', 66, 162],
      ['Design', 162, 258],
      ['Figma → Web', 258, 359],
      ['QA', 359, 455],
      ['Deploy', 455, 551],
      ['Live', 551, 642],
    ]);
  });
});

describe('isPortrait', () => {
  it('picks the mobile cut under 860px wide', () => {
    expect(isPortrait(390, 844)).toBe(true);
    expect(isPortrait(859, 500)).toBe(true);
    expect(isPortrait(860, 500)).toBe(false);
  });

  it('picks the mobile cut for tall windows of any width', () => {
    expect(isPortrait(1024, 1366)).toBe(true);
    expect(isPortrait(1000, 950)).toBe(false);
    expect(isPortrait(1000, 951)).toBe(true);
    expect(isPortrait(1440, 900)).toBe(false);
  });
});

describe('formatTimecode', () => {
  it('formats frames as mm:ss at the film frame rate', () => {
    expect(FPS).toBe(30);
    expect(formatTimecode(0)).toBe('00:00');
    expect(formatTimecode(29)).toBe('00:00');
    expect(formatTimecode(905)).toBe('00:30');
    expect(formatTimecode(30 * 75)).toBe('01:15');
  });
});
