import {expect, type Page, test} from '@playwright/test';

/* "Everything else" under the stack plates: closed by default so the section stays short, with the tools still in the page. */
const section = (page: Page) => page.locator('#stack');
const toggle = (page: Page) => section(page).locator('summary');
const hiddenTool = (page: Page) => section(page).getByText('Zustand', {exact: true});

test('the rest of the stack starts closed but stays in the page', async ({page}) => {
  await page.goto('/');
  await expect(hiddenTool(page)).toBeAttached();
  await expect(hiddenTool(page)).toBeHidden();
  await expect(section(page).getByText('Show 36 more tools')).toBeVisible();
});

test('the toggle opens and closes the list', async ({page}) => {
  await page.goto('/');
  await toggle(page).scrollIntoViewIfNeeded();
  await toggle(page).click();
  await expect(hiddenTool(page)).toBeVisible();
  await expect(section(page).getByText('Hide 36 tools')).toBeVisible();
  // Both labels stay in the pill to hold its width, so only one may be painted at a time
  await expect(section(page).getByText('Show 36 more tools')).toBeHidden();

  await toggle(page).click();
  await expect(hiddenTool(page)).toBeHidden();
  await expect(section(page).getByText('Show 36 more tools')).toBeVisible();
  await expect(section(page).getByText('Hide 36 tools')).toBeHidden();
});

test('the toggle works from the keyboard and is a 44px target', async ({page}) => {
  await page.goto('/');
  await toggle(page).focus();
  await page.keyboard.press('Enter');
  await expect(hiddenTool(page)).toBeVisible();
  const pill = await toggle(page).locator('.stack-ruler-pill').boundingBox();
  expect(pill?.height).toBeGreaterThanOrEqual(44);
});

test.describe('with reduced motion', () => {
  test.use({reducedMotion: 'reduce'});

  test('the list still opens', async ({page}) => {
    await page.goto('/');
    await toggle(page).click();
    await expect(hiddenTool(page)).toBeVisible();
  });
});
