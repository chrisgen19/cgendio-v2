import {expect, test} from '@playwright/test';
import {projects} from '../../prisma/seed-data/projects';
import {escapeRegExp} from '../support/regexp';
import {NO_TOUR_SLUG} from '../support/test-env';

const ACCESS_HIRE = projects.find(({slug}) => slug === 'access-hire');
if (!ACCESS_HIRE) throw new Error('No seeded access-hire project');

test('a home page card opens its case study', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: new RegExp(`^View case study\\s*: ${escapeRegExp(ACCESS_HIRE.title)}$`)}).click();

  await expect(page).toHaveURL(/\/projects\/access-hire$/);
  await expect(page.getByRole('heading', {level: 1})).toHaveText(ACCESS_HIRE.title);
  await expect(page.getByRole('definition').filter({hasText: ACCESS_HIRE.role ?? ''})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Built'})).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Next project'}).getByRole('link')).toBeVisible();
});

test('a case study without a tour shows its cover', async ({page}) => {
  await page.goto(`/projects/${NO_TOUR_SLUG}`);
  // The cover is decorative (empty alt); e2e swaps the seeded r2.dev URL for a local fixture
  await expect(page.getByRole('main').locator('article img[src^="data:image/png"]')).toBeVisible();
});
