import {expect, type Page, test} from '@playwright/test';

/*
 * The milestones stage. With JS and motion allowed it pins while the page scrolls past and plays one milestone at a
 * time, with a rail of jump buttons; without JS or under reduced motion the same milestones show as a static list.
 * Both layouts are server-rendered and CSS picks one, so the section's height never changes after hydration.
 */

// From the seed, in order
const MILESTONES = [
  {value: '15+', title: 'Years on the web', count: '15'},
  {value: '6', title: 'Developers led', count: '6'},
  {value: 'CMS', title: 'Headless CMS on Builder.io'},
  {value: '40+', title: 'Client sites managed', count: '40'},
  {value: 'VPS', title: 'Self-hosted infrastructure'},
];

// The slide on show (data-active only marks one that plays its entrance)
const activeSlide = (page: Page) => page.locator('#milestones .ms-slide[data-shown]');

/** Scrolls to the middle of milestone `index`'s stretch of the pinned track. Instant, or smooth scrolling lags behind. */
const scrollToMilestone = (page: Page, index: number) =>
  page.evaluate(
    ({index, count}) => {
      const track = document.querySelector<HTMLElement>('#milestones .ms-track');
      const sticky = track?.firstElementChild;
      if (!track || !(sticky instanceof HTMLElement)) throw new Error('No pinned track');
      const top = track.getBoundingClientRect().top + window.scrollY;
      const distance = track.offsetHeight - sticky.offsetHeight;
      window.scrollTo({top: top + (distance * (index + 0.5)) / count, behavior: 'instant'});
    },
    {index, count: MILESTONES.length},
  );

test('scrolling through the stage plays each milestone in order, and numbers count up to their value', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('#milestones .ms-static')).toBeHidden();
  for (const [index, milestone] of MILESTONES.entries()) {
    await scrollToMilestone(page, index);
    await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(milestone.title);
    await expect(page.getByRole('button', {name: `${milestone.value} ${milestone.title}`})).toHaveAttribute('aria-current', 'step');
    if (milestone.count) await expect(activeSlide(page).locator('.ms-count')).toHaveText(milestone.count);
  }
});

test('the rail buttons jump to their milestone', async ({page}) => {
  await page.goto('/');
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
  await page.goto('/');
  await scrollToMilestone(page, 0);
  await expect(activeSlide(page).getByRole('heading', {level: 3})).toHaveText(MILESTONES[0].title);
  await activeSlide(page)
    .locator('h3 + p')
    .evaluate((p, text) => {
      p.textContent = text;
    }, LONG_DESCRIPTION);
  await expect.poll(() => stageOverflow(page)).toBe(0);
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
  await page.goto('/');
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
