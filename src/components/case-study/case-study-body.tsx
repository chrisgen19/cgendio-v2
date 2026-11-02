import {hasTour} from '@/lib/tour';
import type {ProjectDetail} from '@/server/content';
import {CaseStudyArticle} from './case-study-article';
import {Walkthrough} from './walkthrough';

/** The published page and the draft preview both choose here, so a preview shows what publishing will. */
export function CaseStudyBody({project}: {project: ProjectDetail}) {
  return hasTour(project.tourStops) ? <Walkthrough project={project} /> : <CaseStudyArticle project={project} />;
}
