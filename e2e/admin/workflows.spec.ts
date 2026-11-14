import {test as base, expect} from '@playwright/test';
import {fillContactForm, uniqueToken, useOwnIp} from '../support/contact';

const test = base.extend<{checkConsole: undefined}>({
  checkConsole: [
    async ({page}, use) => {
      await page.route('https://www.googletagmanager.com/gtag/js**', (route) => route.fulfill({contentType: 'application/javascript', body: ''}));
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await use(undefined);
      await page.waitForLoadState('networkidle');
      expect(errors, 'Browser errors during the signed-in workflow').toEqual([]);
    },
    {auto: true},
  ],
});

// Uses the isolated test database and admin session from test:e2e:prepare.
test.describe.configure({mode: 'default'});

const sections = [
  ['Dashboard', '/admin'],
  ['Inbox', '/admin/inbox'],
  ['Projects', '/admin/projects'],
  ['Posts', '/admin/posts'],
  ['Milestones', '/admin/milestones'],
  ['Timeline', '/admin/timeline'],
  ['Stack', '/admin/stack'],
  ['Page copy', '/admin/copy'],
  ['Settings', '/admin/settings'],
] as const;

for (const [name, path] of sections) {
  test(`${path} supports signed-in navigation and reload`, async ({page}) => {
    await page.goto('/admin');
    const link = page.getByRole('navigation', {name: 'Admin', exact: true}).getByRole('link', {name, exact: true});
    await link.click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('main').getByRole('heading', {name, exact: true})).toBeVisible();
    await expect(link).toHaveAttribute('aria-current', 'page');
    await page.reload();
    await expect(page.getByRole('main').getByRole('heading', {name, exact: true})).toBeVisible();
  });
}

const collections = [
  {
    path: 'projects',
    field: 'Title',
    create: 'Create project',
    save: 'Save project',
    message: 'Project saved.',
    fields: {Summary: 'Admin workflow test', 'Kind label': 'TEST', Glyph: 'QA'},
  },
  {
    path: 'posts',
    field: 'Title',
    create: 'Create post',
    save: 'Save post',
    message: 'Post saved.',
    fields: {Excerpt: 'Admin workflow test', Tag: 'Testing', Body: 'A draft created by the signed-in workflow test.'},
  },
  {
    path: 'milestones',
    field: 'Title',
    create: 'Add milestone',
    save: 'Save milestone',
    message: 'Milestone saved.',
    fields: {Kind: 'MILESTONE', 'Big value': '2026', Description: 'Admin workflow test'},
  },
  {
    path: 'timeline',
    field: 'Role',
    create: 'Add entry',
    save: 'Save entry',
    message: 'Timeline entry saved.',
    fields: {When: '2026', Organisation: 'Test organisation', Description: 'Admin workflow test'},
  },
  {path: 'stack', field: 'Name', create: 'Add to stack', save: 'Save', message: 'Stack item saved.', fields: {}},
] as const;

for (const collection of collections) {
  test(`${collection.path} supports create, edit, persisted save and delete`, async ({page}) => {
    const title = `Workflow ${uniqueToken()}`;
    const edited = `${title} edited`;
    const path = `/admin/${collection.path}`;
    await page.goto(path);
    await page
      .getByRole('main')
      .getByRole('link', {name: /^(New project|New post|New milestone|New entry|Add to stack)$/})
      .click();
    await expect(page).toHaveURL(`${path}/new`);
    await page.getByLabel(collection.field, {exact: true}).fill(title);
    for (const [label, value] of Object.entries(collection.fields)) await page.getByLabel(label, {exact: true}).fill(value);
    if (collection.path === 'projects' || collection.path === 'posts') await page.getByLabel('Slug', {exact: true}).fill(`workflow-${uniqueToken()}`);
    await page.getByRole('button', {name: collection.create, exact: true}).click();
    await expect(page).not.toHaveURL(`${path}/new`);

    await page.goto(path);
    await page.getByRole('link', {name: `Edit ${title}`, exact: true}).click();
    await expect(page.getByLabel(collection.field, {exact: true})).toHaveValue(title);
    await page.getByLabel(collection.field, {exact: true}).fill(edited);
    await page.getByRole('button', {name: collection.save, exact: true}).click();
    await expect(page.getByText(collection.message, {exact: true})).toBeVisible();
    await page.reload();
    await expect(page.getByLabel(collection.field, {exact: true})).toHaveValue(edited);

    await page.goto(path);
    await page.getByRole('button', {name: `Delete ${edited}`, exact: true}).click();
    await page.getByRole('alertdialog').getByRole('button', {name: 'Delete', exact: true}).click();
    await expect(page.getByRole('link', {name: `Edit ${edited}`, exact: true})).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('link', {name: `Edit ${edited}`, exact: true})).toHaveCount(0);
  });
}

test('settings saves persist across reloads', async ({page}) => {
  await page.goto('/admin/settings');
  const email = page.getByLabel('Contact email', {exact: true});
  const original = await email.inputValue();
  // The seed uses a data URL fixture, whereas the settings form accepts only HTTP(S) image URLs.
  // Wait for the upload field itself: its client UI may arrive after the contact email input.
  const photoUrl = page.locator('input[name="photoUrl"]');
  await photoUrl.waitFor({state: 'attached'});
  const removePhoto = page.getByRole('button', {name: 'Remove about photo', exact: true});
  if (await photoUrl.inputValue()) {
    await removePhoto.click();
    await expect(photoUrl).toHaveValue('');
  }
  await email.fill('workflow@example.test');
  await page.getByRole('button', {name: 'Save settings', exact: true}).click();
  await expect(page.getByText('Settings saved.', {exact: true})).toBeVisible();
  await page.reload();
  await expect(email).toHaveValue('workflow@example.test');
  await email.fill(original);
  await page.getByRole('button', {name: 'Save settings', exact: true}).click();
  await expect(page.getByText('Settings saved.', {exact: true})).toBeVisible();
  await page.reload();
  await expect(email).toHaveValue(original);
});

test('a CV URL typed into the settings form saves without uploading a file', async ({page}) => {
  const pasted = 'https://e2e-media.example.test/cv/pasted-cv.pdf';
  await page.goto('/admin/settings');
  const cvUrl = page.getByLabel('CV (A4)', {exact: true});
  await cvUrl.waitFor({state: 'visible'});
  const original = await cvUrl.inputValue();
  try {
    await cvUrl.fill(pasted);
    await page.getByRole('button', {name: 'Save settings', exact: true}).click();
    await expect(page.getByText('Settings saved.', {exact: true})).toBeVisible();
    await page.reload();
    await expect(cvUrl).toHaveValue(pasted);
    // The typed URL is the field's value, so the public buttons pick it up like an uploaded one
    await expect(page.getByRole('link', {name: 'Current CV (PDF)'}).first()).toHaveAttribute('href', pasted);
  } finally {
    await page.goto('/admin/settings');
    await cvUrl.waitFor({state: 'visible'});
    await cvUrl.fill(original);
    await page.getByRole('button', {name: 'Save settings', exact: true}).click();
    await expect(page.getByText('Settings saved.', {exact: true})).toBeVisible();
  }
});

test('a CV URL that is not a web URL is refused with a field error', async ({page}) => {
  await page.goto('/admin/settings');
  const cvUrl = page.getByLabel('CV (A4)', {exact: true});
  await cvUrl.waitFor({state: 'visible'});
  // type="url" blocks the browser's own submit, so the server rule is what this checks: ftp:// is not accepted
  await cvUrl.evaluate((node: HTMLInputElement) => node.setAttribute('type', 'text'));
  await cvUrl.fill('ftp://example.com/cv.pdf');
  await page.getByRole('button', {name: 'Save settings', exact: true}).click();
  await expect(page.getByText('Settings saved.', {exact: true})).toHaveCount(0);
  // The reason shows on the field itself, not only as a toast: without this the field's errors prop can go missing
  // and the save fails with nothing highlighted (#170 review).
  await expect(page.locator('#field-cvUrl-error')).toHaveText('Enter a full URL');
  await expect(cvUrl).toHaveAttribute('aria-invalid', 'true');
  await page.reload();
  await expect(cvUrl).not.toHaveValue('ftp://example.com/cv.pdf');
});

test('page copy saves persist across reloads', async ({page}) => {
  await page.goto('/admin/copy');
  const eyebrow = page.getByLabel('Eyebrow', {exact: true}).first();
  const original = await eyebrow.inputValue();
  await eyebrow.fill(`${original} QA`);
  await page.getByRole('button', {name: 'Save page copy', exact: true}).click();
  await expect(page.getByText('Saved 1 change.', {exact: true})).toBeVisible();
  await page.reload();
  await expect(eyebrow).toHaveValue(`${original} QA`);
  await eyebrow.fill(original);
  await page.getByRole('button', {name: 'Save page copy', exact: true}).click();
  await expect(page.getByText('Saved 1 change.', {exact: true})).toBeVisible();
  await page.reload();
  await expect(eyebrow).toHaveValue(original);
});

test('inbox read state and deletion persist across reloads', async ({page}, testInfo) => {
  const name = `Workflow ${uniqueToken()}`;
  await useOwnIp(page, testInfo);
  await page.goto('/contact');
  await fillContactForm(page, {name, message: 'An isolated admin workflow test message.'});
  await page.getByRole('button', {name: 'Send message', exact: true}).click();
  await expect(page.getByRole('heading', {name: "Thanks, I've got your message."})).toBeVisible();
  await page.goto('/admin/inbox');
  const row = page.getByRole('main').getByRole('listitem').filter({hasText: name});
  await row.getByRole('button', {name: 'Mark as read', exact: true}).click();
  await expect(row.getByRole('button', {name: 'Mark as unread', exact: true})).toBeVisible();
  await page.reload();
  await expect(row.getByRole('button', {name: 'Mark as unread', exact: true})).toBeVisible();
  await row.getByRole('button', {name: 'Mark as unread', exact: true}).click();
  await expect(row.getByRole('button', {name: 'Mark as read', exact: true})).toBeVisible();
  await page.reload();
  await expect(row.getByRole('button', {name: 'Mark as read', exact: true})).toBeVisible();
  await row.getByRole('button', {name: `Delete the message from ${name}`, exact: true}).click();
  await page.getByRole('alertdialog').getByRole('button', {name: 'Delete', exact: true}).click();
  await expect(row).toHaveCount(0);
  await page.reload();
  await expect(row).toHaveCount(0);
});
