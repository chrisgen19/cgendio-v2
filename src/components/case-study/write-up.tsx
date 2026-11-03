import {Check} from 'lucide-react';
import type {ReactNode} from 'react';
import {renderMarkdown} from '@/components/prose/markdown';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {cn} from '@/lib/cn';
import {reasoningRows} from '@/lib/tour';
import {splitWriteUp} from '@/lib/write-up';
import type {ProjectDetail} from '@/server/content';
import {WriteUpIndex, type WriteUpIndexItem} from './write-up-index';

type Chapter = {
  id: string;
  heading: string | null;
  group: WriteUpIndexItem['group'];
  body: ReactNode;
  items: string[] | null;
};

// The one-sentence paragraphs read as statements: display type, kept under about 45 characters a line
const STATEMENT =
  'max-w-[34ch] font-display text-[clamp(26px,2.5vw,36px)] leading-[1.16] font-semibold tracking-[-0.025em] text-pretty text-ink [&_p]:m-0 [&_p+p]:mt-5 [&_ul]:font-body [&_ul]:text-lg [&_ul]:font-normal [&_ul]:tracking-normal';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section';

/** The chapters: the write-up's `##` sections, then the reasoning rows that have text. Ids are unique and prefixed. */
const buildChapters = async (project: ProjectDetail): Promise<Chapter[]> => {
  const used = new Set<string>();
  const idFor = (heading: string) => {
    const base = `write-up-${slugify(heading)}`;
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };
  const sections = project.caseStudy?.trim() ? splitWriteUp(project.caseStudy) : [];
  const written = await Promise.all(
    sections.map(async (section, index) => ({
      id: idFor(section.heading ?? `lead-${index}`),
      heading: section.heading,
      group: 'write-up' as const,
      items: section.items,
      body: section.items ? null : (await renderMarkdown(section.markdown)).body,
    })),
  );
  const reasoning = reasoningRows(project).map(({label, text}) => ({
    id: idFor(label),
    heading: label,
    group: 'reasoning' as const,
    items: null,
    body: <p className="whitespace-pre-line">{text}</p>,
  }));
  return [...written, ...reasoning];
};

/** A plain bullet list as a checklist. Each tick fills as its item crosses the reading line (globals.css). */
function ScopeList({items}: {items: string[]}) {
  return (
    <ul className="m-0 grid list-none gap-x-10 p-0 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex min-h-15 items-center gap-4 border-b border-line py-3 text-lg leading-snug max-md:text-base">
          <span aria-hidden="true" className="write-up-tick grid size-7 shrink-0 place-items-center rounded-full bg-lime text-on-lime">
            <Check className="write-up-tick-icon size-4" strokeWidth={3} />
          </span>
          <span className="write-up-item-text">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ChapterSection({chapter}: {chapter: Chapter}) {
  const titleId = `${chapter.id}-title`;
  return (
    <section
      id={chapter.id}
      aria-labelledby={chapter.heading ? titleId : undefined}
      className="flex scroll-mt-24 flex-col gap-5 border-t border-line py-12 first:border-t-0 first:pt-0 lg:scroll-mt-12 lg:gap-6 lg:py-14"
    >
      {chapter.heading ? (
        <h3 id={titleId} className="m-0 font-display text-lg leading-tight font-bold tracking-[-0.01em] text-muted">
          {chapter.heading}
        </h3>
      ) : null}
      {chapter.items ? <ScopeList items={chapter.items} /> : <div className={STATEMENT}>{chapter.body}</div>}
    </section>
  );
}

/**
 * The write-up after the tour, as chapters: the heading and a sticky jump index beside the Markdown's short sections,
 * set as large statements. A plain bullet list becomes a checklist, and the reasoning rows with text close the block.
 */
export async function WriteUp({project}: {project: ProjectDetail}) {
  const chapters = await buildChapters(project);
  if (chapters.length === 0) return null;
  const index: WriteUpIndexItem[] = chapters.flatMap(({id, heading, group}) => (heading ? [{id, label: heading, group}] : []));
  const written = chapters.filter(({group}) => group === 'write-up');
  const reasoning = chapters.filter(({group}) => group === 'reasoning');
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
          {written.map((chapter) => (
            <ChapterSection key={chapter.id} chapter={chapter} />
          ))}
          {reasoning.length > 0 ? (
            <div className={cn('flex flex-col', written.length > 0 && 'mt-4 border-t-2 border-ink pt-10 lg:pt-14')}>
              <Eyebrow>Reasoning</Eyebrow>
              <div className="flex flex-col pt-8">
                {reasoning.map((chapter) => (
                  <ChapterSection key={chapter.id} chapter={chapter} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
