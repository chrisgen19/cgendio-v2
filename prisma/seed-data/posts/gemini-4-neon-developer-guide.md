Google released Gemini 4 Neon on November 18, 2026. It's the fourth Gemini 4 model in six weeks, after Argon in October, [Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) on October 28 and Hydrogen on November 12, and it's aimed straight at the gap between the last two. Google's own line: "While Carbon tackles your hardest, long-horizon projects and Hydrogen handles fast everyday execution, Neon balances depth and efficiency" ([launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)).

So the question isn't really "is Neon good". It's which of the four you point a project at, and what that choice costs per finished task rather than per token. That's what this post works out. I haven't shipped Neon in a client project, so this isn't a case study, and I haven't run it on my own API key either: every number here is Google's, an independent tester's or a developer's who posted it, and each one links to where it came from. Everything is current as of November 22, 2026. I went looking for the Reddit threads and couldn't reach them, so the developer voice here is Hacker News.

> **The short version.** At matched thinking levels Neon scores the same as Carbon on Artificial Analysis's index (60 at `high`), runs about 1.7x Carbon's output speed, and costs less per task on all three independent measures I could find, none of which is a clean like-for-like comparison. The catch is the calendar: Neon lists at $3 / $15 per million tokens, which is *more* than Carbon's $2 / $10 today and *less* than Carbon's $4 / $20 from December 1. It's also paid tier only. For most work I'd make Neon the default, leave high-volume and latency-sensitive jobs on Hydrogen, and keep Carbon for the hardest long-horizon runs.

## What Neon is

Neon is the middle of the Gemini 4 family, and it's a derivative rather than a new base model: "Gemini 4 Neon is adapted from Gemini 4 Carbon", with a knowledge cutoff of March 2026 ([model card](https://deepmind.google/models/model-cards/gemini-4-neon/)). The model ID is `gemini-4-neon`, stable, with no preview suffix ([AI Studio model page](https://aistudio.google.com/docs/models/gemini-4-neon)).

The shape of it, from Google's docs:

- **One 1,048,576-token window,** described as a "unified input and output token limit". Input, thinking and output all come out of the same budget.
- **Four thinking levels:** `low`, `medium`, `high` and `xhigh`, defaulting to `high`.
- **Text out only.** Input can be text, images, video, audio or PDF. There's no Live API and no image or audio generation.
- **Paid tier only.** "Gemini 4 Neon is not available on the Free tier" ([pricing](https://aistudio.google.com/docs/pricing)).

Where it runs, as of today: the Gemini API and AI Studio on the paid tier, the Gemini app and AI Studio chat for Google AI Pro and Ultra subscribers, Google Antigravity for those same paid tiers, Gemini for business, the Google Cloud Agent Platform ([model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-neon), GA, released November 18), and [Firebase AI Logic](https://firebase.google.com/docs/ai-logic/models) on the Blaze plan. Outside Google it's in the [Vercel AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/google), the [AI Gateway](https://vercel.com/ai-gateway/models/gemini-4-neon) and [OpenRouter](https://openrouter.ai/google/gemini-4-neon). Unlike Hydrogen, Google hasn't put Neon in Search.

![Google's launch post header: Introducing Gemini 4 Neon, dated November 18, 2026, by Koray Kavukcuoglu of Google DeepMind, subtitled "Bringing frontier-level intelligence with fast end-to-end task completion"](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/7d67b6db-b7e0-4cbd-92d9-cfe83be95c34.webp)

*Google's launch post, November 18, 2026.*

One note on Argon, the fourth name: it's still in the docs and still priced like Carbon, but developers report it has quietly left the model picker ([kingstnap](https://news.ycombinator.com/item?id=50552482), [altcognito](https://news.ycombinator.com/item?id=50569978)), and that it's been passed on the cost-performance curve ([HenryMulligan](https://news.ycombinator.com/item?id=50552324)). Those are developer reports, not a Google announcement, but I wouldn't start anything new on it.

## The family, side by side

Prices first, per million tokens, standard tier, from [Google's pricing page](https://aistudio.google.com/docs/pricing):

| Model | Input | Output | Scheduled change |
| --- | --- | --- | --- |
| Gemini 4 Hydrogen | $1.50 | $7.50 | none; free tier available |
| Gemini 4 Neon | $3.00 | $15.00 | none; no free tier |
| Gemini 4 Carbon | $2.00 | $10.00 | $4.00 / $20.00 from December 1, 2026 |
| Gemini 4 Argon | $2.00 | $10.00 | $4.00 / $20.00 from December 1, 2026 |
| Gemini 3.8 Flash | $0.75 | $3.75 | $1.50 / $7.50 from January 1, 2027 |

Cached input is 5% of the input price across the Gemini 4 line, Batch and Flex are half the standard rate, and Priority is 1.8x it. Read the Carbon row twice: through November 30 Neon is the dearer model per token, and from December 1 it's 25% cheaper than the thing it replaces. Developers noticed. On Hacker News, [svachalek](https://news.ycombinator.com/item?id=50561934) put it as "Carbon is 50% off, while Neon is not; at full price Carbon is the \"premium\" model", and [anentropic](https://news.ycombinator.com/item?id=50557758) pointed out that on OpenRouter Neon is simply "$3/$15 vs $2/$10" today.

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

The warning: only one cost per task is published per model, and not at a common level, so the $3.16, $6.44 and $7.76 figures are not like for like. Hydrogen's and Neon's are at `xhigh`; Carbon's is at `high`, because `high` is as far as Carbon goes. And Artificial Analysis's Carbon page already quotes the December price of $4 / $20, so that $7.76 may be computed at the new rate rather than today's. Don't lift any of those three numbers as "what it will cost me". Also don't mistake the blended price per million that these pages show for a cost per task; they're different measurements.

## Cost per task, three ways

Google's claim is specific: at the default `high` setting Neon delivers "a 32% lower cost per task than Carbon", and on the Vals and Agent Arena indexes "roughly 50% to 80% lower cost per task than top competing frontier models" ([launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)). It's a vendor's own framing, so I read it as a reason to test rather than a verdict. Three independent-ish measures point the same way, with different numbers:

- **[Artificial Analysis](https://artificialanalysis.ai/models/gemini-4-neon):** $6.44 per index task for Neon at `xhigh` against $7.76 for Carbon at `high`, with the caveats above. Its speed and latency figures "average each endpoint's runs over the past 5 days", so they move.
- **[Vals](https://www.vals.ai/):** Neon at 70.87% on the Vals Index for $7.40 per test, against Carbon at 70.36% for $10.51 and Claude Fable 5.2 at 71.31% for $17.94. Near-identical scores at 70% of Carbon's bill, and 41% of Fable 5.2's. Vals' own page for Neon was a 404 when I checked, so those figures come off the Vals home page.
- **[Models Engineering Index](https://git-aarvin.github.io/mei/):** "a composite index across 16 coding benchmarks, adjusted for benchmark difficulty and missing results so models average 50". Neon places second at 67.0, just behind Fable 5.2 at 67.2, with Carbon fifth at 61.6 and Hydrogen eighth at 58.9. It reports cost as a multiple of a typical model: Neon 3.1x, Carbon 3.5x, Fable 5.2 7.7x. Its own health warning is worth repeating: "Results are reproduced as published, not independently verified, and may be affected by contamination or tuning to the benchmarks." It aggregates other people's published runs, and Vals is one of its sources, so treat the two as overlapping rather than independent.

The direction is consistent across all three: the same quality as Carbon at the top levels, and materially cheaper per finished task. The Models Engineering Index suggests why, scoring Neon's token use at 0.84x a typical model against Carbon's 1x: it isn't only the per-token price, it's that Neon spends fewer tokens getting there. The dollar figures are not consistent at all, and none of them is your workload. The only number that decides anything is the one you measure on your own prompts.

![Bar chart of the Models Engineering Index: Fable 5.2 and 4 Neon lead at the top, followed by 6.2 Astra, Opus 5.5 and 4 Carbon, with 4 Hydrogen eighth](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/1f0e257a-d202-4b48-9fc7-c1c748c22104.webp)

*The Models Engineering Index, a composite of 16 coding benchmarks, read on November 22, 2026.*

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

Three caveats about third-party docs, because each one would have sent me the wrong way. The AI SDK's Google provider page shows an explicit caching example on a Gemini 4 model, which these models don't support, so don't copy it. The AI Gateway's model page advertises 1,000,000 max output tokens, which is only reachable through background long decode, not from a normal request. OpenRouter lists `temperature` and `top_p` among the fields Neon accepts, which Google says it ignores.

## The parts that matter for client work

The things that decide whether I'd put a client's data through this, rather than whether the model is clever:

- **Paid tier only, and that's good news.** Neon isn't on the free tier at all. Google's pricing page marks free-tier content "used to improve our products" and paid-tier content "**not** used to improve our products", so the tier that would have been the problem isn't available anyway. Hydrogen, by contrast, is free on the free tier, which is exactly where a prototype quietly leaks client data.
- **Requests are stored by default now.** Since October 26, 2026, "New projects using the Generate Content API ... on the paid tier now store requests by default (`store=true`)", and "Existing projects keep their current setting" ([changelog](https://aistudio.google.com/docs/changelog)). It's per-request `store=false` to opt out. Worth knowing before a client asks where their documents went.
- **Enterprise terms.** On the Agent Platform, "Gemini 4 Neon is a Google Frontier Model subject to Section 34 of the Service Specific Terms", which is the abuse-monitoring clause. That's the paragraph a client's legal team will want, not the benchmark table.
- **Caching bills in a way worth planning for.** On the [Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-neon) it's implicit caching only with a 4,096-token minimum, "durable caching enabled by default", and "Cache writes are billed at 1.25x the standard input token price by default". From January 12, 2027 that page promises TTL configuration, where "longer retention costs more". So the 95% discount on cache hits has a write cost in front of it, which the per-task figures above don't separate out.
- **Grounding is metered separately.** Google Search grounding gives "5,000 free search requests per month (shared across all Gemini 3 and newer models), then $14 per 1,000 requests", capped at 1,500 a day, and you're charged "for each individual search query performed". One grounded answer can run several searches.
- **Retirement risk, stated carefully.** The Agent Platform page says "Launch stage: GA" with a release date of November 18, 2026, and carries no retirement-notice wording, unlike Hydrogen's. But [Firebase AI Logic](https://firebase.google.com/docs/ai-logic/models) footnotes Neon as a short-term availability model on the Agent Platform API, and defines those as models that "may be shut down (retired) as early as 45 days after a replacement model is released". Two Google pages, two impressions. I'd plan for the 45 days and keep the model ID in one config value. Firebase also doesn't support long decode for Neon yet.

## What developers say

I couldn't reach Reddit while writing this, so this section is Hacker News: the [launch thread](https://news.ycombinator.com/item?id=50552424) at 1,060 points and 775 comments, and a [second thread](https://news.ycombinator.com/item?id=50568130) on the Models Engineering Index result at 375 points and 246 comments. That thread is titled for Neon taking the top spot on that index; by the time I read the index on November 22 it had slipped to second, behind Fable 5.2 by 0.2. Five things came up repeatedly.

**Nobody can keep the lineup straight.** [Mitchem](https://news.ycombinator.com/item?id=50552306): "4 is really confusing. Very hard to figure out in what situation I would use Carbon, Argon, Neon or Hydrogen if I'm coming in brand new to Google AI." [HenryMulligan](https://news.ycombinator.com/item?id=50552324) offers the ordering I'd use too: "The new lineup is Hydrogen < Neon < Carbon. I think Argon has been superceded on the Pareto Front." [mkagenius](https://news.ycombinator.com/item?id=50557692) counts the field: "So total names to remember, hydrogen, argon, carbon, neon, luna, sol, terra, astra, opus, fable, sonnet, haiku".

**The per-token versus per-task argument, in public.** [zeroq](https://news.ycombinator.com/item?id=50557155) reads it as a price cut: "Carbon costs the same as Argon did. Neon is a cheaper model." [svachalek](https://news.ycombinator.com/item?id=50561934) reads today's invoice instead: "Carbon is 50% off, while Neon is not; at full price Carbon is the \"premium\" model." Both are right, on either side of December 1, which is the whole problem with quoting a price here.

**The people actually running it are positive, and specific.** [pkulak](https://news.ycombinator.com/item?id=50569816): "As far as I can tell, it's at least as good as Opus 5.5 at writing code". [postalcoder](https://news.ycombinator.com/item?id=50568821): "Coding-wise, it's equivalent to Opus 5.5/Fable." [jorl17](https://news.ycombinator.com/item?id=50570116) on a build: "it seems to have built faster and waaaaay cheaper than Claude." [aleqs](https://news.ycombinator.com/item?id=50570996) on subscription throughput: "Noticeably faster than opus 5.5, and so far it seems like I will get at least 10x usage", and [separately](https://news.ycombinator.com/item?id=50571039), "I've been running 3 neon sessions for the last ~hour and I'm still at 0% weekly usage". That last one is a quota observation on a subscription, not an API cost measurement, so it doesn't transfer to your bill.

**And the sceptics are specific too.** [jiggawatts](https://news.ycombinator.com/item?id=50569074): "All of the Gemini 4 models -- including Neon -- consistently make simple, \"doofus\" errors", adding "For comparison, these basic errors no longer occur with any of the recent Anthropic or OpenAI models". [impulser_](https://news.ycombinator.com/item?id=50552711) on the Gemini 4 line generally: "they just don't seem as good as Opus 5.5 despite the benchmarks." One widely repeated claim deserves a label: [irthomasthomas](https://news.ycombinator.com/item?id=50558513) wrote that "Neon is within about 1% of Fable 5.2's performance for about 40% the cost on vals.ai", which is a commenter reading a leaderboard, not their own test. The Vals figures above say roughly the same thing, for what that's worth.

**Access is the most common complaint, and it isn't about money.** [esperent](https://news.ycombinator.com/item?id=50569602) put it best: "Google just makes it weirdly hard to give them money." [306bobby](https://news.ycombinator.com/item?id=50569782): "I have AI Pro as well and have Hydrogen and Neon access. Just no Argon or Carbon". For agent work specifically, [soared](https://news.ycombinator.com/item?id=50572053) on Antigravity: "it still asks me permission for every tiny thing it tries to do."

![Hacker News submission "Gemini 4 Neon (blog.google)" with 1060 points and 775 comments](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/a928ca58-c1c0-4280-a951-861704342086.webp)

*The launch thread, read on November 22, 2026.*

## Which one I'd pick

This is my own call, not a benchmark result.

![Three cards comparing the models by job: Hydrogen at $1.50 and $7.50 for high volume, Neon at $3 and $15 marked start here for everyday serious work, Carbon at $2 and $10 rising to $4 and $20 for the hardest long-horizon projects](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/efbdbcfb-548e-4d90-8131-5b95577bdd6b.webp)

*Which model I reach for, by job, with prices as of November 22, 2026.*

**Neon is the new default for serious work.** The same index score as Carbon at `high`, roughly 1.7x the output speed, a shorter wait for the first token, and less per task on all three measures I could find. For a coding agent, an analysis pipeline or anything tool-heavy, it's the one I'd start on.

**Hydrogen keeps the volume.** It's half Neon's price, it's the fastest of the three by a wide margin, and it's the only one with a free tier for prototypes. For classification, extraction, routing, short summaries and anything behind a chat box where latency is the product, the quality gap doesn't earn Neon's price.

**Carbon is now a specialist.** After December 1 it costs 33% more per token than Neon and matches it rather than beating it at `high` while running slower, so what's left for it is the hardest long-horizon work, where Google still positions it, and where its `medium` default and heavier token habit are a deliberate choice rather than an accident.

**And Argon I'd leave alone.** Priced like Carbon, passed on the curve, and reportedly gone from the app picker, as above.

The two dates to watch are December 1, when Carbon and Argon double, and January 1, when Gemini 3.8 Flash does. Both change this arithmetic, so I'd re-run it in January rather than treat today's table as settled.

## What I'd do this week

1. **Pin the model ID in one config value.** Two Google pages disagree about whether Neon carries a 45-day retirement risk, so assume it does.
2. **Set the thinking level explicitly if you're coming from Carbon or Argon.** Their default is `medium`, Neon's is `high`, and thinking bills as output. A model ID swap alone is a silent price rise.
3. **Measure cost per task, not price per token.** Run your real prompts on Neon and on whatever you use now, and compare the cost of a finished job. The published figures above run from $3.16 to $7.76 per task on Artificial Analysis and $7.40 to $17.94 per test on Vals, depending on the model, the thinking level and who measured.
4. **Clean out the old request fields.** `temperature`, `top_p`, `top_k`, `thinking_budget`, `minimal`, explicit caches, and any low `max_output_tokens` cap left over from a 64K-output model.
5. **Raise your HTTP timeouts to 15 minutes** or move long jobs to background execution, before a client-side timeout throws away work you've paid for.
6. **Check `store` and the tier before client data goes near it.** New paid projects store requests by default now, and the free tier, which Neon can't use anyway, is the one that feeds product improvement.
7. **Try Neon as the planner over Hydrogen workers.** Google's docs list Neon for managed agents "standalone or paired with Hydrogen" ([AI Studio model page](https://aistudio.google.com/docs/models/gemini-4-neon)), and the launch post describes Antigravity orchestrating parallel Hydrogen subagents. That pairing is where the price gap between the two should pay for itself, though I haven't measured it.

## Sources

**Google**

- [Introducing Gemini 4 Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)
- [Gemini 4 Neon model card](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Docs**

- [What's new in Gemini 4 Neon](https://aistudio.google.com/docs/whats-new-gemini-4-neon)
- [AI Studio model page](https://aistudio.google.com/docs/models/gemini-4-neon)
- [Gemini API pricing](https://aistudio.google.com/docs/pricing)
- [Gemini API changelog](https://aistudio.google.com/docs/changelog)
- [Gemini Enterprise Agent Platform model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-neon)
- [Firebase AI Logic models](https://firebase.google.com/docs/ai-logic/models)
- [Vercel AI SDK Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google)
- [Vercel AI Gateway: Gemini 4 Neon](https://vercel.com/ai-gateway/models/gemini-4-neon)
- [OpenRouter: Gemini 4 Neon](https://openrouter.ai/google/gemini-4-neon)

**Independent tests**

- [Artificial Analysis: Gemini 4 Neon](https://artificialanalysis.ai/models/gemini-4-neon), [Gemini 4 Carbon](https://artificialanalysis.ai/models/gemini-4-carbon) and [Gemini 4 Hydrogen](https://artificialanalysis.ai/models/gemini-4-hydrogen)
- [Vals](https://www.vals.ai/)
- [Models Engineering Index](https://git-aarvin.github.io/mei/)

**Hacker News**

- [Gemini 4 Neon (launch thread)](https://news.ycombinator.com/item?id=50552424) and [Gemini 4 Neon is the new #1 on the Models Engineering Index](https://news.ycombinator.com/item?id=50568130)
- Comments quoted: [Mitchem](https://news.ycombinator.com/item?id=50552306), [HenryMulligan](https://news.ycombinator.com/item?id=50552324), [mkagenius](https://news.ycombinator.com/item?id=50557692), [zeroq](https://news.ycombinator.com/item?id=50557155), [svachalek](https://news.ycombinator.com/item?id=50561934), [anentropic](https://news.ycombinator.com/item?id=50557758), [pkulak](https://news.ycombinator.com/item?id=50569816), [postalcoder](https://news.ycombinator.com/item?id=50568821), [jorl17](https://news.ycombinator.com/item?id=50570116), [aleqs](https://news.ycombinator.com/item?id=50570996) and [again](https://news.ycombinator.com/item?id=50571039), [jiggawatts](https://news.ycombinator.com/item?id=50569074), [impulser_](https://news.ycombinator.com/item?id=50552711), [irthomasthomas](https://news.ycombinator.com/item?id=50558513), [esperent](https://news.ycombinator.com/item?id=50569602), [306bobby](https://news.ycombinator.com/item?id=50569782), [soared](https://news.ycombinator.com/item?id=50572053)
