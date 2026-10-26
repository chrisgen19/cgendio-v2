import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy, getSiteSettings, getTimeline} from '@/server/content';
import {type CounterStop, TimelineV5Counter} from './timeline-v5-counter';
import {parseStartYear} from './timeline-v5-years';

const LIST_ID = 'tlv5-roles';

/**
 * Variant 5, "Year counter": an editorial list of roles beside a giant sticky year that rolls, odometer style, to each
 * role's start year as it reaches the reading line. Every entry keeps its own visible `when`; the counter is decoration.
 */
export async function TimelineV5() {
  const [entries, copy, settings] = await Promise.all([getTimeline(), getPageCopy(), getSiteSettings()]);
  const stops: CounterStop[] = entries.map((entry) => ({year: parseStartYear(entry.when), when: entry.when}));

  return (
    <Section id="timeline" tone="white" innerClassName="flex flex-col gap-16 max-md:gap-10">
      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-end gap-16 max-md:grid-cols-1 max-md:gap-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['timeline.eyebrow']}</Eyebrow>
          <SectionHeading>
            <MarkedText text={copy['timeline.heading']} />
          </SectionHeading>
        </div>
        <div data-reveal className="flex flex-col items-start gap-5">
          <p className="m-0 max-w-[420px] text-lg leading-[1.55] text-muted max-md:text-base">{copy['timeline.lede']}</p>
          {/* Only once a CV is uploaded in admin Settings */}
          {settings.cvUrl ? (
            <Button href={settings.cvUrl} variant="secondary" size="sm">
              {copy['timeline.cvLabel']}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-16 max-md:grid-cols-1 max-md:gap-0">
        <div className="tlv5-rail @container max-md:hidden">
          <TimelineV5Counter stops={stops} listId={LIST_ID} />
        </div>

        <ol id={LIST_ID} className="m-0 flex list-none flex-col p-0">
          {entries.map((entry, i) => {
            const year = stops[i]?.year;
            return (
              <li
                key={entry.order}
                data-tlv5-active={i === 0 || undefined}
                className="tlv5-entry border-t border-line pt-8 pb-30 last:pb-20 max-md:pt-7 max-md:pb-16 max-md:last:pb-0"
              >
                <div className="flex flex-col gap-3.5">
                  {year ? (
                    <span
                      aria-hidden="true"
                      className="tlv5-year hidden font-display text-[56px] leading-[0.9] font-extrabold tracking-[-0.04em] max-md:block"
                    >
                      {year}
                    </span>
                  ) : null}
                  {/* 24px tall with or without the NOW pill, so the date sits level with the counter's on the reading line */}
                  <div className="flex min-h-6 flex-wrap items-center gap-3 font-mono text-[13px] leading-none text-muted uppercase">
                    <span aria-hidden="true" className="text-ink tabular-nums max-md:hidden">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="tracking-[0.04em]">{entry.when}</span>
                    {entry.isCurrent ? (
                      <span data-theme="light" className="rounded-pill bg-lime px-[9px] py-1.5 text-[11px] text-on-lime">
                        NOW
                      </span>
                    ) : null}
                  </div>
                  <h3 className="m-0 mt-1 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.03em] text-balance max-md:text-[26px]">
                    {entry.role}
                  </h3>
                  <p className="m-0 text-[17px] leading-[1.45] font-semibold text-accent">
                    <span className="tlv5-org">{entry.org}</span>
                  </p>
                  <p className="m-0 mt-1 max-w-[560px] text-base leading-[1.6] text-muted">{entry.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
