import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, type Page, test} from '@playwright/test';
import {NO_TOUR_SLUG} from '../support/test-env';

/*
 * The Walkthrough, on the seeded Access Hire tour. The captures live on R2, so requests for them get the local fixture
 * and the spec stays offline. Changes to the row go through the admin, in e2e/admin/tour.spec.ts.
 */
const FIXTURE = readFileSync(join(__dirname, '../support/fixtures/about-photo.png'));

const main = (page: Page) => page.locator('main:visible');
const frame = (page: Page) => main(page).getByRole('figure', {name: 'The live site, in a browser'});

test.beforeEach(async ({page}) => {
  await page.route(
    (url) => /(access-hire|myimprov|merthyr-village|experience-sunnybank|fresh-fruit)-tour/.test(decodeURIComponent(url.href)),
    (route) => route.fulfill({body: FIXTURE, contentType: 'image/png'}),
  );
});

test('Access Hire opens on the frame with its facts in view', async ({page}) => {
  await page.goto('/projects/access-hire');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
  await expect(frame(page)).toBeVisible();
  await expect(main(page).getByRole('definition').filter({hasText: 'Senior Full Stack Developer'})).toBeVisible();
  await expect(main(page).getByRole('link', {name: 'Live site', exact: true})).toHaveAttribute('href', 'https://www.accesshire.net/');
});

test('the opening stop shows in the frame but has no note of its own', async ({page}) => {
  await page.goto('/projects/access-hire');
  await expect(main(page).locator('[data-stop]')).toHaveCount(7);
  await expect(frame(page).getByText('Brand banner').first()).toBeAttached();
});

test('the address bar follows the note on the reading line', async ({page}) => {
  await page.goto('/projects/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Category page'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(frame(page)).toContainText('/category/scissor-lift');
});

test('stops that share a page stay on one layer of the frame', async ({page}) => {
  await page.goto('/projects/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Services'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(frame(page)).toContainText('/credit-application');
  const active = frame(page).locator('[data-state="active"]:visible');
  await expect(active).toHaveCount(1);
  await expect(active.locator('[data-on]').getByText('Services', {exact: true})).toBeAttached();
  await expect(active.getByText("What you'll need", {exact: true})).toBeAttached();
});

test('the address bar link meets the 44px touch target', async ({page}) => {
  await page.goto('/projects/access-hire');
  const box = await frame(page)
    .getByRole('link', {name: /on the live site/})
    .boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test('only the visible device downloads its first capture', async ({page}, testInfo) => {
  const hidden = testInfo.project.name === 'mobile' ? 'home-desktop' : 'home-mobile';
  const shown = testInfo.project.name === 'mobile' ? 'home-mobile' : 'home-desktop';
  const requested: string[] = [];
  page.on('request', (request) => requested.push(decodeURIComponent(request.url())));
  await page.goto('/projects/access-hire');
  await expect.poll(() => requested.some((url) => url.includes(shown))).toBe(true);
  await page.waitForLoadState('networkidle');
  expect(requested.filter((url) => url.includes(hidden))).toEqual([]);
});

test('the device switch changes the frame', async ({page}, testInfo) => {
  await page.goto('/projects/access-hire');
  const target = testInfo.project.name === 'mobile' ? 'desktop' : 'mobile';
  await frame(page)
    .getByRole('button', {name: target === 'mobile' ? 'Mobile' : 'Desktop'})
    .click();
  await expect(main(page).locator(`[data-device="${target}"]`)).toBeAttached();
  await expect(frame(page).locator(`[data-layer="${target}"][data-state="active"]`)).toBeVisible();
});

test('the write-up shows and empty reasoning stays hidden', async ({page}) => {
  await page.goto('/projects/access-hire');
  await expect(page.getByRole('heading', {level: 2, name: 'The short version'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Built'})).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Write-up sections'}).getByRole('link', {name: 'Built'})).toBeVisible();
  for (const label of ['The decision', 'My part', 'The result']) {
    await expect(page.getByRole('heading', {name: label})).toHaveCount(0);
  }
});

test.describe('on a tall desktop viewport', () => {
  // At 1000px tall, a reading line at 30% of the viewport sat below these short chapters, so a jump link marked the next one
  test.use({viewport: {width: 1440, height: 1000}});

  test('each write-up jump link marks the chapter it jumps to', async ({page}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'The desktop index; the viewport is set above');
    for (const slug of ['access-hire', 'fresh-fruit-and-veg']) {
      await page.goto(`/projects/${slug}`);
      const links = page.getByRole('navigation', {name: 'Write-up sections'}).getByRole('link');
      const count = await links.count();
      expect(count).toBeGreaterThan(1);
      for (let index = 0; index < count; index += 1) {
        const link = links.nth(index);
        const id = ((await link.getAttribute('href')) ?? '').slice(1);
        await link.click();
        // Check once the smooth scroll has landed the chapter at its scroll margin: mid-scroll the right link can flash current
        await page.waitForFunction((target) => {
          const chapter = document.getElementById(target);
          if (!chapter) return false;
          return Math.abs(chapter.getBoundingClientRect().top - Number.parseFloat(getComputedStyle(chapter).scrollMarginTop)) < 2;
        }, id);
        await expect(link).toHaveAttribute('aria-current', 'true');
      }
    }
  });
});

test('the next project and contact sections follow the tour', async ({page}) => {
  await page.goto('/projects/access-hire');
  await expect(page.getByRole('navigation', {name: 'Next project'}).getByRole('link')).toHaveAttribute('href', /^\/work\/[a-z0-9-]+$/);
  await expect(main(page).locator('#contact')).toBeVisible();
});

test.describe('reduced motion', () => {
  test.use({reducedMotion: 'reduce'});

  test('each note shows its own capture instead of the pinned frame', async ({page}) => {
    await page.goto('/projects/access-hire');
    await expect(frame(page)).toBeHidden();
    await expect(page.getByRole('img', {name: /scissor lift category page/}).first()).toBeVisible();
  });
});

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled: false});

  test('each note shows its own capture and the switch is gone', async ({page}) => {
    await page.goto('/projects/access-hire');
    await expect(page.getByRole('heading', {level: 3, name: 'Branch finder'})).toBeVisible();
    await expect(page.getByRole('img', {name: /branch finder/}).first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Mobile'})).toBeHidden();
  });
});

test('a project without a tour keeps the current layout', async ({page}) => {
  await page.goto(`/projects/${NO_TOUR_SLUG}`);
  await expect(frame(page)).toHaveCount(0);
  await expect(main(page).getByRole('term').filter({hasText: 'Client'})).toBeVisible();
  await expect(main(page).locator('article img[src^="data:image/png"]')).toBeVisible();
});

test('a stop on a subdomain shows and links to its own address', async ({page}) => {
  await page.goto('/projects/myimprov');
  await page.getByRole('heading', {level: 3, name: 'Student login'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(frame(page)).toContainText('courses.myimprov.com');
  await expect(frame(page).getByRole('link', {name: /on the live site/})).toHaveAttribute('href', 'https://courses.myimprov.com/');
  await expect(
    main(page)
      .getByRole('link', {name: /open Student login/})
      .last(),
  ).toHaveAttribute('href', 'https://courses.myimprov.com/');
});

test('MyImprov shows a note for each stop after its opening, including two states', async ({page}) => {
  await page.goto('/projects/myimprov');
  await expect(main(page).locator('[data-stop]')).toHaveCount(6);
  await expect(page.getByRole('heading', {level: 3, name: 'California'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Texas'})).toBeVisible();
});

test('Merthyr Village shows a note for each stop after its opening', async ({page}) => {
  await page.goto('/projects/merthyr-village');
  await expect(frame(page)).toBeVisible();
  await expect(main(page).locator('[data-stop]')).toHaveCount(4);
  await expect(page.getByRole('heading', {level: 3, name: 'Tenant page'})).toBeVisible();
});

test('Experience Sunnybank shows a note for each stop after its opening', async ({page}) => {
  await page.goto('/projects/experience-sunnybank');
  await expect(frame(page)).toBeVisible();
  await expect(main(page).locator('[data-stop]')).toHaveCount(5);
  await expect(page.getByRole('heading', {level: 3, name: 'Specialty stores'})).toBeVisible();
});

test('Fresh Fruit and Veg Shop shows a note for each stop after its opening', async ({page}) => {
  await page.goto('/projects/fresh-fruit-and-veg');
  await expect(frame(page)).toBeVisible();
  await expect(main(page).locator('[data-stop]')).toHaveCount(3);
  await expect(page.getByRole('heading', {level: 3, name: 'Office boxes'})).toBeVisible();
});
