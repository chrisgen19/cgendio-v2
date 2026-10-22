import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import type {WorkFilter} from '@/lib/work-filter';
import {getProjects} from '@/server/content';
import {ProjectCard} from './project-card';
import {WorkCount, WorkFilterProvider, WorkFilters, WorkGrid} from './work-browser';

type WorkProps = {
  /** The filter this prerendered variant starts with (`/?filter=…`). */
  filter: WorkFilter;
};

export async function Work({filter}: WorkProps) {
  // Every card is rendered so JavaScript can switch filters in place; the active filter hides the rest
  const projects = await getProjects();
  const counts = {
    all: projects.length,
    client: projects.filter((p) => p.group === 'client').length,
    personal: projects.filter((p) => p.group === 'personal').length,
  };

  return (
    <Section id="work" tone="white">
      <WorkFilterProvider initialFilter={filter} counts={counts}>
        <div className="flex flex-col gap-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div data-reveal className="flex flex-col gap-[18px]">
              <Eyebrow>
                Selected work · <WorkCount />
              </Eyebrow>
              <SectionHeading>
                Things we&apos;ve <Mark>shipped.</Mark>
              </SectionHeading>
            </div>
            <WorkFilters />
          </div>
          <WorkGrid>
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </WorkGrid>
        </div>
      </WorkFilterProvider>
    </Section>
  );
}
