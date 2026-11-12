import {expect, type Page, test} from '@playwright/test';
import {STACK_EXTRAS} from '../../src/lib/stack-groups';

/* "Everything else" under the stack plates: closed by default so the section stays short, with the tools still in the page. */
const section = (page: Page) => page.locator('#stack');
const toggle = (page: Page) => section(page).locator('summary');
const TOOL_COUNT = STACK_EXTRAS.reduce((total, group) => total + group.tools.length, 0);
const hiddenTool = (page: Page) => section(page).getByText(STACK_EXTRAS[0].tools[0], {exact: true});
const listHeight = (page: Page) =>
  section(page)
    .locator('details')
    .evaluate((el) => Math.round(el.getBoundingClientRect().height));
const rulerAnimations = (page: Page) =>
  page.evaluate(() => document.getAnimations().filter((a) => a instanceof CSSAnimation && a.animationName.startsWith('stack-ruler')).length);

test('the rest of the stack starts closed but stays in the page', async ({page}) => {
  await page.goto('/');
  await expect(hiddenTool(page)).toBeAttached();
  await expect(hiddenTool(page)).toBeHidden();
  await expect(section(page).getByText(`Show ${TOOL_COUNT} more tools`)).toBeVisible();
});

test('the toggle opens and closes the list', async ({page}) => {
  await page.goto('/');
  await toggle(page).scrollIntoViewIfNeeded();
  await toggle(page).click();
  await expect(hiddenTool(page)).toBeVisible();
  await expect(section(page).getByText(`Hide ${TOOL_COUNT} tools`)).toBeVisible();
  // Both labels stay in the pill to hold its width, so only one may be painted at a time
  await expect(section(page).getByText(`Show ${TOOL_COUNT} more tools`)).toBeHidden();

  await toggle(page).click();
  await expect(hiddenTool(page)).toBeHidden();
  await expect(section(page).getByText(`Show ${TOOL_COUNT} more tools`)).toBeVisible();
  await expect(section(page).getByText(`Hide ${TOOL_COUNT} tools`)).toBeHidden();
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

  // A height read straight after the click is the final one only if nothing is gliding
  test('the list opens and closes at once, with nothing animating', async ({page}) => {
    await page.goto('/');
    const closedHeight = await listHeight(page);

    await toggle(page).click();
    const openHeight = await listHeight(page);
    expect(openHeight).toBeGreaterThan(closedHeight);
    await expect(hiddenTool(page)).toBeVisible();
    expect(await rulerAnimations(page)).toBe(0);
    await page.waitForTimeout(700);
    expect(await listHeight(page)).toBe(openHeight);

    await toggle(page).click();
    expect(await listHeight(page)).toBe(closedHeight);
    expect(await rulerAnimations(page)).toBe(0);
  });
});
