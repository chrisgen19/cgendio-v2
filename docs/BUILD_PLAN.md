# Cgdiomampo.dev — Claude Code Build Plan

Owner: Christian · Last updated: 2026-10-22

Ten phases take the approved home page design and the Remotion hero film to a live, editable site on Coolify, self-hosted on a Hostinger VPS. Each phase is one Claude Code session, one branch, one PR and one GitHub issue.

> **For Claude Code:** this file is the source of truth. Every phase starts with a `<!-- phase:N -->` marker and has the same sections: **Goal**, optional **Before you start** decisions, **Prompt**, and **Done when** as a checklist. `docs/prompts/GITHUB_TRACKING.md` reads those sections to create and update the GitHub issues. Keep the markers and section names unchanged.

---

## How to use this plan

**Put these in the repo before Phase 0:**

- `docs/BUILD_PLAN.md`: this file.
- `docs/prompts/GITHUB_TRACKING.md`: the prompts that create the GitHub issues and keep progress in sync.
- `docs/design/design-reference.dc.html`: the home page canvas source. It has every section, colour, font size and spacing value, and both the desktop and mobile cuts of the hero.
- `cgdiomampo-hero-film-remotion.zip` unzipped to `docs/design/remotion-src/`: the production hero code, with both cuts, to port in Phase 2.
- `docs/design/hero-film.mp4` and `docs/design/hero-film-mobile.mp4`: the rendered films, used as the motion reference. They don't exist yet: Phase 2 renders them from the Remotion source.

**Before Phase 0, once:** push the repo to GitHub, then run **Prompt A** from `docs/prompts/GITHUB_TRACKING.md`. It creates one issue per phase, a tracking epic, labels, a milestone and, if you want one, a project board.

**For every phase:**

1. Start a fresh session (`/clear`) so each phase gets a clean context. `CLAUDE.md` carries the rules between sessions.
2. Switch to plan mode (Shift+Tab) and paste **Prompt B (start a phase)** with the phase number. It opens the phase issue, creates the branch and runs the phase prompt. Read the plan before approving it, and push back on anything that drifts from the design.
3. Let it build. Each prompt ends with its own checks: typecheck, lint, build and tests.
4. Check the **Done when** list yourself in the browser at 1440px and 390px.
5. Run your usual review pass (Claude Code `/review` and Codex) and fix the P1s.
6. Paste **Prompt C (finish a phase)**. It ticks the verified items, opens the PR with `Closes #N`, and updates the issue, the epic and the progress table at the end of this file.

The prompts are in code blocks so they copy cleanly. Fill in the bracketed bits (`[YOUR EMAIL]`) before pasting.

---

<!-- phase:0 -->
## Phase 0 — Kickoff: project rules

**Goal:** Claude Code reads the design and writes `CLAUDE.md`, the standing rules for every later session. No app code yet.

**Prompt:**

```text
Phase 0 of docs/BUILD_PLAN.md — project rules. We're building cgdiomampo.dev — my portfolio + dev blog, branded as a "we" web studio.
Audience: job-offer agencies, recruiters and dev clients.

Read these first, fully, before planning anything:
- docs/BUILD_PLAN.md (the whole plan, so the rules fit every later phase)
- docs/design/design-reference.dc.html  (the approved home page design; treat it as the source of truth for layout, copy, colours, type and spacing — it uses a custom <x-dc> runtime, so read it as a spec, don't copy the runtime)
- docs/design/remotion-src/README.md and the code under docs/design/remotion-src/src  (the production hero film, built in Remotion, with a desktop and a mobile cut)
- docs/design/hero-film.mp4 and hero-film-mobile.mp4 are the motion references, rendered in Phase 2 (they may not exist yet; you can't watch them anyway, the README's storyboard describes them)

Then create CLAUDE.md at the repo root with these project rules — no app code in this phase:
- Stack: Next.js (latest stable, App Router, React Server Components by default), TypeScript strict, Tailwind CSS v4 (CSS-first @theme tokens), shadcn/ui for admin UI only, Prisma + PostgreSQL, Better Auth, Zod, Biome for lint/format, pnpm. Check installed versions before using any API; never guess APIs from memory — read node_modules types or official docs.
- Remotion: all remotion and @remotion/* packages pinned to the same exact version (no ^).
- Design tokens (from the design): ink #0D0E12, muted #565B67, line #E3E5EA, ground #F5F6F8, white #FFFFFF, lime #D7FF3D (highlighter), accent #3B2BFF, tint = accent at 10% on white. Fonts: Bricolage Grotesque (display), Geist (body), Geist Mono (labels). Light mode is the default; dark mode is a later option.
- Signature details to preserve everywhere: the lime highlighter mark under a key word in each heading, mono uppercase eyebrow labels, dot-grid stage backgrounds, pill buttons, 44px minimum touch targets.
- Copy rules: the brand speaks as "we"; never describe WordPress as slow or outdated (we still sell WordPress & WooCommerce); no invented stats — missing facts stay as [PLACEHOLDER] text.
- Accessibility: WCAG 2.2 AA, semantic HTML, real <a>/<button>, visible focus, prefers-reduced-motion respected.
- Quality gate before saying a task is done: pnpm typecheck, pnpm lint, pnpm build all pass; UI changes checked at 1440px and 390px.
- Git: one branch + PR per phase (branch feature/phase-N-short-name), conventional commits, PR title feat(phase-N): <short title> (chore(phase-N) for setup-only phases), PR body includes "Closes #<phase issue>".
- Progress tracking: the plan is docs/BUILD_PLAN.md; issue numbers live in .github/tracking.json; follow docs/prompts/GITHUB_TRACKING.md to start and finish phases.
- Workflow: each phase runs through Prompt B in plan mode, so skip the superpowers brainstorming and using-git-worktrees skills in this project; work on the phase branch in the main checkout.
- Folder layout: src/app, src/components/{site,sections,ui-site,ui,hero-film} (ui-site = the public site's own primitives; ui = shadcn/ui, admin only), src/content (typed mock data until the DB exists), src/lib, src/server (data access + actions), prisma/.

Ask me anything the design leaves ambiguous before writing the file. Show me CLAUDE.md when done.
```

**Done when:**

- [ ] `CLAUDE.md` exists at the repo root and covers stack, tokens, fonts, signature details, copy rules, accessibility, quality gate, git and folder layout
- [ ] You have read every rule and agree with it
- [ ] Committed as `chore: project rules`

---

<!-- phase:1 -->
## Phase 1 — Scaffold and design foundations

**Goal:** a running Next.js app with the design system set up as Tailwind tokens, the fonts, the header and footer, and empty section anchors.

**Prompt:**

```text
Phase 1 of docs/BUILD_PLAN.md — scaffold and design foundations. Follow CLAUDE.md.

1. Scaffold Next.js (latest stable) with TypeScript strict, App Router, src/ dir, Tailwind v4, pnpm. Replace ESLint/Prettier with Biome. Add scripts: dev, build, start, typecheck (tsc --noEmit), lint (biome check), format.
2. Fonts with next/font/google: Bricolage Grotesque (display, variable, opsz axis), Geist (body), Geist Mono (labels, 400/500). next/font exposes them as --font-bricolage, --font-geist, --font-geist-mono; map those in `@theme inline` to the Tailwind tokens --font-display, --font-body, --font-mono (see the Appendix in docs/BUILD_PLAN.md; never give a next/font variable the same name as the token it feeds, or the variable references itself). Check the pattern against the installed Tailwind v4 docs.
3. In src/app/globals.css, define the design tokens with Tailwind v4 @theme: colours (ink, muted, line, ground, lime, accent, tint), font families, radii (pill 999px, card 22px, panel 28px, cta 40px), the card shadow from the design, and a max container width of 1320px. Values come from CLAUDE.md and docs/design/design-reference.dc.html — read the helmet <style> block there for exact numbers.
4. Build small primitives in src/components/ui-site/ that every section reuses, matching the design exactly:
   - Mark: the lime highlighter under a word (absolute bar, 0.36em tall, scaleX reveal on first view, no animation under reduced motion)
   - Eyebrow: mono, 13px, uppercase, 0.08em tracking, muted
   - SectionHeading (h2): display font, clamp(40px, 5vw, 72px), -0.04em tracking, line-height 0.98
   - Button: pill, variants primary (ink → accent on hover), secondary (white, line border), sizes md (52px) and sm (44px); renders <a> when given href
   - Tag: mono pill chip
   - Container: max-w 1320 with 56px side padding desktop / 20px mobile
5. SiteHeader: logo ("cg" ink square with lime letters + cgdiomampo.dev), centered pill nav (Work, Milestones, Timeline, Blog), "Open to projects" status dot, "Let's talk" button; on < 860px collapse to a menu button that opens an accessible disclosure panel (focus managed, Esc closes). The header must be able to sit transparently over the hero (prop: overlay).
6. SiteFooter as in the design.
7. src/app/page.tsx: render the header, then placeholder <section> blocks with the real ids (top, about, work, milestones, timeline, blog, contact) so anchors work. Root layout: lang="en", metadata title/description for Cgdiomampo.dev, theme-color.

Verify: pnpm typecheck, lint and build pass. Run the dev server and describe what renders at 1440px and 390px.
```

**Done when:**

- [ ] Header, footer and fonts match the canvas side by side at 1440px and 390px
- [ ] Section anchors (`#work`, `#milestones`, `#timeline`, `#blog`, `#contact`) scroll to their sections
- [ ] The mobile menu opens, traps focus and closes with Esc, using the keyboard only
- [ ] `pnpm typecheck`, `pnpm lint` and `pnpm build` pass

---

<!-- phase:2 -->
## Phase 2 — Remotion hero film

**Goal:** the hero film fills the screen above the fold: the ~30s landscape cut on desktop and the ~26s phone-native cut on phones. It plays once, ends on the brand card with See my works and Replay, and the page still loads fast.

**Prompt:**

```text
Phase 2 of docs/BUILD_PLAN.md — integrate the Remotion hero. Follow CLAUDE.md.

Source: docs/design/remotion-src (read its README fully first). It was type-checked against Remotion 4.0.537 under strict TS and render-tested at 1440x820, 390x844 and 360x640.

1. Install remotion, @remotion/player, @remotion/transitions, @remotion/google-fonts at exactly 4.0.537 (the version the source was tested against; no ^). Add @remotion/cli as a dev dependency at the same version. Get everything working on 4.0.537 first; upgrading to a newer 4.x is a separate commit, only if I agree.
2. Copy src/components/hero-film/ into the app unchanged first, plus src/remotion/ (Studio entry). Get it compiling before changing anything. Add scripts: "remotion:studio": "remotion studio src/remotion/index.ts", "remotion:poster" that renders a still of the last frame of HeroFilm to public/hero-poster.png, and "remotion:render" that renders HeroFilm to docs/design/hero-film.mp4 and HeroFilmMobile to docs/design/hero-film-mobile.mp4. Run remotion:render once so I have the motion references to compare against.
3. Wire it into src/app/page.tsx: <HeroPlayer worksHref="#work" header={<SiteHeader overlay />} />. Replace the HUD's hard-coded hex classes with the Tailwind tokens from Phase 1.
4. Performance — the Player is client-only and heavy:
   - Server-render a static first frame underneath (the intro headline "Great websites don't happen by accident." as real HTML in the same type styles) so the hero has content and an LCP element before JS loads; fade it out once the Player reports its first frame.
   - Load HeroPlayer with next/dynamic (ssr: false) behind that static frame.
   - Confirm the Remotion code is not in the JS for other routes.
5. Two cuts: HeroPlayer shows HeroFilm (desktop) or HeroFilmMobile (phone-native scenes, story-style segment HUD) based on isPortrait() in timeline.ts — under 860px wide or any tall window. Test both, plus rotating a tablet (it swaps cuts and restarts).
6. Behaviour to keep and verify: plays once (loop false, moveToBeginningWhenEnded false); chapter chips jump; Skip intro; pause/play becomes Replay at the end; pauses when scrolled out of view; prefers-reduced-motion opens on the final brand card paused; See my works scrolls to #work; Replay restarts.
7. Fonts: the film loads its fonts through @remotion/google-fonts (needed for MP4 exports). Check that this doesn't cause a visible font swap against the next/font versions; if it does, propose the cleanest fix and ask me before changing theme.ts.

Verify: typecheck, lint, build. Report the First Load JS for / before and after, and test the hero at 1440x820, 1280x720, 390x844 and 360x640 in the dev server.
```

**Done when:**

- [ ] `hero-film.mp4` and `hero-film-mobile.mp4` are rendered into `docs/design/`
- [ ] Desktop hero matches `hero-film.mp4` and the phone hero matches `hero-film-mobile.mp4`
- [ ] The film never loops and holds on the brand card
- [ ] HUD works by keyboard on desktop (chips, Skip, pause/replay) and by touch on mobile (segments, Skip, pause/replay)
- [ ] Reduced motion opens on the brand card, paused
- [ ] Rotating a tablet swaps between the two cuts
- [ ] First Load JS for `/` is reported, Remotion is absent from other routes, and the size is acceptable to you

---

<!-- phase:3 -->
## Phase 3 — Home page sections with typed mock content

**Goal:** every section below the hero, pixel-close to the canvas, fed by typed data files shaped exactly like the future database rows.

**Prompt:**

```text
Phase 3 of docs/BUILD_PLAN.md — build the home page sections. Follow CLAUDE.md.

1. Create src/content/ with typed mock data (Zod schemas + inferred types in src/content/schema.ts), copying the text from docs/design/design-reference.dc.html's renderVals() exactly:
   - stack.ts (tech chips)
   - projects.ts: slug, title, summary, kind label, group (client | personal), glyph, theme (ink | lime | tint | gray), span (4 | 5 | 6 | 7), tags[], featured, order
   - milestones.ts: kind, value, title, description, order
   - timeline.ts: when, role, org, description, dot colour, isCurrent, order
   - posts.ts: slug, title, tag, date (ISO), readMinutes, excerpt
   Shape these so Phase 4 can swap them for Prisma queries without touching components. Keep every [PLACEHOLDER] as-is.
   Components never import src/content directly: expose each collection through async functions in src/server/content.ts (getStack, getProjects({ group }), getMilestones, getTimeline, getPosts({ limit })). Phase 4 swaps their bodies for Prisma.
2. Build one server component per section in src/components/sections/, matching the canvas spacing, type and colours:
   - StackStrip
   - About (photo placeholder card with name badge, big statement with the lime Mark, three fact columns)
   - Work: header with count, filter pills (All / Client work / Personal) as a small client component using the URL search param ?filter= so it is shareable and works without JS as links; 12-column bento grid using each project's span, collapsing to one column under 860px; card thumbs with the two outline circles and the giant glyph; hover lift
   - Milestones (5-up grid → 2-up → 1-up)
   - Timeline (date · rail with dot · content; "NOW" lime badge; rail hidden on mobile)
   - BlogTeaser (newest 4 posts as rows: date · tag + title · read time · arrow; hover turns the title accent)
   - ContactCta (lime panel, two outline circles, Start a project + Download CV, mono contact line)
3. Compose them in src/app/page.tsx in the canvas order. Section headings are h2; project titles h3; the page keeps a single h1 (visually hidden, as in the design).
4. Add a scroll-reveal for section headings and cards (IntersectionObserver, CSS transitions, once only, disabled under prefers-reduced-motion). Keep it subtle — the hero is the show.

Verify: typecheck, lint, build; compare each section to the canvas at 1440px and 390px and list any difference you couldn't resolve.
```

**Done when:**

- [ ] The whole home page reads like the canvas on desktop (1440px) and phone (390px)
- [ ] The Work filter works with JavaScript on and off, and the URL reflects the filter
- [ ] No component imports `src/content` directly; all data goes through `src/server/content.ts`
- [ ] `pnpm typecheck`, `pnpm lint` and `pnpm build` pass

---

<!-- phase:4 -->
## Phase 4 — Content layer: Prisma + PostgreSQL

**Goal:** the same pages, now reading from Postgres, cached, and seeded with the Phase 3 mock data.

**Before you start:** choose the database host.

- **Postgres in Coolify on the same Hostinger VPS (recommended):** the app reaches it over Coolify's internal Docker network, so there's no public port and no pooler needed for one long-running server. You own the backups (Phase 9 sets them up).
- **Neon (managed):** backups and per-PR database branches built in, but every query leaves the VPS, which adds latency.

The prompt asks Claude Code to confirm the choice with you.

**Prompt:**

```text
Phase 4 of docs/BUILD_PLAN.md — move content into PostgreSQL with Prisma. Follow CLAUDE.md.

Before coding, ask me which Postgres host we're using in production (Postgres in Coolify on my Hostinger VPS, or Neon) and set up .env / .env.example accordingly. Local development uses Postgres in Docker (compose.yaml) either way. Use the latest stable Prisma and read its current docs for client generation, config file and driver adapters — don't rely on older Prisma patterns.

1. Schema (prisma/schema.prisma), mirroring src/content/schema.ts:
   - Project: id, slug (unique), title, summary, kindLabel, group (enum CLIENT | PERSONAL), glyph, theme (enum INK | LIME | TINT | GRAY), span (int), tags (string[]), featured, order, status (DRAFT | PUBLISHED), coverImageUrl?, caseStudy (markdown text, optional), liveUrl?, repoUrl?, timestamps
   - Post: id, slug (unique), title, excerpt, tag, body (markdown), readMinutes (computed on save), status, publishedAt?, coverImageUrl?, timestamps
   - Milestone, TimelineEntry, StackItem: fields from Phase 3 + order + timestamps
   - SiteSettings (single row): contactEmail, openToProjects (bool), cvUrl?, socials (json)
   Leave the Better Auth tables for Phase 5.
2. Migrations + prisma/seed.ts that imports the Phase 3 files from src/content and upserts them (idempotent; re-running changes nothing).
3. Swap the bodies of src/server/content.ts to Prisma queries (published only, ordered) with Zod parsing at the boundary. Components must not change. Use a single Prisma client module that is safe in dev hot-reload and in a long-running Node server (the production container).
4. Caching: use this Next.js version's recommended data-cache API with one cache tag per collection (projects, posts, milestones, timeline, stack, settings) so Phase 5 can revalidate precisely. The home page should be static/ISR, not dynamic per request.
5. Once the DB is the source of truth, move src/content/*.ts to prisma/seed-data/ so nothing in src imports them.

Verify: migrate, seed twice (second run is a no-op), typecheck, lint, build. Confirm the home page renders identically and that the build output shows / as static or ISR.
```

**Done when:**

- [ ] Database host chosen and recorded in `.env.example`
- [ ] The site looks exactly as it did in Phase 3, with data coming from Postgres
- [ ] `pnpm db:seed` is idempotent: a second run changes nothing
- [ ] `/` builds as static or ISR
- [ ] Nothing under `src/` imports the old mock files

---

<!-- phase:5 -->
## Phase 5 — Admin to edit content

**Goal:** a private `/admin` where only you can sign in and edit projects, posts, milestones, timeline, stack and site settings. Saving updates the live site within seconds.

**Before you start:** choose image storage.

- **Cloudflare R2 (recommended):** S3-compatible, free egress, and off the VPS, so images survive a VPS failure and are served from Cloudflare's network. The same bucket can hold the Phase 9 database backups.
- **MinIO in Coolify:** self-hosted S3 on the same VPS, but it uses the VPS's disk and bandwidth and needs its own backups.

**Prompt:**

```text
Phase 5 of docs/BUILD_PLAN.md — admin with Better Auth. Follow CLAUDE.md.

1. Auth with the latest Better Auth (read its current docs for the Next.js App Router + Prisma adapter setup):
   - Single admin. Sign-in with GitHub OAuth, restricted to an allowlist of one email from ADMIN_EMAILS env. No public sign-up.
   - Protect /admin/** with a server-side session check in the admin layout AND in every server action (never trust the client). Proxy/middleware may redirect early, but the real check lives on the server.
   - Add Better Auth's tables via a Prisma migration.
2. Admin UI under src/app/admin with shadcn/ui (the admin can look plain and tool-like; the public site keeps its custom design):
   - Dashboard: counts + recent edits
   - CRUD tables + forms for Project, Post, Milestone, TimelineEntry, StackItem; drag-to-reorder where there's an order field; Draft/Published toggle
   - Markdown editor with live preview for Post.body and Project.caseStudy
   - SiteSettings form (contact email, open-to-projects toggle shown in the header status dot, CV upload)
   - Image upload: ask me R2 or MinIO in Coolify (both S3-compatible, so use one S3 client), then upload directly from the browser with a server-issued signed URL; store the public URL
3. Mutations as server actions: Zod-validate input, check the session, write with Prisma, then revalidate only the affected cache tags and paths from Phase 4. Slugs auto-generate from titles and stay editable; reject duplicates with a friendly error.
4. Draft preview: a signed preview route so I can see a draft post or case study before publishing.
5. Admin pages are noindex and excluded from the sitemap.

Verify: typecheck, lint, build. Walk through: sign in, edit a project title, publish a draft post, upload an image, reorder milestones — and confirm each shows on the public site without a redeploy. Confirm a non-allowlisted GitHub account is refused.
```

**Done when:**

- [ ] Image storage chosen (R2 or MinIO in Coolify) and wired up
- [ ] Any text on the home page can be changed from `/admin` and appears live within seconds, without a redeploy
- [ ] Draft preview works for posts and case studies
- [ ] A GitHub account that isn't on the allowlist is refused; every server action checks the session
- [ ] `/admin` is noindex and not in the sitemap

---

<!-- phase:6 -->
## Phase 6 — Blog, case studies and contact

**Goal:** every link that's a `#` placeholder today goes somewhere real: an article page, a case study page, a working contact form and a CV download.

**Prompt:**

```text
Phase 6 of docs/BUILD_PLAN.md — blog, case studies, contact. Follow CLAUDE.md and match the home page's visual language (eyebrows, display headings with the lime Mark, pill tags, 1320 container).

1. Markdown rendering (shared by posts and case studies): a server-side unified/remark/rehype pipeline with GitHub-flavoured markdown, heading anchors, rehype-sanitize (the body comes from the DB), and Shiki syntax highlighting with a light theme that fits the palette. Style prose with a custom typography layer — measure ~68ch, body 18px, code blocks on ink with the theme's code colours.
2. /blog: list of published posts, newest first, tag filter via ?tag=, paginated 10 per page. /blog/[slug]: title, tag, date, read time, cover, table of contents for posts with 3+ h2s, previous/next links, and a "Start a project" CTA at the end. generateStaticParams + the Phase 4 cache tags; 404 for drafts.
3. /work/[slug]: case study layout — hero band using the project's thumb theme and glyph, a facts row (client, role, stack tags, live/repo links when present), the markdown case study, and "Next project". Point the home page's "View case study" links and the blog rows at these routes.
4. Contact: /contact section form (name, email, company optional, project type select: WordPress & WooCommerce / Next.js & React / Migration or redesign / Job opportunity, message). Server action with Zod; store a ContactMessage row; send me an email with Resend (RESEND_API_KEY, to SiteSettings.contactEmail); honeypot field + per-IP rate limit; accessible inline errors and a success state. Add an admin inbox page listing messages with read/unread.
5. CV: the "Download CV" buttons link to SiteSettings.cvUrl (uploaded in admin); hide them if empty.
6. RSS feed at /blog/rss.xml.

Verify: typecheck, lint, build. Submit the contact form end to end in dev (log the email if no Resend key yet). Open a post with code blocks and a long case study at 390px.
```

**Done when:**

- [ ] Every button and link on the site goes somewhere real; no `#` placeholders left
- [ ] A test inquiry reaches your inbox and the admin inbox
- [ ] Posts and case studies read comfortably at 390px, code blocks included
- [ ] `/blog/rss.xml` is valid
- [ ] Download CV appears only when a CV is uploaded

---

<!-- phase:7 -->
## Phase 7 — SEO, performance, accessibility, dark mode

**Goal:** the site is findable, fast on a mid-range phone and passes WCAG 2.2 AA. It also offers dark mode, with light staying the default.

**Prompt:**

```text
Phase 7 of docs/BUILD_PLAN.md — polish for search, speed, access and theme. Follow CLAUDE.md.

SEO
- Metadata API on every route: titles "<Page> — Cgdiomampo.dev", descriptions from content, canonical URLs from NEXT_PUBLIC_SITE_URL.
- Open Graph images: the hero poster (pnpm remotion:poster) for /, and generated OG images (next/og) for posts and case studies using the brand type and lime Mark.
- sitemap.ts and robots.ts (exclude /admin and preview routes).
- JSON-LD: Person + ProfessionalService on /, BlogPosting on posts, CreativeWork on case studies.

Performance
- Run a production build and report First Load JS per route; the Remotion code must load only on /.
- next/image for every raster with sizes set; covers get priority only above the fold.
- Check LCP, CLS and INP on / and a blog post with Lighthouse (mobile preset) and fix anything below 90. The static hero frame from Phase 2 should be the LCP element.

Accessibility
- Add axe checks for /, /blog, one post and /work/[slug]; fix every violation.
- Keyboard pass: skip link, focus order through header → hero HUD → sections, visible focus rings in both themes, mobile menu traps and returns focus.
- Contrast: verify muted text, tags and lime-on-ink combinations meet 4.5:1.

Dark mode
- Light stays the default. Add a theme toggle (system / light / dark) in the header and footer, stored in a cookie so the server renders the right theme without a flash.
- Map every token to a dark value in @theme (ink background, raised surfaces, lime stays the highlighter, accent lightened enough to pass contrast). Ask me to approve the dark palette before applying it everywhere.
- The Remotion hero stays light in both themes (it's a film), but its HUD follows the theme.

Verify: typecheck, lint, build; share the Lighthouse scores and axe results before/after.
```

**Done when:**

- [ ] Lighthouse mobile is 90+ in every category on `/` and on a blog post
- [ ] axe reports zero violations on `/`, `/blog`, a post and a case study
- [ ] Dark palette approved; dark mode loads with no flash
- [ ] Shared links show proper preview cards (OG images) for the home page, posts and case studies
- [ ] Sitemap, robots and JSON-LD are in place

---

<!-- phase:8 -->
## Phase 8 — Tests and QA

**Goal:** tests that run on every PR cover the behaviours that would embarrass you in front of a recruiter.

**Prompt:**

```text
Phase 8 of docs/BUILD_PLAN.md — tests and CI. Follow CLAUDE.md.

1. Unit tests with Vitest for: Zod schemas, slug generation, readMinutes calculation, the content data-access functions (Prisma mocked or a test database), the timeline helpers in src/components/hero-film/timeline.ts (makeTimeline chapter start frames and total duration for DESKTOP_TIMELINE and MOBILE_TIMELINE, and isPortrait()).
2. Playwright end-to-end, desktop 1440x900 and mobile 390x844 projects, against a production build with a seeded test database:
   - Home: hero renders, HUD Skip jumps to the brand card, See my works scrolls to #work, the film does not loop (wait for the end, assert the brand card stays); the mobile project shows the mobile cut and its segment HUD
   - Reduced motion (emulated): hero opens on the brand card, paused
   - Work filter: Client / Personal change the cards and the URL; works with JavaScript disabled
   - Blog: list → post → next post; RSS returns valid XML
   - Case study page loads from a home card
   - Contact: validation errors, honeypot rejection, successful submit (Resend mocked)
   - Admin: unauthenticated /admin redirects to sign-in; authenticated edit of a project title appears on the home page (use a test-only auth helper, never a real GitHub login)
   - Axe scan on each public page
   - Visual snapshots of each home section at both viewports (mask the hero canvas)
3. GitHub Actions: on PR run install → typecheck → lint → unit → build → e2e (Postgres service container, seeded). Upload the Playwright report on failure.

Verify: everything green locally and in CI. List anything you couldn't test and why.
```

**Done when:**

- [ ] CI is green on a PR: typecheck, lint, unit, build and e2e
- [ ] The hero's play-once behaviour is tested for both cuts
- [ ] The admin edit → public update path is tested
- [ ] The Playwright report uploads on failure

---

<!-- phase:9 -->
## Phase 9 — Deploy to Coolify and go live

**Goal:** cgdiomampo.dev is live on Coolify on the Hostinger VPS, with a preview deployment for every PR, migrations that run safely, off-VPS backups and monitoring turned on.

**Before you start:** some steps are yours, not Claude Code's. You connect the GitHub repo to Coolify (GitHub App), point the domain's DNS at the VPS and paste in the secrets. The prompt has Claude Code prepare everything and give you a checklist for those steps. Have the VPS plan's CPU and RAM ready: they decide where the Docker image gets built.

**Prompt:**

```text
Phase 9 of docs/BUILD_PLAN.md: production deploy on Coolify, self-hosted on my Hostinger VPS. Follow CLAUDE.md. For anything Coolify-specific (build packs, preview deployments, pre/post-deployment commands, health checks, backups), read the current Coolify docs instead of relying on memory.

1. Container: set output: 'standalone' in next.config and write a multi-stage Dockerfile (Node 24, pnpm, prisma generate at build, non-root user, only the standalone output in the final image) plus .dockerignore. Add a /api/health route for the Coolify health check. Build and run the image locally and confirm the site works from it.
2. Build location: Coolify can build on the VPS, or GitHub Actions can build the image and push it to GHCR for Coolify to pull. Ask me for the VPS CPU/RAM, then recommend one (a Next.js + Remotion build can run out of memory on a small VPS and slow the live site while it builds).
3. Env vars: list every variable the app reads, mark which are needed in Production / Preview / Development, and make sure .env.example documents each one (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GITHUB_CLIENT_ID/SECRET, ADMIN_EMAILS, RESEND_API_KEY, storage keys, NEXT_PUBLIC_SITE_URL). Validate them with Zod: NEXT_PUBLIC_* at build time (they're inlined, so they must be Coolify build variables) and server secrets when the server starts (the image build shouldn't need them), so a missing secret fails the deploy, not a page.
4. Migrations: production runs `prisma migrate deploy` (never migrate dev) before the new container takes traffic: as a Coolify pre-deployment command, in the container's start script, or as a CI step. Recommend one and explain why. Preview deployments use a separate database so PRs never touch production data.
5. Previews: enable Coolify preview deployments for PRs (GitHub App, plus a wildcard DNS record such as *.preview.cgdiomampo.dev). Previews get their own env vars, point at the preview database and are noindex.
6. Better Auth + GitHub OAuth callback URLs for production and previews. A GitHub OAuth app has one callback URL, so propose how admin sign-in works on previews (for example a second OAuth app, or admin disabled on previews).
7. Headers in next.config: a Content Security Policy that still allows the Remotion player, Google Fonts used by @remotion/google-fonts, the image host, Resend and the analytics script; plus HSTS, Referrer-Policy, Permissions-Policy. Test the CSP on a preview before production.
8. Caching: self-hosted Next.js keeps its data cache and ISR output on the container's disk. Confirm the Phase 5 revalidation works in the production container, and note in DEPLOY.md that a second replica would need a shared cache handler (we run one).
9. Backups and monitoring: scheduled Coolify backups of the production Postgres to off-VPS S3 storage (the R2 bucket if we chose R2), with one restore tested into a scratch database. Analytics: ask me (Umami or Plausible self-hosted on Coolify, or none). Error monitoring: ask me (Sentry or none). Coolify notifications for failed deploys and failing health checks.
10. Write docs/DEPLOY.md: my manual checklist (Coolify project + GitHub App, env vars per environment, cgdiomampo.dev + www redirect, DNS records at the registrar pointing at the VPS IP including the preview wildcard, Hostinger VPS firewall with only 22/80/443 open and Postgres not public, OAuth app settings, first seed against production), and a rollback procedure (redeploy the previous image in Coolify, and what to do when a migration has to be undone).
11. After I confirm the first production deploy, run a smoke test against the live URL: home (both hero cuts), hero plays once, a post, a case study, contact submit, admin sign-in, /api/health.

Verify: a preview deployment from a PR passes CI and the smoke test before we deploy to production.
```

**Done when:**

- [ ] The Docker image builds and serves the site locally
- [ ] `docs/DEPLOY.md` exists with your manual checklist and a rollback procedure
- [ ] `https://cgdiomampo.dev` serves the site over HTTPS from Coolify, and `www` redirects to it
- [ ] Preview deployments build per PR against their own data
- [ ] Every deploy runs `prisma migrate deploy` safely, and production data is never touched by previews
- [ ] Production Postgres backs up off the VPS on a schedule, and a restore has been tested
- [ ] The smoke test passes on production

---

## Progress

Prompt C updates this table when a phase finishes. **Status** is one of `Not started` · `In progress` · `In review` · `Done`.

| Phase | Outcome | Issue | Status | PR |
| --- | --- | --- | --- | --- |
| 0 — Kickoff | CLAUDE.md agreed | [#1](https://github.com/chrisgen19/cgendio-v2/issues/1) | In progress | |
| 1 — Foundations | Tokens, fonts, header, footer, anchors | [#2](https://github.com/chrisgen19/cgendio-v2/issues/2) | Not started | |
| 2 — Remotion hero | Both cuts play once, HUD, reduced motion, fast LCP | [#3](https://github.com/chrisgen19/cgendio-v2/issues/3) | Not started | |
| 3 — Home sections | All sections from the canvas, typed mock data | [#4](https://github.com/chrisgen19/cgendio-v2/issues/4) | Not started | |
| 4 — Content layer | Prisma + Postgres, seeded, cached, static home | [#5](https://github.com/chrisgen19/cgendio-v2/issues/5) | Not started | |
| 5 — Admin | Better Auth, CRUD, uploads, instant revalidation | [#6](https://github.com/chrisgen19/cgendio-v2/issues/6) | Not started | |
| 6 — Blog & contact | Posts, case studies, contact form, CV, RSS | [#7](https://github.com/chrisgen19/cgendio-v2/issues/7) | Not started | |
| 7 — Polish | SEO, Lighthouse 90+, axe clean, dark mode | [#8](https://github.com/chrisgen19/cgendio-v2/issues/8) | Not started | |
| 8 — Tests | Vitest + Playwright in CI, all green | [#9](https://github.com/chrisgen19/cgendio-v2/issues/9) | Not started | |
| 9 — Launch | Live on cgdiomampo.dev, previews per PR | [#10](https://github.com/chrisgen19/cgendio-v2/issues/10) | Not started | |

**Open items to fill before launch:**

- [ ] Your photo
- [ ] Contact email
- [ ] CV file
- [ ] Timeline start year and earlier role
- [ ] Real case-study write-ups for each project card

---

## Appendix — Fonts

All three fonts are free Google Fonts (SIL Open Font License).

| Font | Role | Used for | Weights |
| --- | --- | --- | --- |
| Bricolage Grotesque | Display | Headlines, section titles, project glyphs, milestone numbers, outlined step numbers, the "cg" logo | 600, 700, 800 (variable, optical size) |
| Geist | Body / UI | Paragraphs, nav, buttons, cards, forms | 400–700 |
| Geist Mono | Labels / code | Eyebrows, tags, chips, code editor, terminal, timecode, chapter labels | 400, 500 |

Display headlines use tight tracking (about −0.04em) and a line-height just under 1.

```tsx
// src/app/fonts.ts
import {Bricolage_Grotesque, Geist, Geist_Mono} from 'next/font/google';

export const display = Bricolage_Grotesque({subsets: ['latin'], variable: '--font-bricolage', axes: ['opsz'], display: 'swap'});
export const body = Geist({subsets: ['latin'], variable: '--font-geist', display: 'swap'});
export const mono = Geist_Mono({subsets: ['latin'], variable: '--font-geist-mono', weight: ['400', '500'], display: 'swap'});
```

```tsx
// src/app/layout.tsx
import {body, display, mono} from './fonts';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
```

```css
/* src/app/globals.css: Tailwind v4. `inline` because these tokens reference variables set by next/font */
@theme inline {
  --font-display: var(--font-bricolage), system-ui, sans-serif;
  --font-body: var(--font-geist), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}
```

The next/font variable names must differ from the Tailwind token names: `--font-display: var(--font-display)` would reference itself and the fonts would silently fall back.

The Remotion film loads the same three fonts through `@remotion/google-fonts` (see `src/components/hero-film/theme.ts`), so exported MP4s match the site.
