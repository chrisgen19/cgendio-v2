import {expect, test} from '@playwright/test';
import {heroControls} from '../support/hero';

test.use({reducedMotion: 'reduce'});

test('with reduced motion the hero opens on the brand card, paused', async ({page}) => {
  await page.goto('/');
  const {skip, toggle, seeOurWork} = heroControls(page);

  await expect(toggle).toHaveAccessibleName('Replay film');
  await expect(skip).toHaveCount(0);
  await expect(seeOurWork).toBeVisible();

  // Still paused a moment later: nothing starts playing on its own
  await page.waitForTimeout(1_500);
  await expect(toggle).toHaveAccessibleName('Replay film');
});
