import {expect, type Page, test} from '@playwright/test';

/* The seed has six client projects and three personal ones. */

const filters = (page: Page) => page.getByRole('navigation', {name: 'Filter projects'});
const visibleCards = (page: Page, group?: 'client' | 'personal') =>
  page.locator(`#work article${group ? `[data-group="${group}"]` : ''}`).locator('visible=true');

const expectFilter = async (page: Page, label: string, counts: {client: number; personal: number}) => {
  await expect(filters(page).getByRole('link', {name: label})).toHaveAttribute('aria-current', 'true');
  await expect(visibleCards(page, 'client')).toHaveCount(counts.client);
  await expect(visibleCards(page, 'personal')).toHaveCount(counts.personal);
};

test('the filter changes the cards and the URL', async ({page}) => {
  await page.goto('/');
  await expectFilter(page, 'All', {client: 6, personal: 3});

  await filters(page).getByRole('link', {name: 'Client work'}).click();
  await expect(page).toHaveURL(/\/\?filter=client$/);
  await expectFilter(page, 'Client work', {client: 6, personal: 0});

  await filters(page).getByRole('link', {name: 'Personal'}).click();
  await expect(page).toHaveURL(/\/\?filter=personal$/);
  await expectFilter(page, 'Personal', {client: 0, personal: 3});

  await filters(page).getByRole('link', {name: 'All'}).click();
  await expect(page).toHaveURL(/\/$/);
  await expectFilter(page, 'All', {client: 6, personal: 3});
});

test('a shared filter URL opens filtered', async ({page}) => {
  await page.goto('/?filter=personal');
  await expectFilter(page, 'Personal', {client: 0, personal: 3});
});

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled: false});

  test('the filter pills are links to prerendered pages', async ({page}) => {
    await page.goto('/');
    await expectFilter(page, 'All', {client: 6, personal: 3});

    await filters(page).getByRole('link', {name: 'Client work'}).click();
    await expect(page).toHaveURL(/\/\?filter=client#work$/);
    await expectFilter(page, 'Client work', {client: 6, personal: 0});

    await filters(page).getByRole('link', {name: 'Personal'}).click();
    await expect(page).toHaveURL(/\/\?filter=personal#work$/);
    await expectFilter(page, 'Personal', {client: 0, personal: 3});
  });
});
