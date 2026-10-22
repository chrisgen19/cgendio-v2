# cgdiomampo.dev: project rules

Portfolio and dev blog for Christian Diomampo, branded as a "we" web studio. Audience: job-offer agencies, recruiters and dev clients.

## Sources of truth

- **Plan:** `docs/BUILD_PLAN.md`. One phase per session, branch, PR and issue. Start and finish phases with Prompts B and C in `docs/prompts/GITHUB_TRACKING.md`.
- **Design:** `docs/design/design-reference.dc.html`. Read it as a spec for layout, copy, colours, type and spacing (its `<helmet><style>` block and inline styles hold the exact values, `renderVals()` holds the content). It runs on a custom `<x-dc>` runtime: never copy the runtime, `support.js` or `vendor/` into the app.
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

**Theme:** light is the default and the only theme until Phase 7 adds dark mode.

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

- `pnpm typecheck`, `pnpm lint` and `pnpm build` pass (plus the tests, from Phase 8 on).
- UI changes are checked at **1440px** and **390px**; say so if they weren't.

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
src/content/             typed mock data until the database exists (Phase 3)
src/lib/                 shared helpers
src/server/              data access and server actions
prisma/                  schema, migrations, seed
```

## Open placeholders (fill before launch)

Christian's photo, contact email, CV file, the timeline start year and earlier role, and real case-study write-ups for each project card.
