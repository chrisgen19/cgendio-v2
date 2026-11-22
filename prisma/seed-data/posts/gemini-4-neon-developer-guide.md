Google released Gemini 4 Neon on November 18, 2026. It's the fourth Gemini 4 model in six weeks, after Argon in October, Carbon on October 28 and Hydrogen on November 12, and it's aimed straight at the gap between the last two. Google's own line: "While Carbon tackles your hardest, long-horizon projects and Hydrogen handles fast everyday execution, Neon balances depth and efficiency" ([launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)).

So the question isn't really "is Neon good". It's which of the four you point a project at, and what that choice costs per finished task rather than per token. That's what this post works out. I haven't shipped Neon in a client project, so this isn't a case study, and I haven't run it on my own API key either: every number here is Google's, an independent tester's or a developer's who posted it, and each one links to where it came from. Everything is current as of November 22, 2026. I went looking for the Reddit threads and couldn't reach them, so the developer voice here is Hacker News.

> **The short version.** At matched thinking levels Neon scores the same as Carbon on Artificial Analysis's index (60 at `high`), runs about 1.7x Carbon's output speed, and costs less per task on every independent measure I could find. The catch is the calendar: Neon lists at $3 / $15 per million tokens, which is *more* than Carbon's $2 / $10 today and *less* than Carbon's $4 / $20 from December 1. It's also paid tier only. For most work I'd make Neon the default, leave high-volume and latency-sensitive jobs on Hydrogen, and keep Carbon for the hardest long-horizon runs.

## What Neon is

Neon is the middle of the Gemini 4 family, and it's a derivative rather than a new base model: "Gemini 4 Neon is adapted from Gemini 4 Carbon", with a knowledge cutoff of March 2026 ([model card](https://deepmind.google/models/model-cards/gemini-4-neon/)). The model ID is `gemini-4-neon`, stable, with no preview suffix ([AI Studio model page](https://aistudio.google.com/docs/models/gemini-4-neon)).

The shape of it, from Google's docs:

- **One 1,048,576-token window,** described as a "unified input and output token limit". Input, thinking and output all come out of the same budget.
- **Four thinking levels:** `low`, `medium`, `high` and `xhigh`, defaulting to `high`.
- **Text out only.** Input can be text, images, video, audio or PDF. There's no Live API and no image or audio generation.
- **Paid tier only.** "Gemini 4 Neon is not available on the Free tier" ([pricing](https://aistudio.google.com/docs/pricing)).

Where it runs, as of today: the Gemini API and AI Studio on the paid tier, the Gemini app and AI Studio chat for Google AI Pro and Ultra subscribers, Google Antigravity for those same paid tiers, Gemini for business, the Google Cloud Agent Platform ([model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-neon), GA, released November 18), and [Firebase AI Logic](https://firebase.google.com/docs/ai-logic/models) on the Blaze plan. Outside Google it's in the [Vercel AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/google), the [AI Gateway](https://vercel.com/ai-gateway/models/gemini-4-neon) and [OpenRouter](https://openrouter.ai/google/gemini-4-neon). Unlike Hydrogen, Google hasn't put Neon in Search.

One note on Argon, the fourth name: it's still in the docs and still priced like Carbon, but developers report it has quietly left the model picker, and that it's been passed on the cost-performance curve. I wouldn't start anything new on it.

## The family, side by side

Prices first, per million tokens, standard tier, from [Google's pricing page](https://aistudio.google.com/docs/pricing):

| Model | Input | Output | Scheduled change |
| --- | --- | --- | --- |
| Gemini 4 Hydrogen | $1.50 | $7.50 | none; free tier available |
| Gemini 4 Neon | $3.00 | $15.00 | none; no free tier |
| Gemini 4 Carbon | $2.00 | $10.00 | $4.00 / $20.00 from December 1, 2026 |
| Gemini 4 Argon | $2.00 | $10.00 | $4.00 / $20.00 from December 1, 2026 |
| Gemini 3.8 Flash | $0.75 | $3.75 | $1.50 / $7.50 from January 1, 2027 |

Cached input is 5% of the input price across the Gemini 4 line, Batch and Flex are half the standard rate, and Priority is 1.8x it. Read the Carbon row twice: for the next eight days Neon is the dearer model per token, and after that it's 25% cheaper than the thing it replaces. Developers noticed. On Hacker News, [svachalek](https://news.ycombinator.com/item?id=50561934) put it as "Carbon is 50% off, while Neon is not; at full price Carbon is the \"premium\" model", and [anentropic](https://news.ycombinator.com/item?id=50557758) pointed out that on OpenRouter Neon is simply "$3/$15 vs $2/$10" today.

Now what you get for it. These are [Artificial Analysis](https://artificialanalysis.ai/models/gemini-4-neon)'s own measurements, not Google's, at matched thinking levels:

| Model and level | Index | Output tok/s | First token | Cost per index task |
| --- | --- | --- | --- | --- |
| Hydrogen `high` | 51 | 156 | 22.05s | not published |
| Hydrogen `xhigh` | 54 | 153 | 55.24s | $3.16 |
| Neon `medium` | 55 | 100 | 22.52s | not published |
| Neon `high` (default) | 60 | 103 | 38.95s | not published |
| Neon `xhigh` | 61 | 106 | 59.77s | $6.44 |
| Carbon `medium` (default) | 58 | 68 | 32.99s | not published |
| Carbon `high` | 60 | 59 | 69.71s | $7.76 |

Three things to take from that table, and one warning about reading it.

The headline is **Neon `high` against Carbon `high`: the same index score, 60, at 103 output tokens per second against 59, and the first token back in 39 seconds instead of 70**. Artificial Analysis also has Neon's whole index run finishing in 14.5 minutes at `high` against Carbon's 34.9 minutes. Second, **Carbon has no `xhigh`**, so Neon's 61 is a level Carbon can't reach. Third, **Hydrogen is not in the same conversation on quality**: 51 at `high` against Neon's 60 is a wide gap, and it's wider still further down, where Hydrogen `low` scores 27 and Neon `low` scores 44.

The warning: only one cost per task is published per model, each at a different level, so the $3.16, $6.44 and $7.76 figures are not like for like. Carbon's is at `high`, Neon's at `xhigh`. And Artificial Analysis's Carbon page already quotes the December price of $4 / $20, so that $7.76 may be computed at the new rate rather than today's. Don't lift any of those three numbers as "what it will cost me". Also don't mistake the blended price per million that these pages show for a cost per task; they're different measurements.

## Cost per task, three ways

Google's claim is specific: at the default `high` setting Neon delivers "a 32% lower cost per task than Carbon", and on the Vals and Agent Arena indexes "roughly 50% to 80% lower cost per task than top competing frontier models" ([launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)). It's a vendor's own framing, so I read it as a reason to test rather than a verdict. Three independent-ish measures point the same way, with different numbers:

- **[Artificial Analysis](https://artificialanalysis.ai/models/gemini-4-neon):** $6.44 per index task for Neon at `xhigh` against $7.76 for Carbon at `high`, with the caveats above. Its speed and latency figures "average each endpoint's runs over the past 5 days", so they move.
- **[Vals](https://www.vals.ai/):** Neon at 70.87% on the Vals Index for $7.40 per test, against Carbon at 70.36% for $10.51 and Claude Fable 5.2 at 71.31% for $17.94. Near-identical scores, a third of the bill.
- **[Models Engineering Index](https://git-aarvin.github.io/mei/):** "a composite index across 16 coding benchmarks, adjusted for benchmark difficulty and missing results so models average 50". Neon places second at 67.0, just behind Fable 5.2 at 67.2, with Carbon fifth at 61.6 and Hydrogen eighth at 58.9. It reports cost as a multiple of a typical model: Neon 3.1x, Carbon 3.5x, Fable 5.2 7.7x. Its own health warning is worth repeating: "Results are reproduced as published, not independently verified, and may be affected by contamination or tuning to the benchmarks." It aggregates other people's published runs, and Vals is one of its sources, so treat the two as overlapping rather than independent.

The direction is consistent across all three: same quality as Carbon, materially cheaper per finished task, and cheaper still once the output-token count is taken into account, because Neon spends fewer tokens getting there. The dollar figures are not consistent at all, and none of them is your workload. The only number that decides anything is the one you measure on your own prompts.

## What changes in your code

Google's own summary is that "switching to `gemini-4-neon` requires no request schema changes" from another Gemini 4 model, which is true as far as the schema goes. What changes is the behaviour, and in one case the bill. All of this comes from Google's [what's new in Neon](https://aistudio.google.com/docs/whats-new-gemini-4-neon) page, the [AI Studio model page](https://aistudio.google.com/docs/models/gemini-4-neon) and the [Agent Platform model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-neon).

**Coming from Hydrogen,** it really is close to a one-line change. Same four thinking levels, same `high` default, same shared window. Two things to check: Neon has no free tier, so a project that was running Hydrogen for nothing now needs billing on, and your per-token costs double.

**Coming from Carbon or Argon, read this twice.** Those two "default to `medium` and cap at `high`", and Neon "defaults to `high` and supports `xhigh`". Swap the model ID and leave the request alone, and you have silently moved up a thinking level, on a model that bills thinking as output. That's a bill increase with no code change behind it. Set the level explicitly on the first deploy, then tune it.

Either way, these apply:

1. **No sampling settings.** Remove `temperature`, `top_p` and `top_k`. "The server ignores in-range custom values if sent. Out-of-range values return a `400` validation error."
2. **`minimal` is gone.** Neon takes `low`, `medium`, `high` and `xhigh` only. On the Agent Platform, "Setting `thinking_budget` or `thinking_level="MINIMAL"` returns an HTTP 400 validation error."
3. **One window for everything.** "Input, thinking, and output tokens share one 1,048,576-token window", and "The `max_output_tokens` field caps combined thinking and output tokens for a response." A low hard-coded cap left over from an older model now starves the thinking budget: raise it, or lower the thinking level on purpose.
4. **Long output is opt-in.** Synchronous responses stop at 65,536 tokens per hop. Past that you need long decode, either `background: true` or client-side continuation. Set `background` without `max_output_tokens` and "the server stops after 65,536 tokens" anyway.
5. **Slow turns need patient clients.** Google's advice is to use background execution or "set HTTP client timeouts to at least 15 minutes". A default 30-second fetch timeout will cut off work you've already paid for.
6. **No explicit caching.** "Gemini 4 Neon does not support explicit caching (`cachedContents` and `caches.create`). Remove `cached_content` fields from requests." Implicit caching runs by default from 4,096 tokens and takes 95% off cached input, so the lever you have left is prompt order: keep the stable part of the prompt at the front.
7. **Keep thought signatures intact.** In client-managed `generateContent` histories, return prior model turns and their thought signatures unchanged, and "Do not copy a thought signature across parallel `functionCall` parts." On the Interactions API, `previous_interaction_id` does this for you.
8. **Declare your tools.** Function calling, structured outputs, Search and Maps grounding, URL context, code execution, computer use and file search are all supported. Asking for JSON tool calls in the prompt with no tools declared "can return `MALFORMED_FUNCTION_CALL`".
9. **What isn't there.** No Live API, no image or audio generation. Text in, text out, with images, video, audio and PDF accepted as input.

Two caveats about third-party docs, because both cost me time. The AI SDK's Google provider page shows an explicit caching example on a Gemini 4 model, which these models don't support, so don't copy it. The AI Gateway's model page advertises 1,000,000 max output tokens, which is only reachable through background long decode, not from a normal request. OpenRouter lists `temperature` and `top_p` among the fields Neon accepts, which Google says it ignores.

## The parts that matter for client work

The things that decide whether I'd put a client's data through this, rather than whether the model is clever:

- **Paid tier only, and that's good news.** Neon isn't on the free tier at all. Google's pricing page marks free-tier content "used to improve our products" and paid-tier content "**not** used to improve our products", so the tier that would have been the problem isn't available anyway. Hydrogen, by contrast, is free on the free tier, which is exactly where a prototype quietly leaks client data.
- **Requests are stored by default now.** Since October 26, 2026, "New projects using the Generate Content API ... on the paid tier now store requests by default (`store=true`)", and "Existing projects keep their current setting" ([changelog](https://aistudio.google.com/docs/changelog)). It's per-request `store=false` to opt out. Worth knowing before a client asks where their documents went.
- **Enterprise terms.** On the Agent Platform, "Gemini 4 Neon is a Google Frontier Model subject to Section 34 of the Service Specific Terms", which is the abuse-monitoring clause. That's the paragraph a client's legal team will want, not the benchmark table.
- **Caching bills in a way worth planning for.** Implicit caching only, 4,096-token minimum, durable caching on by default, and cache writes "billed at 1.25x the standard input token price by default". From January 12, 2027 there's TTL configuration, where "longer retention costs more".
- **Grounding is metered separately.** Google Search grounding gives "5,000 free search requests per month (shared across all Gemini 3 and newer models), then $14 per 1,000 requests", capped at 1,500 a day, and you're charged "for each individual search query performed". One grounded answer can run several searches.
- **Retirement risk, stated carefully.** The Agent Platform page says "Launch stage: GA" with a release date of November 18, 2026, and carries no retirement-notice wording, unlike Hydrogen's. But [Firebase AI Logic](https://firebase.google.com/docs/ai-logic/models) footnotes Neon as a short-term availability model on the Agent Platform API, and defines those as models that "may be shut down (retired) as early as 45 days after a replacement model is released". Two Google pages, two impressions. I'd plan for the 45 days and keep the model ID in one config value. Firebase also doesn't support long decode for Neon yet.

## What developers say

## Which one I'd pick

## What I'd do this week

## Sources
