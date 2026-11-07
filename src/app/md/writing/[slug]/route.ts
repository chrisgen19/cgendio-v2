import {siteEnv} from '@/lib/env';
import {markdownResponse} from '@/lib/markdown-export';
import {getPostSlugs} from '@/server/content';
import {getPostMarkdown} from '@/server/markdown-export';

/*
 * A post as Markdown. Public at /writing/<slug>.md, or at /writing/<slug> with `Accept: text/markdown` (rewrites in
 * next.config.ts); this internal path is disallowed in robots.txt. Refreshed by the posts tag.
 */

// Cache Components rejects an empty list; the placeholder answers 404 (as the post page does)
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-posts'}];
}

export async function GET(_request: Request, {params}: RouteContext<'/md/writing/[slug]'>) {
  const {slug} = await params;
  const markdown = await getPostMarkdown(slug);
  if (!markdown) return new Response('Not found\n', {status: 404, headers: {'X-Robots-Tag': 'noindex'}});
  return markdownResponse(markdown, `${siteEnv().NEXT_PUBLIC_SITE_URL}/writing/${slug}`);
}
