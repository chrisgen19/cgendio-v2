import {expect, type Page} from '@playwright/test';

/**
 * The film mounts on the visitor's first scroll, tap, mouse movement or key press (src/lib/use-first-interaction.ts), so
 * tests that drive it press a key first. The listener only exists once React has hydrated, so a press can land too early: keep
 * pressing, as a visitor would, until the film's controls appear. Shift has no side effects on either project.
 * Reduced motion skips this: the film loads on idle there and opens on its brand card.
 */
export const startFilm = async (page: Page) => {
  const {toggle} = heroControls(page);
  await expect(async () => {
    await page.keyboard.press('Shift');
    await expect(toggle).toBeVisible({timeout: 1_000});
  }).toPass();
};

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
    seeMyWork: hero.getByRole('link', {name: /See my work/}).last(),
    /** Desktop chips read "01 Research" */
    desktopChapter: (label: string) => hero.getByRole('group', {name: 'Film chapters'}).getByRole('button', {name: new RegExp(`^\\d\\d ${label}$`)}),
    mobileSegment: (label: string) => hero.getByRole('button', {name: `Jump to ${label}`}),
  };
};
