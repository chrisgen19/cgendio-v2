import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {BlogTeaser} from '@/components/sections/blog-teaser';
import {Milestones} from '@/components/sections/milestones';
import {Timeline} from '@/components/sections/timeline';
import {TIMELINE_VARIANTS} from '@/components/sections/timeline-lab/variants';
import {PageShell} from '@/components/site/page-shell';
import {ScrollReveal} from '@/components/ui-site/scroll-reveal';
import {cn} from '@/lib/cn';

const CURRENT = {slug: 'current', name: 'Current design', approach: 'The live section, for comparison.', Component: Timeline};
const ALL = [CURRENT, ...TIMELINE_VARIANTS];

export const metadata: Metadata = {title: 'Timeline lab', robots: {index: false, follow: false}};

// Each variant is a prerendered page and switching between them is a full load, so instant navigation doesn't apply
export const instant = false;

export function generateStaticParams() {
  return ALL.map(({slug}) => ({variant: slug}));
}

/** Previews one Work timeline design between the sections that sit around it on the home page. */
export default async function TimelineLabPage({params}: PageProps<'/lab/timeline/[variant]'>) {
  const {variant} = await params;
  const entry = ALL.find(({slug}) => slug === variant);
  if (!entry) notFound();
  const {Component} = entry;
  return (
    <PageShell>
      <nav aria-label="Timeline variants" className="border-b border-line bg-ground px-14 py-3 max-md:px-5">
        <div className="mx-auto flex max-w-site flex-wrap items-center gap-2">
          {ALL.map(({slug, name}) => (
            <Link
              key={slug}
              href={`/lab/timeline/${slug}`}
              aria-current={slug === variant ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center rounded-pill border border-line px-4 font-mono text-[12px]',
                slug === variant ? 'bg-ink text-white' : 'bg-white text-ink hover:border-ink',
              )}
            >
              {slug === 'current' ? 'Current' : `${slug.toUpperCase()} · ${name}`}
            </Link>
          ))}
        </div>
        <p className="mx-auto mt-2 mb-0 max-w-site text-[13px] text-muted">{entry.approach}</p>
      </nav>
      <Milestones />
      <Component />
      <BlogTeaser />
      <ScrollReveal />
    </PageShell>
  );
}
