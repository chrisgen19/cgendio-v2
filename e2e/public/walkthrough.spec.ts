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

test('Access Hire opens on the frame with its facts in view', async ({page, isMobile}) => {
  await page.goto('/projects/access-hire');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
  await expect(frame(page)).toBeVisible();
  await expect(main(page).locator('.walkthrough-tour')).toHaveAttribute('data-device', isMobile ? 'mobile' : 'desktop');
  await expect(main(page).getByRole('definition').filter({hasText: 'Senior Full Stack Developer'})).toBeVisible();
  await expect(main(page).getByRole('link', {name: 'Live site', exact: true})).toHaveAttribute('href', 'https://www.accesshire.net/');
});

test('the layout shows its default frame before hydration without downloading the other device', async ({page, isMobile}) => {
  let release = () => {};
  const scripts = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/_next/static/**/*.js*', async (route) => {
    await scripts;
    await route.continue();
  });
  const requested: string[] = [];
  page.on('request', (request) => requested.push(decodeURIComponent(request.url())));
  try {
    await page.goto('/projects/access-hire', {waitUntil: 'domcontentloaded'});
    await expect(main(page).locator('.walkthrough-tour')).toHaveAttribute('data-device', 'responsive');
    const device = isMobile ? 'mobile' : 'desktop';
    const other = isMobile ? 'desktop' : 'mobile';
    await expect(frame(page).locator(`[data-layer="${device}"][data-state="active"]`)).toBeVisible();
    await expect(frame(page).locator(`[data-layer="${other}"][data-state="active"]`)).toBeHidden();
    await expect(frame(page).locator('.walkthrough-viewport')).toHaveCSS('border-top-width', isMobile ? '6px' : '0px');
    await expect.poll(() => requested.some((url) => url.includes(`home-${device}`))).toBe(true);
    expect(requested.filter((url) => url.includes(`-${other}.webp`))).toEqual([]);
  } finally {
    release();
  }
  await page.waitForLoadState('load');
  await expect(main(page).locator('.walkthrough-tour')).toHaveAttribute('data-device', isMobile ? 'mobile' : 'desktop');
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

// A long scroll or a jump can carry the reading line past the first note between two frames, so that note never crosses it (#81).
const OPENING_LINK = /: open Home page on the live site$/;
const jumpTo = (page: Page, top: number) => page.evaluate((y) => window.scrollTo({top: y, behavior: 'instant'}), top);

test('jumping back to the top from a note returns the frame to the opening stop', async ({page}) => {
  await page.goto('/projects/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Category page'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(frame(page)).toContainText('/category/scissor-lift');

  await jumpTo(page, 0);
  await expect(frame(page).getByRole('link', {name: OPENING_LINK})).toBeVisible();
  await expect(frame(page)).not.toContainText('/category/scissor-lift');
});

test('jumping back to the top from below the notes returns the frame to the opening stop', async ({page}) => {
  await page.goto('/projects/access-hire');
  await jumpTo(page, await page.evaluate(() => document.documentElement.scrollHeight));
  await expect(frame(page)).toContainText('/what-we-do/services');

  await jumpTo(page, 0);
  await expect(frame(page).getByRole('link', {name: OPENING_LINK})).toBeVisible();
});

test('jumping from the top to below the notes moves the frame to the last stop', async ({page}) => {
  await page.goto('/projects/access-hire');
  await expect(frame(page).getByRole('link', {name: OPENING_LINK})).toBeVisible();
  await jumpTo(page, await page.evaluate(() => document.documentElement.scrollHeight));
  await expect(frame(page)).toContainText('/what-we-do/services');
});

// The Services stop used to reuse the credit application capture, so it labelled itself with that page and linked there.
test('the Services stop points at the services page, not the credit application', async ({page}) => {
  await page.goto('/projects/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Services'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(frame(page)).toContainText('/what-we-do/services');
  await expect(frame(page)).not.toContainText('/credit-application');
});

// The opening stop and the Home page stop are both on '/', so the frame must hold one layer carrying both their boxes.
test('stops that share a page stay on one layer of the frame', async ({page}) => {
  await page.goto('/projects/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Home page'}).evaluate((heading) => {
    window.scrollTo({top: heading.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  const active = frame(page).locator('[data-state="active"]:visible');
  await expect(active).toHaveCount(1);
  await expect(active.locator('[data-on]').getByText('Equipment categories', {exact: true})).toBeAttached();
  await expect(active.getByText('Brand banner', {exact: true})).toBeAttached();
});

test('the address bar link meets the 44px touch target', async ({page}) => {
  await page.goto('/projects/access-hire');
  const box = await frame(page)
    .getByRole('link', {name: /on the live site/})
    .boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

// Once hydrated, only the layout default remains mounted; the responsive picture sources avoid extra downloads before it.
test('the layout default loads its captures and leaves the other device out of the page', async ({page, isMobile}) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(decodeURIComponent(request.url())));
  await page.goto('/projects/access-hire');
  const device = isMobile ? 'mobile' : 'desktop';
  await expect.poll(() => requested.some((url) => url.includes(`home-${device}`))).toBe(true);
  await expect(main(page).locator(`[data-layer="${isMobile ? 'desktop' : 'mobile'}"]`)).toHaveCount(0);
  if (!isMobile) {
    await page.waitForLoadState('networkidle');
    expect(requested.filter((url) => /-mobile\.webp/.test(url))).toEqual([]);
  }
});

test('the device switch changes the frame in both directions', async ({page, isMobile}) => {
  await page.goto('/projects/access-hire');
  const initial = isMobile ? 'mobile' : 'desktop';
  const other = isMobile ? 'desktop' : 'mobile';
  await expect(main(page).locator('.walkthrough-tour')).toHaveAttribute('data-device', initial);
  for (const device of [other, initial]) {
    await frame(page)
      .getByRole('button', {name: device === 'mobile' ? 'Mobile' : 'Desktop', exact: true})
      .click();
    await expect(frame(page).locator(`[data-layer="${device}"][data-state="active"]`)).toBeVisible();
    await expect(main(page).locator(`[data-layer="${device === 'mobile' ? 'desktop' : 'mobile'}"]`)).toHaveCount(0);
  }
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
  await expect(page.getByRole('navigation', {name: 'Next project'}).getByRole('link')).toHaveAttribute('href', /^\/projects\/[a-z0-9-]+$/);
  await expect(main(page).locator('#contact')).toBeVisible();
});

test.describe('reduced motion', () => {
  test.use({reducedMotion: 'reduce'});

  test('each note shows its own capture instead of the pinned frame', async ({page}) => {
    await page.goto('/projects/access-hire');
    await expect(frame(page)).toBeHidden();
    await expect(page.getByRole('img', {name: /scissor lift category page/}).first()).toBeVisible();
  });

  // The static captures take the device from the frame's own state, so the switch still moves them with the pinned frame gone
  test('the switch moves the static captures to the other device', async ({page, isMobile}) => {
    await page.goto('/projects/access-hire');
    const initial = isMobile ? 'mobile' : 'desktop';
    const other = isMobile ? 'desktop' : 'mobile';
    await expect(main(page).locator('.walkthrough-tour')).toHaveAttribute('data-device', initial);
    await expect(main(page).locator(`[data-layer="${other}"]`)).toHaveCount(0);
    await main(page)
      .getByRole('button', {name: isMobile ? 'Desktop' : 'Mobile', exact: true})
      .locator('visible=true')
      .click();
    await expect(main(page).locator(`figure.walkthrough-static-only [data-layer="${other}"]`).first()).toBeVisible();
    await expect(main(page).locator(`[data-layer="${initial}"]`)).toHaveCount(0);
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

  // Picture media queries must gate downloads even when the browser does not defer hidden lazy images (#142).
  test('the server markup shows and downloads the layout default without JavaScript', async ({page, isMobile}) => {
    const requested: string[] = [];
    page.on('request', (request) => requested.push(decodeURIComponent(request.url())));
    await page.goto('/projects/access-hire');
    const device = isMobile ? 'mobile' : 'desktop';
    const other = isMobile ? 'desktop' : 'mobile';
    await expect(main(page).locator('.walkthrough-tour')).toHaveAttribute('data-device', 'responsive');
    await expect(main(page).locator(`figure.walkthrough-static-only [data-layer="${device}"]`).first()).toBeVisible();
    for (const layer of await main(page).locator(`[data-layer="${other}"]`).all()) await expect(layer).toBeHidden();
    await expect.poll(() => requested.some((url) => url.includes(`-${device}.webp`))).toBe(true);
    await page.waitForLoadState('networkidle');
    expect(requested.filter((url) => url.includes(`-${other}.webp`))).toEqual([]);
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
