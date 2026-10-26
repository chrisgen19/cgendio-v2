import {revalidateTag} from 'next/cache';
import {CACHE_TAGS} from '@/server/content';
import {consumeStartupToken, STARTUP_REVALIDATE_HEADER} from '@/server/startup-revalidation';

/**
 * Marks every content tag stale once after a server start (src/server/startup-revalidation.ts). A 404 for anyone else.
 * `max`, not `{expire: 0}`: expiring the tags made the blocking re-render of /blog/[slug] and /work/[slug] fail with
 * "uncached or runtime data during prerendering" (Next 16.4.2), while stale-while-revalidate renders them in the
 * background like an admin save does. So the first visit to a page after a restart
 * can still get its build-time copy, and the next visit gets the fresh one.
 */
export async function POST(request: Request) {
  if (!consumeStartupToken(request.headers.get(STARTUP_REVALIDATE_HEADER))) return new Response(null, {status: 404});
  for (const tag of Object.values(CACHE_TAGS)) revalidateTag(tag, 'max');
  return new Response(null, {status: 204});
}
