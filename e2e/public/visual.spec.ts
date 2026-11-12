import {expect, test} from '@playwright/test';
import {heroControls, waitForFilm} from '../support/hero';

/*
 * Screenshots of the hero, the stuck header and the stack strip, compared with the committed baseline for this viewport
 * and platform. Reduced motion turns off the scroll reveals and the highlighter animation, and opens the hero on its
 * final frame; the film itself is hidden, so only the header and HUD over it are compared. Update baselines with
 * `pnpm test:e2e --update-snapshots`.
 *
 * The other home sections have no screenshot: their behaviour is covered by their own specs, and a height change in one
 * section shifted the crop of every section below it, so their baselines failed on every redesign without catching a
 * regression.
 */

test.use({reducedMotion: 'reduce'});

// The header is sticky, so it would otherwise paint over whichever section the capture scrolled past
const HIDE_HEADER = 'e2e/support/hide-header.css';

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

test('hero (film hidden)', async ({page}) => {
  const {hero, toggle} = heroControls(page);
  await waitForFilm(page);
  await expect(toggle).toHaveAccessibleName('Replay film');
  // The film box fills the whole hero, so a mask would also cover the header and HUD drawn over it: hide the film instead
  await expect(hero).toHaveScreenshot('hero.png', {stylePath: 'e2e/support/hide-film.css'});
});

/*
 * The header once it has left the film: its surface, the filled-in rail, and the lime indicator under the section in
 * view. The hero shot above covers the other half of the design, the transparent state over the film; the section
 * shots hide the header entirely, so without this the stuck surface and the position indicator have no cover at all.
 */
test('header, stuck past the hero', async ({page}, testInfo) => {
  const header = page.getByRole('banner');
  // Work is a section the nav links to, so the rail marks a labelled graduation and the readout names it
  await page.evaluate(() => document.getElementById('work')?.scrollIntoView({behavior: 'instant', block: 'start'}));
  await expect(header).toHaveAttribute('data-surface', 'true');

  // Wait for the state the picture is of, not for a scroll offset: the indicator is placed from the measured box of
  // the active graduation, so the capture has to come after that measurement, not merely after the scroll.
  const phone = testInfo.project.name === 'mobile';
  // Under 860px the stable Menu trigger opens the section readout; above it the rail link carries aria-current.
  if (phone) {
    const menu = header.getByRole('button', {name: 'Menu', exact: true});
    await expect(menu).toBeVisible();
    await menu.click();
    const navigation = page.getByRole('dialog', {name: 'Navigation'});
    await expect(navigation.getByText('Viewing Work', {exact: true})).toBeVisible();
    await expect(navigation.getByRole('link', {name: 'Work', exact: true})).toHaveAttribute('aria-current', 'true');
    await navigation.getByRole('button', {name: 'Close menu', exact: true}).click();
    await expect(navigation).toBeHidden();
    await expect(menu).toBeFocused();
  } else {
    await expect(header.getByRole('link', {name: 'Work', exact: true})).toHaveAttribute('aria-current', 'true');
  }

  await expect(header).toHaveScreenshot('header-stuck.png');
});

test('stack strip', async ({page}) => {
  // The strip has no id: it's the section right before About
  await expect(page.locator('#about').locator('xpath=preceding-sibling::section[1]')).toHaveScreenshot('stack.png', {stylePath: [HIDE_HEADER]});
});
