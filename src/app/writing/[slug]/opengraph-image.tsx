import {notFound} from 'next/navigation';
import {OG_SIZE, ogCard} from '@/app/_og/og-card';
import {OG_CARD_ID} from '@/lib/metadata';
import {getPost, getPostSlugs} from '@/server/content';

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-posts'}];
}

/** One card per post, with the post's title as its alt text (a plain `alt` export can only be one fixed string). */
export async function generateImageMetadata({params}: {params: {slug: string}}) {
  const post = await getPost(params.slug);
  return [{id: OG_CARD_ID, alt: post?.title ?? 'Blog post', size: OG_SIZE, contentType: 'image/png'}];
}

export default async function Image({params}: {params: Promise<{slug: string}>}) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return ogCard({eyebrow: `Blog · ${post.tag}`, title: post.title});
}
