import {expect, type Page, test} from '@playwright/test';
import {fillContactForm, uniqueToken, useOwnIp} from '../support/contact';
import {queryTestDb} from '../support/test-db';
import {E2E_BASE_URL} from '../support/test-env';

/*
 * Signed in as the e2e admin through the storage state from e2e/support/prepare.mts (Better Auth's test-utils plugin,
 * never a real GitHub login). This project runs after the public ones, so the title edit can't change their snapshots.
 */

// One at a time: a save revalidates the home page, and another test's render of it still in flight can cache the data
// from before that save, so a test reading the page after its own save would see the old version
test.describe.configure({mode: 'default'});

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
  const original = 'Fresh Fruit and Veg Shop';
  const edited = `Fresh Fruit and Veg Shop ${uniqueToken()}`;
  const workTitles = () => page.locator('#work').getByRole('heading', {level: 3});

  // A failed earlier attempt (CI retries once, on the same database) can leave its edited title behind, so start from
  // the seeded title, found by the slug that never changes. The save below revalidates the home page. The form rejects
  // the data URL cover e2e/support/prepare.mts gives every project, so drop it (the public snapshots have already run).
  await queryTestDb('UPDATE projects SET title = $1, cover_image_url = NULL WHERE slug = $2', [original, 'fresh-fruit-and-veg']);

  await renameProject(page, original, edited);
  await page.goto('/');
  await expect(workTitles().filter({hasText: edited})).toBeVisible();

  // Put it back, proving the update works both ways (if this attempt fails first, the next one resets it above)
  await renameProject(page, edited, original);
  await page.goto('/');
  await expect(workTitles().filter({hasText: original})).toHaveText(original);
});

test('a brand colour pasted with spaces and capitals saves as #rrggbb', async ({page}) => {
  // Start from no colour, and drop the data URL cover the form would reject (as above)
  await queryTestDb('UPDATE projects SET brand_color = NULL, cover_image_url = NULL WHERE slug = $1', ['access-hire']);

  await page.goto('/admin/projects');
  await page.getByRole('link', {name: 'Edit Access Hire Australia'}).click();
  const field = page.getByLabel('Brand colour', {exact: true});
  await field.clear();
  // Typed text as a paste delivers it, so the input's own limits apply
  await field.focus();
  await page.keyboard.insertText(' #E31836 ');
  await expect(field).toHaveValue(' #E31836 ');
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Project saved.')).toBeVisible();

  const {rows} = await queryTestDb('SELECT brand_color FROM projects WHERE slug = $1', ['access-hire']);
  expect(rows[0]?.brand_color).toBe('#e31836');
});

const setBrandColour = async (page: Page, title: string, colour: string) => {
  await page.goto('/admin/projects');
  await page.getByRole('link', {name: `Edit ${title}`}).click();
  await page.getByLabel('Brand colour', {exact: true}).fill(colour);
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Project saved.')).toBeVisible();
};

test('a project without a brand colour falls back to its theme', async ({page, context}) => {
  const title = 'MyImprov Online Traffic School';
  // A failed earlier attempt can leave the colour cleared, so start from the seeded one. The save below revalidates the
  // home page (a direct write would stay cached). The form rejects the data URL cover, so drop it (as above).
  await queryTestDb('UPDATE projects SET brand_color = $1, cover_image_url = NULL WHERE slug = $2', ['#005fe5', 'myimprov']);
  await setBrandColour(page, title, '');

  // On the dark page, where a lime card must stay a light island: lime with ink text
  await context.addCookies([{name: 'theme', value: 'dark', url: E2E_BASE_URL}]);
  await page.goto('/');
  const card = page.locator('main:visible #work article.work-card').filter({has: page.getByRole('heading', {level: 3, name: title})});
  await expect(card).toHaveAttribute('data-theme', 'light');
  await expect(card).toHaveClass(/\bbg-lime\b/);
  await expect(card).toHaveClass(/\btext-on-lime\b/);
  await expect(card).not.toHaveClass(/\bbrand-panel\b/);
  await expect(card).toHaveCSS('background-color', 'rgb(215, 255, 61)'); // #d7ff3d
  await expect(card.getByRole('heading', {level: 3})).toHaveCSS('color', 'rgb(13, 14, 18)'); // ink
  await expect(card.getByRole('link', {name: /View case study/})).toHaveClass(/\bbg-ink\b/);

  // Put it back, proving the brand tint returns (if this attempt fails first, the next one resets it above)
  await setBrandColour(page, title, '#005fe5');
  await page.goto('/');
  await expect(card).toHaveClass(/\bbrand-panel\b/);
  await expect(card).not.toHaveAttribute('data-theme');
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
