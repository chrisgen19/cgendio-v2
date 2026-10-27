import {expect, type Page, test} from '@playwright/test';
import {E2E_BASE_URL} from '../support/test-env';

/*
 * Projects with a brand colour show their brand tint, and follow the page theme. MyImprov's card theme is lime, the one
 * theme that makes a card a light island, so it also checks that a brand-tinted card never stays light on the dark page.
 */

test.use({reducedMotion: 'reduce'});

const myImprovCard = (page: Page) =>
  page.locator('main:visible #work article.work-card').filter({has: page.getByRole('heading', {level: 3, name: 'MyImprov Online Traffic School'})});

const COLOURS = {
  light: {card: 'rgb(224, 236, 252)', text: 'rgb(13, 14, 18)', accent: 'rgb(0, 95, 229)'}, // #e0ecfc, ink, #005fe5
  dark: {card: 'rgb(16, 39, 73)', text: 'rgb(242, 243, 245)', accent: 'rgb(77, 143, 237)'}, // #102749, dark ink, #4d8fed
};

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({context}) => {
      // The theme toggle stores its choice in this cookie; no cookie means light
      if (theme === 'dark') await context.addCookies([{name: 'theme', value: 'dark', url: E2E_BASE_URL}]);
    });

    test('a brand-tinted card follows the page theme', async ({page}) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const card = myImprovCard(page);
      await expect(card).not.toHaveAttribute('data-theme');
      await expect(card).toHaveCSS('background-color', COLOURS[theme].card);
      await expect(card.getByRole('heading', {level: 3})).toHaveCSS('color', COLOURS[theme].text);
    });

    // The site's focus ring is the accent, which can fall under 3:1 on a card washed from a near-white tint; the card's
    // own accent always passes 4.5:1 on it
    test('focus rings on a brand-tinted card use its accent', async ({page}) => {
      await page.goto('/');
      const link = myImprovCard(page).getByRole('link', {name: /View case study/});
      await link.focus();
      await expect(link).toHaveCSS('outline-color', COLOURS[theme].accent);
    });

    test('the case study panel takes the same tint', async ({page}) => {
      await page.goto('/work/myimprov');
      const panel = page.locator('main:visible .brand-panel');
      await expect(panel).toHaveCSS('background-color', COLOURS[theme].card);
    });
  });
}
