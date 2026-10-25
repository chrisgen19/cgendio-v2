import {expect, type Page, test} from '@playwright/test';

/* The Work cards pin and stack: each card sticks one step lower than the card before it among the visible cards. */

const cards = (page: Page) => page.locator('#work article.work-card').locator('visible=true');

/** The sticky `top` of every visible card, in px. */
const stickyTops = (page: Page) => cards(page).evaluateAll((els) => els.map((el) => Number.parseFloat(getComputedStyle(el).top)));

const expectEvenSteps = (tops: number[]) => {
  const step = tops[1] - tops[0];
  expect(step).toBeGreaterThan(0);
  expect(tops).toEqual(tops.map((_, n) => expect.closeTo(tops[0] + n * step, 1)));
};

test('cards stick one step below the card before them', async ({page}) => {
  await page.goto('/');
  const tops = await stickyTops(page);
  expect(tops).toHaveLength(9);
  expectEvenSteps(tops);

  // Scroll until the third card has reached its sticky spot: the first three now sit stacked at their offsets
  await cards(page).nth(2).scrollIntoViewIfNeeded();
  await page.evaluate(async (top) => {
    const card = document.querySelectorAll('#work article.work-card')[2];
    // Instant, or the page's smooth scrolling is still under way when the cards are measured
    window.scrollBy({top: card.getBoundingClientRect().top - top + 1, behavior: 'instant'});
    await new Promise(requestAnimationFrame);
  }, tops[2]);
  for (const n of [0, 1, 2]) {
    const box = await cards(page).nth(n).boundingBox();
    expect(box?.y).toBeCloseTo(tops[n], 0);
  }
});

test('a filter restacks the cards it shows without gaps', async ({page}) => {
  await page.goto('/');
  await page.getByRole('navigation', {name: 'Filter projects'}).getByRole('link', {name: 'Personal'}).click();
  const tops = await stickyTops(page);
  expect(tops).toHaveLength(3);
  expectEvenSteps(tops);
  // The first personal card takes the first spot, as the first card does under All
  await page.getByRole('navigation', {name: 'Filter projects'}).getByRole('link', {name: 'All'}).click();
  expect((await stickyTops(page))[0]).toBe(tops[0]);
});

test.describe('on short screens', () => {
  // Just above the phone layout and barely tall enough to stack: the cards are at their smallest, so content must fit
  test('every case study link stays inside its card', async ({page}) => {
    await page.setViewportSize({width: 900, height: 560});
    await page.goto('/');
    // How far each link's bottom sits past its card's bottom; a missing link counts as clipped
    const overflow = await cards(page).evaluateAll((els) =>
      els.map((el) => {
        const link = el.querySelector('a[href^="/work/"]');
        return link ? link.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom : Number.POSITIVE_INFINITY;
      }),
    );
    expect(overflow).toHaveLength(9);
    expect(Math.max(...overflow)).toBeLessThanOrEqual(0);
  });

  // A phone in landscape drops the stacking; the cover's window is absolutely positioned, so it needs a height of its own
  test('covers keep their height when the stack falls back to plain flow', async ({page}) => {
    await page.setViewportSize({width: 740, height: 360});
    await page.goto('/');
    const heights = await page.locator('#work .work-media').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    expect(heights.length).toBeGreaterThan(0);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(240);
  });
});
