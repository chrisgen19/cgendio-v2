import {getFeedXml} from '@/server/feed';

/** RSS 2.0 feed of the blog. The XML is built by a cached helper ('use cache' can't sit in a route handler body). */
export async function GET() {
  return new Response(await getFeedXml(), {headers: {'Content-Type': 'application/rss+xml; charset=utf-8'}});
}
