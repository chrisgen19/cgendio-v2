import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CaseStudyArticle} from '@/components/case-study/case-study-article';
import {NextProject} from '@/components/case-study/next-project';
import {ContactCta} from '@/components/sections/contact-cta';
import {PageShell} from '@/components/site/page-shell';
import {getNextProject, getProject, getProjectSlugs} from '@/server/content';

/** Published projects are prerendered. With none at all, a placeholder slug keeps the build happy and 404s. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-projects'}];
}

export async function generateMetadata({params}: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return {title: project.title, description: project.summary};
}

/** A case study. Drafts and unknown slugs 404 before anything streams (see the post page for why that matters). */
export default async function CaseStudyPage({params}: PageProps<'/work/[slug]'>) {
  const {slug} = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const next = await getNextProject(slug);
  return (
    <PageShell>
      <CaseStudyArticle project={project} />
      <NextProject project={next} />
      <ContactCta />
    </PageShell>
  );
}
