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

## The parts that matter for client work

## What developers say

## Which one I'd pick

## What I'd do this week

## Sources
