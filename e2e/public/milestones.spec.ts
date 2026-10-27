import {expect, type Page, test} from '@playwright/test';

/*
 * The milestone values count up as their line scrolls into view (CSS view timelines). Each count starts at the smallest
 * number with as many digits, so a two-digit value never shows '0+' on the way.
 */

// From the seed: the counted values and where their count starts
const COUNTS = [
  {to: 15, from: 10},
  {to: 6, from: 1},
  {to: 40, from: 10},
];

/** Every value each counter shows while the page scrolls through the section in 40px steps. Instant scrolls, or smooth scrolling lags behind. */
const sampleCounts = (page: Page) =>
  page.evaluate(async () => {
    const ticks = [...document.querySelectorAll<HTMLElement>('#milestones .ms-tick')];
    const seen = ticks.map(() => new Set<number>());
    const rect = document.getElementById('milestones')?.getBoundingClientRect();
    if (!rect) return [];
    const start = rect.top + window.scrollY - window.innerHeight;
    const end = rect.bottom + window.scrollY;
    for (let y = start; y <= end; y += 40) {
      window.scrollTo({top: y, behavior: 'instant'});
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      ticks.forEach((tick, i) => {
        seen[i]?.add(Number(getComputedStyle(tick).getPropertyValue('--ms-n')));
      });
    }
    return seen.map((values) => [...values].sort((a, b) => a - b));
  });

test('each count runs from its first same-width number up to the value', async ({page}) => {
  await page.goto('/');
  const counts = await sampleCounts(page);
  expect(counts).toHaveLength(COUNTS.length);
  COUNTS.forEach(({from, to}, i) => {
    expect(counts[i]?.[0]).toBe(from);
    expect(counts[i]?.at(-1)).toBe(to);
  });
});

// Admin values longer than the seeded ones (the admin hint suggests "Nov ’25"); a 9-digit number is the longest that counts
const LONG_VALUES = ['Nov ’25', 'Q3 2025', 'Launch', '999999999+'];

test('long values shrink to fit their line instead of scrolling the page sideways', async ({page}) => {
  await page.goto('/');
  for (const value of LONG_VALUES) {
    // Put the value in the CMS line, with the length the server would have set
    const fit = await page.evaluate((value) => {
      const p = document.querySelector('#milestones .ms-word')?.closest('p');
      const line = p?.closest('li');
      if (!p || !line) return null;
      for (const el of p.querySelectorAll('.ms-word, .ms-fill, .sr-only')) el.textContent = value;
      p.style.setProperty('--ms-chars', String([...value].length));
      return {
        valueRight: p.getBoundingClientRect().right,
        lineRight: line.getBoundingClientRect().right,
        pageWidth: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      };
    }, value);
    expect(fit, value).not.toBeNull();
    expect(fit?.pageWidth, value).toBeLessThanOrEqual(fit?.viewport ?? 0);
    expect(fit?.valueRight, value).toBeLessThanOrEqual(fit?.lineRight ?? 0);
  }
});

test.describe('with reduced motion', () => {
  test.use({reducedMotion: 'reduce'});

  test('the final values show without counting', async ({page}) => {
    await page.goto('/');
    const section = page.locator('#milestones');
    await expect(section.locator('.ms-tick').first()).toBeHidden();
    await expect(section.locator('.ms-final').first()).toBeVisible();
    // Screen readers get each value once, from the visually hidden copy
    await expect(section.locator('li .sr-only')).toHaveText(['15+', '6', 'CMS', '40+', 'VPS']);
  });
});
