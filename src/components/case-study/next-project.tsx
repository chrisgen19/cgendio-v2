import Link from 'next/link';
import {CaptureSkeleton} from '@/components/ui-site/capture-skeleton';
import {isOptimizableCover} from '@/components/ui-site/cover-image';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {LoadingImage} from '@/components/ui-site/loading-image';
import {brandPanelStyle, PROJECT_THEMES} from '@/components/ui-site/project-theme';
import {cn} from '@/lib/cn';
import type {ProjectDetail} from '@/server/content';

const ARROW = (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** The next project's cover in a browser window that runs off the band's right and bottom edges; it rises on hover and focus. */
function CoverPeek({src}: {src: string}) {
  return (
    <div aria-hidden="true" className="relative z-1 min-h-0 max-lg:ml-[clamp(24px,4.4vw,64px)] max-lg:h-[clamp(180px,42vw,320px)]">
      <div
        className={cn(
          'absolute top-14 -right-[clamp(20px,4vw,56px)] -bottom-16 left-0 overflow-hidden rounded-[16px] border border-ink/10 bg-white shadow-(--shadow-deep) max-lg:top-0 max-lg:rounded-[12px]',
          'transition-[translate] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-3 group-has-[a:focus-visible]:-translate-y-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-has-[a:focus-visible]:translate-y-0',
        )}
      >
        <div className="flex h-7 items-center gap-1.5 border-b border-line px-3.5 max-md:h-5 max-md:px-2.5">
          <span className="size-2 rounded-full bg-wire max-md:size-1.5" />
          <span className="size-2 rounded-full bg-wire max-md:size-1.5" />
          <span className="size-2 rounded-full bg-wire max-md:size-1.5" />
        </div>
        <div className="skeleton-host relative h-[calc(100%-28px)] max-md:h-[calc(100%-20px)]">
          <CaptureSkeleton />
          <LoadingImage
            src={src}
            alt=""
            width={1600}
            height={900}
            sizes="(max-width: 1080px) 100vw, 700px"
            unoptimized={!isOptimizableCover(src)}
            className="relative h-full w-full object-cover object-left-top"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The "Next project" link under a case study, in the order of the Work grid: one link the width of the page, in that
 * project's brand tint (its theme without one), with its kind, title, summary and cover (its glyph without one).
 */
export function NextProject({project}: {project: ProjectDetail | null}) {
  if (!project) return null;
  const brand = brandPanelStyle(project.brandColor, project.brandTint);
  return (
    <nav aria-label="Next project" className="px-14 pt-14 pb-28 max-md:px-5 max-md:pt-10 max-md:pb-18">
      <div className="mx-auto max-w-site">
        <div
          data-theme={!brand && project.theme === 'lime' ? 'light' : undefined}
          style={brand}
          className={cn(
            'group relative grid min-h-[440px] overflow-hidden rounded-cta shadow-(--shadow-deep) lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12',
            // The ring sits outside the panel, on the page ground, so it keeps the site accent (not the brand's)
            'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-accent',
            brand ? 'brand-panel bg-(--brand-bg) text-ink' : PROJECT_THEMES[project.theme],
          )}
        >
          <div className="flex flex-col justify-between gap-12 p-[clamp(24px,4.4vw,64px)] max-lg:gap-8 max-lg:pb-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Eyebrow tone="ink">Next project</Eyebrow>
              <span aria-hidden="true" className={cn('h-px w-6 bg-current max-md:hidden', brand ? 'text-(--brand-accent)' : 'opacity-40')} />
              <span className="font-mono text-[12px] leading-none tracking-[0.08em] opacity-80">{project.kindLabel}</span>
            </div>
            <div className="flex flex-col gap-6 max-md:gap-4">
              {/* The title is the link, stretched over the whole card: its name is the title, and the rest stays readable text */}
              <Link
                href={`/projects/${project.slug}`}
                className="max-w-[14ch] font-display text-[clamp(40px,5.4vw,80px)] leading-[0.96] font-bold tracking-[-0.045em] text-balance text-inherit no-underline after:absolute after:inset-0 after:z-2 after:content-[''] hover:text-inherit focus-visible:outline-none"
              >
                {project.title}
              </Link>
              <span className="max-w-[46ch] text-lg leading-[1.55] opacity-80 max-md:text-base">{project.summary}</span>
              <span
                className={cn(
                  'mt-2 inline-flex min-h-13 items-center gap-3 self-start rounded-pill pr-2 pl-6 text-[15px] font-semibold transition-colors duration-200 motion-reduce:transition-none',
                  brand
                    ? 'bg-(--brand-button) text-(--brand-on-button) group-hover:bg-ink group-hover:text-white'
                    : 'bg-ink text-white group-hover:bg-accent',
                )}
              >
                View case study
                <span className="grid size-9 place-items-center rounded-full bg-white/15 transition-[translate] duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                  {ARROW}
                </span>
              </span>
            </div>
          </div>
          {project.coverImageUrl ? (
            <CoverPeek src={project.coverImageUrl} />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                'relative z-1 self-end justify-self-end p-[clamp(24px,4.4vw,64px)] font-display text-[clamp(80px,11vw,168px)] leading-[0.82] font-extrabold tracking-[-0.06em]',
                brand && 'text-(--brand-accent)',
              )}
            >
              {project.glyph}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
