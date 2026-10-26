import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import type {TimelineDot} from '@/server/content';
import {getPageCopy, getSiteSettings, getTimeline} from '@/server/content';
import {TimelineV1Stage} from './timeline-v1-stage';

const DOTS: Record<TimelineDot, string> = {
  lime: 'bg-lime',
  accent: 'bg-accent',
  ink: 'bg-ink',
  placeholder: 'bg-dot-placeholder',
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * V1, the scroll-drawn rail. The server HTML is the finished state: the rail fully drawn and every stop lit. With
 * JavaScript and motion welcome, TimelineV1Stage arms it: the rail fills in accent as the list passes a reading line
 * 60% down the viewport, and each stop lights up (dot, date, role, org) as the fill reaches it. Styles: the
 * `timeline-lab v1` block in globals.css.
 */
export async function TimelineV1() {
  const [entries, copy, settings] = await Promise.all([getTimeline(), getPageCopy(), getSiteSettings()]);
  const total = pad(entries.length);
  return (
    <Section id="timeline" tone="white">
      <TimelineV1Stage className="tl1 relative grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-start gap-16 max-md:grid-cols-1 max-md:gap-10">
        <div className="flex flex-col md:sticky md:top-10">
          <div data-reveal className="flex flex-col gap-[18px]">
            <Eyebrow>{copy['timeline.eyebrow']}</Eyebrow>
            <SectionHeading>
              <MarkedText text={copy['timeline.heading']} />
            </SectionHeading>
            <p className="m-0 max-w-[360px] text-base leading-[1.55] text-muted">{copy['timeline.lede']}</p>
            {/* Only once a CV is uploaded in admin Settings */}
            {settings.cvUrl ? (
              <Button href={settings.cvUrl} variant="secondary" size="sm" className="mt-2 self-start">
                {copy['timeline.cvLabel']}
              </Button>
            ) : null}
          </div>
          {/* A quiet echo of the rail in the sticky column: how many stops are lit. Shown only when the rail is armed. */}
          <div aria-hidden="true" className="tl1-meter mt-9 items-center gap-4">
            <span className="font-mono text-[12px] tracking-[0.04em] text-muted tabular-nums">
              <span data-tl1-count className="text-ink">
                {total}
              </span>{' '}
              / {total}
            </span>
            <span className="flex gap-1.5">
              {entries.map((entry) => (
                <span key={entry.order} data-tl1-tick className="tl1-tick block h-0.5 w-6 rounded-pill" />
              ))}
            </span>
          </div>
        </div>
        <ol className="m-0 flex list-none flex-col p-0">
          {entries.map((entry) => (
            <li
              key={entry.order}
              data-tl1-stop
              data-current={entry.isCurrent || undefined}
              className="tl1-stop relative grid grid-cols-[170px_32px_minmax(0,1fr)] gap-x-6 pb-12 last:pb-4 max-md:grid-cols-[16px_minmax(0,1fr)] max-md:gap-x-4 max-md:gap-y-2 max-md:pb-10"
            >
              <span className="tl1-when pt-1.5 font-mono text-[13px] leading-5 max-md:col-start-2 max-md:row-start-1 max-md:pt-0">{entry.when}</span>
              <span className="max-md:col-start-1 max-md:row-start-1 max-md:pt-0.5">
                <span
                  data-tl1-node
                  className="tl1-node relative z-1 grid size-8 place-items-center rounded-full border-2 bg-white max-md:size-4 max-md:border-[1.5px]"
                >
                  <span className={`tl1-pip block size-3 rounded-full max-md:size-1.5 ${DOTS[entry.dot]}`} />
                </span>
              </span>
              <div className="flex flex-col gap-2 max-md:col-start-2 max-md:row-start-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="tl1-role m-0 font-display text-[26px] leading-[1.15] font-bold tracking-[-0.03em] max-md:text-[22px]">
                    {entry.role}
                  </h3>
                  {entry.isCurrent ? (
                    <span data-theme="light" className="rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px] leading-none text-on-lime">
                      NOW
                    </span>
                  ) : null}
                </div>
                <span className="tl1-org text-[15px] font-semibold">{entry.org}</span>
                <p className="m-0 max-w-[620px] text-base leading-[1.6] text-muted max-md:text-[15px]">{entry.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </TimelineV1Stage>
    </Section>
  );
}
