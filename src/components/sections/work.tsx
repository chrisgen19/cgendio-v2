import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import type {WorkFilter} from '@/lib/work-filter';
import {stackPlaces} from '@/lib/work-stack';
import {getPageCopy, getProjects} from '@/server/content';
import {ProjectCard} from './project-card';
import {WorkCount, WorkFilterProvider, WorkFilters, WorkStack} from './work-browser';

type WorkProps = {
  /** The filter this prerendered variant starts with (`/?filter=…`). */
  filter: WorkFilter;
};

/** Selected work: full-width project cards that pin and stack as the visitor scrolls (`.work-card` in globals.css). */
export async function Work({filter}: WorkProps) {
  // Every card is rendered so JavaScript can switch filters in place; the active filter hides the rest
  const [projects, copy] = await Promise.all([getProjects(), getPageCopy()]);
  const counts = {
    all: projects.length,
    client: projects.filter((p) => p.group === 'client').length,
    personal: projects.filter((p) => p.group === 'personal').length,
  };
  const places = stackPlaces(projects);

  return (
    <Section id="work" tone="white">
      <WorkFilterProvider initialFilter={filter} counts={counts}>
        <div className="flex flex-col gap-12 max-md:gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div data-reveal className="flex flex-col gap-[18px]">
              <Eyebrow>
                {copy['work.eyebrow']} · <WorkCount />
              </Eyebrow>
              <SectionHeading>
                <MarkedText text={copy['work.heading']} />
              </SectionHeading>
            </div>
            <WorkFilters />
          </div>
          <WorkStack count={projects.length}>
            {projects.map((project, n) => (
              <ProjectCard key={project.slug} project={project} place={places[n]} />
            ))}
          </WorkStack>
        </div>
      </WorkFilterProvider>
    </Section>
  );
}
