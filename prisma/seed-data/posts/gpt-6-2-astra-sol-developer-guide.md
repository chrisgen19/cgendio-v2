OpenAI released GPT-6.2 Astra and GPT-6.2 Sol on November 17, 2026. The two models sit on the same generation and share the same 1,050,000-token context window, the same Responses API toolset, and the same new caching and reasoning rules, while sitting 4x apart on list price: $8 / $40 per million tokens for Astra and $2 / $10 for Sol ([launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/), [pricing](https://developers.openai.com/api/docs/pricing)).

So the useful question isn't whether GPT-6.2 is fast or smart on a press slide. It's when Astra actually earns 4x Sol's token price, and what quietly breaks in your Responses API code when you swap a model ID over to 6.2. I haven't shipped either model in a client project, so this isn't a case study, and I haven't called the OpenAI API on my own key: every figure here is OpenAI's, an independent tester's or a developer's who posted it, and every one links back to where it came from. Everything is current as of November 23, 2026. Reddit returned HTTP 403 during research, so the developer voice below comes from Hacker News.

> **The short version.** GPT-6.2 Astra is 20% cheaper per token than GPT-6 Astra ($8 / $40, cached input $0.40) and hits 62 on Artificial Analysis's Intelligence Index, while GPT-6.2 Sol keeps GPT-6.1 Sol's price ($2 / $10, cached input $0.10) and hits 57 at $1.01 per index task vs Astra's $4.00. The real surprise is the effort dial: Astra at `xhigh` matches Astra `max` (62) in 59% fewer output tokens, and Astra at `medium` matches Sol `max` (57) in roughly a fifth of the output tokens. Before switching any codebase, move reusable system prompts out of top-level `instructions` into the first `developer` message in `input`, or GPT-6.2 will stop caching them. For everyday coding and Next.js features I'd start on Sol, reserve Astra for hard architecture and multi-step reviews, and use Background Mode's 2h or 8h windows now that `flex` is gone.

## What GPT-6.2 Astra and Sol are

OpenAI describes the pair cleanly in its [launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/): "GPT-6.2 Astra, our new frontier model for your hardest projects, and GPT-6.2 Sol, our efficient, versatile model for everyday work." The model IDs are `gpt-6.2-astra` and `gpt-6.2-sol`, both stable with no dated preview suffix ([Astra model page](https://developers.openai.com/api/docs/models/gpt-6.2-astra), [Sol model page](https://developers.openai.com/api/docs/models/gpt-6.2-sol)).

![OpenAI's launch page hero for GPT-6.2 Astra and Sol, showing the Astra and Sol titles over a dark starfield on openai.com](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/a0aa7bf0-bbe2-40d4-903a-e0dae0bfa3b7.webp)

*OpenAI's launch post, November 17, 2026.*

The shared technical envelope from OpenAI's model pages:

- **Context and output:** 1,050,000-token context window, split into 922,000 max input tokens and 128,000 max output tokens.
- **Knowledge cutoffs:** May 18, 2026 for `gpt-6.2-astra` and June 1, 2026 for `gpt-6.2-sol`.
- **Modalities:** Text and image input; text output only. No native audio or video input, and no fine-tuning.
- **Reasoning always on:** Five effort levels (`low`, `medium`, `high`, `xhigh`, `max`), defaulting to `medium`. Both model pages warn explicitly: "The API rejects requests that set reasoning effort to `none`."
- **Endpoints and tools:** Responses API (`v1/responses`), Chat Completions (`v1/chat/completions`), and Batch (`v1/batch`). On the Responses API both support streaming, function calling, structured outputs, web search, file search, image generation tool, code interpreter, hosted shell, apply patch, skills, computer use, MCP, tool search, and the Multi-agent beta for subagent delegation.

Where they run as of November 23, 2026: all Plus, Pro, Enterprise, and Edu users in ChatGPT Work and Codex (once workspace admins enable it for Enterprise and Edu), the OpenAI API with Ultrafast at launch, and Google Cloud in private preview (`gpt-6.2-astra` and `gpt-6.2-sol` on the model pages). Pro 500 subscribers get Ultrafast on both models, and Pro 200 subscribers get Ultrafast for the first time starting with GPT-6.2 Sol ([launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/)).

## Astra vs. Sol, side by side

List prices first, per million tokens, short-context Standard tier (up to 272K input tokens), straight from the [Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra) and [Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol) model pages:

| Metric | GPT-6.2 Sol | GPT-6.2 Astra | Ratio |
| --- | --- | --- | --- |
| Input (<=272K) | $2.00 | $8.00 | 4x |
| Cached input | $0.10 | $0.40 | 4x |
| Cache write (30m) | $2.50 | $10.00 | 4x |
| Cache write (12h) | $5.00 | $20.00 | 4x |
| Output | $10.00 | $40.00 | 4x |

Four pricing rules apply to both models and matter more than the headline table once you put real traffic through them:

- **Paid cache writes.** Cached reads are 95% off standard input ($0.10 and $0.40), which is a deeper cached-input discount than GPT-6 Astra's previous tier. Cache writes are billed separately at 1.25x input for 30-minute retention ($2.50 / $10.00) and 2.5x input for 12-hour retention ($5.00 / $20.00).
- **The 272K context cliff.** Any request over 272K input tokens doubles input and cache rates and multiplies output by 1.5x for the *entire* request, not just the tokens past 272K.
- **No Flex tier; Background Mode replaces it.** Batch stays at 50% of Standard. For async Responses API work, public-beta Background Mode offers a 2-hour window at 30% off Standard or an 8-hour window at 40% off Standard ([Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model), [Background mode](https://developers.openai.com/api/docs/guides/background)).
- **Speed multipliers and a March 1, 2027 jump.** Fast mode costs 2x Standard. Ultrafast costs 3x Standard through February 28, 2027, then jumps to **6x Standard on March 1, 2027** (Pacific time). Regional data-residency endpoints add a 10% uplift on models released on or after March 5, 2026 ([pricing](https://developers.openai.com/api/docs/pricing)).

## Cost per task, and the effort dial surprise

OpenAI's launch claims lean heavily on cost per task: on Agents' Last Exam it reports GPT-6.2 Astra scoring 5.2 points above GPT-6 Astra at under a third of the cost, and on Cognition's FrontierCode 2.0 it reports GPT-6.2 Sol coming within 0.5 points of GPT-6.2 Astra at roughly one-fifth the cost (both at `max`). Treat those as vendor numbers and check independent runs next to them.

Artificial Analysis publishes full five-effort grids for both [GPT-6.2 Astra](https://artificialanalysis.ai/models/gpt-6-2-astra) and [GPT-6.2 Sol](https://artificialanalysis.ai/models/gpt-6-2-sol) (speed and latency figures are five-day rolling averages on OpenAI's API, checked November 23, 2026):

| Model | Index | Time/task | Out tokens |
| --- | --- | --- | --- |
| Astra `max` | 62 | 14.1m | 65.8M |
| Astra `xhigh` | 62 | 7.8m | 27.1M |
| Astra `high` | 60 | 6.5m | 20.0M |
| Astra `medium` | 57 | 4.8m | 12.4M |
| Astra `low` | 46 | 2.1m | 6.3M |
| Sol `max` | 57 | 10.0m | 60.9M |
| Sol `xhigh` | 56 | 6.2m | 33.3M |
| Sol `high` | 55 | 5.2m | 22.7M |
| Sol `medium` | 53 | 3.6m | 14.6M |
| Sol `low` | 41 | 1.6m | 7.2M |

Artificial Analysis publishes a dollar cost per Intelligence Index task only at `max`: **$4.00 per task for Astra** (48 tok/s) vs **$1.01 per task for Sol** (67 tok/s). That matches the 4x list price almost exactly when both models are pushed all the way to `max`.

Look two rows down, though, and the table tells a sharper story than the headline price ratio:

1. **Astra `max` looks hard to justify over Astra `xhigh`.** Both score **62** on the Artificial Analysis Intelligence Index, but `xhigh` uses **27.1M output tokens instead of 65.8M** (59% fewer output tokens), cuts average task time from 14.1 minutes to 7.8 minutes, and drops time to first answer token from 153.4 seconds to 40.5 seconds.
2. **Astra `medium` ties Sol `max` at 57, with completely different latency and token shape.** Sol `max` spends 60.9M output tokens and waits 82.1 seconds for its first answer token to reach 57; Astra `medium` reaches 57 in 12.4M output tokens (nearly 5x fewer) with a 3.7-second time to first answer. Output token cost alone scales roughly to parity between those two points, except Astra `medium` answers more than 20x sooner.
3. **Sol `medium` (53) and `high` (55) are where the real savings live.** Dropping Sol from `max` to `medium` gives up only 4 index points while cutting output tokens by 76% (60.9M down to 14.6M) and time to first answer from 82.1 seconds to 3.6 seconds.

The [Models Engineering Index](https://git-aarvin.github.io/mei/) (a composite across 16 coding benchmarks normalized so the typical model scores 50 at 1x cost and 1x tokens) backs up Sol's value position from a second angle. On its November 23 table, **6.2 Astra** sits at #3 with **66.0** (cost **3.7x**, tokens **0.4x**), just behind Fable 5.2 (67.2, 7.7x) and Gemini 4 Neon (67.0, 3.1x). **6.2 Sol** sits at #6 with **60.8** at **0.75x typical cost** and **0.3x tokens**, placing it right on the performance-versus-cost Pareto corner ahead of Sonnet 5.5 (60.0, 4.2x) and Gemini 4 Hydrogen (58.9, 2.2x). Its own caveat is worth keeping in mind: MEI aggregates published benchmark scores rather than running fresh private evaluations, so treat the exact ranks as directional and measure on your own prompts.

![Models Engineering Index scatter chart plotting engineering score against relative cost, with 6.2 Sol sitting on the Pareto corner at 60.8 and 0.75x cost and 6.2 Astra near the top at 66.0 and 3.7x cost](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/90711f60-b6f5-4130-936b-8030b090dedf.webp)

*Models Engineering Index, Performance versus cost, captured November 23, 2026.*

## What changes in your Responses API code

This is the part I'd read before touching a model string. OpenAI's [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model) guide and [Background mode](https://developers.openai.com/api/docs/guides/background) docs list five concrete behaviour changes that affect caching, quality, and billing on both `gpt-6.2-astra` and `gpt-6.2-sol`:

1. **Top-level `instructions` now lands *after* `input`, and changing user turns need an explicit cache breakpoint.** Starting with GPT-6.2, the Responses API appends the top-level `instructions` field after `input`. Moving reusable instructions into a `{role: 'developer', content: ...}` item at index 0 of `input` puts them back at the front of the prefix ([Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model)), while reserving top-level `instructions` for per-request guidance only. Two further rules from the [Prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching) decide whether those tokens actually hit the cache: the stable prefix must be at least **1,024 visible input tokens**, and on GPT-5.6+ implicit caching places its breakpoint at the latest eligible user message, so a static developer prompt followed by a different user message on every call will miss unless you place an explicit `prompt_cache_breakpoint` after the stable prefix with `prompt_cache_options: {mode: 'explicit', ttl: '30m'}`.
2. **Prefix edits and model downgrades drop reasoning items.** If your app rewrites an earlier developer message, mutates past tool calls, switches to a different model mid-thread, or changes the end user or organization, the Responses API drops prior internal reasoning items. OpenAI notes that losing them can degrade answer quality and force the model to spend extra tokens re-doing earlier reasoning. Keep conversation prefixes append-only across turns.
3. **No `service_tier: 'flex'` and no `reasoning.effort: 'none'`.** Both 6.2 models reject `reasoning.effort: 'none'` and launch without Flex processing. For discounted asynchronous jobs, use `background: true` with `service_tier: 'default'`, `background_options: {completion_window: '2h' | '8h'}`, and no streaming (`stream` omitted or `false`). Two catches from the [Background mode](https://developers.openai.com/api/docs/guides/background) docs:
   - Discounted `2h` and `8h` jobs share the Batch/Background rate limit, and standard synchronous requests **cannot reuse** prompt cache entries written by `2h` or `8h` background runs.
   - Background mode temporarily stores response content encrypted at rest even when `store: false` or Zero Data Retention is active, because the API needs it to run and serve retrieval. Check that against client data agreements before turning it on.
4. **Prompting for conciseness and persistence flips.** OpenAI notes that GPT-6.2 writes more concisely and directly by default, so legacy `"be concise"` rules in system prompts can make replies overly clipped. Conversely, under **Task completion**, OpenAI warns that when intent is ambiguous the model may propose a next step and stop for confirmation. For autonomous jobs, explicitly tell it to make reasonable reversible assumptions and finish the task.
5. **Watch for silent blockers in agents.** In its own [launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/) under Alignment, OpenAI notes that in two evaluations both 6.2 models were more likely than GPT-6 Astra to omit mentioning obstacles such as a missing file or unavailable search tool (it added Codex instructions to reduce this). In custom agent harnesses, verify tool failures in code rather than relying on the model to report them unprompted.

## What developers on Hacker News are saying

Two large Hacker News threads give a clear picture of how developers are reacting five days in: the main launch thread ([GPT-6.2 Astra and Sol](https://news.ycombinator.com/item?id=50535230), 1,347 points, 864 comments) and a follow-up thread on [SimpleBench](https://simple-bench.com/) ([Astra 6.2 and Sol 6.2 flop at Simple Bench](https://news.ycombinator.com/item?id=50588916), 183 points, 171 comments). Every quote below was checked verbatim on its comment permalink.

![Hacker News launch thread header: GPT-6.2 Astra and Sol (openai.com), showing 1347 points by jasondavies and 864 comments](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/4f1e879b-636a-4933-be34-d6a7e5b9886d.webp)

*The Hacker News launch thread, captured November 23, 2026.*

**Astra vs. Sol split on real codebases.** When [billypilgrim](https://news.ycombinator.com/item?id=50535364) asked where Astra is noticeably better than Sol, replies split cleanly along architecture vs execution lines:
- [chaos_emergent](https://news.ycombinator.com/item?id=50535402): "I find Astra to have a lot better ability to coordinate subagents compared to Sol. I haven't found a distinction in the complexity of work they can handle."
- [whimsicalism](https://news.ycombinator.com/item?id=50535418): "For just doing things or coding things up, Sol all the way."
- [itvision](https://news.ycombinator.com/item?id=50535578): "I have a 1.5 MB C++ codebase, and at least a third of the tasks that Sol completed required cleaning up by Astra. Astra usually produced good output from the outset. Sol did not. Astra also designs things more effectively."
- [zeroxfe](https://news.ycombinator.com/item?id=50535474): "I always simply use Astra (high), despite the cost and latency overhead -- it's just a lot more reliable."

**Cost per task and speed drew genuine praise.** [charlesabarnes](https://news.ycombinator.com/item?id=50535353) wrote: "I appreciate that OAI is now bringing the topic of conversation to \"task completion cost\" rather than brute forcing solutions". On throughput, [criemen](https://news.ycombinator.com/item?id=50592967) pointed to OpenRouter's median output speed rising from 43 tok/s on Sol 6.1 to 58 tok/s on Sol 6.2 (and over 80 tok/s via Azure/Amazon).

**The biggest practical complaint matches OpenAI's own docs: stopping early.** Multiple Codex and agent users noticed 6.2 pausing instead of pushing through long runs:
- [zergrush](https://news.ycombinator.com/item?id=50590844): "I've been using Astra 6.2 for the past few days and the biggest complaint is that it simply will not continue long tasks on its own"
- [andai](https://news.ycombinator.com/item?id=50590910): "Yeah it's been a few months since I used codex but I tried it again last night and it kept stopping."
- [hrncn](https://news.ycombinator.com/item?id=50592964): "The stopping is something I noticed as well."

**Directness divides people.** [adam_arthur](https://news.ycombinator.com/item?id=50593137) liked Astra 6.2's strict compliance ("It is super concise and straight to the point. Does exactly what you ask of it, pretty much no more or less (on medium)."), while criticizing 6.2 Sol as "more circuitous". On the other side, [martinjc](https://news.ycombinator.com/item?id=50589862) felt 6.2 "follows instructions too well. Grey areas are completely cut out", and [nsingh2](https://news.ycombinator.com/item?id=50590458) noted that "the relatively worse communication means it's harder to drive and effectively use that capability."

**SimpleBench and benchmark scepticism.** In thread `#50588916`, [jeremyjjj](https://news.ycombinator.com/item?id=50591334) argued that "If 6.2 is worse than 6.1, something weird is going on." Others pushed back on both the framing and synthetic evals: [ilaksh](https://news.ycombinator.com/item?id=50592082) noted "So \"flop\" overstates it", while [0xbadc0de5](https://news.ycombinator.com/item?id=50589897) said "Having used both Sol-6.2 and Astra-6.2 heavily over the last few days (as well as regularly using Claude Opus and Fable) they are marked improvements over the previous releases and comparable to Opus-5.5 and Fable-5.2."

## Using GPT-6.2 in a Next.js app

Every snippet below was type-checked with `tsc --noEmit` in strict mode against `openai` 7.62.0 and `zod` 4.6.7, without making any live API calls. They follow Next.js 16 App Router conventions for Route Handlers and Server Functions.

### 1. Streaming Route Handler with cache-safe developer instructions

Notice three details in the request shape: `SHARED_REVIEW_POLICY` goes first in `input` as a `developer` message (in production this prefix must be at least 1,024 visible tokens to cache; the string below is shortened for readability), `prompt_cache_options: {mode: 'explicit', ttl: '30m'}` paired with `prompt_cache_breakpoint: {mode: 'explicit'}` pins the cache boundary before the per-request `diff`, and top-level `instructions` holds only the per-request `focus` hint. Passing `request.signal` aborts the upstream stream if the client disconnects, and the loop checks `response.completed`, `response.incomplete`, and `response.failed` so truncated or failed streams don't close as HTTP 200 successes.

```ts
// app/api/review/route.ts
import OpenAI from 'openai';

const openai = new OpenAI();

// Stable, reusable guidance goes in the first developer message in `input`,
// NOT in top-level `instructions`, which GPT-6.2 appends after `input`.
// Abbreviated here: real prefixes need >= 1,024 visible input tokens to cache.
const SHARED_REVIEW_POLICY = `You review TypeScript pull requests for a Next.js App Router codebase.
Flag correctness bugs, missing auth checks, and unsafe SQL or XSS sinks.
Keep findings concise and cite the exact file and line.`;

export async function POST(request: Request) {
  // Verify the caller's session and permissions before calling OpenAI.
  const {diff, focus}: {diff: string; focus?: string} = await request.json();

  const stream = openai.responses.stream(
    {
      model: 'gpt-6.2-sol',
      reasoning: {effort: 'medium'},
      prompt_cache_key: 'pr-review-policy-v1',
      prompt_cache_options: {mode: 'explicit', ttl: '30m'},
      input: [
        {
          role: 'developer',
          content: [
            {
              type: 'input_text',
              text: SHARED_REVIEW_POLICY,
              prompt_cache_breakpoint: {mode: 'explicit'},
            },
          ],
        },
        {role: 'user', content: diff},
      ],
      // Use top-level `instructions` only for per-request guidance.
      ...(focus ? {instructions: `Pay extra attention to: ${focus}`} : {}),
    },
    {signal: request.signal},
  );

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      let completed = false;
      try {
        for await (const event of stream) {
          if (event.type === 'response.output_text.delta') {
            controller.enqueue(encoder.encode(event.delta));
          } else if (event.type === 'response.completed') {
            completed = true;
          } else if (event.type === 'response.failed' || event.type === 'response.incomplete') {
            const detail =
              event.type === 'response.failed'
                ? (event.response.error?.message ?? 'request failed')
                : (event.response.incomplete_details?.reason ?? 'incomplete');
            controller.error(new Error(`Response ended with ${event.type}: ${detail}`));
            return;
          }
        }
        if (!completed) {
          controller.error(new Error('Response stream ended without response.completed'));
          return;
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {'Content-Type': 'text/plain; charset=utf-8'},
  });
}
```

### 2. Server Action with Zod structured output and Sol-to-Astra escalation

Keep the two model IDs in one small config object so routine triage runs on `gpt-6.2-sol` at `medium` effort and only escalates to `gpt-6.2-astra` at `high` when a ticket actually needs it. Always verify auth inside Server Actions before invoking paid APIs.

```ts
// app/actions/triage.ts
'use server';

import OpenAI from 'openai';
import {zodTextFormat} from 'openai/helpers/zod';
import {z} from 'zod';

const openai = new OpenAI();

const MODELS = {
  default: 'gpt-6.2-sol',
  heavy: 'gpt-6.2-astra',
} as const;

const TriageSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  summary: z.string(),
  affectedFiles: z.array(z.string()),
  needsArchitectReview: z.boolean(),
});

export type TriageResult = z.infer<typeof TriageSchema>;

export async function triageIssue(issueText: string, escalate = false): Promise<TriageResult> {
  // Verify the caller's session and permissions before calling OpenAI.
  const response = await openai.responses.parse({
    model: escalate ? MODELS.heavy : MODELS.default,
    reasoning: {effort: escalate ? 'high' : 'medium'},
    input: [
      {
        role: 'developer',
        content: 'Classify this engineering issue and list the files most likely involved.',
      },
      {role: 'user', content: issueText},
    ],
    text: {
      format: zodTextFormat(TriageSchema, 'issue_triage'),
    },
  });

  if (response.status !== 'completed' || !response.output_parsed) {
    throw new Error(`Triage did not complete: ${response.status}`);
  }
  return response.output_parsed;
}
```

### 3. Long-running audit on Background Mode (8h discounted window)

Because `service_tier: 'flex'` is gone on GPT-6.2, an overnight architecture or security audit belongs on Background Mode with `service_tier: 'default'`, `completion_window: '8h'` (40% off Standard), and Astra at `xhigh` rather than `max`. Subscribe to `response.completed` alongside the `response.failed`, `response.incomplete`, and `response.canceled` webhooks (or poll `openai.responses.retrieve(responseId)` until a terminal status) and record a failure or retry state so stalled audits never hang unresolved.

```ts
// app/actions/audit.ts
'use server';

import OpenAI from 'openai';

const openai = new OpenAI();

export async function queueOvernightAudit(repoSummary: string, runId: string) {
  // Verify the caller's session and check ZDR/data-storage requirements first.
  const response = await openai.responses.create({
    model: 'gpt-6.2-astra',
    reasoning: {effort: 'xhigh'},
    background: true,
    service_tier: 'default',
    background_options: {
      completion_window: '8h',
      continuation_id: runId,
    },
    input: [
      {
        role: 'developer',
        content:
          'Audit this architecture summary for security, data-loss, and scaling risks. Work through every section without stopping for confirmation.',
      },
      {role: 'user', content: repoSummary},
    ],
  });

  return {responseId: response.id, status: response.status};
}
```

## Astra or Sol: which one I'd pick

![Decision diagram titled "Which GPT-6.2 model, by job", comparing GPT-6.2 Sol ($2/$10, marked Start Here), GPT-6.2 Astra ($8/$40), and Delivery & speed tiers (Background 2h/8h, Batch, Fast, Ultrafast), with a lime-accented note on tuning reasoning effort before switching models](https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/d647dfd3-e8be-4521-9d51-247767b425ad.webp)

*My own routing split, based on the pricing and Artificial Analysis numbers as of November 23, 2026.*

**I'd start almost every project on `gpt-6.2-sol` at `medium` or `high`.** At $2 / $10, 67 tok/s, and 0.75x typical engineering cost on MEI, Sol covers routine Next.js endpoints, structured extraction, PR reviews, and day-to-day Codex execution without burning budget on diminishing returns. Even OpenAI's own launch post says many OpenAI employees use Sol as their daily default.

**I'd pay the 4x jump for `gpt-6.2-astra` in three specific places:** large-codebase architectural design (where HN users like `itvision` saw fewer clean-up passes), orchestrating worker subagents (`chaos_emergent` and `whimsicalism` both called this out as Astra's clearest edge), and high-stakes domain deliverables like legal, financial, or scientific workflows where a subtle mistake costs far more than $3 extra per task. When I do reach for Astra, I'd cap routine runs at `high` or `xhigh` rather than `max`, because `xhigh` matches `max`'s Artificial Analysis score (62) while cutting output tokens by more than half.

**And I'd pair them.** Put Astra (`high` or `xhigh`) on planning, spec review, and final verification, and fan the bounded implementation or classification steps out to Sol (`medium`) workers. That matches where both models sit on the cost-performance curve without forcing one model to do both jobs.

## What I'd do this week

1. **Audit every `instructions` field in Responses API calls.** Move reusable prompts (>= 1,024 visible tokens) into the first `developer` message in `input` and add an explicit `prompt_cache_breakpoint` before changing user messages so 95%-off cached reads actually hit.
2. **Make conversation history strictly append-only.** Stop mutating earlier developer messages or downgrading models mid-thread, or GPT-6.2 will drop prior reasoning items and burn tokens re-thinking.
3. **Strip legacy `"be concise"` lines and add explicit completion rules.** GPT-6.2 is already terse by default, and for autonomous agent loops it needs explicit permission to make reversible assumptions instead of stopping to ask.
4. **Replace `service_tier: 'flex'` with Background Mode (`2h` or `8h`) or Batch.** Check the temporary-storage note before sending sensitive client data through background windows, and keep background and synchronous cache budgets separate.
5. **Check the 272K context cliff and remove `effort: 'none'`.** Trim or compact long threads before 272K input tokens so a single bloated turn doesn't double input and cache rates across the whole request.
6. **Test Astra `xhigh` vs Sol `high` on five real tasks from your own repo.** Ignore single-score headlines and compare finished task cost, latency, and how many follow-up corrections you had to make.
7. **Mark March 1, 2027 if you adopt Ultrafast.** Its API multiplier doubles from 3x to 6x Standard on that date.

## Sources

**OpenAI**

- [Introducing GPT-6.2 Astra and Sol](https://openai.com/index/introducing-gpt-6-2-astra-sol/)
- [GPT-6.2 Astra and Sol system card](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

**Docs**

- [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model)
- [GPT-6.2 Astra model page](https://developers.openai.com/api/docs/models/gpt-6.2-astra)
- [GPT-6.2 Sol model page](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Background mode guide](https://developers.openai.com/api/docs/guides/background)
- [Prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching)

**Independent tests**

- [Artificial Analysis: GPT-6.2 Astra](https://artificialanalysis.ai/models/gpt-6-2-astra) and [GPT-6.2 Sol](https://artificialanalysis.ai/models/gpt-6-2-sol)
- [Models Engineering Index](https://git-aarvin.github.io/mei/)
- [SimpleBench](https://simple-bench.com/)

**Hacker News**

- [GPT-6.2 Astra and Sol (launch thread)](https://news.ycombinator.com/item?id=50535230) and [Astra 6.2 and Sol 6.2 flop at Simple Bench](https://news.ycombinator.com/item?id=50588916)
- Comments quoted: [billypilgrim](https://news.ycombinator.com/item?id=50535364), [chaos_emergent](https://news.ycombinator.com/item?id=50535402), [whimsicalism](https://news.ycombinator.com/item?id=50535418), [itvision](https://news.ycombinator.com/item?id=50535578), [zeroxfe](https://news.ycombinator.com/item?id=50535474), [charlesabarnes](https://news.ycombinator.com/item?id=50535353), [criemen](https://news.ycombinator.com/item?id=50592967), [zergrush](https://news.ycombinator.com/item?id=50590844), [andai](https://news.ycombinator.com/item?id=50590910), [hrncn](https://news.ycombinator.com/item?id=50592964), [adam_arthur](https://news.ycombinator.com/item?id=50593137), [martinjc](https://news.ycombinator.com/item?id=50589862), [nsingh2](https://news.ycombinator.com/item?id=50590458), [jeremyjjj](https://news.ycombinator.com/item?id=50591334), [ilaksh](https://news.ycombinator.com/item?id=50592082), [0xbadc0de5](https://news.ycombinator.com/item?id=50589897)
