# Fable 5.2 research notes (verified 2026-11-12)

## Facts

- Released November 9, 2026, alongside Mythos 5.2 https://www.anthropic.com/claude-fable-and-mythos-5-2
- Fable and Mythos 5.2 are the same underlying model; Fable has stronger cyber and bio safeguards and is open to everyone, Mythos is for verified organisations https://www.anthropic.com/claude-fable-and-mythos-5-2
- Price $8 / $40 per million input / output tokens, down from $10 / $50 https://www.anthropic.com/claude/fable
- Cache reads $0.20 per million tokens https://www.anthropic.com/claude/fable
- Batch $4 / $20 per million tokens https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2
- Up to 30% faster output than Fable 5.1 https://www.anthropic.com/claude-fable-and-mythos-5-2
- Fast mode: up to 2.5x faster output at $16 / $80; API `"speed": "fast"`; Claude Code toggles it in the model picker, billed through extra usage credits https://x.com/ClaudeDevs/status/2119868701994570178
- About 55% fewer safeguard blocks than Fable 5.1 (about 60% fewer in cyber, 40% in biology) https://www.anthropic.com/claude-fable-and-mythos-5-2
- Blocked cyber queries fall back to Opus 4.8, biology to Opus 5; API customers configure the fallback https://www.anthropic.com/claude/fable
- Anthropic recommends starting with Opus 5.5 for most coding and knowledge work, moving up to Fable or down to Sonnet 5.5 / Haiku 5.5 as scope requires https://www.anthropic.com/claude-fable-and-mythos-5-2
- At High effort Fable 5.2 scored about level with Opus 5.5 at Max effort on FrontierCode 2.0, for roughly half the cost per task https://www.anthropic.com/claude-fable-and-mythos-5-2
- Claude Code: Medium is the default effort in Claude apps and Claude Code https://www.anthropic.com/claude-fable-and-mythos-5-2
- Available on the Claude Platform, AWS, Google Cloud and Microsoft Foundry, model ID claude-fable-5-2 https://www.anthropic.com/claude/fable
- 1M context, 128K max output, June 2026 knowledge cutoff https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2
- Benchmarks (Fable 5.2 / Fable 5.1 / Opus 5.5): FrontierCode 2.0 49.1 / 32.4 / 45.5; FrontierSWE v2 69.9 / 56.3 / 62.3; Remote Labor Index 41.3 / 17.9 / 21.3; OSWorld 2.1 89.3 / 83.5 / 87.2 https://www.anthropic.com/claude/fable
- Artificial Analysis Intelligence Index 65, highest so far (HN title) https://news.ycombinator.com/item?id=50431144
- HN launch thread: 914 points at the time of writing https://news.ycombinator.com/item?id=50429068
- HN Artificial Analysis thread: 379 points at the time of writing https://news.ycombinator.com/item?id=50431144

- Opus 5.5 costs $4 / $20 per million tokens; batch is half price (Fable 5.2 $4 / $20) https://platform.claude.com/docs/en/about-claude/pricing
- Uber ran a 10 to 12 hour security audit with about 170 reviewer agents (customer quote on the model page) https://www.anthropic.com/claude/fable
- Per-task tokens on Artificial Analysis rose from 118k (5.1) to 274k (5.2), per rgbrenner https://news.ycombinator.com/item?id=50432202
- Fable 5.2 High scored 62 at $9.08 per task vs Opus 5.5 Max 59 at $10.04, per XenophileJKO https://news.ycombinator.com/item?id=50433706
- ariwilson: 30 regular coding tasks, 5.2 finished in 0.62x the time of 5.1, no safeguard stops https://news.ycombinator.com/item?id=50432483

## Quotes

- "Forget about the scores... look at the Cost Per Task." | rgbrenner | https://news.ycombinator.com/item?id=50432202
- "The output tokens per task just exploded." | rgbrenner | https://news.ycombinator.com/item?id=50432202
- "This model is on the cost performance frontier (Pareto line) from medium -> max." | XenophileJKO | https://news.ycombinator.com/item?id=50433706
- "Fable 5.2 low is 3x cheaper than Fable 5.1 xhigh while being 8% smarter." | goldenarm | https://news.ycombinator.com/item?id=50432994
- "I personally have a hard time telling the difference between Fable 5.2 and Opus 5.5 for ordinary coding tasks." | postalcoder | https://news.ycombinator.com/item?id=50430766
- "Fable is good, but you really have to push the ambition of your prompt in order to see proper separation from Opus 5.5." | postalcoder | https://news.ycombinator.com/item?id=50430766
- "Fable 5.2 and Opus 5.5 both solved 26 (Fable 5.1 was at 25)" | ariwilson | https://news.ycombinator.com/item?id=50432483
- "But using Fable to do deep thorough audit of the codebase and the system, it's able to catch more problems than Opus can." | wwind123 | https://news.ycombinator.com/item?id=50437677
- "Sticking to Opus for now." | phillennium | https://news.ycombinator.com/item?id=50438628
- "the cost per task still needs to fall by a 100x" | eldgfipo | https://news.ycombinator.com/item?id=50437915
- "It is BY FAR the best model I've ever used." | Matthew Berman | https://x.com/MatthewBerman/status/2119871207206158459
- "I've burned over 100 billion tokens early testing Fable 5.2." | Matthew Berman | https://x.com/MatthewBerman/status/2119871207206158459
- "Fable 5.2 is now available in the Claude Platform and Claude Code." | ClaudeDevs | https://x.com/ClaudeDevs/status/2119868698613956992
- "2.5x faster output, for twice the price." | ClaudeDevs | https://x.com/ClaudeDevs/status/2119868701994570178
- "designed to tackle the most daunting technical challenges" | claudeai | https://x.com/claudeai/status/2119867114450268322

## API

- Thinking is always on; `thinking: {type: "disabled"}` and `budget_tokens` return a 400; control depth with `output_config.effort` (low, medium, high, xhigh, max); API default is `high` https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2
- Effort guidance: low for quick, high-volume work; medium for interactive coding and chat; high for hard coding and long runs; xhigh only where a gain is measured; max for ceilings https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- Forced `tool_choice` `any` / `tool` returns a 400; use `auto` with `strict: true`, or structured outputs `output_config.format` https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- No assistant prefill; no `temperature` / `top_p` / `top_k` https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2
- Refusals: `stop_reason: "refusal"` with `stop_details.category`; server-side `fallbacks: "default"` with beta `server-side-fallback-2026-07-01`; explicit list may name only claude-opus-4-8 or claude-opus-5 https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback
- Preserved thinking history-editing check enforced for every account; keep history append-only (freeze system and tools per session) https://platform.claude.com/docs/en/build-with-claude/preserved-thinking
- Earlier models cannot read its thinking blocks; a fallback runs without that reasoning https://platform.claude.com/docs/en/build-with-claude/preserved-thinking
- `computer_20251124` returns a 400 except on Amazon Bedrock; use `computer_toolset_20260801` https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
- Advisor tool: a Fable 5.2 executor accepts only claude-fable-5-2 or claude-mythos-5-2 as advisor https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2
- 30-day data retention required; not available under ZDR without Enterprise Frontier Safeguards https://www.anthropic.com/claude/fable
- Long turns; stream above about 16K max_tokens; set a large max_tokens at high and above https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- Fable 5.2 has its own rate limit https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2
- Early testers had good results using it as planner and orchestrator for other models; subagents can be a large share of cost https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- Minimum cacheable prompt is 512 tokens https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2
- At high and above it thinks before almost every reply, a greeting included; use a lower effort for easy turns https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- Instructions to think less no longer work at medium and above; lower effort instead https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- It may stop long tasks early, more often at low and medium; add a finish-the-whole-task instruction https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- Saying the codebase is the model's own makes it restructure more and change more; leave it out where minimal changes are wanted https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- You get most of the capability gain when using high effort https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- A declined request is a normal response, not an error, with stop_reason refusal https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback
- Streaming: on a mid-output decline a fallback content block (content_block_start/stop, no deltas) marks the boundary and the fallback model continues from the partial output https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback
- If the request is refused, treat partial output as incomplete and discard it https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback
- A 5-minute cache write costs 1.25x base input ($10 per million on Fable 5.2); the cache is valid for 5 minutes and hits refresh it https://platform.claude.com/docs/en/about-claude/pricing
- outputFileTracingIncludes in next.config adds files the output trace misses (Next.js 16.4.2 docs, output.md) https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- Model IDs: claude-fable-5-2 on the Claude API, Claude Platform on AWS, Claude Models on Google Cloud and Microsoft Foundry; global.anthropic.claude-fable-5-2 on Amazon Bedrock (bedrock-runtime) https://platform.claude.com/docs/en/models/fable-5-2/overview
- Stop reasons in @anthropic-ai/sdk 1.8.0 include end_turn, max_tokens, refusal and model_context_window_exceeded https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
