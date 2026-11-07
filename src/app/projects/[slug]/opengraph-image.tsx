import {notFound} from 'next/navigation';
import {OG_SIZE, ogCard} from '@/app/_og/og-card';
import {OG_CARD_ID} from '@/lib/metadata';
import {getProject, getProjectSlugs} from '@/server/content';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-projects'}];
}

/** One card per case study, with the project's title as its alt text (a plain `alt` export can only be one fixed string). */
export async function generateImageMetadata({params}: {params: {slug: string}}) {
  const project = await getProject(params.slug);
  return [{id: OG_CARD_ID, alt: project?.title ?? 'Case study', size: OG_SIZE, contentType: 'image/png'}];
}

export default async function Image({params}: {params: Promise<{slug: string}>}) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return ogCard({eyebrow: `Case study · ${project.kindLabel}`, title: project.title});
}
