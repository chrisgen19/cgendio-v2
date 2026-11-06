import {notFound} from 'next/navigation';
import {OG_SIZE, ogCard} from '@/app/_og/og-card';
import {getPost, getPostSlugs} from '@/server/content';

export const alt = 'Cgdiomampo.dev blog post';
export const size = OG_SIZE;
export const contentType = 'image/png';

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-posts'}];
}

export default async function Image({params}: {params: Promise<{slug: string}>}) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return ogCard({eyebrow: `Blog · ${post.tag}`, title: post.title});
}
