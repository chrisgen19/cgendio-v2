# Fable 5.2 blog post: design

Date: 2026-11-12. Branch: `feature/fable-5-2-post` (main checkout, off `main` at `d2ef5c1`).

## Why

Christian wants a post about Claude Fable 5.2 (released 2026-11-09) aimed at **other developers and potential dev
clients**. The point is proof: he keeps up with new AI models and knows how to put one to work in real projects. It is
not a news recap.

He has **not** used Fable 5.2 on a client project yet, so the post is a hands-on guide written as "here's how I'd use
it", never as client results.

## Goals

- Explain what's new in 5.2, with every figure linked to a primary source.
- Show what changes in a developer's code (API behaviour), not just the benchmark headlines.
- Summarise real developer feedback from Hacker News and X, with links and short verbatim quotes.
- Give working-shape code examples for a Next.js app, plus the non-Next.js uses that matter more (Claude Code, agent
  orchestration, effort and cost tuning).
- Answer the question readers actually have: when is Fable 5.2 worth paying for, and when is Opus 5.5 enough?
- Images: screenshots taken by the builder plus diagrams the builder draws.

## Non-goals

- No Reddit. Reddit couldn't be reached during research; the post says it draws on HN and X.
- No benchmarks or sample output of our own.
- No Anthropic press images, logos or brand art.
- No changes to site code, components or styles.

## Anti-goals (a failure even if it ships)

- Hype, or claims of personal or client results that didn't happen.
- Any stat, quote or API detail that can't be traced to a linked source.
- Saying "we", "us" or "our". The site speaks as "I".
- Describing WordPress as slow or outdated, if it comes up.
- Em dashes or en dashes in anything new.

## Constraints

- **Research only, no API calls.** Christian: "don't use fable 5.2 in this account" and "just do research, not from
  our own tokens". Nothing calls the Claude API, on any model. Code examples are type-checked, never executed. There is
  no terminal screenshot.
- **Accuracy:** API details come from Anthropic's docs for Fable 5.2 (the claude-api skill's migration guide and
  `platform.claude.com` docs), checked at write time, not from memory. Figures are dated "as of November 12, 2026".
- **Post format:** Markdown body (`prisma/schema.prisma:86`). Seed bodies live in `prisma/seed-data/posts/<slug>.md`
  and metadata in `prisma/seed-data/posts.ts`. Images are plain `![alt](url)` (`src/components/prose/markdown.tsx:121`).
- **Production only seeds an empty database** (`Dockerfile:53`, `SEED_ONLY_IF_EMPTY=1`), so the seed file never
  reaches production. The live post goes in through the admin, which is a production change: Christian's go-ahead
  first.
- **Uploads:** admin R2 uploads accept jpg, png, webp and avif (`src/server/r2.ts:8`).
- **Quality gate** from `CLAUDE.md` applies (typecheck, lint, test, build, e2e), and the post is checked at 1440px and
  390px.

## Decided by Christian

- Audience: other developers and potential dev clients.
- Shape: a hands-on guide. Next.js is one part of it, not the whole post ("discover other things that are more
  relevant").
- Sources: official Anthropic material, Hacker News and X, with links. Skip Reddit and say so.
- Images: screenshots the builder takes (launch page, HN thread) plus diagrams the builder draws.
- No API usage from this account.

## Research already gathered (verify again at write time)

- Launch: [launch post](https://www.anthropic.com/claude-fable-and-mythos-5-2), [model page](https://www.anthropic.com/claude/fable),
  [system card](https://www.anthropic.com/claude-fable-5-2-mythos-5-2-system-card). 2026-11-09. $8/$40 per MTok (down from
  $10/$50), cache reads $0.20. Up to 30% faster than 5.1. Fast mode is 2.5x faster at $16/$80 (`speed: "fast"`).
  About 55% fewer safeguard blocks than 5.1. Fable and Mythos are the same model with different safeguards. Mythos
  is for verified organisations only.
- Benchmarks, Fable 5.2 vs 5.1 vs Opus 5.5: FrontierCode 2.0 49.1 / 32.4 / 45.5, FrontierSWE v2 69.9 / 56.3 / 62.3,
  Remote Labor Index 41.3 / 17.9 / 21.3, OSWorld 2.1 89.3 / 83.5 / 87.2. Anthropic says that at High effort, 5.2
  roughly matches Opus 5.5 at Max on FrontierCode for about half the cost per task.
- Anthropic's own advice is to start with Opus 5.5 for most coding and knowledge work, then move up to Fable or down to
  Sonnet 5.5 or Haiku 5.5.
- Developer-facing API behaviour on `claude-fable-5-2`:
  - Thinking is always on. `disabled` or `budget_tokens` returns a 400, so depth is controlled with `output_config.effort`
    (start at `high`).
  - Forced `tool_choice` `any`/`tool` returns a 400; use `auto` with `strict: true`, or structured outputs.
  - Refusals arrive as `stop_reason: "refusal"`, with server-side `fallbacks` (beta `server-side-fallback-2026-07-01`,
    `fallbacks: "default"`).
  - The preserved thinking history-editing check now applies to every account.
  - `computer_20251124` returns a 400 except on Bedrock; use `computer_toolset_20260801`.
  - As an advisor-tool executor, Fable 5.2 accepts only `claude-fable-5-2` or `claude-mythos-5-2` as its advisor.
  - It needs 30-day data retention, so it isn't available under ZDR without Enterprise Frontier Safeguards.
  - There's no prefill, it supports 128K output (so use streaming), and turns are long.
- Claude Code: Fable 5.2 available, fast mode in the model picker (billed through extra usage), and Medium is the
  default effort ([@ClaudeDevs](https://x.com/ClaudeDevs/status/2119868698613956992), [fast mode post](https://x.com/ClaudeDevs/status/2119868701994570178)).
- HN: [launch thread](https://news.ycombinator.com/item?id=50429068) (914 points, 1,044 comments) and
  [Artificial Analysis thread](https://news.ycombinator.com/item?id=50431144) (379 points, 278 comments). Themes:
  - cost per task ("Forget about the scores... look at the Cost Per Task", rgbrenner)
  - Pareto frontier ("on the cost performance frontier (Pareto line) from medium -> max", XenophileJKO)
  - hard to tell apart from Opus 5.5 on ordinary coding (postalcoder)
  - faster and more reliable than 5.1 (postalcoder)
  - novel ideas get "watered down" (bmitc)
  - "Fable 5.2 low is 3x cheaper than Fable 5.1 xhigh while being 8% smarter" (goldenarm)

  The fetch tool's quotes must be checked word for word on the thread before use.
- X: official [@claudeai launch](https://x.com/claudeai/status/2119867114450268322),
  [Matthew Berman](https://x.com/MatthewBerman/status/2119871207206158459) ("BY FAR the best model I've ever used"; label him
  as a reviewer with early access). Check each quote on the post itself.

## Post metadata

- Slug: `claude-fable-5-2-developer-guide`. Tag: `AI workflow` (already used by the drafts in `posts.ts`).
- Title (builder's call, Christian to confirm): "Claude Fable 5.2 for developers: what's new, what people are saying,
  and how I'd use it".
- Excerpt (builder's call): "What changed in Claude Fable 5.2, what developers on Hacker News and X make of it, and how
  I'd wire it into a Next.js app, Claude Code and agent workflows, including when Opus 5.5 is the better pick."
- Length: about 2,500 to 3,000 words, the same scale as `wordpress-news-october-2026.md`.

## Outline

1. **Intro** (two short paragraphs). What the model is, current as of the date, an honest note that this is how I'd use
   it rather than a client case study, then a `> **The short version.**` callout: cheaper and faster than 5.1, strong
   on long open-ended work, Opus 5.5 still the default for everyday tasks.
2. **What's new in 5.2.** Price, speed, fast mode, safeguards and fallbacks, Fable vs Mythos, and a small benchmark
   table (four rows from the research). *Screenshot 1: the launch page hero, cropped.*
3. **What changes in your code.** The API behaviour list above, each with a one-line fix, written as a checklist for
   anyone moving from 5.1 or Opus.
4. **Fable 5.2 or Opus 5.5?** Anthropic's own advice, the cost-per-task argument from HN, effort levels as the main
   lever, and when the price is worth it (multi-repo work, audits, long agent runs) and when it isn't (routine fixes,
   chat). *Diagram 1: a model-picking flowchart (Haiku, Sonnet, Opus, Fable, by task size and cost of error).*
5. **What developers are saying.** HN and X themes with three to five verbatim quotes and links, both praise and
   criticism. A line saying sources are HN and X, not Reddit. *Screenshot 2: the HN launch thread header with points
   and comment count (no individual comment blocks).*
6. **Using it in a Next.js app.** TypeScript and `@anthropic-ai/sdk`, App Router:
   - a route handler that streams a response with `effort`, `fallbacks: "default"` and refusal handling
   - a server action that returns typed JSON through structured outputs, with Zod (instead of forcing a tool)
   - prompt caching for a large, stable system prompt, and `countTokens` for a cost estimate before a big call
7. **Beyond the app.**
   - Claude Code: when to switch to Fable, fast mode, effort.
   - The orchestrator pattern: Fable plans and reviews, cheaper models do the bulk work. *Diagram 2: orchestrator with
     workers.*
   - Batch work for offline jobs, at half price.
   - Long audits and reviews, which is where HN users say it earns its price.
8. **What I'd do this week.** A numbered checklist in the October post's style.
9. **Sources.** Grouped: Anthropic, docs, Hacker News, X.

## Images

- Two screenshots (launch page, HN thread) taken with the Playwright MCP at 1440px, cropped and saved as WebP at about
  1600px wide. Two diagrams drawn by hand as SVG in the site's tokens (ink, lime highlighter, accent, Bricolage
  and Geist Mono labels), rendered to WebP through a Playwright screenshot. No new packages.
- Every image gets descriptive alt text, plus a caption line under it with the source and date for screenshots.
- Cover image (builder's call): Diagram 1, since it's our own work.
- Working files go in the scratchpad. Final images are uploaded to R2 through the admin when the post is published.
  For local review, the seed Markdown points at the same images (builder's call on whether that's an R2 URL from a
  local upload or a placeholder like `[IMAGE: model picker diagram]` until upload).

## Code examples

- Written for the installed Next.js (read `node_modules/next/dist/docs/` for route handlers and server actions) and
  the current `@anthropic-ai/sdk` from the claude-api skill. Model IDs as exact strings: `claude-fable-5-2`,
  `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`.
- Type-checked with `tsc --noEmit` in a scratchpad folder that installs `@anthropic-ai/sdk` and `zod` there only (not
  in the project). Approving this doc approves that scratchpad install. **Never run them.**
- Each block gets a language tag so shiki highlights it.

## Delivery

1. Write `prisma/seed-data/posts/claude-fable-5-2-developer-guide.md` and add a `DRAFT` entry to `posts.ts`.
2. Run the quality gate. Check the seed-integrity tests pick up the new post, and check the post locally at 1440px and
   390px.
3. Christian reviews the draft. After his go-ahead, he or the builder uploads the images and publishes through the
   production admin.
4. Commit on `feature/fable-5-2-post` (`docs(blog): ...` for the spec, `feat(blog): ...` for the post) and open a PR.
   Only when Christian asks.

## Left to the builder

The exact wording, which quotes to use (after checking them word for word), the diagram layout, the crop of the
screenshots, and the code example details within the rules above.
