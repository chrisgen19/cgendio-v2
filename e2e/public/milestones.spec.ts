import {expect, type Page, test} from '@playwright/test';
import {milestones} from '../../prisma/seed-data/milestones';
import {parseCountedValue} from '../../src/lib/milestone-value';

/*
 * The milestones stage. With JS and motion allowed it pins while the page scrolls past and plays one milestone at a
 * time, with a rail of jump buttons; without JS or under reduced motion the same milestones show as a static list.
 * Both layouts are server-rendered and CSS picks one, so the section's height never changes after hydration.
 */

// From the seed, in order. A counted value ends on its number ("15+" counts up to 15); a word value has no count.
const MILESTONES = milestones.map(({value, title}) => ({value, title, count: parseCountedValue(value)?.to.toString()}));

// The slide on show (data-active only marks one that plays its entrance)
const activeSlide = (page: Page) => page.locator('#milestones .ms-slide[data-shown]');

/**
 * Loads the home page and waits for the stage's client code. The server renders the first milestone shown, so its
 * title showing proves nothing; loaded at the top, the hydrated stage hides it until the reader reaches the stage. Text
 * a test puts in the page before hydration would be thrown away by it.
 */
const gotoHydrated = async (page: Page) => {
  await page.goto('/');
  await expect(page.locator('#milestones .ms-slide[data-shown]')).toHaveCount(0);
};

/** Scrolls to the middle of milestone `index`'s stretch of the pinned track. Instant, or smooth scrolling lags behind. */
const scrollToMilestone = (page: Page, index: number) =>
  page.evaluate(
    ({index, count}) => {
      const track = document.querySelector<HTMLElement>('#milestones .ms-track');
      const panel = track?.querySelector<HTMLElement>('.ms-panel');
      if (!track || !panel) throw new Error('No pinned track');
      // The scroll position where the pin starts (the panel's top at its pin line), then the middle of the stretch
      const start = track.getBoundingClientRect().top + window.scrollY - Number.parseFloat(getComputedStyle(panel).top);
      const distance = track.offsetHeight - panel.offsetHeight;
      window.scrollTo({top: start + (distance * (index + 0.5)) / count, behavior: 'instant'});
    },
    {index, count: MILESTONES.length},
  );

test('scrolling through the stage plays each milestone in order, and numbers count up to their value', async ({page}) => {
  await gotoHydrated(page);
  await expect(page.locator('#milestones .ms-static')).toBeHidden();
  for (const [index, milestone] of MILESTONES.entries()) {
    await scrollToMilestone(page, index);
    await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(milestone.title);
    await expect(page.getByRole('button', {name: `${milestone.value} ${milestone.title}`})).toHaveAttribute('aria-current', 'step');
    if (milestone.count) await expect(activeSlide(page).locator('.ms-count')).toHaveText(milestone.count);
  }
});

test('the rail buttons jump to their milestone', async ({page}) => {
  await gotoHydrated(page);
  await scrollToMilestone(page, 0);
  await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(MILESTONES[0].title);
  const target = MILESTONES[3];
  await page.getByRole('button', {name: `${target.value} ${target.title}`}).click();
  await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(target.title);
});

test('the section is its final height before hydration', async ({page}) => {
  // The pinned track's height comes from server CSS, so a hash link to a later section never lands short
  await page.route('**/*.js', (route) => route.abort());
  await page.goto('/');
  const before = await page.locator('#milestones').evaluate((el) => el.getBoundingClientRect().height);
  await page.unroute('**/*.js');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const after = await page.locator('#milestones').evaluate((el) => el.getBoundingClientRect().height);
  expect(after).toBeCloseTo(before, 0);
});

test('without its JS bundle the stage still shows the first milestone', async ({page}) => {
  // Scripting is on, so CSS picks the pinned stage, but the client code never runs
  await page.route('**/*.js', (route) => route.abort());
  await page.goto('/');
  const shown = activeSlide(page);
  await expect(shown).toHaveCount(1);
  await expect(shown.getByRole('heading', {level: 3})).toHaveText(MILESTONES[0].title);
  expect(await shown.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

// The admin's limit for a description
const LONG_DESCRIPTION = 'Planned, built and maintained sites for clients across several industries. '.repeat(6).slice(0, 400);

/** How far the shown slide's text runs past the slide list, the list into the rail, or the panel out of the viewport (0 when it all fits). */
const stageOverflow = (page: Page) =>
  page.evaluate(() => {
    const panel = document.querySelector('#milestones .ms-panel');
    const list = panel?.querySelector('ol');
    const rail = panel?.querySelector('[aria-label="Jump to a milestone"]');
    const description = list?.querySelector('[data-shown] h3 + p');
    if (!panel || !list || !rail || !description) return Number.POSITIVE_INFINITY;
    const p = panel.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    // A list that scrolls holds its text even when the text runs past its box
    const textOver = getComputedStyle(list).overflowY === 'auto' ? 0 : description.getBoundingClientRect().bottom - l.bottom;
    return Math.max(0, textOver, l.bottom - rail.getBoundingClientRect().top, p.bottom - window.innerHeight, -p.top);
  });

test('a description at the admin limit stays inside the pinned panel', async ({page}) => {
  await gotoHydrated(page);
  await scrollToMilestone(page, 0);
  await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(MILESTONES[0].title);
  await activeSlide(page)
    .locator('h3 + p')
    .evaluate((p, text) => {
      p.textContent = text;
    }, LONG_DESCRIPTION);
  await expect.poll(() => stageOverflow(page)).toBe(0);
});

/** Serves the home page with the seeded "Developers led" description swapped for one at the admin limit, in both the
 * HTML and the RSC payload inside it, so the server renders the long text and hydration agrees with it. */
const serveLongDescription = (page: Page) =>
  page.route(
    (url) => url.pathname === '/',
    async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replaceAll(milestones[1].description, LONG_DESCRIPTION);
      await route.fulfill({response, body});
    },
  );

const sectionAndPanel = (page: Page) =>
  page.evaluate(() => {
    const section = document.getElementById('milestones');
    const panel = section?.querySelector<HTMLElement>('.ms-panel');
    if (!section || !panel) throw new Error('No stage');
    return {section: section.getBoundingClientRect().height, panel: panel.offsetHeight, design: Number.parseFloat(getComputedStyle(panel).minHeight)};
  });

// A phone width, where the description wraps enough to grow the panel past its design height
test.describe('on a phone', () => {
  test.use({viewport: {width: 390, height: 844}});

  test('long admin text sets the section height in CSS, so it never changes after hydration', async ({page}) => {
    await serveLongDescription(page);
    // Before hydration: scripting is on, so CSS picks the pinned stage, but the client code never runs
    await page.route('**/*.js', (route) => route.abort());
    await page.goto('/');
    const before = await sectionAndPanel(page);
    // The long text really did make the panel taller than its design height, or this test proves nothing
    expect(before.panel).toBeGreaterThan(before.design);
    await page.unroute('**/*.js');
    await page.goto('/');
    // Hydrated: loaded at the top, the stage hides its first milestone until the reader reaches it
    await expect(page.locator('#milestones .ms-slide[data-shown]')).toHaveCount(0);
    const after = await sectionAndPanel(page);
    expect(after.panel).toBeCloseTo(before.panel, 0);
    expect(after.section).toBeCloseTo(before.section, 0);
  });
});

test.describe('on the shortest window that still pins', () => {
  test.use({viewport: {width: 320, height: 600}});

  test('a short milestone after a long one shows in full, scrolled to its top', async ({page}) => {
    await gotoHydrated(page);
    await scrollToMilestone(page, 0);
    await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(MILESTONES[0].title);
    // Admin text near the limits: too tall for the tallest panel this window allows, so the list scrolls
    await activeSlide(page).evaluate((slide, text) => {
      const title = slide.querySelector('h3');
      const description = slide.querySelector('h3 + p');
      if (!title || !description) throw new Error('No slide text');
      title.textContent = 'Headless CMS builds, WordPress and WooCommerce sites, and React apps for lead and UTM tracking for clients';
      description.textContent = text;
    }, LONG_DESCRIPTION);
    const list = page.locator('#milestones .ms-panel ol');
    await expect(list).toHaveAttribute('data-overflow');
    // Leave the long milestone scrolled to its end, then move on
    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await scrollToMilestone(page, 1);
    await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(MILESTONES[1].title);
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBe(0);
    const titleInView = await page.evaluate(() => {
      const list = document.querySelector('#milestones .ms-panel ol');
      const title = list?.querySelector('[data-shown] h3');
      if (!list || !title) return false;
      const l = list.getBoundingClientRect();
      const t = title.getBoundingClientRect();
      return t.top >= l.top && t.bottom <= l.bottom;
    });
    expect(titleInView).toBe(true);
  });
});

/*
 * Admin values longer than the seeded ones: the admin hint suggests "Nov ’25", a 9-digit number is the longest that
 * counts, and W-heavy words outrun the CSS estimate until MilestoneFit measures them
 */
const LONG_VALUES = ['Nov ’25', 'Q3 2025', 'Launch', '999999999+', 'WWWWWWWW', 'WOW', 'WOOCOMMERCE'];

/** How far a value pokes past its column, and the page past the viewport (0 when it fits). */
const overflow = (page: Page, selector: string) =>
  page.evaluate((selector) => {
    const value = document.querySelector<HTMLElement>(selector);
    const column = value?.parentElement;
    if (!value || !column) return Number.POSITIVE_INFINITY;
    const valueOver = value.getBoundingClientRect().right - column.getBoundingClientRect().right;
    const pageOver = document.documentElement.scrollWidth - window.innerWidth;
    return Math.max(0, valueOver, pageOver);
  }, selector);

/** Puts `value` in the CMS milestone's value, with the length the server would have set; MilestoneFit refits on the size change. */
const setValue = (page: Page, selector: string, value: string) =>
  page.evaluate(
    ({selector, value}) => {
      const p = document.querySelector<HTMLElement>(selector);
      if (!p) throw new Error(`No value at ${selector}`);
      for (const el of p.querySelectorAll('.sr-only, [aria-hidden] > span')) el.textContent = value;
      if (!p.querySelector('.sr-only')) p.textContent = value;
      p.style.setProperty('--ms-chars', String(Math.max(2, [...value].length)));
    },
    {selector, value},
  );

test('long values shrink to fit the stage instead of scrolling the page sideways', async ({page}) => {
  await gotoHydrated(page);
  await scrollToMilestone(page, 2);
  const selector = '#milestones .ms-slide:nth-child(3) .ms-stage-value';
  for (const value of LONG_VALUES) {
    await setValue(page, selector, value);
    await expect.poll(() => overflow(page, selector), {message: value}).toBe(0);
  }
});

test.describe('with reduced motion', () => {
  test.use({reducedMotion: 'reduce'});

  test('the milestones show as a static list, each value once', async ({page}) => {
    await page.goto('/');
    const section = page.locator('#milestones');
    await expect(section.locator('.ms-track')).toBeHidden();
    const list = section.locator('.ms-static');
    await expect(list.getByRole('heading', {level: 3})).toHaveText(MILESTONES.map((m) => m.title));
    await expect(list.locator('.ms-list-value')).toHaveText(MILESTONES.map((m) => m.value));
  });

  test('long values shrink to fit the list instead of scrolling the page sideways', async ({page}) => {
    await page.goto('/');
    const selector = '#milestones .ms-static li:nth-child(3) .ms-list-value';
    for (const value of LONG_VALUES) {
      await setValue(page, selector, value);
      await expect.poll(() => overflow(page, selector), {message: value}).toBe(0);
    }
  });
});

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled: false});

  test('the milestones show as a static list', async ({page}) => {
    await page.goto('/');
    const section = page.locator('#milestones');
    await expect(section.locator('.ms-track')).toBeHidden();
    await expect(section.locator('.ms-static').getByRole('heading', {level: 3})).toHaveText(MILESTONES.map((m) => m.title));
  });
});
