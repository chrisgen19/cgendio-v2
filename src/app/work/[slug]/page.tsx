import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CaseStudyArticle} from '@/components/case-study/case-study-article';
import {NextProject} from '@/components/case-study/next-project';
import {ContactCta} from '@/components/sections/contact-cta';
import {JsonLd} from '@/components/site/json-ld';
import {PageShell} from '@/components/site/page-shell';
import {pageMetadata} from '@/lib/metadata';
import {caseStudyJsonLd} from '@/lib/structured-data';
import {getNextProject, getPageCopy, getProject, getProjectSlugs} from '@/server/content';

/** Published projects are prerendered. With none at all, a placeholder slug keeps the build happy and 404s. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-projects'}];
}

export async function generateMetadata({params}: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return pageMetadata({title: project.title, description: project.summary, path: `/work/${project.slug}`});
}

/** A case study. Drafts and unknown slugs 404 before anything streams (see the post page for why that matters). */
export default async function CaseStudyPage({params}: PageProps<'/work/[slug]'>) {
  const {slug} = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const [next, copy] = await Promise.all([getNextProject(slug), getPageCopy()]);
  return (
    <PageShell>
      <JsonLd data={caseStudyJsonLd(project, copy)} />
      <CaseStudyArticle project={project} />
      <NextProject project={next} />
      <ContactCta />
    </PageShell>
  );
}
