import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {slugify} from '@/lib/slugify';
import {reasoningRows} from '@/lib/tour';
import type {ProjectDetail} from '@/server/content';
import {FIELD, FIELD_LABEL, renderWriteUp, STATEMENT} from './write-up-markdown';
import {type WriteUpField, WriteUpTabs} from './write-up-tabs';

type Reason = {id: string; label: string; text: string};

/** Our part and the result, pinned beside the heading when they're written: what a reader looks for first. */
const PINNED = new Set(['Our part', 'The result']);

function PinnedField({id, label, text}: Reason) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-2.5 border-t border-line py-6 first:border-t-2 first:border-ink">
      <h3 id={`${id}-title`} className="m-0 font-body text-[15px] leading-tight font-semibold text-muted">
        {label}
      </h3>
      <p className="m-0 max-w-[36ch] font-display text-[22px] leading-[1.22] font-semibold tracking-[-0.02em] text-pretty whitespace-pre-line text-ink">
        {text}
      </p>
    </section>
  );
}

/**
 * The write-up after the tour, as a build sheet. Our part and the result (when written) are pinned under the heading;
 * the Markdown's chapters, plus the decision, are the sheet's fields: tabs on wide screens, stacked everywhere else.
 */
export async function WriteUp({project}: {project: ProjectDetail}) {
  const written = project.caseStudy?.trim() ? await renderWriteUp(project.caseStudy) : null;
  // The "reasoning-" prefix keeps these ids apart from the write-up's "write-up-" ones
  const reasons: Reason[] = reasoningRows(project).map(({label, text}) => ({id: `reasoning-${slugify(label)}`, label, text}));
  const pinned = reasons.filter(({label}) => PINNED.has(label));
  const decision = reasons.find(({label}) => !PINNED.has(label));
  if (!written && reasons.length === 0) return null;
  const fields: WriteUpField[] = [...(written?.chapters ?? []), ...(decision ? [{id: decision.id, label: decision.label}] : [])];
  const tabbed = fields.length > 1 && !written?.headless;

  return (
    <div className="border-y border-line bg-white px-14 py-28 max-md:px-5 max-md:py-18">
      <section
        aria-labelledby="write-up-heading"
        className="mx-auto grid max-w-site grid-cols-[minmax(0,1fr)] gap-y-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-16"
      >
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <Eyebrow>The write-up</Eyebrow>
            <h2 id="write-up-heading" className="m-0 font-display text-[clamp(40px,4.2vw,60px)] leading-[0.98] font-bold tracking-[-0.04em]">
              The <Mark>short</Mark> version
            </h2>
          </div>
          {pinned.length > 0 ? (
            <div className="flex flex-col">
              {pinned.map((reason) => (
                <PinnedField key={reason.id} {...reason} />
              ))}
            </div>
          ) : null}
        </div>
        {fields.length > 0 || written ? (
          <div className="rounded-panel border border-line bg-ground p-[clamp(20px,3.4vw,44px)] max-md:-mx-1">
            <WriteUpTabs fields={fields} tabbed={tabbed}>
              {written?.content}
              {decision ? (
                <section id={decision.id} aria-labelledby={`${decision.id}-title`} data-active={written ? undefined : ''} className={FIELD}>
                  <h3 id={`${decision.id}-title`} className={FIELD_LABEL}>
                    {decision.label}
                  </h3>
                  <div className={STATEMENT}>
                    <p className="whitespace-pre-line">{decision.text}</p>
                  </div>
                </section>
              ) : null}
            </WriteUpTabs>
          </div>
        ) : null}
      </section>
    </div>
  );
}
