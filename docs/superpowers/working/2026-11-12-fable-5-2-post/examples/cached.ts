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
