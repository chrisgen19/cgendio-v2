import {expect, test} from '@playwright/test';
import {heroControls, startFilm, waitForFilm} from '../support/hero';

/*
 * The film waits for the visitor's first scroll, tap, mouse movement or key press (src/components/sections/hero-stage.tsx),
 * so the server-rendered intro card is the hero until then. Reduced motion is covered by reduced-motion.spec.ts.
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

// One scroll is enough even before hydration: the page is already scrolled when the listener would attach. The film
// then still has to fetch its chunks and mount, so wait for it before checking that it plays.
test('the first scroll starts the film', async ({page}) => {
  const {toggle} = heroControls(page);
  await page.mouse.wheel(0, 120);
  await waitForFilm(page);
  await expect(toggle).toHaveAccessibleName('Pause film');
});

test('moving the mouse starts the film', async ({page}) => {
  test.skip(test.info().project.name === 'mobile', 'phones have no hover: a scroll or tap starts the film there');
  const {toggle} = heroControls(page);
  // The listener only exists once React has hydrated, so keep moving, as a visitor would, until the film appears
  let x = 100;
  await expect(async () => {
    x += 40;
    await page.mouse.move(x, 300);
    await expect(toggle).toBeVisible({timeout: 1_000});
  }).toPass();
  await expect(toggle).toHaveAccessibleName('Pause film');
});

test('the film controls stay hidden if the film fails to load', async ({page}) => {
  // Each cut is its own chunk, loaded after the player. Fail it (both cuts' Research scene says "90 days") and the
  // intro card should stay up with no controls, rather than a HUD whose buttons do nothing.
  let failed = 0;
  await page.route('**/_next/static/chunks/*.js', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    if (!body.includes('90 days')) return route.fulfill({response, body});
    failed++;
    return route.abort();
  });
  const {hero, toggle} = heroControls(page);
  await expect(async () => {
    await page.keyboard.press('Shift');
    await expect(hero).toBeVisible({timeout: 1_000});
  }).toPass();
  await expect.poll(() => failed).toBeGreaterThan(0);
  await page.waitForTimeout(1_000);
  await expect(toggle).toHaveCount(0);
  await expect(page.getByText('Chris Diomampo presents')).toBeVisible();
});

test('a key press starts the film', async ({page}) => {
  const {toggle} = heroControls(page);
  await startFilm(page);
  await expect(toggle).toHaveAccessibleName('Pause film');
});
