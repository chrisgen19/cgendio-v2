# Lean test suite: design

Date: 2026-11-12. Branch: `feature/lean-test-suite` (worktree `../cgendio-v2-lean-tests`, off `origin/main` at `a42e6fb`).

## Why

Two complaints from Christian: CI is slow, and tests break when he edits seed copy (the project tour migration tests in
particular). He wants a leaner suite that still catches real regressions.

What the data says (measured 2026-11-12 over the CI workflow's whole history, 358 runs since 2026-10-23):

- A green run takes about 8.5 minutes. Playwright e2e is ~300s, the admin-dev validation step that follows it ~78s,
  install/build/Chromium/typecheck ~70s, and the 410 unit tests **5s**. Unit tests are not a speed problem.
- Summed Playwright test time is ~513s over 2 workers. "The film plays once and holds on the brand card" alone is 67s
  of it (35.5s desktop, 31.2s mobile), because it waits through the whole film.
- Request-only and HTML-only specs that the mobile project repeats for no reason (`live-urls`, `deploy`, `seo`, the CSP
  header test) cost ~22s of test time on mobile. Real, but small.
- The unit step never failed in CI. Seed-copy breakage happens locally: three pure copy fixes (`6b87522`, `7c5d75d`,
  `455b8b3`) each had to edit `src/server/project-tour-migration.test.ts`, and each added an assertion on the new
  wording that a later commit then rewrote.
- Of 29 failed runs: 19 were visual baseline diffs on redesign branches (Christian confirmed every one was an intended
  change he had to refresh, none caught anything), 3 the known Google font build flake, 1 the first run without
  baselines, and 2 real catches (a broken case-study link on `feature/live-url-scheme`, mobile milestone values
  overflowing).
- Flakiness is low: one retried test (admin posts workflow) in 25 sampled green runs.

Guidance this follows: change-detector tests ("coupled too closely with implementation details", "more costly to
maintain": Fuchsia testing best practices, after the Google Testing Blog post); test migrations against data that
predates them rather than by matching SQL, and never edit an applied migration (Atlas, GitLab); delete high-level tests
that a lower level already covers (Fowler, The Practical Test Pyramid); split work across Playwright projects with
`testIgnore`/`testMatch` and parallelise CI (Playwright docs).

## Goals

1. Editing seed copy (a tour note, a heading, a summary, a milestone or timeline entry, a stack tool) never fails a test
   unless the edit breaks a real rule (a tour that no longer parses, a box outside its capture, a link off the live site).
2. CI wall time from ~8.5 minutes to about 6, measured on the PR's own runs, before any worker-count change.
3. Every behaviour the suite guards today stays guarded, with the two real catches above as the bar: a broken
   navigation link and a mobile overflow must still fail CI.

## Non-goals

- Rewriting tests for style. Only the tests named below change.
- The footer's hardcoded `© 2026` (`src/components/site/site-footer.tsx:41`): a product fix, separate PR.
- The SEO copy in `e2e/public/seo.spec.ts` (exact title, description, verification token, previous site's timestamps).
  It is a deliberate contract from the v1 cutover (#81) and stays word for word.
- Coverage targets or new tooling. No new packages.

## Anti-goals (a failure even if CI is faster)

- Dropping the only check for something. Each removed test must name what covers that behaviour now.
- Making a test pass by weakening it, e.g. loosening a count to `toBeGreaterThan(0)` where the exact number came from
  data the test can read.
- Any edit to an existing file under `prisma/migrations/`.

## Constraints

- Project rules in `CLAUDE.md`: Biome style, named exports, quality gate (`pnpm typecheck`, `pnpm lint`, `pnpm test`,
  `pnpm build`, `pnpm test:e2e`), Conventional Commits, never commit to `main`.
- `page-copy-migration.test.ts` stays: page-copy migrations insert rows, which a fresh database depends on.
- PR #158 (`bugfix/e2e-per-worktree-instance`, open) changes `e2e/support/test-env.ts`, `e2e/support/prepare.mts`,
  `e2e/public/blog.spec.ts`, `vitest.config.mts`, `compose.yaml`. This work avoids those files; whichever merges second
  rebases. Local e2e runs share port 3100 with other checkouts until #158 lands: check the port before running.
- Admin edit e2e tests fail locally under WSL2 clock drift (see `CLAUDE.md`): judge those on CI.

## The changes

### A. Faster CI

**A1. Admin-dev validation runs as its own job.** Move the "Admin development validation" step out of the `checks` job
in `.github/workflows/ci.yml` into a new job that runs in parallel. It needs: checkout, pnpm, Node 24, install, its own
Postgres service (same settings as `checks`), `pnpm test:e2e:prepare`, Chromium install, then
`pnpm exec playwright test --config=playwright.admin-dev.config.ts`, and the report upload on failure (its output dir is
`test-results/admin-dev`, report `playwright-report/admin-dev`). It does not need the production build. The repo is
public, so the second runner costs nothing. Expected: ~78s off wall time.

**A2. The film test jumps to the last chapter first.** In `e2e/public/hero.spec.ts`, "the film plays once and holds on
the brand card" clicks the last chapter control (desktop chapter "Live", or the mobile "Live" segment) before waiting,
then asserts what it asserts today: "Replay film" appears, still reads "Replay film" 3s later (no loop), Skip is gone,
See my work is visible, and on desktop `00:30 / 00:30` shows. From the Live chapter start to the end is about 8.5s of
film on desktop (frames 650 to 905). Lower the `test.setTimeout(120_000)` to fit. Expected: ~50s of test time.
Check that the film is still playing after the jump (the toggle reads "Pause film"); if a chapter click pauses it, press
the toggle to resume before waiting (my call).

**A3. The mobile project skips viewport-independent specs.** Move the CSP/HSTS header test from `csp.spec.ts` into
`deploy.spec.ts` (one loop over the four paths checking both the security headers and CSP/HSTS, which also merges the
two duplicate loops). Then give the `mobile` project in `playwright.config.ts` a `testIgnore` for `live-urls.spec.ts`,
`deploy.spec.ts` and `seo.spec.ts`. A comment there says why: these read HTTP responses or head tags, which no viewport
changes. `seo.spec.ts`'s "the header and footer carry the name" is the one viewport-touching test in those files; it
stays desktop-only, which is acceptable because `visual.spec.ts` covers the mobile header (see the open question).

**A4. Try 4 workers on CI.** Change `workers: CI ? 2 : undefined` to 4 in its own commit, run CI three times on the PR,
and keep it only if all three are green with no new retries in the report; otherwise revert that commit. Public
`ubuntu-latest` runners have 4 vCPUs, but `next start` and Chromium share them.

### B. Stop seed-copy breakage

**B1. One seed-integrity test replaces the project migration tests.** Delete `src/server/project-tour-migration.test.ts`
(41 tests) and `src/server/project-brand-migration.test.ts` (8 tests). Add `src/server/seed-integrity.test.ts` that loops
over every project in `prisma/seed-data/projects.ts` with a tour and checks, per project:

- the tour parses with `tourStopsSchema`, and `hasTour` is true;
- the first stop is the opening (empty note) and every later stop has a note;
- stop keys are unique;
- every capture URL sits in a tour folder (`/images/<year>/<name>-tour/`);
- every box fits inside its capture, desktop and mobile;
- `tourHref(stop.path, project.liveUrl)` is not null for every stop.

All six seed projects pass these today (checked 2026-11-12). Nothing replaces the per-migration SQL matching or the
wording checks ("not a national brand", "without AngularJS", exact summaries): those migrations have run, and on a fresh
database their UPDATEs match no rows, because no migration inserts projects and the seed runs after (`prisma/seed.mts`).

**B2. e2e expectations come from the seed.** Replace literals that restate seed content with values read from
`prisma/seed-data` (and `src/lib` helpers, which have no runtime imports):

- `e2e/public/walkthrough.spec.ts`: the `[data-stop]` counts (Access Hire, MyImprov, Merthyr Village, Experience
  Sunnybank, Fresh Fruit) and the headings each test looks for. The note count is the tour's stops after the opening.
  Tests that pick a specific stop on purpose (Category page, Services, Home page, Student login, the scissor-lift path)
  keep naming it, but read it from the seed by key.
- `e2e/public/milestones.spec.ts`: `MILESTONES` from `prisma/seed-data/milestones.ts`, the counted value via
  `parseCountedValue`, and the "Developers led" description that `serveLongDescription` swaps out.
- `e2e/public/timeline.spec.ts`: `STOPS` from `prisma/seed-data/timeline.ts`, with the year via `parseStartYear` and
  the `NN / NN` label from the entry count.
- `e2e/public/stack.spec.ts`: the "Show N more tools" / "Hide N tools" count from `STACK_EXTRAS`.
- `src/lib/stack-groups.test.ts`: drop `toHaveLength(36)`, keep the uniqueness check.

`NO_TOUR_SLUG`'s tour is cleared by `e2e/support/prepare.mts`, so specs must not read that project's tour from the seed.

**B3. The CSP e2e check imports the policy.** After A3 moves it into `deploy.spec.ts`, it compares the header with
`contentSecurityPolicy({isDev: false, siteUrl: <the e2e site URL>})` and `HSTS` from `src/lib/security-headers.ts`,
instead of the hand-copied `CSP_DIRECTIVES`. The "no `upgrade-insecure-requests` on http" test stays. The violation
sweeps in `csp.spec.ts` are untouched.

### C. Small removals

**C1.** Delete "a contact message arrives in the admin inbox" from `e2e/admin/admin.spec.ts`: "inbox read state and
deletion persist across reloads" in `workflows.spec.ts` sends a message and finds it in the inbox first.

### D. Fewer visual baselines (Christian's decision, 2026-11-12)

All 19 visual failures in CI history were intended changes that needed a refresh; none caught a regression. Most of
the churn is the per-section snapshots, which fail on a 1px crop shift whenever a section above changes height, while
the functional specs already cover each section's behaviour.

- In `e2e/public/visual.spec.ts`, remove the `SECTIONS` loop (`#about`, `#what-we-build`, `#work`, `#milestones`,
  `#timeline`, `#blog`, `#contact`) and the `STYLES` map it uses. Keep "hero (film hidden)", "header, stuck past the
  hero" and "stack strip", unchanged, so their baselines stay valid and need no refresh.
- Delete the 28 baselines for the removed tests: `e2e/public/__screenshots__/visual.spec.ts/<section>-<desktop|mobile>-<linux|darwin>.png`
  for `about`, `what-we-build`, `work`, `milestones`, `timeline`, `blog`, `contact`. The `hero-*`, `header-stuck-*` and
  `stack-*` images stay.
- Delete `e2e/support/flatten-work-stack.css` and `e2e/support/flatten-timeline-counter.css`, which only those tests
  used. `e2e/support/hide-header.css` stays (the stack strip uses it); reword its comment that cites
  `flatten-work-stack.css`.
- Update the file's header comment, which describes a screenshot of each home section.

### E. Docs

- `CLAUDE.md`: the e2e specs gotcha (`Sticky layouts need flattening for element screenshots ... see
  e2e/support/flatten-work-stack.css`) points at a deleted file: keep the advice, drop the pointer (or point at
  `hide-header.css` as the `stylePath` example). If A1 changes anything the quality gate says about CI, update it. The
  Visual baselines gotcha still applies to the three remaining snapshots and stays.
- Old specs and plans under `docs/superpowers/` that mention deleted tests stay as history.

## Left to the builder

Commit boundaries (one Conventional Commit per lettered change is a sensible default), exact helper names, how specs
import seed data (relative paths, as `e2e/support` already does), and the wording of comments.

## Calls made without Christian (check these)

- A2 replaces a full playthrough with the last chapter. A loop bug that only shows when the film starts at frame 0 would
  no longer be caught. I judged that unlikely enough to accept.
- A3 makes "the header and footer carry the name" desktop-only.
- A4's keep/revert rule (three green runs, no new retries).
- The seed-integrity rules in B1, including the tour folder pattern.
- The SEO contract tests stay as they are.
- The film-jump fallback in A2 (resume playback if a chapter click pauses it).

## Decided by Christian

- The plan in A to C, as proposed on 2026-11-12.
- D: drop the seven section snapshots; keep hero, stuck header and stack strip.
