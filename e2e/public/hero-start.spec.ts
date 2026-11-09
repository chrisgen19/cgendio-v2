import {expect, test} from '@playwright/test';
import {heroControls, startFilm} from '../support/hero';

/*
 * The film waits for the visitor's first scroll, tap or key press (src/components/sections/hero-stage.tsx), so the
 * server-rendered intro card is the hero until then. Reduced motion is covered by reduced-motion.spec.ts.
 */
test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test('the intro card holds and the film does not load before any interaction', async ({page}) => {
  const {hero} = heroControls(page);
  await expect(page.getByText('Chris Diomampo presents')).toBeVisible();
  // Give an idle-time load the chance to happen, so this cannot pass by racing it
  await page.waitForTimeout(3_000);
  await expect(hero).toHaveCount(0);
});

// One scroll is enough even before hydration: the page is already scrolled when the listener would attach
test('the first scroll starts the film', async ({page}) => {
  const {toggle} = heroControls(page);
  await page.mouse.wheel(0, 120);
  await expect(toggle).toHaveAccessibleName('Pause film');
});

test('a key press starts the film', async ({page}) => {
  const {toggle} = heroControls(page);
  await startFilm(page);
  await expect(toggle).toHaveAccessibleName('Pause film');
});
