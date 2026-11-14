Google released Gemini 4 Hydrogen on November 12, 2026. It's the fast member of the new Gemini 4 family, next to Carbon and Argon, and Google calls it the recommended upgrade from Gemini 3.8 Flash and the older Gemini 3 and 2.5 models ([what's new in Hydrogen](https://aistudio.google.com/docs/whats-new-gemini-4-hydrogen)).

I haven't shipped Hydrogen in a client project yet, so this isn't a case study. It's what I'd tell another developer, or a client asking whether it's worth switching: how fast it is, what it really costs, what changes in your code, and what people who have used it are saying. I haven't run it on my own API key either. Every number here is Google's, an independent tester's or a developer's who posted it, and each one links to where it came from. Everything is current as of November 14, 2026.

> **The short version.** Hydrogen costs $1.50 per million input tokens and $7.50 per million output tokens, finishes tasks about 2.5x faster than Gemini 3.8 Flash by Google's numbers, and by Google's numbers scores level with Gemini 4 Argon on Artificial Analysis's index. It's fast and capable, but it isn't a budget model: until the end of the year it's twice 3.8 Flash's list price, and Claude Haiku 5.5 is 15x cheaper per token. I'd use it as the fast worker in an agent setup, for turning designs into UI drafts, and for everyday API work where speed matters more than the last few points of quality.

## What Hydrogen is

![Google's launch post header: Introducing Gemini 4 Hydrogen, dated November 12, 2026, by Koray Kavukcuoglu of Google DeepMind](/__hydrogen-images/launch-page.webp)

*Google's launch post, November 12, 2026.*

Gemini 4 has three models so far: Carbon, Argon and Hydrogen, the fast, cheaper one. Its model card says "Gemini 4 Hydrogen is adapted from Gemini 4 Carbon", with a knowledge cutoff of March 2026 ([model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-4-Hydrogen-Model-Card.pdf)). The model ID is `gemini-4-hydrogen`, with no preview suffix ([AI Studio model page](https://aistudio.google.com/docs/models/gemini-4-hydrogen)).

It landed in a lot of places on the same day ([launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)):

- **The Gemini app.** Paid users can pick it. Free users get it "via auto model selection when it's the appropriate model for the prompt".
- **Google Search,** for all users worldwide. Google's Search team calls it "the biggest model upgrade to Search yet" ([Search post](https://blog.google/products-and-platforms/products/search/gemini-4-hydrogen-search-upgrade/)). 9to5google reports it's the default model for AI Mode, which Google's own posts don't say ([9to5google](https://9to5google.com/2026/11/12/gemini-4-hydrogen-launch/)).
- **Work tools.** Gemini for business, Gemini in Google Sheets and Android Studio.
- **For developers.** Google AI Studio and the Gemini API on both the free and paid tiers ([changelog](https://aistudio.google.com/docs/changelog)), Google Cloud's Gemini Enterprise Agent Platform (Vertex AI), Firebase AI Logic with no billing needed ([Firebase](https://firebase.google.com/docs/ai-logic/models)), and Google Antigravity for paid Google AI Pro and Ultra subscribers.
- **Outside Google.** The [Vercel AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/google) supports it, and the [Vercel AI Gateway](https://vercel.com/ai-gateway/models/gemini-4-hydrogen) and [OpenRouter](https://openrouter.ai/google/gemini-4-hydrogen) list it at Google's price.

One detail matters for anything long-lived: Vertex calls Hydrogen "a short-term generally available (GA) release subject to a minimum 45-day retirement notice policy" ([Vertex guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-4-hydrogen)). I'd keep the model ID in one config value, not scattered through the code.

## Performance

These are Google's numbers from the launch post. They're a vendor's own benchmarks, so I read them as a reason to test, not a verdict.

| Benchmark | Hydrogen | Compared with |
| --- | --- | --- |
| Artificial Analysis Intelligence Index | 51 (high), 54 (xhigh) | Argon: 50 |
| Terminal-Bench 4.1 (agentic coding) | 57% | 3.8 Flash: 18.2% |
| HLE-Diamond (hard reasoning) | 58.8% | Google says it leads its class |
| Vals Tax Agent Bench | 52.3% | #1 overall |
| Agents' Last Exam v1.1 | 71.6% | |

The Terminal-Bench jump over 3.8 Flash is the striking one, and it matches some of the coding reports below, though not all of them.

Speed is the headline. Google says Hydrogen finishes tasks "2.5 times faster at its high default setting" than 3.8 Flash, and that partners saw runs "2x to 2.8x faster while reducing token usage by 12% to 23%". Google also claims it cuts fabricated claims "by more than 5x compared to Gemini 3.8 Flash by flagging missing context instead of guessing" ([what's new](https://aistudio.google.com/docs/whats-new-gemini-4-hydrogen)), and reports a 94% honesty rate on its internal agent honesty evaluation ([launch post](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)).

Independent numbers mostly agree, with caveats. [Artificial Analysis](https://artificialanalysis.ai/models/gemini-4-hydrogen) measures Hydrogen at xhigh at 180 output tokens per second, 44.89 seconds to the first answer token, and $3.16 per index task. Its [3.8 Flash page](https://artificialanalysis.ai/models/gemini-3-8-flash) shows 113 tokens per second, 16.53 seconds and $7.77 per task, but that's 3.8 Flash at high, so it isn't like for like. The long wait for the first answer token is most likely thinking time, which matters if you put Hydrogen behind a chat box at xhigh.

Two outside tests:

- **Plotly's data analytics exam,** one run per model on launch day. Hydrogen scored 43 out of 43 for $6.36, against Carbon's 42 for $11.55. "Its median question took 32 seconds, against Carbon's 93, and its whole exam took about 43 minutes, against Carbon's 1 hour 48 minutes." The same post adds: "If you're choosing across providers, GPT-6.1 Sol gets the same score for about 40% of the cost." ([Plotly](https://plotly.com/blog/gemini-4-hydrogen-plotly-data-analytics-bench/))
- **Box's AI Complex Work Eval.** Aaron Levie of Box: "Hydrogen is 5 percentage points better in accuracy than Gemini 3.8 Flash. That alone would be a great boost in capability, but possibly more importantly it did the tasks in less than half the time with about 12% fewer tokens on a typical task." ([@levie](https://x.com/levie/status/2120947988143198302))

## What it costs

Prices per million tokens, from [Google's pricing page](https://aistudio.google.com/docs/pricing) and [Anthropic's](https://platform.claude.com/docs/en/about-claude/pricing):

| Model | Input | Output | Notes |
| --- | --- | --- | --- |
| Gemini 4 Hydrogen | $1.50 | $7.50 | Free tier in the API, Batch and Flex at half price |
| Gemini 3.8 Flash | $0.75 | $3.75 | Rises to $1.50 / $7.50 on January 1, 2027 |
| Gemini 4 Carbon and Argon | $2 | $10 | Rises to $4 / $20 on December 1, 2026, no free tier |
| Claude Sonnet 5.5 | $2 | $10 | 1M context, 128K output |
| Claude Haiku 5.5 | $0.10 | $0.50 | Prompts up to 100K tokens, $0.50 / $2.50 above |

The table hides the awkward part: the price gaps change twice in seven weeks. Until November 30, Hydrogen is only 25% cheaper than Carbon and Argon. From December 1, when they double, it's 62.5% cheaper. Against 3.8 Flash it's twice the price until December 31 and the same price from January 1. Simon Willison summed up the launch week: "Hydrogen, supposedly the cheap model, is currently only a 25% discount on its more capable peers." ([simonwillison.net](https://simonwillison.net/2026/Nov/12/llm-gemini/)) He also points out that Haiku 5.5 costs a fifteenth of it.

Price per token isn't price per task, though. On Hacker News, data-ottawa reported: "My use case benchmarks 37% more expensive per task but 40-60% of the total time per task (median and p90 had the same improvement)." ([HN](https://news.ycombinator.com/item?id=50473718)) Artificial Analysis goes the other way, with Hydrogen at xhigh cheaper per index task ($3.16) than 3.8 Flash at high ($7.77). On the same thread, pqdbr said their 3.8 Flash bill had already gone up about 40% from 3.7 Flash, and that this doubles it again ([HN](https://news.ycombinator.com/item?id=50471846)). Your own workload decides which of these you get, so measure it before you switch.

The details that change a bill:

- **Thinking is output.** The $7.50 includes thinking tokens, so the thinking level is the biggest cost lever you have.
- **Batch and Flex** halve the price to $0.75 / $3.75 for jobs that can wait. **Priority** costs $2.70 / $13.50.
- **Caching is automatic only.** Prompts of at least 4,096 tokens get implicit caching, and cached input is billed at $0.075.
- **Search grounding** gives 5,000 free search requests a month, shared across all Gemini 3 and newer models, then $14 per 1,000 requests. One request can run several Google searches, and Google bills "for each individual search query performed", so a grounded request can cost more than one. It isn't available on the free tier.
- **Free-tier data is used to improve Google's products.** The pricing page marks free-tier data as "Used to improve our products: Yes" and paid as "No". For client work, I'd only ever use the paid tier.

## What changes in your code

Coming from 3.8 Flash, most of this is a model ID swap, but a few things now return errors or behave differently. All of these are from Google's [what's new in Hydrogen](https://aistudio.google.com/docs/whats-new-gemini-4-hydrogen) page and the [Vertex model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-hydrogen):

1. **Thinking levels.** Hydrogen takes `low`, `medium`, `high` and a new `xhigh`, and defaults to `high`, where 3.8 Flash defaulted to `medium`. Setting `thinking_budget` or `minimal` returns a 400. The AI SDK docs add that a November 11 update shifted the levels: the new `xhigh` matches the old `high`, and `high` matches the old `medium`. Google's pages don't mention this, but if you tuned prompts on an early build, test them again.
2. **No sampling settings.** Remove `temperature`, `top_p` and `top_k`. In-range values are ignored, and out-of-range values return a 400.
3. **One shared window.** 3.8 Flash had a 1M input budget and a separate 64K output budget. Hydrogen shares 1,048,576 tokens across input, thinking and output, and `max_output_tokens` caps thinking plus answer together. The default cap is 65,536. Google says to remove hard-coded low caps like 8,192 and lower the thinking level instead.
4. **Long output is opt-in.** Up to 1M output tokens needs "long decode": a background request with `max_output_tokens` above 65,536, which the server continues in 64K hops while you poll. Firebase AI Logic doesn't support it yet.
5. **No explicit caching.** `cachedContents` and `caches.create` aren't supported, so remove `cached_content`. The AI SDK's Google page still shows an explicit cache example with Hydrogen, so don't copy it.
6. **Declare your tools.** Function calling, Search and Maps grounding, code execution, structured outputs, URL context and computer use are all supported, plus file search in AI Studio and the Gemini API. Asking for raw JSON tool calls in the prompt with no tools declared "can return `MALFORMED_FUNCTION_CALL`".
7. **Keep thought signatures intact.** With `generateContent`, send earlier turns and their thought signatures back unchanged.
8. **What's missing.** No Live API, and no audio or image generation. Input can be text, images, video, audio or PDF, but output is text only.

## How people use it

For most people, Hydrogen is something they've already used without choosing it. It's in Search for everyone, it answers free Gemini app users when auto selection picks it, and Google says Gemini in Sheets now outputs "over 30% faster than previous models in Sheets canvas". One early app user on HN: "I just tried it in the Gemini app, it's much better than the previous version." ([HN](https://news.ycombinator.com/item?id=50472631))

![Hacker News submission "Gemini 4 Hydrogen (blog.google)" with 559 points and 349 comments](/__hydrogen-images/hn-thread.webp)

*Hacker News, at the time of writing (November 14, 2026).*

Developers have had more to say. At the time of writing, the [launch thread](https://news.ycombinator.com/item?id=50471431) on Hacker News has 559 points and 349 comments, and the [Antigravity thread](https://news.ycombinator.com/item?id=50472260) has 496 points and 161 comments. I read those threads, posts on X and a few developer blogs. I couldn't find any Reddit launch threads to quote.

**What works:**

- **A coding subagent.** This is Google's own pitch. In Antigravity's Orchestrator, Carbon explores and plans, then "Hydrogen could then take over to write edits, update packages, and run tests" ([Antigravity](https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/)). Developers describe the same split. cflewis: "I have found it a good subagent workhorse for code implementation, with some higher level model doing the spec and review." ([HN](https://news.ycombinator.com/item?id=50471670))
- **Design to HTML.** For web developers, this was the most interesting report. jjcm: "I'm very impressed with it as a model for image->html builds. It's the first non-anthropic low-param model that successfully captures complex flows." On their own benchmark: "IMO it sits between sonnet and opus in terms of quality, and is equivalent with gpt sol (for this particular benchmark). Google did a great job with this." ([HN](https://news.ycombinator.com/item?id=50474893))
- **Speed.** japgolly: "Hydrogen high is noticeably faster then Flash 3.8 high. Seems pretty good so far." ([HN](https://news.ycombinator.com/item?id=50478218))
- **Data work.** chriddyp, posting the Plotly exam above: "Tested Hydrogen in my data analytics exam, and it's the 4th model to get a 100%", "at about 1/3 the cost of Astra and Fable (but still more expensive than Sol)" ([HN](https://news.ycombinator.com/item?id=50485733)).

**What doesn't:**

- **Agents doing too much.** onlyrealcuzzo: "Pretty big Gemini fan, but my initial results with Hydrogen and Carbon are disappointing." They listed the failures as "overreach (doing more than asked), overwork (when it should have failed fast), harm (doing the opposite of what was asked), orthogonal work (doing something completely unrelated to what was asked), etc." ([HN](https://news.ycombinator.com/item?id=50471692))
- **Visual output.** Simon Willison's SVG pelican test: "Surprisingly plain pelicans for a Gemini model, quite a nice illustration of how Hydrogen really is significantly less powerful than Carbon and Argon" ([HN](https://news.ycombinator.com/item?id=50475410)).
- **Made-up extras.** Kotlopou, on a visual puzzle: "This one answered correctly, but then felt the need to add a fun fact that was wrong" ([HN](https://news.ycombinator.com/item?id=50473183)).
- **Price.** Several complaints were about the price rather than the model, like pqdbr's and Simon Willison's in the cost section above.

Put together, the early reports describe a model that's fast enough for interactive work and good at implementation when something smarter plans, with weaker visual output than Carbon or Argon going by Simon Willison's pelican test.

## Using it in a Next.js app

These examples use the Vercel AI SDK 7 (`ai` 7.0.171) and `@ai-sdk/google` 4.0.119, with the App Router. I type-checked them against those versions but haven't run them. The Google provider reads `GOOGLE_GENERATIVE_AI_API_KEY`, and the plain `'google/...'` model strings go through the AI Gateway, which reads `AI_GATEWAY_API_KEY`.

Before deploying any of them, remember that a route handler and a Server Action are both public endpoints, and every call costs money. I'd put them behind the app's auth check and a rate limit, and bound the size of whatever text they accept.

A route handler that streams a reply. Medium thinking keeps chat quick, and passing the request's signal stops the call when the user leaves:

```ts
import {google, type GoogleLanguageModelOptions} from '@ai-sdk/google';
import {createTextStreamResponse, streamText, toTextStream} from 'ai';
import {z} from 'zod';

const bodySchema = z.object({
  prompt: z.string().trim().min(1).max(8000),
});

export async function POST(request: Request): Promise<Response> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({error: 'Send a JSON body like {"prompt": "..."}'}, {status: 400});
  }

  const result = streamText({
    model: google('gemini-4-hydrogen'),
    prompt: parsed.data.prompt,
    // Medium keeps chat replies quick; Hydrogen defaults to high when this is unset.
    providerOptions: {
      google: {
        thinkingConfig: {thinkingLevel: 'medium'},
      } satisfies GoogleLanguageModelOptions,
    },
    // Stops the model call (and the billing) when the user closes the tab.
    abortSignal: request.signal,
  });

  return createTextStreamResponse({stream: toTextStream({stream: result.stream})});
}
```

A server action that returns typed JSON. Extraction is a good fit for `low` thinking, and `Output.object` validates the result against the Zod schema:

```ts
'use server';

import {google, type GoogleLanguageModelOptions} from '@ai-sdk/google';
import {generateText, Output} from 'ai';
import {z} from 'zod';

// Not exported: a 'use server' file may only export async functions.
const invoiceSchema = z.object({
  vendor: z.string(),
  total: z.number(),
  currency: z.string().describe('ISO 4217 code, e.g. PHP or USD'),
  dueDate: z.string().describe('ISO 8601 date, e.g. 2026-12-01'),
  lineItems: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
    }),
  ),
});

export type Invoice = z.infer<typeof invoiceSchema>;

export async function extractInvoice(text: string): Promise<Invoice> {
  // Server Actions are public endpoints, so bound the input like any request body.
  if (text.length > 20_000) throw new Error('Invoice text is too long');

  const {output} = await generateText({
    model: google('gemini-4-hydrogen'),
    output: Output.object({schema: invoiceSchema}),
    prompt: `Extract the invoice details from this text:\n\n${text}`,
    // Extraction is reading, not reasoning, so low is enough.
    providerOptions: {
      google: {
        thinkingConfig: {thinkingLevel: 'low'},
      } satisfies GoogleLanguageModelOptions,
    },
  });

  return output;
}
```

A screenshot to an HTML draft, the use case jjcm praised. I'd treat the output as a first draft to review, not a finished component:

```ts
import {google, type GoogleLanguageModelOptions} from '@ai-sdk/google';
import {generateText} from 'ai';

const INSTRUCTIONS = [
  'Rebuild this screenshot as a single, self-contained HTML file.',
  'Style it with Tailwind CSS utility classes loaded from the Tailwind CDN script.',
  'Use semantic, accessible markup: landmarks, one h1, alt text, labelled form controls, visible focus.',
  'Reply with the HTML only.',
].join('\n');

export async function screenshotToHtml(image: Uint8Array, notes: string): Promise<string> {
  const {text, finishReason} = await generateText({
    model: google('gemini-4-hydrogen'),
    messages: [
      {
        role: 'user',
        content: [
          {type: 'text', text: `${INSTRUCTIONS}\n\nNotes from me:\n${notes}`},
          {type: 'file', mediaType: 'image', data: image},
        ],
      },
    ],
    providerOptions: {
      google: {
        thinkingConfig: {thinkingLevel: 'high'},
      } satisfies GoogleLanguageModelOptions,
    },
  });

  // Half an HTML file is worse than none, so only a clean stop counts as finished.
  if (finishReason !== 'stop') throw new Error(`Generation did not finish (${finishReason})`);

  // Models often wrap code in a ```html fence even when told not to.
  const fenced = text.match(/```(?:html)?\s*\n([\s\S]*?)\n?```/);
  return (fenced?.[1] ?? text).trim();
}
```

![Diagram: Gemini 4 Carbon or Claude Sonnet 5.5 plans and reviews, three Gemini 4 Hydrogen workers each run one step in parallel, and their results merge into one result](/__hydrogen-images/orchestrator.webp)

*The Antigravity Orchestrator pattern, as I'd wire it into an app.*

The orchestrator pattern, through the AI Gateway so the planner can come from either provider. Carbon writes a plan as typed JSON, then Hydrogen workers run the steps in parallel:

```ts
import {generateText, Output} from 'ai';
import {z} from 'zod';

const planSchema = z.object({
  steps: z.array(z.string()).min(1).max(6),
});

export async function planAndBuild(task: string): Promise<string[]> {
  // Plain 'provider/model' strings go through the AI Gateway, the default global provider.
  const {output: plan} = await generateText({
    // 'anthropic/claude-sonnet-5.5' is a drop-in planner alternative.
    model: 'google/gemini-4-carbon',
    output: Output.object({schema: planSchema}),
    prompt: `Split this task into at most 6 independent steps that can run in parallel:\n\n${task}`,
  });

  const results = await Promise.all(
    plan.steps.map(async (step) => {
      const {text, finishReason} = await generateText({
        model: 'google/gemini-4-hydrogen',
        system: `You are one worker on this task: ${task}\nDo only your step and return the result.`,
        prompt: step,
      });
      // A worker cut off by its output cap or a filter returns partial text, so only a clean stop counts.
      if (finishReason !== 'stop') throw new Error(`Step did not finish (${finishReason}): ${step}`);
      return text;
    }),
  );

  return results;
}
```

Note the Sonnet ID: the AI Gateway writes it `anthropic/claude-sonnet-5.5`, while Anthropic's own API uses `claude-sonnet-5-5`.

## Hydrogen, Haiku 5.5 or Sonnet 5.5?

![Diagram: high-volume, simple work goes to Claude Haiku 5.5; fast everyday work, agents and image to UI go to Gemini 4 Hydrogen (start here); tricky reasoning, review and planning go to Claude Sonnet 5.5 or Gemini 4 Carbon](/__hydrogen-images/model-picker.webp)

*Which model I reach for, by job, with prices as of November 14, 2026.*

This is my own pick, not a benchmark result:

- **Claude Haiku 5.5** for high-volume, simple jobs: tagging, short summaries, routing. At $0.10 / $0.50, it's hard to justify paying 15x more for work it already does well.
- **Gemini 4 Hydrogen** for fast everyday work: chat where thinking time matters, worker agents, document extraction where accuracy matters, and design to HTML drafts. If you already run on Google Cloud or Firebase, it's the obvious default.
- **Claude Sonnet 5.5 or Gemini 4 Carbon** for planning, review and anything where a wrong answer is expensive. They cost the same today. After December 1, Carbon costs twice as much as Sonnet.

The pricing shifts on December 1 and January 1 can change this, so I'd check it again in January.

## What I'd do this week

1. **Pin the ID in one place.** Keep `gemini-4-hydrogen` in one config value, because it's a short-term GA release.
2. **Clean up old requests.** Remove `temperature`, `top_p`, `top_k`, `thinking_budget`, `minimal`, explicit caches and low `max_output_tokens` caps before switching from 3.8 Flash.
3. **Pick a thinking level on purpose.** Use `low` for extraction, `medium` for chat and `high` for coding, and leave `xhigh` for runs where speed doesn't matter.
4. **Measure cost per task.** Run your real prompts on Hydrogen and your current model and compare the cost per task, not the price per token.
5. **Check the free tier.** Make sure client data never goes through the free tier, which Google uses to improve its products.
6. **Try one subagent.** Give Hydrogen the implementation step under a stronger planner, and watch for the overreach developers reported.
7. **Look again in January.** Carbon's December 1 price and 3.8 Flash's January 1 price both change the maths.

## Sources

**Google**

- [Introducing Gemini 4 Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)
- [Gemini 4 Hydrogen in Search](https://blog.google/products-and-platforms/products/search/gemini-4-hydrogen-search-upgrade/)
- [Gemini 4 Hydrogen in Google Antigravity](https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/)
- [Gemini 4 Hydrogen model card (PDF)](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-4-Hydrogen-Model-Card.pdf)

**Docs**

- [What's new in Gemini 4 Hydrogen](https://aistudio.google.com/docs/whats-new-gemini-4-hydrogen)
- [AI Studio model page](https://aistudio.google.com/docs/models/gemini-4-hydrogen)
- [Gemini API pricing](https://aistudio.google.com/docs/pricing)
- [Gemini API changelog](https://aistudio.google.com/docs/changelog)
- [Vertex AI model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-hydrogen) and [guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-4-hydrogen)
- [Firebase AI Logic models](https://firebase.google.com/docs/ai-logic/models)
- [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Vercel AI SDK Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google)
- [Vercel AI Gateway: Gemini 4 Hydrogen](https://vercel.com/ai-gateway/models/gemini-4-hydrogen)
- [OpenRouter: Gemini 4 Hydrogen](https://openrouter.ai/google/gemini-4-hydrogen)

**Independent tests and press**

- [Artificial Analysis: Gemini 4 Hydrogen](https://artificialanalysis.ai/models/gemini-4-hydrogen) and [Gemini 3.8 Flash](https://artificialanalysis.ai/models/gemini-3-8-flash)
- [Plotly data analytics bench](https://plotly.com/blog/gemini-4-hydrogen-plotly-data-analytics-bench/)
- [Simon Willison: llm-gemini and Gemini 4](https://simonwillison.net/2026/Nov/12/llm-gemini/)
- [9to5google launch coverage](https://9to5google.com/2026/11/12/gemini-4-hydrogen-launch/)

**Hacker News**

- [Gemini 4 Hydrogen (launch thread)](https://news.ycombinator.com/item?id=50471431)
- [Gemini 4 Hydrogen and Orchestrator (Antigravity thread)](https://news.ycombinator.com/item?id=50472260)
- Comments quoted: [data-ottawa](https://news.ycombinator.com/item?id=50473718), [pqdbr](https://news.ycombinator.com/item?id=50471846), [handzhiev](https://news.ycombinator.com/item?id=50472631), [cflewis](https://news.ycombinator.com/item?id=50471670), [jjcm](https://news.ycombinator.com/item?id=50474893), [japgolly](https://news.ycombinator.com/item?id=50478218), [chriddyp](https://news.ycombinator.com/item?id=50485733), [onlyrealcuzzo](https://news.ycombinator.com/item?id=50471692), [simonw](https://news.ycombinator.com/item?id=50475410), [Kotlopou](https://news.ycombinator.com/item?id=50473183)

**X**

- [@levie (Aaron Levie, Box)](https://x.com/levie/status/2120947988143198302)
