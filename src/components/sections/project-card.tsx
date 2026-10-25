import Image from 'next/image';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import {isOptimizableCover} from '@/components/ui-site/cover-image';
import {PROJECT_RINGS} from '@/components/ui-site/project-theme';
import {Tag} from '@/components/ui-site/tag';
import {cn} from '@/lib/cn';
import type {StackPlace} from '@/lib/work-stack';
import type {Project, ProjectTheme} from '@/server/content';

/*
 * Card colours per project theme. Unlike the case study thumb, text on the tint card is ink (the accent is kept for the
 * glyph), and the lime card is a light island so it stays lime with ink text in dark mode.
 */
const CARD_THEMES: Record<ProjectTheme, string> = {
  ink: 'bg-thumb-ink text-on-dark shadow-(--shadow-thumb)',
  tint: 'bg-tint text-ink',
  lime: 'bg-lime text-on-lime',
  gray: 'bg-thumb text-ink',
};

// The pill link: the primary button, except on the ink card where it turns lime
const LINK_THEMES: Record<ProjectTheme, string> = {
  ink: 'bg-lime text-on-lime hover:bg-on-dark hover:text-on-lime',
  tint: 'bg-ink text-white hover:bg-accent hover:text-white',
  lime: 'bg-ink text-white hover:bg-accent hover:text-white',
  gray: 'bg-ink text-white hover:bg-accent hover:text-white',
};

type ProjectCardProps = {
  project: Project;
  /** Its place in the Work stack, set as the CSS variables the `.work-card` styles read (see globals.css). */
  place: StackPlace;
};

export function ProjectCard({project, place}: ProjectCardProps) {
  const style = {
    '--own': place.own,
    '--i-all': place.index.all,
    '--i-client': place.index.client,
    '--i-personal': place.index.personal,
    '--next-all': place.next.all,
    '--next-client': place.next.client,
    '--next-personal': place.next.personal,
  } as CSSProperties;

  return (
    <article
      data-group={project.group}
      data-theme={project.theme === 'lime' ? 'light' : undefined}
      style={style}
      className={cn(
        'work-card overflow-hidden rounded-panel shadow-(--shadow-deep) max-md:before:hidden max-md:after:hidden',
        PROJECT_RINGS,
        CARD_THEMES[project.theme],
      )}
    >
      <div className="relative z-1 grid h-full grid-cols-[minmax(0,5fr)_minmax(0,7fr)] max-md:flex max-md:flex-col">
        <div className="flex flex-col justify-between gap-6 p-10 max-lg:p-8 max-md:justify-start max-md:gap-3.5 max-md:p-5 max-md:pb-4">
          <p className="m-0 flex items-center gap-3 font-mono text-[12px] leading-none font-medium tracking-[0.08em]">
            <span aria-hidden="true" className="work-num" />
            <span aria-hidden="true" className="h-px w-6 bg-current opacity-40" />
            {project.kindLabel}
          </p>
          <div className="flex flex-col gap-4 max-md:gap-3">
            <h3 className="m-0 font-display text-[clamp(32px,3.4vw,52px)] leading-[1.02] font-bold tracking-[-0.035em] max-md:text-[28px]">
              {project.title}
            </h3>
            <p className="m-0 max-w-[440px] text-[17px] leading-[1.55] opacity-80 max-md:text-[15px] max-md:leading-[1.5]">{project.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Tag key={tag} size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
            <Link
              href={`/work/${project.slug}`}
              className={cn(
                'mt-2 inline-flex min-h-11 items-center gap-2.5 self-start rounded-pill px-[18px] text-sm leading-none font-semibold no-underline transition-[background-color,color,translate] duration-200 hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-md:mt-1',
                LINK_THEMES[project.theme],
              )}
            >
              View case study<span className="sr-only">: {project.title}</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
        <ProjectMedia project={project} />
      </div>
    </article>
  );
}

/** The cover in a browser window that runs off the card's right and bottom edges, or the glyph when there's no cover. */
function ProjectMedia({project}: {project: Project}) {
  const src = project.coverImageUrl;
  if (!src) {
    return (
      <div aria-hidden="true" className="relative flex min-h-0 flex-1 items-end justify-end p-10 max-md:justify-start max-md:p-5">
        <span
          className={cn(
            'font-display text-[clamp(96px,12vw,184px)] leading-[0.82] font-extrabold tracking-[-0.06em] max-md:text-[72px]',
            project.theme === 'tint' && 'text-accent',
          )}
        >
          {project.glyph}
        </span>
      </div>
    );
  }
  return (
    <div className="work-media relative min-h-0 flex-1 max-md:mx-5">
      <div className="absolute top-12 -bottom-10 left-0 w-[130%] overflow-hidden rounded-[16px] border border-ink/10 bg-white shadow-(--shadow-card) max-md:top-0 max-md:-bottom-6 max-md:w-[125%] max-md:rounded-[12px]">
        <div aria-hidden="true" className="flex h-7 items-center gap-1.5 border-b border-line px-3.5 max-md:h-5 max-md:px-2.5">
          <span className="size-2 rounded-full bg-wire max-md:size-1.5" />
          <span className="size-2 rounded-full bg-wire max-md:size-1.5" />
          <span className="size-2 rounded-full bg-wire max-md:size-1.5" />
        </div>
        <Image
          src={src}
          alt=""
          width={1600}
          height={900}
          sizes="(max-width: 860px) 110vw, 900px"
          unoptimized={!isOptimizableCover(src)}
          className="h-[calc(100%-28px)] w-full object-cover object-left-top max-md:h-[calc(100%-20px)]"
        />
      </div>
    </div>
  );
}
