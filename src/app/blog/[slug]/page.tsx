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

/** Published posts are prerendered. With no posts at all, a placeholder slug keeps the build happy and 404s. */
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-posts'}];
}

export async function generateMetadata({params}: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return pageMetadata({title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, article: {publishedTime: post.date}});
}

/**
 * A post. Drafts and unknown slugs get a real 404: the lookup and notFound() happen before anything streams, so the
 * status code is still 404 rather than a 200 with a not-found page.
 */
export default async function PostPage({params}: PageProps<'/blog/[slug]'>) {
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
