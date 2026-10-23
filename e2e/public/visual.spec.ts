import {expect, test} from '@playwright/test';
import {heroControls} from '../support/hero';

/*
 * Screenshot of each home section, compared with the committed baseline for this viewport and platform. Reduced motion
 * turns off the scroll reveals and the highlighter animation, and opens the hero on its final frame; the film itself
 * is hidden, so only the header and HUD over it are compared. Update baselines with `pnpm test:e2e --update-snapshots`.
 */

test.use({reducedMotion: 'reduce'});

const SECTIONS = ['about', 'work', 'milestones', 'timeline', 'blog', 'contact'];

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

test('hero (film hidden)', async ({page}) => {
  const {hero, toggle} = heroControls(page);
  await expect(toggle).toHaveAccessibleName('Replay film');
  // The film box fills the whole hero, so a mask would also cover the header and HUD drawn over it: hide the film instead
  await expect(hero).toHaveScreenshot('hero.png', {stylePath: 'e2e/support/hide-film.css'});
});

test('stack strip', async ({page}) => {
  // The strip has no id: it's the section right before About
  await expect(page.locator('#about').locator('xpath=preceding-sibling::section[1]')).toHaveScreenshot('stack.png');
});

for (const id of SECTIONS) {
  test(`#${id}`, async ({page}) => {
    await expect(page.locator(`#${id}`)).toHaveScreenshot(`${id}.png`);
  });
}
