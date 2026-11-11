import {readFileSync} from 'node:fs';
import {expect, test} from '@playwright/test';
import type {AdminDevFixtures} from '../support/admin-dev-fixtures.mts';
import {observeAdminDev} from '../support/admin-dev-observer';
import {ADMIN_DEV_ROUTES} from '../support/admin-dev-routes';
import {queryTestDb} from '../support/test-db';
import {ADMIN_DEV_FIXTURES, ADMIN_DEV_URL} from '../support/test-env';

let fixtures: AdminDevFixtures;
test.beforeAll(() => {
  fixtures = JSON.parse(readFileSync(ADMIN_DEV_FIXTURES, 'utf8'));
});

for (const state of ['missing', 'invalid', 'expired'] as const) {
  test.describe(`${state} session`, () => {
    for (const [index, template] of ADMIN_DEV_ROUTES.entries()) {
      test(`${template} redirects cleanly to sign-in`, async ({page, context}) => {
        const collection = template.split('/')[2];
        const path = template.replace('[seeded]', fixtures.records[collection] ?? '');
        const {id, cookies} = fixtures.expired[index];
        if (state !== 'missing') {
          if (state === 'expired') {
            const {rows} = await queryTestDb("SELECT expires_at <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AS expired FROM sessions WHERE id = $1", [
              id,
            ]);
            expect(rows[0]?.expired, 'The signed cookie must reference an existing expired session').toBe(true);
          }
          await context.addCookies(state === 'expired' ? cookies : cookies.map((cookie) => ({...cookie, value: 'invalid-test-session'})));
        }
        const initialRequest = page.waitForRequest((request) => request.isNavigationRequest() && request.url() === `${ADMIN_DEV_URL}${path}`);
        const observations = await observeAdminDev(page);
        await page.goto(path);
        await expect(page).toHaveURL(`${ADMIN_DEV_URL}/sign-in`);
        await expect(page.getByRole('button', {name: /github/i})).toBeVisible();
        const requestHeaders = await (await initialRequest).allHeaders();
        expect(Boolean(requestHeaders.cookie?.includes(`${cookies[0].name}=`))).toBe(state !== 'missing');
        await expect(page.locator('.admin-theme main, nav[aria-label="Admin"]')).toHaveCount(0);
        await expect(
          page.locator('nextjs-portal [data-nextjs-dialog], nextjs-portal [data-issues-open], nextjs-portal [data-nextjs-error-overlay]'),
        ).toHaveCount(0);
        expect(observations.protectedUi, 'Protected UI appeared before the redirect').toBe(false);
        expect(observations.overlay, 'A development error overlay appeared before the redirect').toBe(false);
        expect(observations.insights, 'Instant Navigation/prerender validation messages').toEqual([]);
        expect(observations.errors, 'Browser errors').toEqual([]);
      });
    }
  });
}
