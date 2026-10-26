import {expect, type Page, test} from '@playwright/test';

/* The Work cards pin and stack: each card sticks one step lower than the card before it. */

const cards = (page: Page) => page.locator('#work article.work-card');

/** The sticky `top` of every card, in px. */
const stickyTops = (page: Page) => cards(page).evaluateAll((els) => els.map((el) => Number.parseFloat(getComputedStyle(el).top)));

const expectEvenSteps = (tops: number[]) => {
  const step = tops[1] - tops[0];
  expect(step).toBeGreaterThan(0);
  expect(tops).toEqual(tops.map((_, n) => expect.closeTo(tops[0] + n * step, 1)));
};

test('cards stick one step below the card before them', async ({page}) => {
  await page.goto('/');
  const tops = await stickyTops(page);
  expect(tops).toHaveLength(6);
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
    expect(overflow).toHaveLength(6);
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

// The admin allows a 160-character title and a 600-character summary: the card clamps them so it never outgrows the
// screen while stuck, and on phones the cover keeps its space instead of being squeezed out by the text
test('admin-length text keeps the card within the screen and the cover visible', async ({page}) => {
  await page.goto('/');
  // Edit only once React has hydrated: text changed before that is a hydration mismatch, and React swaps the card back
  // to the server's, mid-measurement on a busy machine. The theme button reads "Switch theme" until hydration is done.
  await expect(page.locator('button[aria-label^="Switch to"]')).toBeAttached();
  const card = cards(page).first();
  await card.evaluate((el) => {
    const words = (count: number) => Array.from({length: count}, () => 'Booking platform with payments and reports').join(' ');
    const title = el.querySelector('h3');
    const summary = el.querySelector('h3 + p');
    if (title) title.textContent = words(4).slice(0, 160);
    if (summary) summary.textContent = words(15).slice(0, 600);
  });
  const viewport = page.viewportSize()?.height ?? 0;
  const top = Number.parseFloat(await card.evaluate((el) => getComputedStyle(el).top));
  const box = await card.boundingBox();
  expect(top + (box?.height ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(viewport);
  const cover = await card.locator('.work-media').boundingBox();
  expect(cover?.height).toBeGreaterThanOrEqual(140);
});
