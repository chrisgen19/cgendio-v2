import {expect, type Page, test} from '@playwright/test';
import {timeline} from '../../prisma/seed-data/timeline';
import {parseStartYear} from '../../src/lib/timeline-years';

/* The Work timeline marks the role on the reading line (45% down the viewport) active, and the counter rolls to its start year. */

const roles = (page: Page) => page.locator('#timeline-roles > li');

/** Scrolls until role `n` has just crossed the reading line. Instant, or the page's smooth scrolling is still under way. */
const scrollToRole = (page: Page, n: number) =>
  page.evaluate(async (n) => {
    const role = document.querySelectorAll('#timeline-roles > li')[n];
    window.scrollBy({top: role.getBoundingClientRect().top - window.innerHeight * 0.45 + 40, behavior: 'instant'});
    await new Promise(requestAnimationFrame);
  }, n);

/** The year the counter shows: each digit strip is 0 to 9 repeated, moved up by its digit's position in em. */
const counterYear = (page: Page) =>
  page
    .locator('#timeline .tl-solid .tl-strip')
    .evaluateAll((strips) =>
      strips.map((strip) => Math.round(-Number.parseFloat((strip as HTMLElement).style.transform.split(',')[1])) % 10).join(''),
    );

// From the seed: the third role, the earliest one, then back to the current one
const position = (n: number) => String(n).padStart(2, '0');
const STOPS = [2, timeline.length - 1, 0].map((n) => ({
  n,
  year: String(parseStartYear(timeline[n].when)),
  when: timeline[n].when,
  label: position(n + 1),
}));

test('the role on the reading line is the active one', async ({page}) => {
  await page.goto('/');
  for (const {n} of STOPS) {
    await scrollToRole(page, n);
    await expect(roles(page).nth(n)).toHaveAttribute('data-tl-active', '');
    await expect(page.locator('#timeline-roles > li[data-tl-active]')).toHaveCount(1);
  }
});

test('the counter rolls to the start year of the active role', async ({page, isMobile}) => {
  test.skip(isMobile, 'Phones hide the counter: each role shows its own year');
  await page.goto('/');
  const counter = page.locator('#timeline .tl-counter');
  for (const {n, year, when, label} of STOPS) {
    await scrollToRole(page, n);
    await expect.poll(() => counterYear(page)).toBe(year);
    await expect(counter.locator('.tl-when[data-on]')).toHaveText(when);
    await expect(counter.getByText(`${label} / ${position(timeline.length)}`)).toBeVisible();
  }
});
