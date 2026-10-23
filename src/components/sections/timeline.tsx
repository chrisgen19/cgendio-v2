import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import type {TimelineDot} from '@/server/content';
import {getPageCopy, getSiteSettings, getTimeline} from '@/server/content';

const DOTS: Record<TimelineDot, string> = {
  lime: 'bg-lime',
  accent: 'bg-accent',
  ink: 'bg-ink',
  placeholder: 'bg-dot-placeholder',
};

export async function Timeline() {
  const [entries, copy, settings] = await Promise.all([getTimeline(), getPageCopy(), getSiteSettings()]);
  return (
    <Section
      id="timeline"
      tone="white"
      innerClassName="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-start gap-16 max-md:grid-cols-1 max-md:gap-8"
    >
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
      <ol className="m-0 flex list-none flex-col p-0">
        {entries.map((entry) => (
          <li key={entry.order} data-reveal className="grid grid-cols-[170px_32px_minmax(0,1fr)] gap-6 pb-10 max-md:grid-cols-1 max-md:gap-2">
            <span className="pt-1.5 font-mono text-[13px] text-muted">{entry.when}</span>
            <div className="relative before:absolute before:top-0 before:-bottom-2 before:left-[15px] before:w-0.5 before:bg-line before:content-[''] max-md:hidden">
              <span className="relative z-1 grid size-8 place-items-center rounded-full border-2 border-line bg-white">
                <span className={`block size-3 rounded-full ${DOTS[entry.dot]}`} />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="m-0 font-display text-[26px] font-bold tracking-[-0.03em]">{entry.role}</h3>
                {entry.isCurrent ? <span className="rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px]">NOW</span> : null}
              </div>
              <span className="text-[15px] font-semibold text-accent">{entry.org}</span>
              <p className="m-0 max-w-[620px] text-base leading-[1.6] text-muted">{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
