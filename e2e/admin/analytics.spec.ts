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
const CV_LETTER_URL = 'https://e2e-media.example.test/cv/e2e-cv-letter.pdf';

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

/** Keeps CV clicks on the page: the CV host doesn't exist, and the listener only needs the click. */
const swallowCvClicks = (page: Page) =>
  page.addInitScript(() =>
    addEventListener('click', (event) => (event.target as Element).closest?.('a[data-track="cv_download"]') && event.preventDefault(), true),
  );

test('the CV button records cv_download when only the A4 cut is uploaded', async ({page}) => {
  await queryTestDb('UPDATE site_settings SET cv_url = $1', [CV_URL]);
  try {
    await resaveSettings(page);
    await swallowCvClicks(page);
    await page.goto('/contact');
    await waitForGtag(page);
    const cv = page.locator('main [data-track="cv_download"]');
    await expect(cv).toHaveCount(1);
    await expect(cv).toHaveAttribute('href', CV_URL);
    await cv.click();
    expect(await gaEvents(page, 'cv_download')).toEqual([{placement: 'contact'}]);
  } finally {
    await queryTestDb('UPDATE site_settings SET cv_url = NULL');
    await resaveSettings(page);
  }
});

/** Puts both CV cuts in the settings for the callback, then takes them out again. */
const withBothCuts = async (page: Page, run: () => Promise<void>) => {
  await queryTestDb('UPDATE site_settings SET cv_url = $1, cv_url_letter = $2', [CV_URL, CV_LETTER_URL]);
  try {
    await resaveSettings(page);
    await run();
  } finally {
    await queryTestDb('UPDATE site_settings SET cv_url = NULL, cv_url_letter = NULL');
    await resaveSettings(page);
  }
};

/** The Download CV disclosure in the Contact section: its `<details>`, its `<summary>` and the two rows. */
const cvMenu = (page: Page) => {
  const details = page.locator('main details').filter({has: page.locator('[data-track="cv_download"]')});
  return {
    details,
    summary: details.locator('summary'),
    a4: details.locator('[data-track="cv_download"][data-track-format="a4"]'),
    letter: details.locator('[data-track="cv_download"][data-track-format="letter"]'),
  };
};

test('both CV cuts sit in one Download CV menu, each with its own format param', async ({page}) => {
  await withBothCuts(page, async () => {
    await swallowCvClicks(page);
    await page.goto('/contact');
    await waitForGtag(page);

    const {details, summary, a4, letter} = cvMenu(page);
    await expect(summary).toHaveText('Download CV');
    await expect(a4).toBeHidden();

    await summary.click();
    await expect(details).toHaveAttribute('open', '');
    await expect(a4).toHaveAttribute('href', CV_URL);
    await expect(letter).toHaveAttribute('href', CV_LETTER_URL);
    await expect(a4).toContainText('A4 Format CV');
    await expect(letter).toContainText('Letter Format CV');
    await a4.click();
    await expect(details).not.toHaveAttribute('open');

    await summary.click();
    await letter.click();
    expect(await gaEvents(page, 'cv_download')).toEqual([
      {placement: 'contact', format: 'a4'},
      {placement: 'contact', format: 'letter'},
    ]);
  });
});

test('the CV menu closes on Escape, returning focus to its button, and on a click outside it', async ({page}) => {
  await withBothCuts(page, async () => {
    await page.goto('/contact');
    const {details, summary, a4} = cvMenu(page);

    await summary.click();
    await a4.focus();
    await page.keyboard.press('Escape');
    await expect(details).not.toHaveAttribute('open');
    await expect(summary).toBeFocused();

    await summary.click();
    await expect(details).toHaveAttribute('open', '');
    await page.locator('main h1').click();
    await expect(details).not.toHaveAttribute('open');
  });
});

test('without JavaScript the CV menu still opens and both cuts are links', async ({page, browser}) => {
  await withBothCuts(page, async () => {
    const context = await browser.newContext({javaScriptEnabled: false, baseURL: E2E_BASE_URL});
    try {
      const noJs = await context.newPage();
      await noJs.goto('/contact');
      const {details, summary, a4, letter} = cvMenu(noJs);
      await summary.click();
      await expect(details).toHaveAttribute('open', '');
      await expect(a4).toBeVisible();
      await expect(a4).toHaveAttribute('href', CV_URL);
      await expect(letter).toBeVisible();
      await expect(letter).toHaveAttribute('href', CV_LETTER_URL);
    } finally {
      await context.close();
    }
  });
});
