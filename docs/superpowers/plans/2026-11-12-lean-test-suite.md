# Lean Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop seed-copy edits from failing tests and cut CI from ~8.5 to ~6 minutes, without losing coverage of real regressions.

**Architecture:** Replace SQL-matching migration tests with one rule-based seed test; make e2e specs read expected values from `prisma/seed-data` and `src/lib` instead of literals; stop the mobile Playwright project repeating viewport-independent specs; shorten the full-film test; drop the per-section screenshots; run admin-dev validation as a parallel CI job; then try 4 workers.

**Tech Stack:** Vitest, Playwright, GitHub Actions, TypeScript (Biome style), pnpm, Node 24.

**Spec:** `docs/superpowers/specs/2026-11-12-lean-test-suite-design.md` (commit `e916cf1`). Section letters (A1, B2, ...) below refer to it.

## Global Constraints

- Work in the worktree `/home/chrisgen19/projects/cgendio-v2-lean-tests`, branch `feature/lean-test-suite`. Never commit to `main`.
- Never edit a file under `prisma/migrations/`.
- Do not touch the files PR #158 changes: `e2e/support/test-env.ts`, `e2e/support/prepare.mts`, `e2e/public/blog.spec.ts`, `vitest.config.mts`, `compose.yaml`.
- No new packages.
- Biome style: single quotes, no bracket spacing (`{expect, test}`), semicolons, trailing commas, line width 150. Named exports. Utilities are arrow functions.
- Every removed test must have a named replacement or a named existing test that covers its behaviour (spec, anti-goals).
- Never loosen an exact expectation to `toBeGreaterThan(0)` where the exact value can be read from data.
- `seo.spec.ts` copy assertions stay word for word.
- No em dashes or en dashes in anything written (comments, commit messages, docs).
- Conventional Commits, one per task. Body only for the non-obvious why.
- Specs read the seed from `prisma/seed-data/*.ts` by relative path; the project whose tour `prepare.mts` clears (`NO_TOUR_SLUG`, `premium-mobile-car-valeting`) must never have its tour read from the seed by a spec.
- Local e2e: the Postgres container `cgendio-v2-db` (port 5437) is shared with other checkouts. Reuse it; do not run `pnpm db:up` from the worktree if it is already up (`pg_isready -h 127.0.0.1 -p 5437`). Before any `pnpm test:e2e` or `playwright test`, check port 3100 with `ss -ltn | grep ':3100 '`: if another checkout's server holds it, Playwright reuses that server and tests the wrong code. Wait until it is free, or rely on CI for that check, and say which.
- Admin edit e2e tests that save then read `/` can fail locally from WSL2 clock drift (`CLAUDE.md`): judge those on CI.

## Review Focus

1. **A cleared or missing tour read from the seed.** A spec that loops over seed tours and includes `NO_TOUR_SLUG` expects stops the page does not render. The loop in Task 6 excludes it explicitly and its test name says so.
2. **A seed loop that matches nothing.** A filter typo makes `describe.each([])` or a `for` over an empty list pass silently. Task 1 and Task 6 each guard their list as non-empty. They deliberately don't pin its membership: that would make adding a project a test edit, the very thing this work removes.
3. **The film jump pausing playback.** If a chapter click pauses the film, the shortened test times out instead of proving the no-loop rule. Task 4 asserts "Pause film" right after the jump, with a resume fallback.
4. **The CSP compared with a different site URL than the build used.** The e2e build sets `NEXT_PUBLIC_SITE_URL` to `E2E_BASE_URL`; PR #158 may change that value. Task 2 builds the expected policy from the imported `E2E_BASE_URL`, never a literal.
5. **Admin-dev failures losing their report.** Once admin-dev leaves the `checks` job, its report is no longer in the `playwright-report` artifact. Task 8 uploads `playwright-report/admin-dev` and `test-results/admin-dev` from the new job on failure.

---

### Task 0: Prepare the worktree

**Files:** none.

- [ ] **Step 1: Install dependencies**

Run in the worktree: `pnpm install --frozen-lockfile`. Expected: exit 0 (postinstall runs `prisma generate`).

- [ ] **Step 2: Confirm the baseline**

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`. Expected: all exit 0; Vitest reports `Tests  410 passed (410)` (or the count on `origin/main` if it has moved; note it).

---

### Task 1: One seed-integrity test replaces the project migration tests (B1)

**Files:**
- Create: `src/server/seed-integrity.test.ts`
- Delete: `src/server/project-tour-migration.test.ts`, `src/server/project-brand-migration.test.ts`

**Interfaces:**
- Consumes: `projects` from `prisma/seed-data/projects.ts`; `tourStopsSchema` from `src/server/content-schema.ts`; `hasTour(stops: TourStop[]): boolean` and `tourHref(path: string, liveUrl: string | null): string | null` from `src/lib/tour.ts`.
- Produces: nothing other tasks use.

- [ ] **Step 1: Write the test**

A header comment: these are the rules every seeded tour keeps whatever its wording; they replace the per-migration tests, whose migrations have run and whose UPDATEs match no rows on a fresh database (no migration inserts projects; the seed runs after).

```ts
const toured = projects.filter((project) => project.tourStops?.length);

describe('seeded tours', () => {
  // A guard, not a count: a filter typo must not empty the loop below, and a new project must not need a test edit
  it('cover at least one project', () => {
    expect(toured.length).toBeGreaterThan(0);
  });

  describe.each(toured)('$slug', (project) => {
    const stops = project.tourStops ?? [];
    it('parses and has a note to show', ...);            // tourStopsSchema.safeParse(stops).success === true; hasTour(stops) === true
    it('opens on a stop with no note, and every later stop has one', ...); // stops[0].note === ''; stops.slice(1) all note.trim() !== ''
    it('uses each stop key once', ...);                    // new Set(keys).size === keys.length
    it('keeps every capture in a tour folder', ...);       // desktop and mobile url match /\/images\/\d{4}\/[a-z0-9-]+-tour\//
    it('keeps every box inside its capture', ...);         // for desktop and mobile: box.x + box.w <= width, box.y + box.h <= height
    it('links every stop to the live site', ...);          // stops whose tourHref(stop.path, project.liveUrl ?? null) is null, as keys, toEqual([])
  });
});
```

Failing assertions report stop keys (collect offenders into an array and `toEqual([])`), so a failure names the stop.

- [ ] **Step 2: Run it**

Run: `pnpm exec vitest run src/server/seed-integrity.test.ts`. Expected: PASS, 37 tests.

- [ ] **Step 3: Prove it can fail**

Temporarily set one Access Hire stop's desktop `box.w` to `99999` in `prisma/seed-data/access-hire-tour.ts`, rerun. Expected: FAIL in `access-hire > keeps every box inside its capture`, naming the stop key. Revert with `git checkout prisma/seed-data/access-hire-tour.ts`.

- [ ] **Step 4: Delete the old tests and run the unit suite**

`git rm src/server/project-tour-migration.test.ts src/server/project-brand-migration.test.ts`, then `pnpm test`. Expected: PASS; count is the baseline minus 49 plus 37.

- [ ] **Step 5: Commit**

```bash
git add src/server/seed-integrity.test.ts
git commit -m "test(seed): check tour rules instead of matching applied migrations"
```

---

### Task 2: Header checks in one place, comparing with the imported policy (A3 first half, B3)

**Files:**
- Modify: `e2e/public/deploy.spec.ts`
- Modify: `e2e/public/csp.spec.ts` (remove `CSP_DIRECTIVES`, the `sends the CSP and HSTS headers` loop and `the policy has no upgrade-insecure-requests on an http site`; update its header comment to say the header checks live in `deploy.spec.ts`)

**Interfaces:**
- Consumes: `contentSecurityPolicy({isDev, siteUrl}: {isDev: boolean; siteUrl?: string}): string` and `HSTS: string` from `src/lib/security-headers.ts`; `E2E_BASE_URL` from `e2e/support/test-env.ts`.
- Produces: `deploy.spec.ts` holds only `request`-fixture tests (Task 3 relies on this).

- [ ] **Step 1: Rewrite the header loop in `deploy.spec.ts`**

Keep `/api/health reports the server and the database, uncached` unchanged. Replace the security-header loop with one loop over the same four paths (`/`, `/writing/wordpress-news-october-2026`, `/feed.xml`, `/api/health`), named `${path} sends the security, CSP and HSTS headers`, asserting the three `SECURITY_HEADERS` values as today, plus:

```ts
const CSP = contentSecurityPolicy({isDev: false, siteUrl: E2E_BASE_URL});
expect(headers['content-security-policy'], `CSP on ${path}`).toBe(CSP);
expect(headers['strict-transport-security'], `HSTS on ${path}`).toBe(HSTS);
```

Move `the policy has no upgrade-insecure-requests on an http site` here unchanged. Update the file comment to mention the CSP and HSTS headers (src/lib/security-headers.ts, #99).

- [ ] **Step 2: Remove the moved parts from `csp.spec.ts`**

The violation sweeps and the two image tests stay untouched.

- [ ] **Step 3: Check the list**

Run: `pnpm exec playwright test --list e2e/public/deploy.spec.ts e2e/public/csp.spec.ts`. Expected: no import error; `deploy.spec.ts` lists 6 tests per project, `csp.spec.ts` no longer lists `sends the CSP`.

- [ ] **Step 4: Run them (port check first, see Global Constraints)**

Run: `pnpm test:e2e:prepare && pnpm exec playwright test e2e/public/deploy.spec.ts e2e/public/csp.spec.ts --project=desktop` (the web server builds first when none is running). Expected: PASS. If port 3100 is held by another checkout, skip and record that CI verifies it.

- [ ] **Step 5: Commit**

```bash
git add e2e/public/deploy.spec.ts e2e/public/csp.spec.ts
git commit -m "test(e2e): check the CSP header against the policy the build uses"
```

---

### Task 3: The mobile project skips viewport-independent specs (A3 second half)

**Files:**
- Modify: `playwright.config.ts` (the `mobile` project)

**Interfaces:**
- Consumes: Task 2 (`deploy.spec.ts` is request-only).

- [ ] **Step 1: Add `testIgnore` to the mobile project**

`testIgnore: [/live-urls\.spec\.ts$/, /deploy\.spec\.ts$/, /seo\.spec\.ts$/]`, with a one-line comment: these read HTTP responses and head tags, which no viewport changes, so desktop runs them once.

- [ ] **Step 2: Verify the lists**

Run: `pnpm exec playwright test --list --project=mobile` and save the output; it must contain no `live-urls.spec.ts`, `deploy.spec.ts` or `seo.spec.ts` line. Run the same with `--project=desktop`: all three still listed. Note the new mobile total.

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "test(e2e): run viewport-independent specs on desktop only"
```

---

### Task 4: The film test starts from the last chapter (A2)

**Files:**
- Modify: `e2e/public/hero.spec.ts` (test `the film plays once and holds on the brand card`)

**Interfaces:**
- Consumes: `heroControls(page)` from `e2e/support/hero.ts`: `desktopChapter('Live')`, `mobileSegment('Live')`, `toggle`, `skip`, `seeMyWork`.

- [ ] **Step 1: Rewrite the test body**

After `beforeEach` has started the film: click the Live control (`isMobile() ? mobileSegment('Live') : desktopChapter('Live')`), expect it to have `aria-current="step"`, then expect `toggle` to read `Pause film`; if it reads `Play film`, click it once and expect `Pause film`. Then keep today's assertions: `Replay film` (timeout 20_000), `waitForTimeout(3_000)`, still `Replay film`, `skip` count 0, `seeMyWork` visible, desktop shows `00:30 / 00:30`. Lower `test.setTimeout` to `60_000`. Update the comment: the jump keeps the test to the film's last ~8s while still proving it ends once and holds.

- [ ] **Step 2: Run it (port check first)**

Run: `pnpm exec playwright test e2e/public/hero.spec.ts -g "plays once"`. Expected: PASS on desktop and mobile, each under 15s (was 35.5s and 31.2s). If the port is held, record that CI verifies it and compare durations in the PR's report.

- [ ] **Step 3: Commit**

```bash
git add e2e/public/hero.spec.ts
git commit -m "test(hero): check the film ends once from its last chapter"
```

---

### Task 5: Drop the section snapshots and the duplicate inbox test (D, C1, E)

**Files:**
- Modify: `e2e/public/visual.spec.ts`
- Delete: 28 files `e2e/public/__screenshots__/visual.spec.ts/{about,what-we-build,work,milestones,timeline,blog,contact}-{desktop,mobile}-{linux,darwin}.png`
- Delete: `e2e/support/flatten-work-stack.css`, `e2e/support/flatten-timeline-counter.css`
- Modify: `e2e/support/hide-header.css` (comment only)
- Modify: `e2e/admin/admin.spec.ts`
- Modify: `CLAUDE.md` (the "e2e specs" gotcha)

- [ ] **Step 1: Trim `visual.spec.ts`**

Remove `SECTIONS`, `STYLES` and the loop. Keep `hero (film hidden)`, `header, stuck past the hero` and `stack strip` byte for byte (their baselines must stay valid). Rewrite the file comment: screenshots of the hero, the stuck header and the stack strip; the sections' behaviour is covered by their own specs, and per-section shots were dropped because a height change above one shifted every crop below it.

- [ ] **Step 2: Delete the baselines and stylesheets**

`git rm` the 28 PNGs and the two CSS files. Then `git ls-files e2e/public/__screenshots__/visual.spec.ts` lists exactly 12 files (`hero-*`, `header-stuck-*`, `stack-*`).

- [ ] **Step 3: Fix the pointers**

In `hide-header.css`, replace "Same reasoning as flatten-work-stack.css." with the reason stated in place. In `CLAUDE.md`, the e2e specs gotcha keeps "Sticky layouts need flattening for element screenshots (`stylePath`)" and points at `e2e/support/hide-header.css` as the example. Then `grep -rn "flatten-" --exclude-dir=node_modules --exclude-dir=docs .` returns nothing.

- [ ] **Step 4: Remove the duplicate inbox test**

Delete `a contact message arrives in the admin inbox` from `e2e/admin/admin.spec.ts`; drop imports it alone used (`fillContactForm`, `uniqueToken`, `useOwnIp` if now unused). `workflows.spec.ts`'s `inbox read state and deletion persist across reloads` covers it.

- [ ] **Step 5: Verify**

`pnpm lint` exits 0. `pnpm exec playwright test --list e2e/public/visual.spec.ts` lists 3 tests per project. With the port free: `pnpm exec playwright test e2e/public/visual.spec.ts` passes against the kept baselines.

- [ ] **Step 6: Commit**

```bash
git add -A e2e CLAUDE.md
git commit -m "test(visual): keep the hero, header and stack shots, drop the section shots"
```

---

### Task 6: The walkthrough specs read the seed (B2, walkthrough)

**Files:**
- Modify: `e2e/public/walkthrough.spec.ts`
- Modify: `e2e/public/case-study.spec.ts` (title and role)

**Interfaces:**
- Consumes: `projects` from `prisma/seed-data/projects.ts`; `tourFrames(stops: TourStop[]): {opening: TourStop; notes: TourStop[]; frames: TourStop[]}` from `src/lib/tour.ts`; `NO_TOUR_SLUG` from `e2e/support/test-env.ts`.

- [ ] **Step 1: Add helpers at the top of `walkthrough.spec.ts`**

`const project = (slug: string) => ...` (throws if missing), `const stop = (slug: string, key: string) => ...` (throws if missing). Access Hire values come from these by key: `opening`, `home`, `category`, `services`, `credit`, `branches`, and the last stop (`tourStops.at(-1)`); MyImprov from key `lms`.

- [ ] **Step 2: Replace the literals**

| Today | From the seed |
|---|---|
| `'Access Hire Australia'` (h1) | `project('access-hire').title` |
| `'Senior Full Stack Developer'` | `project('access-hire').role` |
| `'https://www.accesshire.net/'` | `project('access-hire').liveUrl` |
| `toHaveCount(7)` on `[data-stop]` | `tourFrames(tour).notes.length` |
| `'Brand banner'` | `stop('access-hire', 'opening').selected` |
| `'Equipment categories'`, `'Home page'` heading | `stop('access-hire', 'home').selected`, `.heading` |
| `'Category page'`, `'/category/scissor-lift'`, `/scissor lift category page/` | `stop('access-hire', 'category').heading`, `.path`, `.alt` (img name, exact) |
| `'Services'`, `'/what-we-do/services'` (Services test) | `stop('access-hire', 'services').heading`, `.path` |
| `'/credit-application'` | `stop('access-hire', 'credit').path` |
| `'/what-we-do/services'` (jump-to-bottom tests) | the last stop's `.path` |
| `OPENING_LINK` | built from `stop('access-hire', 'opening').heading`, regex-escaped |
| `'Branch finder'`, `/branch finder/` | `stop('access-hire', 'branches').heading`, `.alt` (exact) |
| `'Student login'`, `courses.myimprov.com`, its href | `stop('myimprov', 'lms').heading`, `new URL(.path).host`, `.path` |

In `case-study.spec.ts`, the h1 and the definition text come from `project('access-hire').title` and `.role` the same way (a local helper; no shared module).

- [ ] **Step 3: One loop replaces the four per-project count tests**

Delete `MyImprov shows a note...`, `Merthyr Village shows...`, `Experience Sunnybank shows...`, `Fresh Fruit and Veg Shop shows...`. Add, for every seed project with a tour except `access-hire` (covered above) and `NO_TOUR_SLUG` (its tour is cleared in the e2e database), a test `${title} shows a note for each stop after its opening`: frame visible, `[data-stop]` count equals `tourFrames(stops).notes.length`, and every note's heading is visible as an h3. Guard: at module level, throw if the loop's list is empty or contains `access-hire` or `NO_TOUR_SLUG`, so a filter typo cannot empty it or pull in the cleared tour. Today it covers `myimprov`, `merthyr-village`, `experience-sunnybank`, `fresh-fruit-and-veg`; check that in the `--list` output, but don't assert it.

- [ ] **Step 4: Verify**

`grep -nE "'(Category page|Branch finder|Student login|Tenant page|Office boxes|Specialty stores|California)'|toHaveCount\((3|4|5|6|7)\)" e2e/public/walkthrough.spec.ts` returns nothing. `pnpm exec playwright test --list e2e/public/walkthrough.spec.ts` imports cleanly. With the port free: `pnpm exec playwright test e2e/public/walkthrough.spec.ts e2e/public/case-study.spec.ts` passes on both projects.

- [ ] **Step 5: Commit**

```bash
git add e2e/public/walkthrough.spec.ts e2e/public/case-study.spec.ts
git commit -m "test(walkthrough): read tour stops and project facts from the seed"
```

---

### Task 7: Milestones, timeline and stack specs read the seed (B2, the rest)

**Files:**
- Modify: `e2e/public/milestones.spec.ts`, `e2e/public/timeline.spec.ts`, `e2e/public/stack.spec.ts`
- Modify: `src/lib/stack-groups.test.ts`

**Interfaces:**
- Consumes: `milestones` (`prisma/seed-data/milestones.ts`, in display order), `timeline` (`prisma/seed-data/timeline.ts`, in display order), `parseCountedValue(value: string): {from: number; to: number; suffix: string} | null`, `parseStartYear(when: string): number | null`, `STACK_EXTRAS: readonly {tools: readonly string[]}[]`.

- [ ] **Step 1: Milestones**

`MILESTONES = milestones.map(({value, title}) => ({value, title, count: parseCountedValue(value)?.to.toString()}))`. `serveLongDescription` swaps `milestones[1].description` (the second milestone, whatever its words) instead of the literal sentence. The long-text constants stay (they are admin limits, not seed copy).

- [ ] **Step 2: Timeline**

Replace `STOPS` with entries built from `timeline` at indices `2`, `timeline.length - 1`, `0`: `year: String(parseStartYear(when))`, `when`, `label: String(n + 1).padStart(2, '0')`. The counter text becomes `` `${label} / ${String(timeline.length).padStart(2, '0')}` ``. Keep the comment explaining the order (third role, the earliest, back to the current one).

- [ ] **Step 3: Stack**

`const TOOL_COUNT = STACK_EXTRAS.reduce((total, group) => total + group.tools.length, 0)`, used in `Show ${TOOL_COUNT} more tools` and `Hide ${TOOL_COUNT} tools`. The hidden tool is `STACK_EXTRAS[0].tools[0]` instead of `'Zustand'`. In `src/lib/stack-groups.test.ts`, delete `expect(tools).toHaveLength(36)`; keep the uniqueness assertion.

- [ ] **Step 4: Verify**

`grep -nE "Years on the web|'2022'|'2007'|Mar 2022|Show 36|Hide 36|toHaveLength\(36\)|Zustand|Planning and assigning" e2e/public/milestones.spec.ts e2e/public/timeline.spec.ts e2e/public/stack.spec.ts src/lib/stack-groups.test.ts` returns nothing. `pnpm test` passes. With the port free: `pnpm exec playwright test e2e/public/milestones.spec.ts e2e/public/timeline.spec.ts e2e/public/stack.spec.ts` passes on both projects.

- [ ] **Step 5: Commit**

```bash
git add e2e/public/milestones.spec.ts e2e/public/timeline.spec.ts e2e/public/stack.spec.ts src/lib/stack-groups.test.ts
git commit -m "test(e2e): read milestones, timeline and stack expectations from the seed"
```

---

### Task 8: Admin-dev validation runs as its own CI job (A1)

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `CLAUDE.md` only if it describes admin-dev running inside the main job (check with `grep -n admin-dev CLAUDE.md`)

- [ ] **Step 1: Remove the step from `checks`**

Delete the `Admin development validation` step from the `checks` job.

- [ ] **Step 2: Add the job**

A job `admin-dev` (name `Admin development validation`), `runs-on: ubuntu-latest`, `timeout-minutes: 20`, with the same `postgres` service block as `checks` (copy it exactly, port `5437:5432`), steps: checkout, `pnpm/action-setup@v6`, `actions/setup-node@v7` (`node-version: 24`, `cache: pnpm`), `pnpm install --frozen-lockfile`, `pnpm test:e2e:prepare`, `pnpm exec playwright install --with-deps chromium`, `pnpm exec playwright test --config=playwright.admin-dev.config.ts`, then on `failure()` upload artifact `admin-dev-report` with paths `playwright-report/admin-dev/` and `test-results/admin-dev/`, `retention-days: 14`. Skip it when `inputs.update_snapshots` is true (`if: ${{ !inputs.update_snapshots }}`), since that run only regenerates baselines. Comment: it needs a seeded database but not the production build, so it runs beside `checks`.

- [ ] **Step 3: Review the diff**

There is no YAML validator in the repo and no new package may be added, so read `git diff .github/workflows/ci.yml`: `admin-dev` sits under `jobs:` at the same indentation as `checks` and `darwin-snapshots`, its `services.postgres` block matches `checks` exactly, and `checks` no longer mentions `admin-dev`. GitHub validates the file on the PR run in Task 9; a syntax error shows there as a workflow that fails to start.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml CLAUDE.md
git commit -m "ci: run the admin development validation beside the main job"
```

---

### Task 9: Quality gate, PR, worker experiment and measurement (A4, goal 2)

**Files:**
- Modify: `playwright.config.ts` (`workers`), in its own commit

- [ ] **Step 1: Full local gate**

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`. Expected: all exit 0. Then, only if port 3100 is free: `pnpm test:e2e`. Expected: PASS (admin clock-drift tests excepted, per Global Constraints). Record what ran and what was left to CI.

- [ ] **Step 2: Ask Christian before pushing**

Pushing and opening a PR is outward-facing: confirm first. On a yes: `git push -u origin feature/lean-test-suite` and `gh pr create` with title `test: lean the test suite and speed up CI`, body summarising A to D with the before numbers (8.5 min green run, 300s e2e, 78s admin-dev, 67s film test) and a link to the spec.

- [ ] **Step 3: Measure the PR run**

When CI finishes: both jobs green; record the `checks` job's E2E step time and the run's wall time (`gh run view <id> --json jobs`). Goal: wall time about 6 minutes. If the E2E step fails on a missing or changed baseline, stop and report it: the kept three should not change.

- [ ] **Step 4: Try 4 workers**

Change `workers: CI ? 2 : undefined` to `workers: CI ? 4 : undefined` in `playwright.config.ts`, commit as `ci(e2e): run four Playwright workers on CI`, push. Rerun CI until it has three runs on this commit (`gh run rerun <id>`). Keep it only if all three are green and the HTML report shows no new flaky (retried) tests; otherwise `git revert` that commit and push. Record the E2E step times either way.

- [ ] **Step 5: Report**

Post the before/after numbers (wall time, E2E step, unit count, Playwright runs per project) as a PR comment, and tell Christian the result, including anything verified only on CI.
