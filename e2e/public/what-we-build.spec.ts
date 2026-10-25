import {expect, type Page, test} from '@playwright/test';

/*
 * The What we build split runs in three columns only from lg (1080px): below it a text column is narrower than the
 * one-word WordPress label, so the split stacks. At the widths around that switch, the label must stay inside the ink
 * stage both at rest and pressed, when it scales up.
 */

// Reduced motion makes a press switch the split and scale the label at once, so nothing is measured mid-transition
test.use({reducedMotion: 'reduce'});

const wordpress = (page: Page) => page.locator('#what-we-build').getByRole('button', {name: /WordPress/});

/** How far the WordPress label pokes out of the stage on its worse side, in px (0 or less is inside). */
const pastStage = (page: Page) =>
  wordpress(page).evaluate((label) => {
    const stage = label.closest('[data-ink-stage]')?.getBoundingClientRect();
    if (!stage) throw new Error('The WordPress label is not inside the stage');
    const box = label.getBoundingClientRect();
    return Math.max(stage.left - box.left, box.right - stage.right);
  });

for (const width of [860, 950, 1080]) {
  test(`the WordPress label stays inside the stage at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: 900});
    await page.goto('/');
    expect(await pastStage(page)).toBeLessThanOrEqual(0);

    await wordpress(page).click();
    await expect(wordpress(page)).toHaveAttribute('aria-pressed', 'true');
    expect(await pastStage(page)).toBeLessThanOrEqual(0);
  });
}
