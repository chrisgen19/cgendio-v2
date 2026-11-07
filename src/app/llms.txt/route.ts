import {getLlmsTxt} from '@/server/markdown-export';

/** llms.txt (https://llmstxt.org) for LLM tools; Google ignores it. Built by a cached helper, refreshed by the content tags. */
export async function GET() {
  return new Response(await getLlmsTxt(), {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
}
