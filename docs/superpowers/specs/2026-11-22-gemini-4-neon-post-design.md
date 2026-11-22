# Gemini 4 Neon blog post: design

Date: 2026-11-22. Branch: `feature/gemini-4-neon-post` (main checkout, off `main` at `039ab9f`).

## Why

Christian wants a third post in the series that already has
[`claude-fable-5-2-developer-guide`](../../../prisma/seed-data/posts/claude-fable-5-2-developer-guide.md) and
[`gemini-4-hydrogen-developer-guide`](../../../prisma/seed-data/posts/gemini-4-hydrogen-developer-guide.md), this time
about **Gemini 4 Neon** (released 2026-11-18). Audience and shape are the same as the Hydrogen post: other developers
and potential dev clients, and the point is proof that he keeps up with new models and knows how to put one to work.

The spine Christian picked: **which Gemini 4 model do I pick?** Neon against Hydrogen and Carbon, with cost per task
inside the family as the deciding measure. Not a cross-provider shootout, and not a news recap.

He has not used Neon on a client project, so the post is written as "here's how I'd use it", never as client results.

## Goals

- Answer the reader's actual question: with four Gemini 4 models in six weeks, which one do I point a project at, and
  why would I move off Hydrogen or Carbon.
- Make cost per task, not price per token, the spine. Show that Neon costs more per token than Carbon today and less
  from December 1, and that per-task figures disagree with per-token intuition.
- Show what changes in a developer's code moving from Hydrogen, and separately from Carbon or Argon, where the
  thinking-level default silently changes the bill.
- Cover the client-work angle the other two posts only touched: paid tier only, server-side storage defaults, and the
  45-day retirement footnote.
- Every figure traceable to a linked primary source, dated "as of November 22, 2026".
- Summarise real developer feedback with usernames, permalinks and short verbatim quotes.
- Images: screenshots the builder takes plus one diagram the builder draws.

## Non-goals

- **No Reddit,** and the post says so. See Constraints: it was tried three ways and blocked every time.
- No benchmarks, timings or sample output of our own.
- No cross-provider verdict. Claude and OpenAI models appear only where a cited source puts them next to Neon.
- No Google press images, logos or brand art.
- No Argon deep dive. It gets one line: still in the docs and priced like Carbon, reportedly dropped from the app
  picker, superseded on the Pareto front.
- No changes to site code, components or styles.

## Anti-goals (a failure even if it ships)

- Hype, or any claim of personal or client results that did not happen.
- Any stat, quote or API detail that cannot be traced to a linked source.
- Quoting Google's launch benchmarks as if they were independent results.
- Saying "we", "us" or "our". The site speaks as "I".
- Em dashes or en dashes in anything new.
- Describing WordPress as slow or outdated, if it comes up.

## Constraints

- **Research only, no API calls.** Nothing calls the Gemini API on Christian's keys, on any model. Code examples are
  type-checked, never executed. No terminal screenshot of a real run.
- **Reddit is unreachable.** Christian asked for Reddit. It was tried three ways on 2026-11-22 and failed every time:
  WebFetch is blocked for `reddit.com` and `old.reddit.com`; the Chrome extension refuses reddit.com ("This site is
  not allowed due to safety restrictions"); Playwright reached `old.reddit.com` but got HTTP 403 and a login wall.
  The post therefore draws on Hacker News, and says in the intro that it does. If Christian pastes thread links or
  text, they can go in: that is a change to this doc, not a surprise at write time.
- **Accuracy:** figures come from Google's own pages, the DeepMind model card, Artificial Analysis, Vals and the
  Models Engineering Index, each re-checked at write time rather than taken from this doc. HN quotes are checked word
  for word on the thread before use.
- **Post format:** Markdown body (`prisma/schema.prisma:93`), reading time computed on save
  (`prisma/schema.prisma:95`). Seed bodies live in `prisma/seed-data/posts/<slug>.md`, metadata in
  `prisma/seed-data/posts.ts`. Images are plain `![alt](url)` (`src/components/prose/markdown.tsx:121`).
- **Production only seeds an empty database** (`Dockerfile:53`, `prisma/seed.mts:141`, `SEED_ONLY_IF_EMPTY=1`), so the
  seed file never reaches production. The live post goes in through the admin, which is a production change:
  Christian's go-ahead first.
- **Uploads:** admin R2 uploads accept jpg, png, webp and avif (`src/server/r2.ts:9`).
- **Quality gate** from `CLAUDE.md` applies (typecheck, lint, test, build, e2e), and the post is checked at 1440px and
  390px. `e2e/public/blog.spec.ts` references the Hydrogen post, so check whether it needs the new slug.

## Approaches

Three ways to build the post were considered.

1. **Model-by-model reference.** A section each for Hydrogen, Neon and Carbon, then a summary. Honest, but it buries
   the decision and reads like the docs it cites. Rejected.
2. **Cost-per-task spine (chosen).** Open with the decision, then prove it: one comparison table across the three
   models at matched thinking levels, independent per-task costs next to Google's claim, then the code changes and the
   client-work caveats, then a decision diagram and a this-week list. It matches the Hydrogen post's shape, so the
   three posts read as a series, and it puts the one genuinely surprising fact (Neon is dearer per token than Carbon
   until December 1, and cheaper after) where a reader will see it.
3. **Migration guide from Hydrogen only.** Shorter and more practical, but it answers half the question: plenty of
   readers are on Carbon, where the thinking-level default change actually costs them money. Rejected as too narrow.

Christian picked the spine in conversation on 2026-11-22; approach 2 is the written form of it.

## Decided by Christian

- Spine: which Gemini 4 model do I pick, Neon against Hydrogen and Carbon, cost per task inside the family.
- Audience and shape: same as the Hydrogen post, a hands-on guide for developers and potential dev clients.
- Sources: Google docs, Reddit, Hacker News and X. Reddit is blocked, so HN carries the developer voice.
- No API usage from this account.

## Post metadata

- Slug: `gemini-4-neon-developer-guide`, matching the other two.
- Tag: `AI workflow`.
- Title (builder's call, Christian to confirm): "Gemini 4 Neon for developers: which Gemini 4 model to pick, and what
  it really costs".
- Excerpt (builder's call): "Google shipped four Gemini 4 models in six weeks. What Neon costs per task next to
  Hydrogen and Carbon, what changes in your code when you switch, what developers on Hacker News make of it, and which
  one I'd point a project at."
- Status: DRAFT in the seed. Published through the admin once Christian approves.
- Length: about 2,500 to 3,000 words, the same scale as the Hydrogen post.

## Outline

1. **Intro** (two short paragraphs). Neon landed on November 18, the fourth Gemini 4 model in six weeks. An honest note
   that this is research, not a case study, that no number here was measured on his own key, that every figure links
   out, and that it draws on Hacker News because Reddit could not be reached. Then a `> **The short version.**`
   callout: Neon matches Carbon's intelligence score at matched thinking levels, runs roughly twice Carbon's
   throughput, and costs less per task by every independent measure, but it is dearer per token than Carbon until
   December 1 and it is paid tier only. For most projects it is the new default; Hydrogen keeps the high-volume work
   and Carbon keeps the hardest long-horizon jobs.
2. **What Neon is.** Adapted from Carbon, March 2026 knowledge cutoff, `gemini-4-neon`, 1M unified context, four
   thinking levels defaulting to `high`, text-only output. Google's own positioning sentence. Where it runs: Gemini API
   and AI Studio (paid tier), Gemini app and Antigravity for AI Pro and Ultra, Gemini for business, Agent Platform,
   Firebase AI Logic, AI SDK, AI Gateway, OpenRouter. One line on Argon. *Screenshot 1: the launch post header.*
3. **The family, side by side.** The centrepiece table: price per million tokens, Artificial Analysis index at matched
   levels, output tokens per second, time to first token, and cost per index task, for Hydrogen, Neon and Carbon, with
   the December 1 and January 1 price changes called out. Then the like-for-like caveat: only the top levels have a
   published per-task cost, and Carbon has no `xhigh`.
4. **Cost per task, three ways.** Google's "32% lower cost per task than Carbon" claim, then Artificial Analysis, Vals
   and the Models Engineering Index, each with its own figure and its own caveat, plus the MEI and AA warnings quoted.
   The point: the direction is consistent, the dollar figures are not, so measure your own workload.
   *Screenshot 2: the Models Engineering Index table.*
5. **What changes in your code.** Two checklists. From Hydrogen: model ID, and that is nearly it, plus paid tier only.
   From Carbon or Argon: the default thinking level moves from `medium` to `high`, which raises the bill unless you set
   it, and `xhigh` is new. Then the list that applies either way: no `temperature`, `top_p`, `top_k`; no explicit
   caching; implicit caching at 4,096 tokens for a 95% discount; one 1M window shared across input, thinking and
   output; 65,536 default output cap and long decode via `background: true`; 15-minute client timeouts; thought
   signatures returned unchanged; declare tools or risk `MALFORMED_FUNCTION_CALL`; no Live API, no image or audio out.
6. **The parts that matter for client work.** Paid tier only, so no free-tier data-improvement exposure, and paid-tier
   content is not used to improve Google's products. `generateContent` stores requests by default on new paid projects
   since October 26. On Agent Platform it is a Google Frontier Model under Section 34 of the Service Specific Terms,
   interactions are stored server-side by default with a 7-day TTL to delete against. Firebase marks it a short-term
   availability model: retirement as early as 45 days after a replacement. Keep the model ID in one config value.
   Search grounding costs and the 5,000-request monthly allowance shared across Gemini 3 and newer.
7. **What developers say.** Hacker News, grouped: lineup confusion, the per-token versus per-task argument, coding and
   Antigravity experience, benchmark scepticism, and access complaints. Short verbatim quotes with usernames and
   permalinks. *Screenshot 3: the main HN thread header.*
8. **Which one I'd pick.** *Diagram: high-volume and latency-sensitive work to Hydrogen, everyday serious coding and
   agent work to Neon as the default, hardest long-horizon work to Carbon, with today's prices on it.* Three short
   paragraphs, flagged as his own call rather than a benchmark result, and a note to look again after December 1.
9. **What I'd do this week.** Seven numbered steps, same register as the Hydrogen post: pin the model ID, set the
   thinking level on purpose when coming from Carbon, measure cost per task on real prompts, check the storage and TTL
   defaults for client data, plan for the 45-day retirement notice, try Neon as the planner over Hydrogen subagents,
   and re-run the maths on December 1.
10. **Sources.** Grouped as in the Hydrogen post: Google, Docs, Independent tests, Hacker News.

## Research gathered 2026-11-22 (verify again at write time)

### Launch and positioning

Launch post, Koray Kavukcuoglu, November 18, 2026:
<https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/>

- Google's positioning: "While Carbon tackles your hardest, long-horizon projects and Hydrogen handles fast everyday
  execution, Neon balances depth and efficiency."
- "The model is priced at $3 per million input tokens ($0.15 per million cached input tokens, a 95% discount) and $15
  per million output tokens, with a 1 million-token context window."
- Cost-per-task claims: "a 32% lower cost per task than Carbon" at high; "roughly 50% to 80% lower cost per task than
  top competing frontier models" on Vals and Agent Arena; at xhigh "still costing 36%+ less per task than competing
  models at their highest setting".
- Google's own benchmark headlines: Artificial Analysis Intelligence Index #3 at 61 (xhigh); Vals Index #2 at 70.9%;
  Agent Arena #2 at 1336; Artificial Analysis Coding Agent Index #1 at 58.6; Terminal-Bench 4.1 65.2%; FrontierCode
  2.0 46.2% at default high; HLE-Diamond 71.3%; Zapier AutomationBench #1 at 56.3%; Chartography 73.5%; Agents' Last
  Exam v1.1 75.8%. Treat all of these as vendor numbers.
- Availability in the post: Gemini API in AI Studio (paid tier), Gemini for business, Antigravity for paid AI Pro and
  Ultra, Gemini app for Pro and Ultra, AI Studio chat for Pro and Ultra. Search is not mentioned for Neon.
- The post never names Claude Opus 5.5 or GPT-6.2 Sol, despite press framing it that way. Worth a line.

Model card, <https://deepmind.google/models/model-cards/gemini-4-neon/>: "Gemini 4 Neon is adapted from Gemini 4
Carbon." Knowledge cutoff March 2026. Safety and security report "will be available in the coming days".

### Prices, per million tokens, standard tier

| Model | Input | Cached | Output | Change |
| --- | --- | --- | --- | --- |
| Gemini 4 Hydrogen | $1.50 | $0.075 | $7.50 | none; free tier available |
| Gemini 4 Neon | $3.00 | $0.15 | $15.00 | none scheduled; no free tier |
| Gemini 4 Carbon | $2.00 | $0.10 | $10.00 | doubles to $4 / $20 on 2026-12-01 |
| Gemini 4 Argon | $2.00 | $0.10 | $10.00 | doubles to $4 / $20 on 2026-12-01 |
| Gemini 3.8 Flash | $0.75 | $0.075 | $3.75 | doubles on 2027-01-01 |

Batch and Flex are half the standard rate; Priority is 1.8x. Source: <https://aistudio.google.com/docs/pricing>.
Paid tier content is not used to improve Google's products; free tier content is. Neon, Carbon and Argon have no free
tier. Search grounding: 5,000 free requests a month shared across Gemini 3 and newer, then $14 per 1,000, billed per
individual search query, 1,500/day cap, standard and priority only.

### Independent measurements

Artificial Analysis (<https://artificialanalysis.ai/models/gemini-4-neon>, and the Carbon and Hydrogen pages). Speed
figures are averaged over five days, so re-read them at write time.

| Model, level | Index | Output tok/s | TTFT | Cost per index task |
| --- | --- | --- | --- | --- |
| Neon xhigh | 61 | 106 | 59.77s | $6.44 |
| Neon high | 60 | 103 | 38.95s | not published |
| Neon medium | 55 | 100 | 22.52s | not published |
| Neon low | 44 | 99 | 17.31s | not published |
| Carbon high | 60 | 59 | 69.71s | $7.76 |
| Carbon medium | 58 | 68 | 32.99s | not published |
| Carbon low | 54 | 53 | 7.13s | not published |
| Hydrogen xhigh | 54 | 153 | 55.24s | $3.16 |
| Hydrogen high | 51 | 156 | 22.05s | not published |
| Hydrogen medium | 41 | 169 | 13.12s | not published |
| Hydrogen low | 27 | 159 | 7.91s | not published |

Matched levels: at high, Neon 60 and Carbon 60 and Hydrogen 51. At medium, Neon 55, Carbon 58, Hydrogen 41. Carbon has
no xhigh. Do not reuse AA's blended price-per-million figures as cost per task.

Vals (<https://www.vals.ai/>; the per-model Neon page 404s): Neon 70.87% at $7.40 per test, Carbon 70.36% at $10.51,
Fable 5.2 71.31% at $17.94, Hydrogen 68.49% at $9.84. Ranks were stated at different times against different
denominators, so skip the ranks.

Models Engineering Index (<https://git-aarvin.github.io/mei/>): "a composite index across 16 coding benchmarks,
adjusted for benchmark difficulty and missing results so models average 50". Neon #2 at 67.0, cost 3.1x a typical
model, tokens 0.84x. Fable 5.2 #1 at 67.2, cost 7.7x. 6.2 Astra #3 at 66.0. Carbon #5 at 61.6, cost 3.5x. Hydrogen #8
at 58.9, cost 2.2x. Quote its caveat: "Results are reproduced as published, not independently verified, and may be
affected by contamination or tuning to the benchmarks." No operator is named on the page, and Vals is one of its data
sources, so it is an aggregate, not a fresh test.

Secondary per-task figures seen in press and not yet verified at source, so verify or drop: Zapier about $0.88 per
task at high, Cursor $6.54 at high and $10.67 at xhigh, Cognition $4.38, and
<https://www.implicator.ai/google-gemini-neon-task-cost/>. Only use ones traced to the original publisher.

### API behaviour

From <https://aistudio.google.com/docs/whats-new-gemini-4-neon>, <https://aistudio.google.com/docs/models/gemini-4-neon>
and <https://aistudio.google.com/docs/changelog> (Neon GA entry dated November 18, 2026):

- `gemini-4-neon`, stable, no dated preview ID. Paid tier only, on `generateContent` and the Interactions API.
  "Gemini 4 Neon is not available on the Free tier."
- 1,048,576 tokens as a "unified input and output token limit". Synchronous output caps at 65,536; up to 1,048,576 with
  long decode, which needs `background: true` or client-side continuation. `max_output_tokens` "caps combined thinking
  and output tokens".
- Thinking: `low`, `medium`, `high` (default), `xhigh`. `minimal` is rejected. Carbon and Argon "default to `medium`
  and cap at `high`", so moving from them changes the default upward.
- From Hydrogen the page says the switch "requires no request schema changes".
- Remove `temperature`, `top_p`, `top_k`: in-range values are ignored, out-of-range return 400. On Agent Platform
  `thinking_budget` and `thinking_level="MINIMAL"` return 400.
- Explicit caching unsupported: remove `cached_content`, `cachedContents`, `caches.create`. Implicit caching from
  4,096 tokens, 95% discount on hits.
- Input text, image, video, audio, PDF (Office and OpenDocument on Agent Platform). Output text only. No Live API, no
  image or audio generation.
- Supported: function calling, structured outputs, Search and Maps grounding, URL context, code execution, computer
  use, file search, implicit caching, tool retrieval (Preview, added November 19 for all Gemini 4 models), Batch, Flex,
  Priority.
- "set HTTP client timeouts to at least 15 minutes." Billing counts "every token the model processes, including
  thinking tokens and internal grounding system instructions and function declarations."
- Multi-turn: `previous_interaction_id` on the Interactions API, or return prior turns and thought signatures
  unchanged on `generateContent`. "Do not copy a thought signature across parallel `functionCall` parts."
- Tools must be declared; prompting for raw-text JSON tool calls with none declared "can return
  `MALFORMED_FUNCTION_CALL`".

Platform notes:

- Agent Platform (<https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-neon>): launch stage
  GA, released November 18, 2026, `global`, `us` and `eu`. A Google Frontier Model under Section 34 of the Service
  Specific Terms. Interactions stored server-side by default, 7-day TTL. No tuning, no Live API, no fixed quota. No
  "short-term GA" or 45-day wording on this page, unlike Hydrogen's Vertex guide, so do not reuse that line.
- Firebase AI Logic (<https://firebase.google.com/docs/ai-logic/models>): listed, Blaze plan required, "Near-Carbon
  intelligence with faster task completion for daily production coding, analytical reasoning, and enterprise
  workflows". Long decode not supported there. Footnote marks it a short-term availability model, which the page
  defines as possibly "shut down (retired) as early as 45 days after a replacement model is released".
- AI SDK (<https://ai-sdk.dev/providers/ai-sdk-providers/google>): `gemini-4-neon`, or `google/gemini-4-neon` through
  the Gateway. "Gemini 4 Hydrogen and Gemini 4 Neon support 'low', 'medium', 'high', and 'xhigh'." Its explicit
  caching example uses a Gemini 4 model that does not support explicit caching, so do not copy it.
- AI Gateway (<https://vercel.com/ai-gateway/models/gemini-4-neon>): $3 / $15, and it advertises 1,000,000 max output
  tokens, which only holds with background long decode. Worth one line.
- OpenRouter (<https://openrouter.ai/google/gemini-4-neon>): several provider rows from $1.50 / $7.50 to $5.40 / $27,
  EU routing via Vertex at $3.30 / $16.50 on Business or Enterprise plans. It also advertises accepting `temperature`
  and `top_p`, which Google ignores. Worth one line.

### Hacker News

Main thread, "Gemini 4 Neon", <https://news.ycombinator.com/item?id=50552424>, 1059 points, 775 comments, on the launch
post. Second thread, "Gemini 4 Neon is the new #1 on the Models Engineering Index",
<https://news.ycombinator.com/item?id=50568130>, 375 points, 246 comments. Two small threads on the docs pages:
<https://news.ycombinator.com/item?id=50552067> (23 points) and <https://news.ycombinator.com/item?id=50552279>.

Quotes were read verbatim off the pages by the research pass, and must be re-checked word for word before use. Comment
ids are permalinks (`https://news.ycombinator.com/item?id=<id>`).

- Lineup confusion: Mitchem (50552306) "4 is really confusing. Very hard to figure out in what situation I would use
  Carbon, Argon, Neon or Hydrogen". HenryMulligan (50552324) "The new lineup is Hydrogen < Neon < Carbon. I think Argon
  has been superceded on the Pareto Front." kingstnap (50552482) and altcognito (50569978) both say Argon has been
  dropped from the app picker. mkagenius (50557692) lists twelve model names to remember.
- Price versus cost: zeroq (50557155) "Carbon costs the same as Argon did. Neon is a cheaper model." svachalek
  (50561934) "Carbon is 50% off, while Neon is not; at full price Carbon is the \"premium\" model." anentropic
  (50557758) "Currently Neon is more expensive on OpenRouter..." with "$3/$15 vs $2/$10". whinvik (50552284) "Carbon is
  $2 now, $4 in 2 weeks. Argon is $2 now, $4 in 2 weeks." polishTar (50556691) "Also Carbon is pretty token heavy."
- Measured use: aleqs (50571039) "I've been running 3 neon sessions for the last ~hour and I'm still at 0% weekly
  usage" and (50570996) "Noticeably faster than opus 5.5, and so far it seems like I will get at least 10x usage".
- Coding and agents: pkulak (50569816) "As far as I can tell, it's at least as good as Opus 5.5 at writing code".
  postalcoder (50568821) "Coding-wise, it's equivalent to Opus 5.5/Fable." jorl17 (50570116) "it seems to have built
  faster and waaaaay cheaper than Claude." soared (50572053) on Antigravity "it still asks me permission for every
  tiny thing it tries to do."
- Scepticism: jiggawatts (50569074) "All of the Gemini 4 models -- including Neon -- consistently make simple,
  \"doofus\" errors" and "For comparison, these basic errors no longer occur with any of the recent Anthropic or
  OpenAI models". impulser_ (50552711) "they just don't seem as good as Opus 5.5 despite the benchmarks."
  irthomasthomas (50558513) "Neon is within about 1% of Fable 5.2's performance for about 40% the cost on vals.ai",
  which is a claim about a benchmark site, not their own measurement.
- Access: esperent (50569602) "Google just makes it weirdly hard to give them money." 306bobby (50569782) "I have AI
  Pro as well and have Hydrogen and Neon access. Just no Argon or Carbon". tpm (50573099) reports no Neon in the app on
  a roughly 10 euro plan. croon (50576402) cannot subscribe on a Workspace account.
- Writing quality, if there is room: relistan (50557307) "For planning documents about complex work, Hydrogen does a
  fantastic job of both the analysis and the writing."

Unverified paraphrases from summarised parts of the threads, to re-read or drop: PaulStatezny (50575808) on quota per
task, largbae (50568755) on Neon high against Opus 5.5 medium, hazmazlaz (50570141) on regressions.

## Images

Four, following the Hydrogen post. Screenshots taken by the builder in Chrome, cropped, uploaded as webp through the
admin to R2. No Google brand art.

1. The launch post header, for "What Neon is".
2. The Models Engineering Index table, for the cost-per-task section.
3. The main Hacker News thread header, for the developer reaction section.
4. A diagram the builder draws: the three-way decision, Hydrogen for volume and latency, Neon as the default, Carbon
   for the hardest long-horizon work, with today's prices and the December 1 change marked.

## Left to the builder

- Exact wording throughout, and which HN quotes make the cut, within the quote-accuracy rule above.
- Whether the secondary per-task figures (Zapier, Cursor, Cognition) survive source verification, and whether the
  writing-quality quote earns its place.
- Table layout and how much of the Artificial Analysis grid to show, as long as matched levels are compared and the
  missing per-task costs are not filled in.
- Crops and alt text for the screenshots, and the diagram's visual form.
- Whether `e2e/public/blog.spec.ts` needs the new slug.
