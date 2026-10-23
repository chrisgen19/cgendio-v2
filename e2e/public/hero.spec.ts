import {expect, test} from '@playwright/test';
import {heroControls} from '../support/hero';

const isMobile = () => test.info().project.name === 'mobile';

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test('the hero renders the cut for the screen size', async ({page}) => {
  const {hero, toggle, desktopChapter, mobileSegment} = heroControls(page);
  await expect(hero).toBeVisible();
  await expect(toggle).toHaveAccessibleName('Pause film');

  if (isMobile()) {
    // Phone-native cut: story-style segments, no desktop chapter chips
    await expect(mobileSegment('Research')).toBeVisible();
    await expect(mobileSegment('Live')).toBeVisible();
    await expect(hero.getByRole('button', {name: /^\d\d Research$/})).toHaveCount(0);
  } else {
    await expect(desktopChapter('Research')).toBeVisible();
    await expect(desktopChapter('Live')).toBeVisible();
    await expect(mobileSegment('Research')).toHaveCount(0);
  }
});

test('a chapter control jumps to its chapter', async ({page}) => {
  const {desktopChapter, mobileSegment} = heroControls(page);
  const qa = isMobile() ? mobileSegment('QA') : desktopChapter('QA');
  await qa.click();
  await expect(qa).toHaveAttribute('aria-current', 'step');
});

test('Skip jumps to the brand card, and See our work scrolls to the work', async ({page}) => {
  const {skip, toggle, seeOurWork} = heroControls(page);
  await skip.click();
  await expect(skip).toHaveCount(0);
  // Focus moves to the play control, so keyboard users aren't dropped on <body>
  await expect(toggle).toBeFocused();
  await expect(seeOurWork).toBeVisible();

  await seeOurWork.click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work')).toBeInViewport();
});

test('the film plays once and holds on the brand card', async ({page}) => {
  // The whole film plays: about 30s on desktop, 26s on the phone cut
  test.setTimeout(120_000);
  const {skip, toggle, seeOurWork} = heroControls(page);

  await expect(toggle).toHaveAccessibleName('Pause film');
  await expect(toggle).toHaveAccessibleName('Replay film', {timeout: 60_000});

  // If it looped, the frame would go back to 0 and the control would read "Pause film" again
  await page.waitForTimeout(3_000);
  await expect(toggle).toHaveAccessibleName('Replay film');
  await expect(skip).toHaveCount(0);
  await expect(seeOurWork).toBeVisible();
  if (!isMobile()) await expect(page.getByText('00:30 / 00:30')).toBeVisible();
});
