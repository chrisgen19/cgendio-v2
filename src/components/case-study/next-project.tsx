import Link from 'next/link';
import {Section} from '@/components/ui-site/section';
import type {ContentLink} from '@/server/content';

/** The "Next project" link under a case study, in the order of the Work grid. */
export function NextProject({project}: {project: ContentLink | null}) {
  if (!project) return null;
  return (
    <Section padding="cta" className="pt-14">
      <Link
        href={`/work/${project.slug}`}
        className="group flex items-center justify-between gap-6 rounded-card border border-line bg-white p-6 text-ink no-underline shadow-card transition-colors duration-200 hover:border-ink hover:text-ink"
      >
        <span className="flex flex-col gap-2">
          <span className="font-mono text-xs tracking-[0.06em] text-muted uppercase">Next project</span>
          <span className="font-display text-[28px] leading-[1.1] font-bold tracking-[-0.03em] max-md:text-[22px]">{project.title}</span>
        </span>
        <span className="inline-grid size-11 shrink-0 place-items-center rounded-full border border-line transition-all duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    </Section>
  );
}
