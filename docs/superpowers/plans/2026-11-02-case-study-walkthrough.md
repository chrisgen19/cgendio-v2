# Case Study Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make The Walkthrough a real layout of `/work/[slug]`, shown for projects with tour data, with its content in the database and editable in the admin.

**Architecture:** Four nullable or defaulted columns on `projects`, with the tour as one validated JSONB array. Pure helpers decide the layout and derive the frame's data. The preview's components are copied from the lab branch, take `ProjectDetail` as props, and their CSS moves to `globals.css`. The admin edits the tour in a client component that serialises to one hidden input.

**Tech Stack:** Next.js 16.4 App Router, Prisma 7 + PostgreSQL, Zod 4, Tailwind v4, Vitest, Playwright, Biome, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-02-case-study-walkthrough-design.md` (read it first; every task implements it)

## Global Constraints

- Read `CLAUDE.md` and `AGENTS.md`. Check installed versions and `node_modules/next/dist/docs/` before using an API.
- No new packages. No em or en dashes in anything written. No `2>&1` or `2>/dev/null`. Do not pipe builds, tests or migrations.
- `sampleCopy` from the lab must never reach this branch, a database or a page. Grep before the final commit.
- The five projects without tours must render exactly as they do today.
- Project rule: no separate CSS files except `globals.css`. Components get data only through `src/server/` types.
- Never push `feature/access-hire-design-lab`: the repo is public. Do not push this branch, open a PR or merge without Christian's go-ahead.
- 44px touch targets, WCAG 2.2 AA, `prefers-reduced-motion` respected, checked at 1440px and 390px.

## Review Focus

1. A page path like `//evil.example` would make `new URL(path, liveUrl)` link off-site: it must be rejected on save (Task 2 test).
2. A tour with no empty-note opening reuses its first stop as the opening frame, which must not produce duplicate React keys or a wrong selection box (Task 2 test on `tourFrames`, Task 4 e2e).
3. A project with a tour but no `liveUrl` must render, with paths as plain text and no links (Task 4 test).
4. Reordering so an empty-note stop is no longer first must give a clear error naming the stop, and keep the admin's unsaved edits (Tasks 2 and 5 tests).
5. Saving an older form or a project with no tour must keep `[]`, and whitespace-only reasoning text must count as empty (Task 2 tests).

---

### Task 1: Preserve the lab and start the branch

**Files:** none changed; git only. The spec and this plan stay untracked through the lab commit.

- [ ] **Step 1: Commit the lab locally, listing the paths**

```bash
git add scripts/design-lab.mjs public/design-lab/access-hire src/app/design-lab/access-hire src/components/design-lab/access-hire
git commit -m "feat(work): add three Access Hire case-study design previews"
```

- [ ] **Step 2: Confirm nothing was pushed and branch from main**

Run: `git status --short` (expected: only the two docs untracked), then `git switch main`, `git switch -c feature/case-study-walkthrough`.
Expected: `ls src/components/design-lab` shows only `fresh-fruit`. Tell Christian ports 3001 to 3003 are now dead, and stop the preview script.

- [ ] **Step 3: Commit the docs**

```bash
git add docs/superpowers/specs/2026-11-02-case-study-walkthrough-design.md docs/superpowers/plans/2026-11-02-case-study-walkthrough.md
git commit -m "docs(work): add the case study walkthrough design and plan"
```

---

### Task 2: Schema, migration and tour helpers

**Files:**
- Modify: `prisma/schema.prisma:48-78`, `src/server/content-schema.ts`, `src/server/content.ts:102-110`, `src/server/admin/form-schemas.ts`, `src/server/admin/form-schemas.test.ts:25-47`, `prisma/seed.mts`, `prisma/seed-data/projects.ts`
- Create: `prisma/migrations/20261102120000_project_walkthrough/migration.sql`, `src/lib/tour.ts`, `src/lib/tour.test.ts`, `src/server/admin/tour-form.ts`, `src/server/admin/tour-form.test.ts`

**Interfaces:**
- Produces, in `content-schema.ts`: `tourStopSchema`, `tourStopsSchema`, `type TourStop`, `type TourView`; `projectDetailSchema` gains `decision`, `contribution`, `outcome` (`string | null`) and `tourStops: TourStop[]`. Re-export the types from `src/server/content.ts`.
- Produces, in `src/lib/tour.ts`: `hasTour(stops: TourStop[]): boolean`; `tourFrames(stops: TourStop[]): {opening: TourStop; notes: TourStop[]; frames: TourStop[]}` where `frames[0]` is the opening and `frames[i + 1] === notes[i]`; `captureKey(stop: TourStop): string`; `captureGroups(stops: TourStop[]): {key: string; stops: TourStop[]}[]` with unique stops by `key`; `reasoningRows(project: Pick<ProjectDetail, 'decision' | 'contribution' | 'outcome'>): {label: 'The decision' | 'Our part' | 'The result'; text: string}[]`.
- Produces, in `tour-form.ts`: `parseTourField(raw: string): {ok: true; stops: TourStop[]} | {ok: false; message: string}`. The raw JSON is an array of drafts: a `TourStop` whose `positions` is a string, as typed in the admin.
- Produces: `projectFormSchema` output gains `decision`, `contribution`, `outcome`, `tourStops`.

- [ ] **Step 1: Write the failing helper tests in `src/lib/tour.test.ts`**

```ts
it('needs at least one stop with a note', () => {
  expect(hasTour([])).toBe(false);
  expect(hasTour([stop({note: '   '})])).toBe(false);
  expect(hasTour([stop({note: ''}), stop({key: 'b'})])).toBe(true);
});
it('uses an empty-note first stop as the opening only', () => {
  const opening = stop({key: 'a', note: ''});
  const note = stop({key: 'b'});
  expect(tourFrames([opening, note])).toEqual({opening, notes: [note], frames: [opening, note]});
});
it('reuses the first stop as the opening when it has a note', () => {
  const first = stop({key: 'a'});
  expect(tourFrames([first])).toEqual({opening: first, notes: [first], frames: [first, first]});
});
it('groups stops that share both captures, unique by key, in first-seen order', () => {
  const a = stop({key: 'a'});
  const b = stop({key: 'b', captures: otherCaptures});
  const c = stop({key: 'c'});
  expect(captureGroups([a, a, b, c]).map((g) => g.stops.map((s) => s.key))).toEqual([['a', 'c'], ['b']]);
});
it('splits on either capture differing', () => {
  expect(captureKey(stop())).not.toBe(captureKey(stop({captures: {...baseCaptures, mobile: otherCaptures.mobile}})));
});
it('drops empty and whitespace-only reasoning, keeping order and trimming', () => {
  expect(reasoningRows({decision: ' Why ', contribution: '   ', outcome: null})).toEqual([{label: 'The decision', text: 'Why'}]);
  expect(reasoningRows({decision: null, contribution: null, outcome: null})).toEqual([]);
});
```

`stop(overrides)` is a local factory returning a valid `TourStop`, with `baseCaptures` and `otherCaptures` constants.

- [ ] **Step 2: Write the failing form tests in `src/server/admin/tour-form.test.ts`**

```ts
it('parses drafts, turning the positions text into data', () => {
  expect(parseTourField(JSON.stringify([draft()]))).toEqual({ok: true, stops: [stop()]});
});
it.each([
  [[draft({positions: '{nope'})], 'Stop 1: positions are not valid JSON'],
  [[draft(), draft({key: 'b', captures: {...caps, desktop: {url: '', width: 0, height: 0}}})], 'Stop 2: the desktop capture is missing'],
  [[draft(), draft({key: 'b', captures: {...caps, mobile: {url: '', width: 0, height: 0}}})], 'Stop 2: the mobile capture is missing'],
  [[draft(), draft({key: 'b', note: ''})], 'Stop 2: only the first stop can have an empty note'],
  [[draft({path: '//evil.example'})], 'Stop 1: the page path must start with a single /'],
  [[draft({path: 'category'})], 'Stop 1: the page path must start with a single /'],
  [[draft({emphasis: 'absent'})], 'Stop 1: the emphasis must be words from the note'],
  [[draft({heading: ''})], 'Stop 1: the heading is required'],
  [[draft({onScreen: ''})], 'Stop 1: the on screen line is required'],
  [[draft({captures: {...caps, desktop: {url: 'javascript:alert(1)', width: 1, height: 1}}})], 'Stop 1: the desktop capture is missing'],
  [[draft({key: 'a'}), draft({key: 'a'})], 'Stop 2: duplicate stop key'],
])('rejects %j', (drafts, message) => {
  expect(parseTourField(JSON.stringify(drafts))).toEqual({ok: false, message});
});
it('rejects a field that is not a JSON array', () => {
  expect(parseTourField('nope')).toEqual({ok: false, message: 'The tour could not be read. Reload the page and try again.'});
});
it('rejects more than 30 stops', () => {
  expect(parseTourField(JSON.stringify(manyDrafts(31)))).toEqual({ok: false, message: 'A tour can have at most 30 stops'});
});
```

Add to `form-schemas.test.ts`: the existing `toEqual` gains `decision: null, contribution: null, outcome: null, tourStops: []`; a missing `tourStops` field parses to `[]`; a whitespace-only `decision` becomes `null`; a 2001-character `outcome` fails; and an invalid tour fails with `fieldErrors.tourStops` containing the message.

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm exec vitest run src/lib/tour.test.ts src/server/admin/tour-form.test.ts src/server/admin/form-schemas.test.ts`
Expected: FAIL (modules and fields missing).

- [ ] **Step 4: Add the columns and generate the SQL**

Add to `Project`: `decision String?`, `contribution String?`, `outcome String?`, `tourStops Json @default("[]") @map("tour_stops")`, with a `///` comment that the tour's shape is in `content-schema.ts`.
Run: `git show main:prisma/schema.prisma` into a file in the session's scratchpad directory, then `pnpm exec prisma migrate diff --from-schema <that file> --to-schema prisma/schema.prisma --script`, and save the output to the migration file. Then run `pnpm db:deploy` and `pnpm db:generate`.
Expected: local DB migrated. Restart `next dev` (it keeps the old Prisma client).

- [ ] **Step 5: Implement the schemas and helpers**

`tourStopSchema` per the spec's shape. Numbers non-negative; `width`, `height` positive integers; `zoom` positive; `url` is `z.url()` (public content may hold any URL; only the form narrows to http and https). `tourStopsSchema` adds: an empty `note` only at index 0, a non-empty `onScreen` on every stop with a note (an opening stop may leave it empty), `emphasis` must occur in `note`, and unique keys. `parseTourField` narrows capture URLs to http(s) and returns the exact messages tested above. Wire `toProjectDetail` and `projectFormSchema` (`tourStops` defaults to `'[]'` when missing and adds a Zod issue with the returned message; the three text fields use `optionalText.pipe(z.string().max(2000).nullable())`). Seed: `tourStops: p.tourStops ?? []` and the three fields as null; make `tourStops` optional on `SeedProject`.

- [ ] **Step 6: Run the tests and type-check**

Run: `pnpm test`, then `pnpm typecheck`. Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add prisma src/lib/tour.ts src/lib/tour.test.ts src/server
git commit -m "feat(work): store case study tours and reasoning on projects"
```

---

### Task 3: Access Hire's tour content

**Files:**
- Create: `prisma/seed-data/access-hire-tour.ts`, `src/server/project-tour-migration.test.ts`
- Modify: `prisma/seed-data/projects.ts:14-33`, `prisma/migrations/20261102120000_project_walkthrough/migration.sql`

**Interfaces:**
- Consumes: `TourStop`, `tourStopsSchema` from Task 2.
- Produces: `accessHireTour: TourStop[]` (8 stops, first with an empty note), set as `tourStops` on the `access-hire` seed project.
- Source: `git show feature/access-hire-design-lab:src/components/design-lab/access-hire/walkthrough-stops.ts`, plus `content.ts` on that branch. Do not use anything from `sampleCopy`.

- [ ] **Step 1: Extract and clean the captures, into the scratchpad only**

Extract `public/design-lab/access-hire/screens/*` from the lab branch with `git show`. With `magick`:
- `home-desktop`: crop to the top 2400px (from 5207). `home-mobile`: crop to the top 2800px (from 6109). Confirm both end above the blank band and all customer names, and that every position in the tour still falls inside.
- `branches-desktop`: paint the staff names and phone numbers solid white, keeping 1600x1942 exactly.
- View every capture at full size, and paint out any other personal details without changing dimensions.
Expected: new `width` and `height` recorded for the two cropped images.

- [ ] **Step 2: Show the cleaned captures to Christian and wait**

Stop for approval, listing the files. Uploaded images are public straight away. Do not continue without a yes.

- [ ] **Step 3: Upload to R2**

Upload as `images/2026/access-hire-tour/<name>.webp` to `cgendio-media`, using a one-off script in the scratchpad with `aws4fetch` and `.env`. Do not commit the script. Confirm every public URL returns 200 and `image/webp`.

- [ ] **Step 4: Write the failing test `src/server/project-tour-migration.test.ts`**

```ts
const accessHire = projects.find((p) => p.slug === 'access-hire');
const unquote = (sql: string) => sql.replaceAll("''", "'");

it('adds the columns', () => {
  expect(sql).toMatch(/ADD COLUMN\s+"tour_stops" JSONB NOT NULL DEFAULT '\[\]'/);
});
it('seeds a valid Access Hire tour with an opening and seven notes', () => {
  const stops = tourStopsSchema.parse(accessHire?.tourStops);
  expect(stops).toHaveLength(8);
  expect(stops[0].note).toBe('');
});
it('backfills the seed tour, only while empty', () => {
  const match = sql.match(/UPDATE "projects" SET "tour_stops" = '(.+)'::jsonb WHERE "slug" = 'access-hire' AND "tour_stops" = '\[\]'::jsonb;/);
  expect(JSON.parse(unquote(match?.[1] ?? ''))).toEqual(accessHire?.tourStops);
});
it('keeps every capture on the tour folder and leaves the reasoning empty', () => {
  for (const stop of accessHire?.tourStops ?? []) expect(stop.captures.desktop.url).toContain('/images/2026/access-hire-tour/');
  expect(sql).not.toMatch(/"decision" =|"contribution" =|"outcome" =/);
});
```

- [ ] **Step 5: Run it to verify it fails**

Run: `pnpm exec vitest run src/server/project-tour-migration.test.ts`. Expected: FAIL.

- [ ] **Step 6: Write the seed data and the backfill**

Inline the stop text and positions from `walkthrough-stops.ts` as plain literals, resolving its references (`writeUp`, `brands`, `siteFacts`) to their strings. Alt text from `PAGE_ALTS`. Generate the migration's `UPDATE` from `JSON.stringify(accessHireTour)`, doubling each `'`, and append it to the migration with a comment on why. Since the local DB already ran this migration, apply the same `UPDATE` to it by hand once with `docker exec` so it matches.

- [ ] **Step 7: Run the tests, and check a fresh database**

Run: `pnpm test`. Then `pnpm test:e2e:prepare`.
Expected: PASS, and `cgendio_test` has 8 stops for `access-hire`.

- [ ] **Step 8: Commit**

```bash
git add prisma src/server/project-tour-migration.test.ts
git commit -m "feat(work): add the Access Hire tour to the seed and backfill it"
```

---

### Task 4: The Walkthrough layout on the public routes

**Files:**
- Create: `src/components/case-study/walkthrough.tsx`, `walkthrough-stage.tsx`, `walkthrough-capture.tsx`, `src/components/case-study/case-study-body.tsx`, `e2e/public/walkthrough.spec.ts`
- Modify: `src/app/globals.css`, `src/app/work/[slug]/page.tsx:33`, `src/app/preview/[type]/[slug]/page.tsx:39`, `e2e/public/case-study.spec.ts`
- Source: the three components and `walkthrough.module.css` from the lab branch, via `git show`

**Interfaces:**
- Consumes: `hasTour`, `tourFrames`, `captureGroups`, `captureKey`, `reasoningRows`, `TourStop`, `TourView`.
- Produces: `CaseStudyBody({project}: {project: ProjectDetail})` (async server component) rendering `Walkthrough` when `hasTour(project.tourStops)`, else `CaseStudyArticle`. Both routes render it in place of `CaseStudyArticle`. `NextProject` and `ContactCta` stay in the route.

- [ ] **Step 1: Write the failing e2e spec `e2e/public/walkthrough.spec.ts`**

In `beforeEach`, `page.route` every URL whose decoded form contains `access-hire-tour` and fulfil it with `e2e/support/fixtures/about-photo.png`, so the spec stays offline. Each test resets the row it changes.

```ts
test('Access Hire opens on the frame with its facts in view', async ({page}) => {
  await page.goto('/work/access-hire');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Access Hire Australia');
  await expect(main(page).getByRole('figure', {name: 'The live site, in a browser'})).toBeVisible();
  await expect(main(page).getByRole('definition').filter({hasText: 'Senior Full Stack Developer'})).toBeVisible();
});
test('the address bar follows the note on the reading line', async ({page}) => {
  await page.goto('/work/access-hire');
  await page.getByRole('heading', {level: 3, name: 'Category page'}).evaluate((el) => {
    window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2, behavior: 'instant'});
  });
  await expect(page.getByRole('link', {name: 'Open Category page on the live site'}).first()).toBeVisible();
  await expect(main(page).getByRole('figure', {name: 'The live site, in a browser'})).toContainText('/category/scissor-lift');
});
test('the device switch changes the frame', async ({page}) => {
  await page.goto('/work/access-hire');
  await main(page).getByRole('button', {name: 'Mobile'}).first().click();
  await expect(main(page).locator('[data-device="mobile"]')).toBeVisible();
});
test('the write-up shows and empty reasoning stays hidden', async ({page}) => {
  await page.goto('/work/access-hire');
  await expect(page.getByRole('heading', {level: 2, name: 'Built'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Why we built it this way'})).toHaveCount(0);
});
test('only the filled reasoning fields show', async ({page}) => {
  await queryTestDb("UPDATE projects SET outcome = 'A result' WHERE slug = $1", ['access-hire']);
  // revalidate as the admin e2e does, then:
  await expect(page.getByRole('heading', {level: 3, name: 'The result'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Our part'})).toHaveCount(0);
});
test('reduced motion shows each note with its own capture', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/work/access-hire');
  await expect(page.getByRole('img', {name: /scissor lift category page/}).first()).toBeVisible();
});
test('a project without a tour keeps the current layout', async ({page}) => {
  await page.goto('/work/myimprov');
  await expect(main(page).getByRole('figure', {name: 'The live site, in a browser'})).toHaveCount(0);
  await expect(main(page).locator('article img[src^="data:image/png"]')).toBeVisible();
});
test('a tour without a live site renders paths without links', async ({page}) => {
  await queryTestDb('UPDATE projects SET live_url = NULL WHERE slug = $1', ['access-hire']);
  // revalidate, then:
  await expect(main(page).getByRole('link', {name: /on the live site/})).toHaveCount(0);
  await expect(main(page).getByText('/category/scissor-lift').first()).toBeVisible();
});
```

`main(page)` is the visible `main`. Read `e2e/admin/admin.spec.ts` for how a test logs in and saves so the cached page revalidates; drive the two database-changing tests through that same path if a direct `UPDATE` does not revalidate. In `case-study.spec.ts`, move the cover assertion to `/work/myimprov` and keep the rest for Access Hire. Add `/work/myimprov` to `a11y.spec.ts` beside `/work/access-hire`.

- [ ] **Step 2: Build the spec's server to verify it fails**

Run: `pnpm test:e2e:prepare`, `pnpm test:e2e:build`, `pnpm exec playwright test e2e/public/walkthrough.spec.ts`
Expected: FAIL (no frame on the page).

- [ ] **Step 3: Move the CSS**

Copy the module's rules into `globals.css` under a comment block, with each class prefixed `walkthrough-` (for example `.tourOnly` becomes `.walkthrough-tour-only`, `.deviceSwap` becomes `.walkthrough-device-swap`). Keep the `walkthrough-frame` view transition name. Do not import a CSS module. Follow the stale `globals.css` gotcha in `CLAUDE.md` when restarting `next dev`.

- [ ] **Step 4: Copy and adapt the components**

Replace `styles.x` with the new class names. Remove imports from `./content` and `./walkthrough-stops`, `sampleCopy`, `hostOf`'s `'accesshire.net'` fallback (no `liveUrl` means no host and no links) and `NextProject`. `Walkthrough({project})` takes `ProjectDetail`; `AfterTour` becomes the Markdown write-up from `renderMarkdown(project.caseStudy)` (left out when empty), then reasoning from `reasoningRows` (no section when empty). Add a Repository link beside Live site when `repoUrl` is set. In the stage: `frames` replaces `stops`, `captureGroups` replaces `pages`, and `Selection` is rendered per unique stop in each group. `CaptureImage` takes the stop's capture and `alt` and uses `isOptimizableCover` for `unoptimized`. `captureSize` is gone: size comes from `stop.captures[device]`. Fix `text-white` on the device switch's pressed state if it fails in dark mode, because the `white` token flips there.

- [ ] **Step 5: Add `CaseStudyBody` and use it in both routes**

- [ ] **Step 6: Run the spec**

Run: `pnpm test:e2e:build`, `pnpm exec playwright test e2e/public/walkthrough.spec.ts e2e/public/case-study.spec.ts e2e/public/a11y.spec.ts e2e/public/placeholders.spec.ts e2e/public/reduced-motion.spec.ts`
Expected: PASS.

- [ ] **Step 7: Check it by eye**

Screenshot `/work/access-hire` and `/work/myimprov` at 1440x900 and 390x844, light and dark, plus mid-scroll. Expected: matches the preview, and `/work/myimprov` looks as it does on `main`. Grep the built CSS for a `walkthrough-` rule per the gotcha.

- [ ] **Step 8: Commit**

```bash
git add src e2e
git commit -m "feat(work): show The Walkthrough on case studies with a tour"
```

---

### Task 5: Edit tours in the admin

**Files:**
- Create: `src/components/admin/tour-stops-field.tsx`, `e2e/admin/tour.spec.ts`
- Modify: `src/components/admin/project-form.tsx`, `src/components/admin/upload-field.tsx`, `src/app/admin/(panel)/projects/[id]/page.tsx`

**Interfaces:**
- Consumes: `parseTourField` messages via `errors.tourStops`; `TourStop`.
- Produces: `UploadField` gains optional `onUploaded?: (file: {url: string; width: number; height: number} | null) => void`, called after upload with sizes from `createImageBitmap(file)` and with `null` on Remove. Current uses are unchanged. `TourStopsField({defaultStops, errors}: {defaultStops: TourStop[]; errors: FieldErrors})` renders the hidden input `name="tourStops"`.

- [ ] **Step 1: Write the failing spec `e2e/admin/tour.spec.ts`**

Use the admin test's existing sign-in. Each test restores the tour from a saved copy of the row.

```ts
test('the reasoning fields save', async ({page}) => {
  await editAccessHire(page);
  await page.getByLabel('The decision').fill('Because');
  await save(page);
  const {rows} = await queryTestDb('SELECT decision FROM projects WHERE slug = $1', ['access-hire']);
  expect(rows[0]?.decision).toBe('Because');
});
test('saving without changes keeps the tour identical', async ({page}) => {
  const before = await tourOf('access-hire');
  await editAccessHire(page);
  await save(page);
  expect(await tourOf('access-hire')).toEqual(before);
});
test('bad positions JSON is refused, naming the stop, and keeps the edits', async ({page}) => {
  const before = await tourOf('access-hire');
  await editAccessHire(page);
  await page.getByLabel('Heading').nth(2).fill('Edited heading');
  await page.getByLabel('Positions JSON').nth(2).fill('{nope');
  await page.getByRole('button', {name: 'Save project'}).click();
  await expect(page.getByText('Stop 3: positions are not valid JSON')).toBeVisible();
  await expect(page.getByLabel('Heading').nth(2)).toHaveValue('Edited heading');
  expect(await tourOf('access-hire')).toEqual(before);
});
test('moving a stop saves the new order', async ({page}) => {
  await editAccessHire(page);
  await page.getByRole('button', {name: 'Move stop 3 down'}).click();
  await save(page);
  expect((await tourOf('access-hire')).map((s) => s.key).slice(2, 4)).toEqual(['brand', 'category']);
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
  expect(await tourOf('access-hire')).toHaveLength(7);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test:e2e:build`, `pnpm exec playwright test e2e/admin/tour.spec.ts`. Expected: FAIL (no fields).

- [ ] **Step 3: Add `onUploaded` to `UploadField`**

If `createImageBitmap` fails, show a toast and report nothing. The form's upload-in-progress tracking applies as it does today.

- [ ] **Step 4: Build `TourStopsField` and wire the form**

State is an array of drafts (positions as text from `JSON.stringify(positions, null, 2)`), new stops keyed with `crypto.randomUUID()`. Labels: Heading, Note, Emphasis, Selected label, On screen, Page path, Alt text, Desktop capture, Mobile capture, Positions JSON. Buttons: Add stop, `Move stop N up`, `Move stop N down`, `Remove stop N` (44px, disabled at the ends). Hint on Note: "Leave empty on the first stop to use it only as the opening frame." Add the card to `ProjectForm` with The decision, Our part, The result (`TextAreaField`, 4 rows), and pass the fields through `ProjectFormValues` and the edit page, parsing `tourStops` with `tourStopsSchema`.

- [ ] **Step 5: Run the specs**

Run: `pnpm test:e2e:build`, `pnpm exec playwright test e2e/admin`. Expected: PASS, including the existing admin specs, because the tour's https URLs pass the form rule.

- [ ] **Step 6: Commit**

```bash
git add src e2e
git commit -m "feat(admin): edit case study tours and reasoning in the project form"
```

---

### Task 6: Full gate and hand-over

**Files:** none expected, beyond fixes.

- [ ] **Step 1: Run the quality gate, one command at a time**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm db:up`, `pnpm test:e2e`.
Expected: all PASS, with no visual baseline changes, because the baselines cover home page sections only. If `e2e/admin/admin.spec.ts:31` is the only local failure, follow the clock drift gotcha in `CLAUDE.md`.

- [ ] **Step 2: Confirm the anti-goals**

Run: `git grep -n "sampleCopy\|marketing team" -- src prisma e2e`, and `git diff main --stat -- src/components/design-lab scripts`.
Expected: no matches and no changes. Fetch all eight capture URLs and confirm no staff or customer details by eye.

- [ ] **Step 3: Report and wait**

Report results, the new visible copy for approval, and that nothing has been pushed. Ask Christian whether to push and open the PR. Merging deploys nothing today (`cgdiomampo.dev` runs `cgendio-v1`), but the repo is public.
