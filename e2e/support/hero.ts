import type {Page} from '@playwright/test';

/** The hero film's section and the HUD controls the tests drive, found by their accessible names. */
export const heroControls = (page: Page) => {
  const hero = page.getByRole('region', {name: /^Brand film/});
  return {
    hero,
    /** "Skip intro" on desktop, "Skip" on phones; it disappears once the brand card starts */
    skip: hero.getByRole('button', {name: /^Skip/}),
    /** Pause film while playing, Play film when paused, Replay film once the film has ended */
    toggle: hero.getByRole('button', {name: /^(Play|Pause|Replay) film$/}),
    /** The brand card's call to action, rendered inside the film */
    seeOurWork: hero.getByRole('link', {name: /See our work/}).last(),
    /** Desktop chips read "01 Research" */
    desktopChapter: (label: string) => hero.getByRole('group', {name: 'Film chapters'}).getByRole('button', {name: new RegExp(`^\\d\\d ${label}$`)}),
    mobileSegment: (label: string) => hero.getByRole('button', {name: `Jump to ${label}`}),
  };
};
