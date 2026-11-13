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
