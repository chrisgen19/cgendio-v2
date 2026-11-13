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
  // The client went away: stop paying for tokens nobody will see
  request.signal.addEventListener('abort', () => stream.abort());

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
      // Some runtimes cancel the response stream instead of aborting request.signal
      stream.abort();
    },
  });
  const headers = {'Content-Type': 'application/x-ndjson; charset=utf-8'};
  return new Response(body, {headers});
}
