import {expect, test} from '@playwright/test';
import {heroControls, waitForFilm} from '../support/hero';

test.use({reducedMotion: 'reduce'});

test('with reduced motion the hero opens on the brand card, paused', async ({page}) => {
  await page.goto('/');
  const {skip, toggle, seeMyWork} = heroControls(page);

  await waitForFilm(page);
  await expect(toggle).toHaveAccessibleName('Replay film');
  await expect(skip).toHaveCount(0);
  await expect(seeMyWork).toBeVisible();

  // Still paused a moment later: nothing starts playing on its own
  await page.waitForTimeout(1_500);
  await expect(toggle).toHaveAccessibleName('Replay film');
});
