import {connection, type NextRequest} from 'next/server';
import {outboundTarget} from '@/lib/outbound';
import {getProject} from '@/server/content';

// Never indexed or cached, and no referrer for the client's site (the site-wide same-origin policy already sends none)
const HEADERS = {'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer'};

/**
 * Sends a visitor on to a published project's live site, or with `?stop=<key>` to that tour stop's page. robots.txt
 * disallows /out, so crawlers never see where it leads (see OUTBOUND_PATH). 302, so a changed live URL takes effect at once.
 */
export async function GET(request: NextRequest, {params}: RouteContext<'/out/[slug]'>) {
  await connection(); // per request, never prerendered
  const {slug} = await params;
  const project = await getProject(slug);
  const target = project ? outboundTarget(project, request.nextUrl.searchParams.get('stop')) : null;
  if (!target) return new Response('Not found\n', {status: 404, headers: HEADERS});
  return new Response(null, {status: 302, headers: {...HEADERS, Location: target}});
}
