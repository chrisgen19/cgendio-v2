# GPT-6.2 Astra and Sol blog post: design

Date: 2026-11-23. Branch: `feature/gpt-6-2-astra-sol-post` (off `origin/main` at `aecd942`).

## Why

Christian wants a fourth post in the AI model developer-guide series (after
[`claude-fable-5-2-developer-guide`](../../../prisma/seed-data/posts/claude-fable-5-2-developer-guide.md),
[`gemini-4-hydrogen-developer-guide`](../../../prisma/seed-data/posts/gemini-4-hydrogen-developer-guide.md) and
[`gemini-4-neon-developer-guide`](../../../prisma/seed-data/posts/gemini-4-neon-developer-guide.md)), covering OpenAI's
**GPT-6.2 Astra** and **GPT-6.2 Sol** (released 2026-11-17). Audience and shape match the series: other developers and
potential dev clients, showing practical command of new models without hype.

The spine Christian picked: **Astra vs. Sol inside GPT-6.2** -- when paying 4x more for Astra ($8 / $40) over Sol
($2 / $10) is worth it on cost per task, plus the breaking Responses API caching/reasoning changes, Codex/developer
reaction on Hacker News, and concise type-checked Next.js Responses API examples.

He has not used GPT-6.2 Astra or Sol on a client project, so the post is written as "here's how I'd use it", never as
client results.

## Goals

- Compare GPT-6.2 Astra and GPT-6.2 Sol cleanly on list pricing, cache writes, context cliffs, and independent
  cost-per-task / effort-level data (Artificial Analysis & Models Engineering Index).
- Highlight the non-obvious effort-level finding from Artificial Analysis: Astra `xhigh` ties Astra `max` (62) in 59%
  fewer output tokens, and Astra `medium` ties Sol `max` (57) in roughly a fifth of the output tokens.
- Document every concrete Responses API behaviour change in GPT-6.2 (`instructions` appended after `input`, prefix
  edits dropping reasoning items, no `flex` tier / Background Mode 2h & 8h beta, `effort: 'none'` rejected, temporary
  storage under Background Mode, default conciseness & early-stopping behaviour).
- Provide three concise, `tsc --noEmit`-verified TypeScript / Next.js App Router examples using `openai@7.62.0` and
  `zod@4.6.7`, without executing live API calls.
- Summarise real developer reaction from Hacker News with verbatim quotes checked on their permalinks.
- Include 4 WebP visuals (3 screenshots + 1 site-token decision diagram), staged in `docs/screenshots/` and uploaded to
  R2.

## Non-goals

- **No Reddit:** `old.reddit.com` returned HTTP 403 during research; the intro states that Hacker News carries the
  community voice.
- No live OpenAI API calls, self-measured benchmarks, or sample output from our own key.
- No changes to site components, routes, or styles under `src/`.
- No publishing in PR 1 (draft only; publishing stays a deliberate step through the production admin + PR 2).

## Anti-goals

- Hype, invented stats, or claims of personal/client results that did not happen.
- Any stat, quote, or API detail that cannot be traced to a linked primary source.
- Using "we", "us", or "our" outside a verbatim quote.
- Em dashes or en dashes anywhere in new prose, titles, or excerpts.
- Plain `http://` links.

## Post metadata

- Slug: `gpt-6-2-astra-sol-developer-guide`
- Tag: `AI workflow`
- Title: `GPT-6.2 Astra and Sol for developers: when Astra is worth 4x Sol, and what changes in the Responses API`
- Excerpt: `OpenAI shipped GPT-6.2 Astra ($8/$40) and Sol ($2/$10) on November 17. What they cost per task, the Responses API caching and reasoning changes that break old habits, what Hacker News developers make of both, and how I'd wire them into a Next.js app.`
- Status: `DRAFT` in PR 1 (no `publishedAt`).

## Images (4 WebP, on R2 + `docs/screenshots/`)

1. `docs/screenshots/gpt-6-2-launch-header.webp` -- OpenAI launch post hero (`openai.com/index/introducing-gpt-6-2-astra-sol/`).
2. `docs/screenshots/gpt-6-2-mei-cost-chart.webp` -- Models Engineering Index Performance vs Cost scatter chart.
3. `docs/screenshots/gpt-6-2-hn-thread.webp` -- Hacker News launch thread header (`#50535230`, points & comments only).
4. `docs/screenshots/gpt-6-2-which-model-diagram.webp` -- Custom decision diagram rendered in the site's design tokens and self-hosted fonts.
