import {expect, test} from '@playwright/test';

test('a home page card opens its case study', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: /^View case study\s*: Access Hire Australia$/}).click();

  await expect(page).toHaveURL(/\/work\/access-hire$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
  await expect(page.getByRole('definition').filter({hasText: 'Senior Full Stack Developer, Access Group Australia'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'Built'})).toBeVisible();
  // The cover is decorative (empty alt); e2e swaps the seeded r2.dev URL for a local fixture. Scoped to the visible main:
  // the home page stays in the DOM, hidden, after the client-side navigation, and its cards show the same fixture
  await expect(page.getByRole('main').locator('article img[src^="data:image/png"]')).toBeVisible();
  await expect(page.getByRole('link', {name: /Next project/})).toBeVisible();
});
