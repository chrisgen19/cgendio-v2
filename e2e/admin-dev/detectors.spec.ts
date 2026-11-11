import {expect, test} from '@playwright/test';
import {observeAdminDev} from '../support/admin-dev-observer';

test('captures validation insights emitted as console.warn', async ({page}) => {
  const observations = await observeAdminDev(page);
  await page.goto('about:blank');
  const warning = 'Route "/admin": Could not validate `instant` because the target segment was prevented from rendering.';
  await page.evaluate((message) => console.warn(message), warning);
  await expect.poll(() => observations.insights).toEqual([warning]);
});

test('remembers transient protected UI and shadow-root error overlays', async ({page}) => {
  const observations = await observeAdminDev(page);
  await page.goto('about:blank');
  await page.evaluate(() => {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Admin');
    document.body.append(nav);
    const portal = document.createElement('nextjs-portal');
    portal.attachShadow({mode: 'open'}).innerHTML = '<div data-nextjs-dialog>Error</div>';
    document.body.append(portal);
  });
  await expect.poll(() => observations.protectedUi && observations.overlay).toBe(true);
  await page.reload();
  expect(observations.protectedUi && observations.overlay).toBe(true);
});
