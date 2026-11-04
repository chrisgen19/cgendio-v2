import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {cn} from '@/lib/cn';
import {slugify} from '@/lib/slugify';
import {reasoningRows} from '@/lib/tour';
import type {ProjectDetail} from '@/server/content';
import {WriteUpIndex, type WriteUpIndexItem} from './write-up-index';
import {CHAPTER, CHAPTER_HEADING, renderWriteUp, STATEMENT} from './write-up-markdown';

type Reason = {id: string; label: string; text: string};

/** A reasoning row as a closing chapter, in the same shape as the write-up's own. */
function ReasonChapter({id, label, text}: Reason) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={CHAPTER}>
      <h3 id={`${id}-title`} className={CHAPTER_HEADING}>
        {label}
      </h3>
      <div className={STATEMENT}>
        <p className="whitespace-pre-line">{text}</p>
      </div>
    </section>
  );
}

/**
 * The write-up after the tour, as chapters: the heading and a sticky jump index beside the Markdown's short sections,
 * set as large statements. A plain bullet list becomes a checklist, and the reasoning rows with text close the block.
 */
export async function WriteUp({project}: {project: ProjectDetail}) {
  const written = project.caseStudy?.trim() ? await renderWriteUp(project.caseStudy) : null;
  // The "reasoning-" prefix keeps these ids apart from the write-up's "write-up-" ones
  const reasons: Reason[] = reasoningRows(project).map(({label, text}) => ({id: `reasoning-${slugify(label)}`, label, text}));
  if (!written && reasons.length === 0) return null;
  const index: WriteUpIndexItem[] = [
    ...(written?.chapters ?? []).map(({id, label}) => ({id, label, group: 'write-up' as const})),
    ...reasons.map(({id, label}) => ({id, label, group: 'reasoning' as const})),
  ];
  return (
    <div className="border-y border-line bg-white px-14 py-28 max-md:px-5 max-md:py-18">
      <section
        aria-labelledby="write-up-heading"
        className="write-up-block mx-auto grid max-w-site grid-cols-[minmax(0,1fr)] gap-y-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-x-24"
      >
        <div className="max-lg:contents lg:sticky lg:top-12 lg:flex lg:flex-col lg:gap-12 lg:self-start">
          <div className="flex flex-col gap-5">
            <Eyebrow>The write-up</Eyebrow>
            <h2 id="write-up-heading" className="m-0 font-display text-[clamp(36px,3.6vw,52px)] leading-[0.98] font-bold tracking-[-0.04em]">
              The <Mark>short</Mark> version
            </h2>
          </div>
          {index.length > 1 ? <WriteUpIndex items={index} /> : null}
        </div>
        <div className="write-up-content flex flex-col">
          {written?.content}
          {reasons.length > 0 ? (
            <div className={cn('flex flex-col', written && 'mt-4 border-t-2 border-ink pt-10 lg:pt-14')}>
              <Eyebrow>Reasoning</Eyebrow>
              <div className="flex flex-col pt-8">
                {reasons.map((reason) => (
                  <ReasonChapter key={reason.id} {...reason} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
