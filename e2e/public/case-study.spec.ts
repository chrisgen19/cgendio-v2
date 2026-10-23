import {expect, test} from '@playwright/test';

test('a home page card opens its case study', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: /^View case study\s*: Edge redirect architecture$/}).click();

  await expect(page).toHaveURL(/\/work\/edge-redirect-architecture$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Edge redirect architecture');
  await expect(page.getByRole('link', {name: /Next project/})).toBeVisible();
});
