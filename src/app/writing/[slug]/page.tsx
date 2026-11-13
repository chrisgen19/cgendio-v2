import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PostArticle} from '@/components/blog/post-article';
import {PostNav} from '@/components/blog/post-nav';
import {ContactCta} from '@/components/sections/contact-cta';
import {JsonLd} from '@/components/site/json-ld';
import {PageShell} from '@/components/site/page-shell';
import {pageMetadata} from '@/lib/metadata';
import {postJsonLd} from '@/lib/structured-data';
import {getAdjacentPosts, getPageCopy, getPost, getPostSlugs} from '@/server/content';

/**
 * The whole route must be static, so a slug that wasn't prerendered waits for its render instead of getting the App
 * Shell first. Partial Prefetching would otherwise stream that shell with a 200, and notFound() would land too late to
 * change the status. Next.js validates the static requirement at build time.
 */
export const ensureStatic = 'navigation';

/** Published posts are prerendered. With no posts at all, a placeholder slug keeps the build happy and 404s. */
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-posts'}];
}

export async function generateMetadata({params}: PageProps<'/writing/[slug]'>): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const copy = await getPageCopy();
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/writing/${post.slug}`,
    // One tag per post is all the content model holds, so this is the whole set rather than a sample
    article: {publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: [copy['about.name']], tags: [post.tag]},
    markdown: true,
  });
}

/**
 * A post. Drafts and unknown slugs get a real 404: with ensureStatic above, nothing streams before the lookup, so
 * notFound() still sets the status code instead of streaming a not-found page under a 200.
 */
export default async function PostPage({params}: PageProps<'/writing/[slug]'>) {
  const {slug} = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const [{previous, next}, copy] = await Promise.all([getAdjacentPosts(slug), getPageCopy()]);
  return (
    <PageShell>
      <JsonLd data={postJsonLd(post, copy)} />
      <PostArticle post={post} />
      <PostNav previous={previous} next={next} />
      <ContactCta />
    </PageShell>
  );
}
