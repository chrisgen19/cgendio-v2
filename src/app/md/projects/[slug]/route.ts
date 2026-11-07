import {siteEnv} from '@/lib/env';
import {markdownResponse} from '@/lib/markdown-export';
import {getProjectSlugs} from '@/server/content';
import {getProjectMarkdown} from '@/server/markdown-export';

/*
 * A case study as Markdown. Public at /projects/<slug>.md, or at /projects/<slug> with `Accept: text/markdown`
 * (rewrites in next.config.ts); this internal path is disallowed in robots.txt. Refreshed by the projects tag.
 */

// Cache Components rejects an empty list; the placeholder answers 404 (as the case study page does)
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-projects'}];
}

export async function GET(_request: Request, {params}: RouteContext<'/md/projects/[slug]'>) {
  const {slug} = await params;
  const markdown = await getProjectMarkdown(slug);
  if (!markdown) return new Response('Not found\n', {status: 404, headers: {'X-Robots-Tag': 'noindex'}});
  return markdownResponse(markdown, `${siteEnv().NEXT_PUBLIC_SITE_URL}/projects/${slug}`);
}
