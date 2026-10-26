import type {CSSProperties} from 'react';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {stackPlaces, stackScope} from '@/lib/work-stack';
import {getPageCopy, getProjects} from '@/server/content';
import {ProjectCard} from './project-card';

/** Selected work: full-width project cards that pin and stack as the visitor scrolls (`.work-card` in globals.css). */
export async function Work() {
  const [projects, copy] = await Promise.all([getProjects(), getPageCopy()]);
  const places = stackPlaces(projects.length);

  return (
    <Section id="work" tone="white">
      <div className="flex flex-col gap-12 max-md:gap-8">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>
            {copy['work.eyebrow']} · ({String(projects.length).padStart(2, '0')})
          </Eyebrow>
          <SectionHeading>
            <MarkedText text={copy['work.heading']} />
          </SectionHeading>
        </div>
        <div style={{'--scope': stackScope(projects.length)} as CSSProperties} className="work-stack flex flex-col gap-6 max-md:gap-4">
          {projects.map((project, n) => (
            <ProjectCard key={project.slug} project={project} place={places[n]} />
          ))}
        </div>
      </div>
    </Section>
  );
}
