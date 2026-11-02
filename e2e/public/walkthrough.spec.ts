import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, type Page, test} from '@playwright/test';

/*
 * The Walkthrough, on the seeded Access Hire tour. The captures live on R2, so requests for them get the local fixture
 * and the spec stays offline. Changes to the row go through the admin, in e2e/admin/tour.spec.ts.
 */
const FIXTURE = readFileSync(join(__dirname, '../support/fixtures/about-photo.png'));

const main = (page: Page) => page.locator('main:visible');
const frame = (page: Page) => main(page).getByRole('figure', {name: 'The live site, in a browser'});

test.beforeEach(async ({page}) => {
  await page.route(
    (url) => decodeURIComponent(url.href).includes('access-hire-tour'),
    (route) => route.fulfill({body: FIXTURE, contentType: 'image/png'}),
  );
});

test('Access Hire opens on the frame with its facts in view', async ({page}) => {
  await page.goto('/work/access-hire');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
  await expect(frame(page)).toBeVisible();
  await expect(main(page).getByRole('definition').filter({hasText: 'Senior Full Stack Developer'})).toBeVisible();
  await expect(main(page).getByRole('link', {name: 'Live site', exact: true})).toHaveAttribute('href', 'https://www.accesshire.net/');
});

test('the opening stop shows in the frame but has no note of its own', async ({page}) => {
  await page.goto('/work/access-hire');
  await expect(main(page).locator('[data-stop]')).toHaveCount(7);
  await expect(frame(page).getByText('Brand banner').first()).toBeAttached();
});

test('the address bar follows the note on the reading line', async ({page}) => {
  await page.goto('/work/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Category page'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(frame(page)).toContainText('/category/scissor-lift');
});

test('stops that share a page stay on one layer of the frame', async ({page}) => {
  await page.goto('/work/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Services'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(frame(page)).toContainText('/credit-application');
  const active = frame(page).locator('[data-state="active"]:visible');
  await expect(active).toHaveCount(1);
  await expect(active.getByText('Services', {exact: true})).toBeAttached();
  await expect(active.getByText("What you'll need", {exact: true})).toBeAttached();
});

test('the device switch changes the frame', async ({page}, testInfo) => {
  await page.goto('/work/access-hire');
  const target = testInfo.project.name === 'mobile' ? 'desktop' : 'mobile';
  await frame(page)
    .getByRole('button', {name: target === 'mobile' ? 'Mobile' : 'Desktop'})
    .click();
  await expect(main(page).locator(`[data-device="${target}"]`)).toBeAttached();
  await expect(frame(page).locator(`[data-layer="${target}"][data-state="active"]`)).toBeVisible();
});

test('the write-up shows and empty reasoning stays hidden', async ({page}) => {
  await page.goto('/work/access-hire');
  await expect(page.getByRole('heading', {level: 2, name: 'Built'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Why we built it this way'})).toHaveCount(0);
});

test('the next project and contact sections follow the tour', async ({page}) => {
  await page.goto('/work/access-hire');
  await expect(page.getByRole('link', {name: /Next project/})).toBeVisible();
  await expect(main(page).locator('#contact')).toBeVisible();
});

test.describe('reduced motion', () => {
  test.use({reducedMotion: 'reduce'});

  test('each note shows its own capture instead of the pinned frame', async ({page}) => {
    await page.goto('/work/access-hire');
    await expect(frame(page)).toBeHidden();
    await expect(page.getByRole('img', {name: /scissor lift category page/}).first()).toBeVisible();
  });
});

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled: false});

  test('each note shows its own capture and the switch is gone', async ({page}) => {
    await page.goto('/work/access-hire');
    await expect(page.getByRole('heading', {level: 3, name: 'Branch finder'})).toBeVisible();
    await expect(page.getByRole('img', {name: /branch finder/}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Mobile'})).toBeHidden();
  });
});

test('a project without a tour keeps the current layout', async ({page}) => {
  await page.goto('/work/myimprov');
  await expect(frame(page)).toHaveCount(0);
  await expect(main(page).getByRole('term').filter({hasText: 'Client'})).toBeVisible();
  await expect(main(page).locator('article img[src^="data:image/png"]')).toBeVisible();
});
