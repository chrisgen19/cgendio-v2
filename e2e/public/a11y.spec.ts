import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';
import {E2E_BASE_URL} from '../support/test-env';

const PAGES = [
  {name: 'home', path: '/'},
  {name: 'blog', path: '/blog'},
  {name: 'post', path: '/blog/migrating-20-wordpress-sites-to-nextjs-without-losing-seo'},
  {name: 'case study', path: '/work/edge-redirect-architecture'},
  {name: 'contact', path: '/contact'},
];

// axe measures contrast at the moment it runs, so text still fading in (scroll reveals, film scenes mid-transition)
// fails it. Reduced motion shows every element in its final state: what a visitor reads once things settle.
test.use({reducedMotion: 'reduce'});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({context}) => {
      // The theme toggle stores its choice in this cookie; no cookie means light
      if (theme === 'dark') await context.addCookies([{name: 'theme', value: 'dark', url: E2E_BASE_URL}]);
    });

    for (const {name, path} of PAGES) {
      test(`${name} has no axe violations`, async ({page}) => {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

        const {violations} = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        // Compact output on failure: the rule, its impact and the elements it flagged
        expect(violations.map(({id, impact, nodes}) => ({id, impact, targets: nodes.map((node) => node.target.join(' '))}))).toEqual([]);
      });
    }
  });
}
