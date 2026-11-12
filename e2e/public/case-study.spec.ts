import {expect, test} from '@playwright/test';
import {NO_TOUR_SLUG} from '../support/test-env';

test('a home page card opens its case study', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: /^View case study\s*: Access Hire Australia$/}).click();

  await expect(page).toHaveURL(/\/projects\/access-hire$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
  await expect(page.getByRole('definition').filter({hasText: 'Senior Full Stack Developer, Access Group Australia'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Built'})).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Next project'}).getByRole('link')).toBeVisible();
});

test('a case study without a tour shows its cover', async ({page}) => {
  await page.goto(`/projects/${NO_TOUR_SLUG}`);
  // The cover is decorative (empty alt); e2e swaps the seeded R2 URL for a local fixture
  await expect(page.getByRole('main').locator('article img[src^="data:image/png"]')).toBeVisible();
});
