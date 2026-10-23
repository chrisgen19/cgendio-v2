import {notFound} from 'next/navigation';
import {OG_SIZE, ogCard} from '@/app/_og/og-card';
import {getProject, getProjectSlugs} from '@/server/content';

export const alt = 'Cgdiomampo.dev case study';
export const size = OG_SIZE;
export const contentType = 'image/png';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-projects'}];
}

export default async function Image({params}: {params: Promise<{slug: string}>}) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return ogCard({eyebrow: `Case study · ${project.kindLabel}`, title: project.title});
}
