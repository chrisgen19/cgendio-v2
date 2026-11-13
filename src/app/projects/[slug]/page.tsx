import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CaseStudyBody} from '@/components/case-study/case-study-body';
import {NextProject} from '@/components/case-study/next-project';
import {ContactCta} from '@/components/sections/contact-cta';
import {JsonLd} from '@/components/site/json-ld';
import {PageShell} from '@/components/site/page-shell';
import {pageMetadata} from '@/lib/metadata';
import {caseStudyJsonLd} from '@/lib/structured-data';
import {getNextProject, getPageCopy, getProject, getProjectSlugs} from '@/server/content';

/**
 * The whole route must be static, so a slug that wasn't prerendered waits for its render instead of getting the App
 * Shell first. Partial Prefetching would otherwise stream that shell with a 200, and notFound() would land too late to
 * change the status. Next.js validates the static requirement at build time.
 */
export const ensureStatic = 'navigation';

/** Published projects are prerendered. With none at all, a placeholder slug keeps the build happy and 404s. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({slug})) : [{slug: 'no-projects'}];
}

export async function generateMetadata({params}: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return pageMetadata({title: project.title, description: project.summary, path: `/projects/${project.slug}`, markdown: true});
}

/**
 * A case study. Drafts and unknown slugs get a real 404: with ensureStatic above, nothing streams before the lookup, so
 * notFound() still sets the status code instead of streaming a not-found page under a 200.
 */
export default async function CaseStudyPage({params}: PageProps<'/projects/[slug]'>) {
  const {slug} = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const [link, copy] = await Promise.all([getNextProject(slug), getPageCopy()]);
  // The Next project card shows the next project's brand, summary and cover, so it needs the full record
  const next = link ? await getProject(link.slug) : null;
  return (
    <PageShell>
      <JsonLd data={caseStudyJsonLd(project, copy)} />
      <CaseStudyBody project={project} />
      <NextProject project={next} />
      <ContactCta />
    </PageShell>
  );
}
