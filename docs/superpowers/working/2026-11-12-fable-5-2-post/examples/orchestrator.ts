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
