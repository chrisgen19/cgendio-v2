import Link from 'next/link';
import type {ReactNode} from 'react';
import {renderMarkdown} from '@/components/prose/markdown';
import {CoverImage} from '@/components/ui-site/cover-image';
import {PROJECT_RINGS, PROJECT_THEMES} from '@/components/ui-site/project-theme';
import {Section} from '@/components/ui-site/section';
import {Tag} from '@/components/ui-site/tag';
import {cn} from '@/lib/cn';
import type {ProjectDetail} from '@/server/content';

const EXTERNAL_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

function Fact({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="font-mono text-xs tracking-[0.06em] text-muted uppercase">{label}</dt>
      <dd className="m-0 text-base leading-[1.45]">{children}</dd>
    </div>
  );
}

function ExternalLink({href, children}: {href: string; children: ReactNode}) {
  return (
    <a href={href} rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold">
      {children}
      {EXTERNAL_ICON}
    </a>
  );
}

/**
 * A case study: a hero band in the project's thumb theme, the title and summary, a facts row (client, role, stack and
 * links when present) and the Markdown write-up. Missing facts stay as visible placeholders.
 */
export async function CaseStudyArticle({project}: {project: ProjectDetail}) {
  const markdown = project.caseStudy?.trim() ? await renderMarkdown(project.caseStudy) : null;
  const client = project.client ?? (project.group === 'personal' ? 'Personal project' : '[Client]');
  return (
    <article>
      <Section padding="cta" innerClassName="flex flex-col gap-6 pt-6 max-md:pt-0">
        <Link
          href="/#work"
          className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-semibold text-ink no-underline hover:text-accent"
        >
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
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          All work
        </Link>
        <div
          data-theme="light"
          className={cn(
            'relative flex min-h-90 flex-col justify-between gap-10 overflow-hidden rounded-panel p-[clamp(24px,4vw,48px)] max-md:min-h-70',
            PROJECT_RINGS,
            PROJECT_THEMES[project.theme],
          )}
        >
          <span className="relative z-1 font-mono text-[12px] tracking-[0.08em]">{project.kindLabel}</span>
          <span
            aria-hidden="true"
            className="relative z-1 font-display text-[clamp(64px,11vw,148px)] leading-[0.9] font-extrabold tracking-[-0.05em] break-words"
          >
            {project.glyph}
          </span>
        </div>
        <h1 className="m-0 mt-4 max-w-[20ch] font-display text-[clamp(40px,5vw,64px)] leading-[1.02] font-bold tracking-[-0.04em]">
          {project.title}
        </h1>
        <p className="m-0 max-w-[640px] text-lg leading-[1.55] text-muted max-md:text-base">{project.summary}</p>
      </Section>
      <Section tone="white" innerClassName="flex flex-col gap-12">
        <dl className="m-0 grid grid-cols-4 gap-6 border-y border-line py-7 max-lg:grid-cols-2 max-md:grid-cols-1">
          <Fact label="Client">{client}</Fact>
          <Fact label="Role">{project.role ?? '[Role]'}</Fact>
          <Fact label="Stack">
            <span className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Tag key={tag} size="sm">
                  {tag}
                </Tag>
              ))}
            </span>
          </Fact>
          {project.liveUrl || project.repoUrl ? (
            <div className="flex flex-col gap-2">
              {project.liveUrl ? <ExternalLink href={project.liveUrl}>Live site</ExternalLink> : null}
              {project.repoUrl ? <ExternalLink href={project.repoUrl}>Repository</ExternalLink> : null}
            </div>
          ) : null}
        </dl>
        {project.coverImageUrl ? <CoverImage src={project.coverImageUrl} /> : null}
        {markdown ? markdown.content : <p className="m-0 max-w-[68ch] text-lg leading-[1.7] text-muted">[Case study write-up]</p>}
      </Section>
    </article>
  );
}
