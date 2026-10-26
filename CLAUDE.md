@AGENTS.md

# cgdiomampo.dev: project rules

Portfolio and dev blog for Christian Diomampo, branded as a "we" web studio. Audience: job-offer agencies, recruiters and dev clients.

## Sources of truth

- **Plan:** `docs/BUILD_PLAN.md`. One phase per session, branch, PR and issue. Start and finish phases with Prompts B and C in `docs/prompts/GITHUB_TRACKING.md`.
- **Design:** `docs/design/design-reference.dc.html`. Read it as a spec for layout, copy, colours, type and spacing (its `<helmet><style>` block and inline styles hold the exact values, `renderVals()` holds the content). It runs on a custom `<x-dc>` runtime: never copy the runtime, `support.js` or `vendor/` into the app.
- **Dark mode design:** `docs/design/dark-version/Main.dc.html`, the same canvas with a dark token layer (`.pg[data-theme="dark"]`). Read it the same way.
- **Hero film:** `docs/design/remotion-src/` (read its README first). It is the production hero, with a desktop and a mobile cut. Where it differs from the canvas's CSS film, the Remotion code wins.

## Stack

- Next.js (latest stable), App Router, React Server Components by default. Client components only where interaction needs them.
- TypeScript strict. Tailwind CSS v4, CSS-first `@theme` tokens. shadcn/ui for the admin UI only; the public site uses its own components.
- Prisma + PostgreSQL, Better Auth, Zod, Biome (lint + format), pnpm, Node 24.
- Check installed versions before using any API. Read the types in `node_modules` or the docs for the installed version; never guess APIs from memory.
- Remotion: `remotion` and every `@remotion/*` package pinned to the same exact version, no `^`. Start on 4.0.537 (the version the hero was tested against); upgrade only as its own commit, when Christian agrees.
- Production: Coolify on a Hostinger VPS, as a Docker image (not Vercel). Local Postgres runs in Docker.

## Design tokens

Define these in `src/app/globals.css` with `@theme` and use the Tailwind utilities, not raw hex values. Exception: the hero film keeps its own `theme.ts` (Remotion renders inline styles).

**Core colours**

| Token | Value | Use |
| --- | --- | --- |
| ink | `#0D0E12` | text, primary buttons, dark panels |
| muted | `#565B67` | secondary text, eyebrows |
| line | `#E3E5EA` | borders, dividers |
| ground | `#F5F6F8` | page background |
| white | `#FFFFFF` | cards, alternating sections |
| lime | `#D7FF3D` | the highlighter, contact panel, NOW badge |
| accent | `#3B2BFF` | links, hover, progress, tags |
| tint | `color-mix(in srgb, #3B2BFF 10%, #fff)` | soft accent surfaces (the film approximates it as `#ECEBFF`) |

**Supporting colours from the canvas:** link hover `#2417C9`, status dot `#16A34A` (with a `rgba(22,163,74,.15)` 4px ring), grey thumb `#E9EBF0`, dot grid `#E1E4EA`, wireframe greys `#E6E8EE` and `#EEF0F4`, outlined numbers `#E4E7ED`. Code blocks: background ink, chrome `#1C1E25`, window dots `#3A3D46`, text `#E8E9EE`, keyword `#B9B2FF`, string `#D7FF3D`, tag `#7FD4FF`, dim `#7C818E`.

**Shape and depth**

- Radii: pill `999px`, card `22px`, panel `28px` (project thumbs), CTA panel `40px`. Also used: About photo `32px`, milestone cards `24px`, logo square `11px`.
- Card shadow: `0 1px 0 rgba(13,14,18,.04), 0 18px 40px -18px rgba(13,14,18,.22)`. Deep shadow (dark panels): `0 30px 60px -24px rgba(13,14,18,.5)`. Mobile menu: `0 24px 48px -20px rgba(13,14,18,.3)`.

**Layout**

- Container: max width `1320px`, side padding `56px` desktop and `20px` under 860px.
- Sections: `112px 56px` padding, `72px 20px` under 860px. Sections alternate ground and white with `line` borders between them.
- Breakpoints: the design switches at **860px** (phone layout, mobile menu, one-column grids) and **1080px** (milestones go 2-up). Set Tailwind's `md` to 860px and `lg` to 1080px instead of the defaults.
- The hero follows `HeroPlayer`: `min(100svh, 980px)` on desktop and `100svh` on phones (not the canvas's fixed 820px).

**Theme:** light is the default (no cookie). The header's sun/moon button switches to dark and stores `theme=light|dark` in a cookie. Dark values override the tokens under `:root[data-theme="dark"]` in `globals.css`; the accent stays `#8E85FF` there for contrast. The hero film follows through `--film-*` variables, with its `theme.ts` values as the light fallbacks. Use shadows as `shadow-(--shadow-card)`: Tailwind copies theme shadows into `shadow-card`, so their dark overrides would never apply.

## Fonts

All three are Google Fonts, loaded with `next/font/google` (see the plan's Appendix).

| Font | Role | Weights | next/font variable | Tailwind token |
| --- | --- | --- | --- | --- |
| Bricolage Grotesque | display: headlines, glyphs, big numbers, the "cg" logo | 600, 700, 800 (variable, `opsz` axis) | `--font-bricolage` | `--font-display` |
| Geist | body and UI | 400 to 700 | `--font-geist` | `--font-body` |
| Geist Mono | eyebrows, tags, chips, code, timecode | 400, 500 | `--font-geist-mono` | `--font-mono` |

Map them in `@theme inline`. A next/font variable must never share its name with the token it feeds, or the variable references itself and the font silently falls back.

**Type scale from the canvas**

- Section heading (h2): display 700, `clamp(40px, 5vw, 72px)`, line-height `0.98`, tracking `-0.04em`.
- Eyebrow: mono 500, `13px`, uppercase, tracking `0.08em`, muted.
- Lede: `18px` / `1.55`, muted (`16px` under 860px).
- Tag: mono 500, `12px`, pill, `8px 11px` padding, white with a `line` border.

## Signature details (keep them everywhere)

- The **lime highlighter** under one key word in each heading: an absolute bar `0.36em` tall at `bottom: 0.07em`, `0.06em` past each side, revealed with `scaleX` from the left on first view. No animation under reduced motion.
- **Mono uppercase eyebrow** above every section heading.
- **Dot-grid stages:** white with `radial-gradient(circle, #E1E4EA 1px, transparent 1.3px)` at `26px 26px`.
- **Pill buttons:** primary is ink and turns accent on hover; secondary is white with a `line` border that turns ink on hover. Heights 52px (md) and 44px (sm), hover lifts by 1px.
- **44px minimum touch targets** for every link and button.

## Copy rules

- The brand speaks as **"we"**. The hero button reads **"See our work"** (not "See my works" as in the canvas and the Remotion source; change it in both cuts).
- Never describe WordPress as slow or outdated: we still sell WordPress and WooCommerce.
- No invented stats or facts. Missing facts stay as visible placeholder text (`[YOUR PHOTO]`, `[YOUR EMAIL]`, `[START]`, `[YEAR]`, `[Earlier role]`).
- This site is deployed on **Coolify**: the footer reads "Built with Next.js · Deployed on Coolify". The hero film's Deploy scene, the Brand card, the project cards and the stack strip keep Vercel, because they describe client work.
- Otherwise use the canvas copy word for word. Ask before rewording anything.

## Accessibility

- WCAG 2.2 AA. Semantic HTML: real `<a>` for navigation and `<button>` for actions, never clickable `<div>`s.
- One h1 per page (visually hidden on the home page, as in the canvas). Section headings are h2, project and timeline titles h3.
- Visible focus on everything interactive (the hero HUD uses a 2px accent outline with a 2px offset).
- Respect `prefers-reduced-motion`: no scroll reveals or highlighter animation, and the hero opens on the final brand card, paused.

## Code style

- Biome is set to match the Remotion source, so the hero film copies in unchanged: single quotes, no bracket spacing (`{Player}`), line width 150, semicolons, trailing commas. JSX attributes keep double quotes.
- Site components are `function` declarations; utilities are arrow functions. The hero film keeps its `React.FC` arrow components and is exempt from the function-length limits.
- Named exports, except Next.js pages, layouts and route files. No `index.ts` barrel files.
- Tailwind utilities with the tokens above; no separate CSS files except `globals.css`.
- Components never import `src/content` or Prisma directly: all data goes through `src/server/`.

## Quality gate

Before calling any task done:

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (Vitest) and `pnpm build` pass.
- `pnpm test:e2e` passes (needs `pnpm db:up`). It resets the `cgendio_test` database, builds against it and runs Playwright at 1440px and 390px. After an intended visual change, refresh the baselines with `pnpm test:e2e --update-snapshots`, check the new images, and get the Linux and macOS ones from CI's `linux-snapshots` and `darwin-snapshots` artifacts (run the workflow with `update_snapshots`; a run that failed on a missing baseline also carries the Linux ones). Commit only the Linux images whose tests failed on the PR's own CI run; the rest differ by rendering noise. For macOS images, see Visual baselines below.
- UI changes are checked at **1440px** and **390px**; say so if they weren't.

## Gotchas

- **Stale `globals.css` (Turbopack):** builds and a restarted `next dev` can serve an old `globals.css` from cache. After a `globals.css` change, grep the built `.next/static/chunks/*.css` for the new rule (clear `.next` except `dev/` if it's missing). To restart `next dev`, stop it, `rm -rf .next/dev`, start it, then check the CSS linked from `/` has the latest rule. Never delete `.next/dev` under a running dev server. `gh pr merge --delete-branch` triggers it too: it switches the checkout to the old base branch before pulling the merge, so a running `next dev` compiles the pre-merge `globals.css` and keeps serving it. Restart `next dev` that way after merging a PR that changed `globals.css`.
- **Prisma migrations:** `prisma migrate dev` won't run non-interactively. Generate the SQL with `prisma migrate diff --from-schema <schema.prisma from main> --to-schema prisma/schema.prisma --script` and apply it with `pnpm db:deploy`. Restart `next dev` afterwards: it keeps the old Prisma client on `globalThis`.
- **New page-copy keys:** every `PAGE_COPY_KEYS` entry is required and the seed skips existing rows, so a database that only runs `prisma migrate deploy` fails on every page that reads copy. Add each new key to the seed and, with the same value, to a hand-written migration: `INSERT INTO "page_copy" ("key", "value", "updated_at") VALUES (..., CURRENT_TIMESTAMP) ON CONFLICT ("key") DO NOTHING`. `src/server/page-copy-migration.test.ts` fails on a missing row or a value that differs from the seed.
- **e2e specs:** the page has `scroll-behavior: smooth`, so scroll with `behavior: 'instant'`. After a client-side navigation the previous page stays in the DOM, hidden, so scope locators to the visible `main`. Sticky layouts need flattening for element screenshots (`stylePath`, see `e2e/support/flatten-work-stack.css`).
- **Visual baselines:** when a section changes height, unchanged sections below it can fail on a 1px or sub-pixel crop shift (macOS and Linux shift different ones). Before committing their new images, compare old and new at 0px and 1px vertical offsets (`magick compare -metric AE -fuzz 2%`) and accept them only if the aligned difference is tiny (under about 0.5%) and the content is unchanged. A small text change can stay under `maxDiffPixelRatio: 0.01` and still pass against the old image: regenerate that section on purpose with `pnpm exec playwright test e2e/public/visual.spec.ts -g <section> --update-snapshots=all` (after `pnpm test:e2e:prepare`). Linux and macOS images both come from CI, not from a Mac: `gh workflow run ci.yml --ref <branch> -f update_snapshots=true` regenerates the Linux images in the main job and the macOS ones in the `darwin-snapshots` job, then `gh run download <run id> -n linux-snapshots -D <empty dir>` and `gh run download <run id> -n darwin-snapshots -D <empty dir>`. CI never runs the macOS tests, so decide which macOS images to commit with Playwright's own comparator (the one `toHaveScreenshot` uses, with this repo's `maxDiffPixelRatio`; the offset check above is stricter and flags images that still pass): commit one only if its old image fails against the new one. Get the old image with `git show main:<path> > <old.png>`, then run `node -e "const {createRequire}=require('node:module');const r=createRequire(require.resolve('@playwright/test'));const core=require('node:path').dirname(r.resolve('playwright-core/package.json'));const c=require(core+'/lib/coreBundle.js').utils.getComparator('image/png');const fs=require('node:fs');const res=c(fs.readFileSync(process.argv[2]),fs.readFileSync(process.argv[1]),{maxDiffPixelRatio:0.01});console.log(res?'FAILS: '+res.errorMessage:'passes')" <old.png> <new.png>`. It loads Playwright's internal `coreBundle.js`, so recheck it after a Playwright upgrade.
- **Admin edit e2e fails only locally (WSL2 clock drift):** if `e2e/admin/admin.spec.ts:31` fails locally but passes in CI, check the clock before the code. On WSL2 the VM's monotonic clock can run slow while the wall clock is stepped to match the host. Next.js stamps cache entries and `updateTag` with `Date.now()` but checks expiry against `performance.timeOrigin + performance.now()`, so after a save `/` keeps serving the old page for as many seconds as the server has drifted. Measure it with `node -e "setTimeout(() => console.log(Date.now() - (performance.timeOrigin + performance.now())), 60000)"` (healthy: close to 0ms; drifting: about 1000ms or more). Neither switching the clocksource to `hyperv_clocksource_tsc_page` nor `wsl --shutdown` fixed the drift (a fresh VM still drifted about 1.1s a minute), so rely on CI for `e2e/admin/admin.spec.ts:31`. Don't raise the test's timeout to hide it.

## Git and tracking

- One branch and PR per phase: `feature/phase-N-short-name`. Never commit to `main`.
- Conventional Commits. PR titles like `feat(phase-N): <short title>` (`chore(phase-N)` for setup-only work), and the PR body includes `Closes #<phase issue>`.
- Issue numbers, branches, PRs and statuses live in `.github/tracking.json`; the plan's Progress table mirrors them. Follow `docs/prompts/GITHUB_TRACKING.md`.
- Each phase runs through Prompt B in plan mode, so skip the superpowers brainstorming and using-git-worktrees skills here and work on the phase branch in the main checkout.

## Folder layout

```text
src/app/                 routes (App Router)
src/components/site/     header, footer, page chrome
src/components/sections/ one server component per home page section
src/components/ui-site/  the site's own primitives (Mark, Eyebrow, SectionHeading, Button, Tag, Container)
src/components/ui/       shadcn/ui, admin only
src/components/hero-film/ the Remotion hero (copied from docs/design/remotion-src)
prisma/seed-data/        the Phase 3 content, inserted by prisma/seed.mts
src/lib/                 shared helpers
src/server/              data access and server actions
prisma/                  schema, migrations, seed
```

## Open placeholders (fill before launch)

Christian's photo, contact email, CV file, the timeline start year and earlier role, and real case-study write-ups for each project card.
