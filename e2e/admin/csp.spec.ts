import {expect, test} from '@playwright/test';
import {expectNoCspViolations, recordCspViolations} from '../support/csp';

/*
 * The admin under the Content-Security-Policy (#99). The public sweep is in e2e/public/csp.spec.ts; this one covers
 * what only the admin loads: shadcn/ui, the editor forms and the upload field. Read-only, so it can't disturb the
 * other admin specs.
 */

test.beforeEach(async ({page}) => {
  await recordCspViolations(page);
});

for (const path of ['/admin', '/admin/projects', '/admin/posts', '/admin/inbox']) {
  test(`${path} loads with no CSP violation`, async ({page}) => {
    await page.goto(path);
    await expect(page.locator('main:visible')).toBeVisible();
    await expectNoCspViolations(page, path);
  });
}

test('a project edit form, with its upload field, has no CSP violation', async ({page}) => {
  await page.goto('/admin/projects');
  await page
    .getByRole('link', {name: /^Edit /})
    .first()
    .click();
  await expect(page.getByLabel('Title', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Save project'})).toBeVisible();
  await expectNoCspViolations(page, 'a project edit form');
});
