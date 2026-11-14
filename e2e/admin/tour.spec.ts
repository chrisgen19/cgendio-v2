import {expect, type Locator, type Page, test} from '@playwright/test';
import {queryTestDb} from '../support/test-db';

/*
 * Editing a tour in the admin, and what the public page then shows. These change the seeded Access Hire row, so they run
 * in the admin project, after the public specs and one at a time. Each test puts the row back through the database and
 * reaches the public page through a save, which revalidates it.
 */
test.describe.configure({mode: 'default'});

type Stop = {key: string; heading: string};

const tourOf = async () => {
  const {rows} = await queryTestDb('SELECT tour_stops FROM projects WHERE slug = $1', ['access-hire']);
  return rows[0]?.tour_stops as Stop[];
};

let saved: {tour: Stop[]; liveUrl: string | null};

test.beforeAll(async () => {
  const {rows} = await queryTestDb('SELECT tour_stops, live_url FROM projects WHERE slug = $1', ['access-hire']);
  saved = {tour: rows[0]?.tour_stops, liveUrl: rows[0]?.live_url};
});

const editAccessHire = async (page: Page) => {
  await page.goto('/admin/projects');
  await page.getByRole('link', {name: 'Edit Access Hire Australia'}).click();
  await expect(page.getByLabel('Title', {exact: true})).toHaveValue('Access Hire Australia');
};

const save = async (page: Page) => {
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Project saved.')).toBeVisible();
};

/**
 * Opens the case study once a save shows. The first request after saving Access Hire can still get the old page, and the
 * next is fresh, whatever the layout: the same project without a tour does it too, and other projects with a tour do not.
 */
const openSaved = async (page: Page, saved: (main: Locator) => Locator) => {
  await expect(async () => {
    await page.goto('/projects/access-hire');
    await expect(saved(page.getByRole('main'))).toBeVisible({timeout: 1000});
  }).toPass({timeout: 15_000});
};

test.beforeEach(async () => {
  // The form rejects the data URL cover e2e/support/prepare.mts gives every project
  await queryTestDb('UPDATE projects SET cover_image_url = NULL WHERE slug = $1', ['access-hire']);
});

test.afterEach(async ({page}) => {
  await queryTestDb(
    'UPDATE projects SET tour_stops = $1::jsonb, live_url = $2, repo_url = NULL, decision = NULL, contribution = NULL, outcome = NULL WHERE slug = $3',
    [JSON.stringify(saved.tour), saved.liveUrl, 'access-hire'],
  );
  // One more save, so the public page drops what this test changed
  await editAccessHire(page);
  await save(page);
});

test('saving without changes keeps the tour identical', async ({page}) => {
  const before = await tourOf();
  await editAccessHire(page);
  await save(page);
  expect(await tourOf()).toEqual(before);
});

test('only the filled reasoning fields show on the page', async ({page}) => {
  await editAccessHire(page);
  await page.getByLabel('The result').fill('A result worth reading');
  await page.getByLabel('My part').fill('   ');
  await save(page);

  const {rows} = await queryTestDb('SELECT outcome, contribution FROM projects WHERE slug = $1', ['access-hire']);
  expect(rows[0]).toEqual({outcome: 'A result worth reading', contribution: null});

  await openSaved(page, (main) => main.getByRole('heading', {level: 3, name: 'The result'}));
  await expect(page.getByRole('navigation', {name: 'Write-up sections'}).getByRole('link', {name: 'The result'})).toBeVisible();
  await expect(page.getByText('A result worth reading')).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'My part'})).toHaveCount(0);
  await expect(page.getByRole('heading', {level: 3, name: 'The decision'})).toHaveCount(0);
});

test('a tour without a live site renders paths without links', async ({page}) => {
  await editAccessHire(page);
  await page.getByLabel('Live site').fill('');
  await save(page);

  await openSaved(page, (main) => main.getByText('/category/scissor-lift', {exact: true}).first());
  await expect(page.getByRole('figure', {name: 'The live site, in a browser'})).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', {name: /on the live site/})).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('link', {name: 'Live site', exact: true})).toHaveCount(0);
  await expect(page.getByRole('main').getByText('/category/scissor-lift').first()).toBeVisible();
});

test('a repository link shows beside the live site', async ({page}) => {
  await editAccessHire(page);
  await page.getByLabel('Repository').fill('https://github.com/example/repo');
  await save(page);

  await openSaved(page, (main) => main.getByRole('link', {name: 'Repository'}));
  await expect(page.getByRole('main').getByRole('link', {name: 'Repository'})).toHaveAttribute('href', 'https://github.com/example/repo');
});

test('bad positions JSON is refused, naming the stop, and keeps the edits', async ({page}) => {
  const before = await tourOf();
  await editAccessHire(page);
  await page.getByLabel('Heading').nth(2).fill('Edited heading');
  await page.getByLabel('Positions JSON').nth(2).fill('{nope');
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Stop 3: positions are not valid JSON')).toBeVisible();
  await expect(page.getByLabel('Heading').nth(2)).toHaveValue('Edited heading');
  expect(await tourOf()).toEqual(before);
});

test('moving a stop saves the new order', async ({page}) => {
  await editAccessHire(page);
  await page.getByRole('button', {name: 'Move stop 3 down'}).click();
  await save(page);
  expect((await tourOf()).map(({key}) => key).slice(2, 4)).toEqual(['brand', 'category']);
});

test('moving the opening stop down is refused', async ({page}) => {
  await editAccessHire(page);
  await page.getByRole('button', {name: 'Move stop 1 down'}).click();
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Stop 2: only the first stop can have an empty note')).toBeVisible();
});

test('removing a stop saves', async ({page}) => {
  await editAccessHire(page);
  await page.getByRole('button', {name: 'Remove stop 8'}).click();
  await save(page);
  expect(await tourOf()).toHaveLength(7);
});

test('a new stop needs its captures before it saves', async ({page}) => {
  await editAccessHire(page);
  await page.getByRole('button', {name: 'Add stop'}).click();
  const last = 8;
  await page.getByLabel('Heading').nth(last).fill('A new stop');
  await page.getByLabel('Note', {exact: true}).nth(last).fill('A new note');
  await page.getByLabel('Selected label').nth(last).fill('A label');
  await page.getByLabel('On screen').nth(last).fill('What shows');
  await page.getByLabel('Page path').nth(last).fill('/new');
  await page.getByLabel('Alt text').nth(last).fill('A page');
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Stop 9: the desktop capture is missing')).toBeVisible();
});

test('a capture the browser cannot decode gets its own error and changes nothing', async ({page}) => {
  const before = await tourOf();
  await editAccessHire(page);
  await page
    .getByLabel('Desktop capture file')
    .first()
    .setInputFiles({name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image')});
  await expect(page.getByText("That image couldn't be read. Try another JPEG, PNG, WebP or AVIF file.")).toBeVisible();
  await expect(page.getByText(/Check your connection/)).toHaveCount(0);
  await save(page);
  expect(await tourOf()).toEqual(before);
});

test('a capture over the size limit is refused before it is decoded', async ({page}) => {
  await editAccessHire(page);
  await page
    .getByLabel('Desktop capture file')
    .first()
    .setInputFiles({name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1)});
  await expect(page.getByText('That file is over the 5 MB limit.')).toBeVisible();
  await expect(page.getByText("That image couldn't be read", {exact: false})).toHaveCount(0);
});
