import {expect, type Page, test} from '@playwright/test';
import {gaEvents, gtagCalls, stubGtag, waitForGtag} from '../support/analytics';
import {queryTestDb} from '../support/test-db';
import {E2E_BASE_URL, GA_TEST_ID} from '../support/test-env';

// Signed in through the admin storage state. Runs after the public projects, so the CV it adds never shows in their snapshots.
test.describe.configure({mode: 'default'});

test.beforeEach(async ({page}) => {
  await stubGtag(page);
});

test('visiting the admin marks this browser internal, and the public pages then tag their hits', async ({page, context}) => {
  await page.goto('/admin');
  await expect.poll(async () => (await context.cookies(E2E_BASE_URL)).find((cookie) => cookie.name === 'cg_internal')?.value).toBe('1');

  await page.goto('/');
  await waitForGtag(page);
  expect((await gtagCalls(page, 'config')).find(([, id]) => id === GA_TEST_ID)).toEqual(['config', GA_TEST_ID, {traffic_type: 'internal'}]);
});

const CV_URL = 'https://e2e-media.example.test/cv/e2e-cv.pdf';

/**
 * Saves the settings form as it stands, so the public pages pick up a cv_url written straight to the database. The
 * seeded about photo is a data: URL the form rejects, so it is removed first, as in the settings workflow test.
 */
const resaveSettings = async (page: Page) => {
  await page.goto('/admin/settings');
  const photoUrl = page.locator('input[name="photoUrl"]');
  await photoUrl.waitFor({state: 'attached'});
  if (await photoUrl.inputValue()) {
    await page.getByRole('button', {name: 'Remove about photo', exact: true}).click();
    await expect(photoUrl).toHaveValue('');
  }
  await page.getByRole('button', {name: 'Save settings', exact: true}).click();
  await expect(page.getByText('Settings saved.', {exact: true})).toBeVisible();
};

test('the CV button records cv_download', async ({page}) => {
  await queryTestDb('UPDATE site_settings SET cv_url = $1', [CV_URL]);
  try {
    await resaveSettings(page);
    // Keep the click on the page: the CV host doesn't exist, and the listener only needs the click
    await page.addInitScript(
      (href) => addEventListener('click', (event) => (event.target as Element).closest?.(`a[href="${href}"]`) && event.preventDefault(), true),
      CV_URL,
    );
    await page.goto('/contact');
    await waitForGtag(page);
    const cv = page.locator('main [data-track="cv_download"]').first();
    await expect(cv).toHaveAttribute('href', CV_URL);
    await cv.click();
    expect(await gaEvents(page, 'cv_download')).toEqual([{}]);
  } finally {
    await queryTestDb('UPDATE site_settings SET cv_url = NULL');
    await resaveSettings(page);
  }
});
