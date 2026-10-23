import {Tag} from '@/components/ui-site/tag';
import {cn} from '@/lib/cn';
import type {Project, ProjectSpan, ProjectTheme} from '@/server/content';

// Full class names so Tailwind can see them
const SPANS: Record<ProjectSpan, string> = {
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
};

const THEMES: Record<ProjectTheme, string> = {
  ink: 'bg-ink text-white',
  tint: 'bg-tint text-accent',
  lime: 'bg-lime text-ink',
  gray: 'bg-thumb text-ink',
};

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({project}: ProjectCardProps) {
  return (
    <article data-reveal data-group={project.group} className={cn('group flex flex-col gap-5 max-md:col-span-12', SPANS[project.span])}>
      <div
        className={cn(
          'relative flex h-80 flex-col justify-between overflow-hidden rounded-panel p-6 transition-transform duration-450 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1 group-hover:-rotate-[0.4deg] motion-reduce:transition-none max-md:h-60',
          // The two outline circles in the top-right corner
          "before:absolute before:-top-20 before:-right-15 before:size-65 before:rounded-full before:border-[1.5px] before:border-current before:opacity-14 before:content-['']",
          "after:absolute after:-top-40 after:-right-35 after:size-105 after:rounded-full after:border-[1.5px] after:border-current after:opacity-14 after:content-['']",
          THEMES[project.theme],
        )}
      >
        <div className="relative z-1 flex items-start justify-between">
          <span className="font-mono text-[12px] tracking-[0.08em]">{project.kindLabel}</span>
          <span className="inline-grid size-11 place-items-center rounded-full border-[1.5px] border-current">
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
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </div>
        <span className="relative z-1 font-display text-[76px] leading-[0.9] font-extrabold tracking-[-0.05em] max-md:text-[56px]">
          {project.glyph}
        </span>
      </div>
      <div className="flex flex-col gap-3 px-1">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Tag key={tag} size="sm">
              {tag}
            </Tag>
          ))}
        </div>
        <h3 className="m-0 font-display text-[28px] leading-[1.1] font-bold tracking-[-0.03em]">{project.title}</h3>
        <p className="m-0 max-w-[560px] text-base leading-[1.55] text-muted">{project.summary}</p>
        {/* Case studies arrive in Phase 6; until then this stays on #work, as in the canvas */}
        <a
          href="#work"
          className="relative inline-flex items-center gap-2 self-start border-b-[1.5px] border-ink pb-[3px] text-[15px] font-semibold text-ink no-underline after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] hover:border-accent hover:text-accent"
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
        </a>
      </div>
    </article>
  );
}
