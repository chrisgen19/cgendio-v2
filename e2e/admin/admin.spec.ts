import {expect, type Page, test} from '@playwright/test';
import {fillContactForm, uniqueToken, useOwnIp} from '../support/contact';

/*
 * Signed in as the e2e admin through the storage state from e2e/support/prepare.mts (Better Auth's test-utils plugin,
 * never a real GitHub login). This project runs after the public ones, so the title edit can't change their snapshots.
 */

test.describe('signed out', () => {
  test.use({storageState: {cookies: [], origins: []}});

  for (const path of ['/admin', '/admin/projects', '/admin/inbox']) {
    test(`${path} redirects to sign-in`, async ({page}) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/sign-in$/);
    });
  }
});

const renameProject = async (page: Page, from: string, to: string) => {
  await page.goto('/admin/projects');
  await page.getByRole('link', {name: `Edit ${from}`}).click();
  const title = page.getByLabel('Title', {exact: true});
  await expect(title).toHaveValue(from);
  await title.fill(to);
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Project saved.')).toBeVisible();
};

test('a project title edited in the admin shows on the home page', async ({page}) => {
  const original = 'CV Tailor';
  const edited = `CV Tailor ${uniqueToken()}`;
  const workTitles = () => page.locator('#work').getByRole('heading', {level: 3});

  await renameProject(page, original, edited);
  await page.goto('/');
  await expect(workTitles().filter({hasText: edited})).toBeVisible();

  // Put it back (and prove the update works both ways); the next prepare resets the database anyway
  await renameProject(page, edited, original);
  await page.goto('/');
  await expect(workTitles().filter({hasText: original})).toHaveText(original);
});

test('a contact message arrives in the admin inbox', async ({page}, testInfo) => {
  const name = `Inbox ${uniqueToken()}`;
  await useOwnIp(page, testInfo);
  await page.goto('/contact');
  await fillContactForm(page, {name, message: 'Could you quote a WooCommerce rebuild for us?'});
  await page.getByRole('button', {name: 'Send message'}).click();
  await expect(page.getByRole('heading', {name: "Thanks, we've got your message."})).toBeVisible();

  await page.goto('/admin/inbox');
  await expect(page.getByText(name)).toBeVisible();
});
