Anthropic released Claude Fable 5.2 on November 9, 2026. It's the most capable Claude model that anyone can sign up for, it costs less than the version before it, and it changes a few things that will break code written for older models.

I haven't shipped Fable 5.2 in a client project yet, so this isn't a case study. It's what I'd tell another developer, or a client asking whether it's worth paying for: what changed, what people who have used it are saying, and how I'd wire it into a real app. Everything here is current as of November 12, 2026, and every number links to where it came from.

> **The short version.** Fable 5.2 costs $8 per million input tokens and $40 per million output tokens (down from $10 and $50), runs up to 30% faster than 5.1, and is much stronger on long, open-ended work. Thinking is always on, forced tool calls now fail, and refusals need handling in your code. For everyday coding, Anthropic itself still says to start with Opus 5.5, which costs half as much.

## What's new in 5.2

![Anthropic's launch post headline: Claude Fable 5.2 and Mythos 5.2, dated November 9, 2026](/__fable-images/launch-page.webp)

*Anthropic's launch post, November 9, 2026.*

Fable 5.2 and Mythos 5.2 are the same model. Fable ships with stronger cybersecurity and biology safeguards so anyone can use it, and Mythos is for organisations in Anthropic's verification programs ([launch post](https://www.anthropic.com/claude-fable-and-mythos-5-2)). For most developers, Fable is the one that matters.

- **Cheaper per token.** $8 / $40 per million input / output tokens, down from $10 / $50. Cache reads are $0.20 per million, and the Batch API halves the price to $4 / $20 ([model page](https://www.anthropic.com/claude/fable), [pricing](https://platform.claude.com/docs/en/about-claude/pricing)).
- **Faster.** Output is up to 30% faster than Fable 5.1. There's also a fast mode, new for Fable: up to 2.5x faster output at twice the price ($16 / $80). In the API you set `"speed": "fast"`, and in Claude Code you toggle it in the model picker, where it bills through extra usage credits ([@ClaudeDevs](https://x.com/ClaudeDevs/status/2119868701994570178)).
- **Fewer false blocks.** Anthropic reports about 55% fewer safeguard blocks than 5.1, with about 60% fewer in cybersecurity and 40% fewer in biology. Requests that are still blocked can fall back to an older model: cybersecurity questions go to Opus 4.8 and biology questions to Opus 5.
- **Limits.** A 1M token context window, up to 128K output tokens, and a June 2026 knowledge cutoff ([what's new in Fable 5.2](https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2)).
- **Most platforms.** The model ID is `claude-fable-5-2` on the Claude API, Claude Platform on AWS, Google Cloud and Microsoft Foundry. On Amazon Bedrock it's `global.anthropic.claude-fable-5-2` ([model overview](https://platform.claude.com/docs/en/models/fable-5-2/overview)).

The benchmark jump over 5.1 is large. These are Anthropic's numbers from the [model page](https://www.anthropic.com/claude/fable), with most scores at each model's highest effort setting:

| Benchmark | Fable 5.2 | Fable 5.1 | Opus 5.5 |
| --- | --- | --- | --- |
| FrontierCode 2.0 (agentic coding) | 49.1% | 32.4% | 45.5% |
| FrontierSWE v2 (agentic coding) | 69.9% | 56.3% | 62.3% |
| Remote Labor Index (knowledge work) | 41.3% | 17.9% | 21.3% |
| OSWorld 2.1 (computer use) | 89.3% | 83.5% | 87.2% |

Against Opus 5.5 the gap is small on coding and computer use, and large on long, real-world tasks: the Remote Labor Index score nearly doubles. Anthropic also says that at High effort, Fable 5.2 scored about level with Opus 5.5 at Max effort on FrontierCode 2.0, for roughly half the cost per task. These are a vendor's own benchmarks, so I read them as a reason to test, not a verdict.

## What changes in your code

Coming from Fable 5.1, moving to 5.2 is mostly a model ID swap. Coming from Opus or an older model, there's more to change. These are the ones that return errors, each with its fix (details in [what's new in Fable 5.2](https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2)):

1. **Thinking is always on.** Sending `thinking: {type: 'disabled'}` or a `budget_tokens` value returns a 400. You control how hard it thinks with `output_config.effort`: `low`, `medium`, `high`, `xhigh` or `max`. The API default is `high`. Claude Code and the Claude apps default to Medium.
2. **No forced tool calls.** A `tool_choice` of `any` or `tool` returns a 400. Use `auto` with `strict: true` on the tool, or use [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) when you only wanted JSON back.
3. **No prefill and no sampling settings.** An assistant prefill, or any of `temperature`, `top_p` and `top_k`, returns a 400.
4. **Refusals are a stop reason.** A declined request comes back as a normal response, not an error, with `stop_reason: "refusal"`, so check it before you read `content`. You can opt into server-side fallbacks with `fallbacks: "default"` and the `server-side-fallback-2026-07-01` beta ([refusals and fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback)).
5. **History has to stay append-only.** The preserved thinking check now applies to every account. If you send a thinking block back after editing the system prompt, the tools or an earlier message, you get a 400. Keep `system` and `tools` fixed for a session and only add to `messages` ([preserved thinking](https://platform.claude.com/docs/en/build-with-claude/preserved-thinking)). No older model can read Fable 5.2's thinking blocks either, so a fallback to Opus carries on without that reasoning.
6. **Computer use moved.** `computer_20251124` returns a 400 everywhere except Amazon Bedrock. Use `computer_toolset_20260801` ([computer use tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)).
7. **Advisor pairing.** With the advisor tool, a Fable 5.2 executor only accepts Fable 5.2 or Mythos 5.2 as its advisor.
8. **Data retention.** Fable 5.2 needs 30-day data retention, so an organisation on zero data retention can't use it without Anthropic's Enterprise Frontier Safeguards.

Two prompting changes from Anthropic's [prompting guide for Fable 5.2](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2) are worth knowing before you test it. A line in the prompt telling it to answer without deliberating no longer stops it thinking at medium effort and above, so lower the effort instead. And on long tasks at low or medium effort it sometimes stops early with a list of what's left, so an agent needs a clear instruction to finish the whole task.

## Fable 5.2 or Opus 5.5?

![Flowchart: routine work goes to Haiku 5.5 or Sonnet 5.5, everyday coding to Opus 5.5 (start here), and multi-repo changes, deep audits and long agent runs to Fable 5.2 at high effort](/__fable-images/model-picker.webp)

*How I pick a model, based on Anthropic's own advice.*

Anthropic's advice is to start with Opus 5.5 for most coding and knowledge work, then move up to Fable or down to Sonnet 5.5 or Haiku 5.5 as the job needs ([launch post](https://www.anthropic.com/claude-fable-and-mythos-5-2)). Opus 5.5 costs $4 / $20 per million tokens, half of Fable's price.

The price per token went down, but the price per task can go up, because the model does more work on each task. On Hacker News, rgbrenner put it bluntly: "Forget about the scores... look at the Cost Per Task." His numbers from Artificial Analysis show the tokens per task rising from 118k on 5.1 to 274k on 5.2. XenophileJKO replied with the other side: "This model is on the cost performance frontier (Pareto line) from medium -> max." By his reading, Fable 5.2 at High scored 62 for $9.08 a task, against Opus 5.5 at Max scoring 59 for $10.04.

Both can be true. The lever that decides which one you get is effort:

- **`high`** is the API default, and Anthropic's prompting guide says it's where you get most of the capability gain. I'd use it for hard coding, research and long unattended runs.
- **`medium`** suits interactive coding and chat.
- **`low`** is for quick, well-specified work and high-volume calls such as subagents.
- **`xhigh` and `max`** are only worth it where you've measured a gain. They use many more tokens.

One detail matters for cost: at high effort and above, Fable 5.2 thinks before almost every reply, a greeting included. Easy turns should run at a lower effort.

So where would I pay for it? Multi-repo refactors and migrations, deep code and security audits, long agent runs that would otherwise need me to step in, and hard debugging where Opus has already stalled. Where wouldn't I? Routine fixes, ordinary features, chat, classification and anything high-volume. Opus, Sonnet and Haiku do those well for less.

## What developers are saying

![Hacker News thread titled Claude Fable 5.2 and Mythos 5.2, showing 914 points and over 1,000 comments](/__fable-images/hn-thread.webp)

*Hacker News, at the time of writing (November 12, 2026).*

I read through the two big Hacker News threads, the [launch thread](https://news.ycombinator.com/item?id=50429068) (914 points and over 1,000 comments at the time of writing) and the [Artificial Analysis thread](https://news.ycombinator.com/item?id=50431144) (379 points, also at the time of writing), plus reactions on X. I didn't use Reddit for this post. A few themes came up again and again.

**On ordinary work, it's hard to tell apart from Opus 5.5.** postalcoder, who had used it, [wrote](https://news.ycombinator.com/item?id=50430766): "I personally have a hard time telling the difference between Fable 5.2 and Opus 5.5 for ordinary coding tasks." And: "Fable is good, but you really have to push the ambition of your prompt in order to see proper separation from Opus 5.5." ariwilson [measured](https://news.ycombinator.com/item?id=50432483) 30 regular coding tasks and found "Fable 5.2 and Opus 5.5 both solved 26 (Fable 5.1 was at 25)". On the same tasks, 5.2 finished in 0.62x the time of 5.1, with no runs stopped by safeguards.

**It pulls ahead on audits and big-picture work.** wwind123 [found](https://news.ycombinator.com/item?id=50437677) that for regular coding and code review it's not much better than Opus, "But using Fable to do deep thorough audit of the codebase and the system, it's able to catch more problems than Opus can." postalcoder also found it faster and more reliable than 5.1, without the output token overflows that used to cut 5.1 off.

**Cost is the real argument.** Besides rgbrenner's point above, goldenarm [argued](https://news.ycombinator.com/item?id=50432994) for cost per successful task instead: "Fable 5.2 low is 3x cheaper than Fable 5.1 xhigh while being 8% smarter." Others weren't convinced. eldgfipo [wrote](https://news.ycombinator.com/item?id=50437915) that "the cost per task still needs to fall by a 100x", and phillennium [summed up](https://news.ycombinator.com/item?id=50438628) a common feeling: "Sticking to Opus for now."

**On X, the early testers were the loudest.** Matthew Berman, who tested it before launch, [posted](https://x.com/MatthewBerman/status/2119871207206158459) "I've burned over 100 billion tokens early testing Fable 5.2." and "It is BY FAR the best model I've ever used." Anthropic's developer account [announced](https://x.com/ClaudeDevs/status/2119868698613956992) that "Fable 5.2 is now available in the Claude Platform and Claude Code." and described fast mode as "2.5x faster output, for twice the price."

My read: the enthusiasm comes from people running big, long, ambitious tasks, and the doubt comes from people paying per task for everyday coding. That matches Anthropic's own advice to keep Opus 5.5 as the default.

## Using it in a Next.js app

These are the patterns I'd reach for in a Next.js App Router project with the official TypeScript SDK, `@anthropic-ai/sdk` 1.8.0. I type-checked each one against that version. I didn't run them against the API for this post, so treat them as starting points. Install the SDK and Zod with `pnpm add @anthropic-ai/sdk zod`, and keep `ANTHROPIC_API_KEY` on the server only.

### Stream a response from a route handler

Fable 5.2 turns can run for minutes and produce up to 128K tokens, so stream anything that isn't tiny. This route handler at `app/api/chat/route.ts` sets the effort explicitly and turns on server-side fallbacks. It streams newline-delimited JSON instead of plain text, so the client can always tell the model's words from status events. `text` events carry the answer. If Fable declines partway through, a `switch` event marks the switch, and the fallback model carries on from the partial text. A final `end` event carries the stop reason, and only `end_turn` means a finished answer. On `refusal` the whole chain declined, and the client should discard the partial text. On `max_tokens` or `model_context_window_exceeded` the answer was cut off. The route also stops the request when the reader closes the tab, so you don't pay for tokens nobody sees.

A route handler is a public endpoint, and at Fable prices that matters. Cap the input as this one does, and put auth and rate limiting in front of it before it goes live. The same goes for the server action below.

```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const encoder = new TextEncoder();
const MAX_PROMPT_CHARS = 20_000;

// One JSON object per line, so the model's text can't be mistaken for a status event
type EndEvent = {type: 'end'; stopReason: string | null};
type StreamEvent = {type: 'text'; text: string} | {type: 'switch'} | EndEvent;

export async function POST(request: Request): Promise<Response> {
  // Invalid JSON becomes null, so it gets a 400 below instead of a 500
  const input = (await request.json().catch(() => null)) as {prompt?: unknown} | null;
  const prompt = input?.prompt;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return new Response('Missing prompt', {status: 400});
  }
  if (prompt.length > MAX_PROMPT_CHARS) return new Response('Too long', {status: 413});

  const stream = client.beta.messages.stream({
    model: 'claude-fable-5-2',
    max_tokens: 64000,
    output_config: {effort: 'high'},
    // On a safety decline, retry on the model Anthropic recommends
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{role: 'user', content: prompt}],
  });

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_start') {
            // Marks where the fallback model takes over from the partial text
            if (event.content_block.type === 'fallback') send({type: 'switch'});
          } else if (event.type === 'content_block_delta') {
            const {delta} = event;
            if (delta.type === 'text_delta') send({type: 'text', text: delta.text});
          }
        }
        // Only 'end_turn' is a finished answer; the client handles the rest
        const final = await stream.finalMessage();
        send({type: 'end', stopReason: final.stop_reason});
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      // The reader went away: stop paying for tokens nobody will see
      stream.abort();
    },
  });
  const headers = {'Content-Type': 'application/x-ndjson; charset=utf-8'};
  return new Response(body, {headers});
}
```

### Typed JSON from a server action

Forcing a tool call to get JSON no longer works, and structured outputs are the cleaner replacement anyway. The SDK's Zod helper turns a schema into the output format and parses the reply, so the action returns a typed object.

```ts
'use server';

import Anthropic from '@anthropic-ai/sdk';
import {zodOutputFormat} from '@anthropic-ai/sdk/helpers/zod';
import {z} from 'zod';

const client = new Anthropic();

const diagnosisSchema = z.object({
  cause: z.string(),
  fix: z.string(),
  confidence: z.enum(['low', 'medium', 'high']),
});

export type Diagnosis = z.infer<typeof diagnosisSchema>;

// Typed JSON through structured outputs: forcing a tool call returns a 400 on Fable 5.2
export async function explainError(log: string): Promise<Diagnosis> {
  const response = await client.messages.parse({
    model: 'claude-fable-5-2',
    max_tokens: 16000,
    output_config: {effort: 'medium', format: zodOutputFormat(diagnosisSchema)},
    messages: [{role: 'user', content: `Find the root cause and the fix:\n\n${log}`}],
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error('No diagnosis returned');
  }
  return response.parsed_output;
}
```

### Cache the big, stable part of the prompt

Cache reads cost $0.20 per million tokens against $8 for fresh input, so a large system prompt that stays the same on every request pays off quickly. Caching is a prefix match: change one byte near the start and everything after it is a cache miss. The minimum cacheable prompt is 512 tokens. Counting tokens first lets you turn away an oversized prompt before you pay for it. It only counts input: the output, up to `max_tokens`, and any cache write come on top. The file is read from `process.cwd()`. If you deploy with `output: 'standalone'`, list it in `outputFileTracingIncludes` so it gets copied into the build.

```ts
import {readFileSync} from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const model = 'claude-fable-5-2';

// The same bytes on every request, so it can be cached. The cache lasts 5 minutes
// and each hit restarts the clock. Writing it costs $10 per million, not $8.
const system: Anthropic.TextBlockParam[] = [
  {
    type: 'text',
    text: readFileSync(path.join(process.cwd(), 'docs/handbook.md'), 'utf8'),
    cache_control: {type: 'ephemeral'},
  },
];

// An input-size limit, not a cost cap: output (up to max_tokens) and cache writes
// come on top. 200K input tokens cost $1.60 uncached, or $0.04 as cache reads.
const MAX_INPUT_TOKENS = 200_000;

export async function askDocs(question: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{role: 'user', content: question}];
  const {input_tokens} = await client.messages.countTokens({model, system, messages});
  if (input_tokens > MAX_INPUT_TOKENS) {
    throw new Error(`Prompt too large: ${input_tokens} tokens`);
  }

  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    output_config: {effort: 'low'},
    system,
    messages,
  });
  if (response.stop_reason === 'refusal') return 'Declined.';
  const text = response.content.map((b) => (b.type === 'text' ? b.text : ''));
  return text.join('');
}
```

### Let Fable plan and cheaper models do the work

![Diagram: Fable 5.2 plans the work in one call, three Haiku 5.5 workers run the steps in parallel, and the results are merged in your code](/__fable-images/orchestrator.webp)

*The orchestrator pattern: one planner, many cheap workers.*

Anthropic's prompting guide says early testers had good results using Fable 5.2 as the planner and orchestrator for other models, and warns that subagents can be a large share of the cost. The idea: the expensive model writes a short plan, and a cheap model does the bulk of the work in parallel. This sketch assumes the steps don't depend on each other. The workers have no tools, so they only see text: put any file contents or data a step needs into the task. The function rejects a plan with more than 8 steps before any worker starts, and it fails if a worker refuses or runs out of tokens, instead of returning half-done work.

```ts
import Anthropic from '@anthropic-ai/sdk';
import {zodOutputFormat} from '@anthropic-ai/sdk/helpers/zod';
import {z} from 'zod';

const client = new Anthropic();
const planSchema = z.object({steps: z.array(z.string())});
const PLAN_PROMPT = 'Split this into at most 8 independent steps a small model can do:';

const textOf = (message: Anthropic.Message) => {
  const parts = message.content.map((b) => (b.type === 'text' ? b.text : ''));
  return parts.join('');
};

export async function planAndDelegate(task: string): Promise<string[]> {
  // Fable 5.2 plans: the expensive model only writes a short list
  const plan = await client.messages.parse({
    model: 'claude-fable-5-2',
    max_tokens: 16000,
    output_config: {effort: 'high', format: zodOutputFormat(planSchema)},
    messages: [{role: 'user', content: `${PLAN_PROMPT}\n\n${task}`}],
  });
  if (plan.stop_reason === 'refusal' || !plan.parsed_output) {
    throw new Error('No plan returned');
  }
  const {steps} = plan.parsed_output;
  // The prompt asks for at most 8 steps, but only this check guarantees it
  if (steps.length === 0 || steps.length > 8) {
    throw new Error(`Expected 1 to 8 steps, got ${steps.length}`);
  }

  // Haiku 5.5 does the bulk of the work, all steps at once
  const results = await Promise.all(
    steps.map((step) =>
      client.messages.create({
        model: 'claude-haiku-5-5',
        max_tokens: 8000,
        output_config: {effort: 'low'},
        // The worker sees the whole task, but only does its own step
        messages: [{role: 'user', content: `${task}\n\nDo only this step: ${step}`}],
      }),
    ),
  );
  // A refused or cut-off step isn't finished work, so fail instead of returning it
  const unfinished = results.filter((result) => result.stop_reason !== 'end_turn');
  if (unfinished.length > 0) {
    throw new Error(`${unfinished.length} step(s) did not finish`);
  }
  return results.map(textOf);
}
```

## Beyond the app

**In Claude Code.** Fable 5.2 is in the model picker, and Claude Code runs it at Medium effort by default. I'd keep Opus 5.5 as the daily driver and switch to Fable for a big refactor, a migration plan or an audit across a whole repo. Fast mode is worth it when you're sitting there waiting, not for runs you leave alone. Anthropic's guide also notes that telling the model the codebase is its own makes it restructure more and change more than you asked. Leave that out when you want small, contained changes.

**Long-running agents.** This is where Anthropic pitches Fable 5.2 hardest. One customer quote on the model page describes Uber running a 10 to 12 hour security audit with about 170 reviewer agents. For runs like that, stream, set a large `max_tokens`, keep the history append-only, and show progress so the person waiting can see it's still working.

**Batch jobs.** The Batch API runs Fable 5.2 at half price, $4 / $20, for work that doesn't need an answer right away: overnight code reviews, bulk content checks, sorting a backlog. Results come back in any order, so match them by ID.

**Reviews and audits.** This is where Hacker News users said it earns its price. I'd run a deep Fable audit on a branch before a big release, and let Opus or Sonnet handle everyday pull request reviews.

## What I'd do this week

1. Search your code for `budget_tokens`, disabled thinking, forced `tool_choice`, prefills and sampling settings before you point anything at `claude-fable-5-2`.
2. Set `effort` explicitly on every call instead of relying on the default.
3. Handle `stop_reason: "refusal"` and turn on `fallbacks: "default"`.
4. Check whether your agent code edits earlier messages, and make it append-only.
5. Pick one hard task you'd normally split into many prompts. Give it to Fable 5.2 at high effort and to Opus 5.5 at the same time, and compare the cost per finished task, not per token.
6. Keep Opus 5.5 as the default. Move a route to Fable only when your own tests show a gain worth twice the price.

## Sources

- Anthropic: [launch post](https://www.anthropic.com/claude-fable-and-mythos-5-2), [Fable model page](https://www.anthropic.com/claude/fable), [system card](https://www.anthropic.com/claude-fable-5-2-mythos-5-2-system-card)
- Docs: [Fable 5.2 model overview](https://platform.claude.com/docs/en/models/fable-5-2/overview), [What's new in Fable 5.2](https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2), [Prompting Claude Fable 5.2](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2), [pricing](https://platform.claude.com/docs/en/about-claude/pricing), [preserved thinking](https://platform.claude.com/docs/en/build-with-claude/preserved-thinking), [refusals and fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback), [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [computer use tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
- Hacker News: [launch thread](https://news.ycombinator.com/item?id=50429068), [Artificial Analysis thread](https://news.ycombinator.com/item?id=50431144), and the comments linked above
- X: [@claudeai launch post](https://x.com/claudeai/status/2119867114450268322), [@ClaudeDevs on availability](https://x.com/ClaudeDevs/status/2119868698613956992), [@ClaudeDevs on fast mode](https://x.com/ClaudeDevs/status/2119868701994570178), [Matthew Berman](https://x.com/MatthewBerman/status/2119871207206158459)
