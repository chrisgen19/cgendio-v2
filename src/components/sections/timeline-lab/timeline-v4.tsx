import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import type {TimelineDot, TimelineEntry} from '@/server/content';
import {getPageCopy, getSiteSettings, getTimeline} from '@/server/content';
import {TimelineV4Track} from './timeline-v4-track';
import {startLabel} from './timeline-v4-when';

const HEADING_ID = 'tl-v4-heading';

const DOTS: Record<TimelineDot, string> = {
  lime: 'bg-lime',
  accent: 'bg-accent',
  ink: 'bg-ink',
  placeholder: 'bg-dot-placeholder',
};

function NowBadge() {
  return (
    <span data-theme="light" className="shrink-0 rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px] leading-none">
      NOW
    </span>
  );
}

/** One role: its card, then the stretch of year ruler it starts on (labelled with the parsed start, ticks only if `when` doesn't parse). */
function RoleItem({entry}: {entry: TimelineEntry}) {
  const id = `tl-v4-role-${entry.order}`;
  const label = startLabel(entry.when);
  return (
    <li className="tl-v4-item group/item flex flex-col max-md:w-[min(85vw,340px)] max-md:shrink-0 max-md:snap-start max-md:pr-4 max-md:last:w-[calc(min(85vw,340px)-16px)] max-md:last:pr-0">
      <article
        data-v4-card
        aria-labelledby={id}
        className={`flex flex-1 flex-col gap-3 rounded-card border p-7 transition-[translate,border-color,box-shadow] duration-300 ease-out max-md:p-6 group-data-active/item:-translate-y-1.5 group-data-active/item:shadow-(--shadow-card) motion-reduce:transition-none ${
          entry.isCurrent ? 'border-accent/35 bg-tint' : 'border-line bg-white group-data-active/item:border-ink'
        }`}
      >
        <div className="flex min-h-[23px] items-center justify-between gap-3">
          <span className="font-mono text-[13px] text-muted tabular-nums">{entry.when}</span>
          {entry.isCurrent ? <NowBadge /> : null}
        </div>
        <h3 id={id} className="m-0 font-display text-[26px] leading-[1.08] font-bold tracking-[-0.03em] text-balance max-md:text-[23px]">
          {entry.role}
        </h3>
        <span className="text-[15px] leading-[1.35] font-semibold text-accent">{entry.org}</span>
        <p className="m-0 mt-1 text-[15px] leading-[1.6] text-muted">{entry.description}</p>
      </article>
      <div aria-hidden="true" className="tl-v4-ruler relative mt-5 h-12 border-t border-line max-md:h-9">
        <span className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(to_right,var(--color-line)_0_1px,transparent_1px_16px)]" />
        <span className="absolute top-0 left-0 h-5 w-px bg-muted" />
        <span className={`absolute -top-[5px] -left-1 size-[9px] rounded-full ring-2 ring-white ${DOTS[entry.dot]}`} />
        {label ? <span className="absolute top-3 left-3 font-mono text-[12px] leading-none text-muted tabular-nums">{label}</span> : null}
      </div>
    </li>
  );
}

/**
 * v4 "Pinned horizontal track": the roles run oldest to newest, left to right, like a year ruler read in the reading
 * direction, so the journey ends on the NOW card. The current role is also named in the intro, so a recruiter sees it
 * before any panning. The server HTML is the complete, static layout; the pin and pan are added on the client.
 */
export async function TimelineV4() {
  const [entries, copy, settings] = await Promise.all([getTimeline(), getPageCopy(), getSiteSettings()]);
  // Seed order is newest first; the track reads oldest first, and the DOM order follows what is on screen
  const chronological = [...entries].sort((a, b) => b.order - a.order);
  const current = entries.find((entry) => entry.isCurrent);

  const intro = (
    <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
      <div data-reveal className="flex flex-col gap-[18px]">
        <Eyebrow>{copy['timeline.eyebrow']}</Eyebrow>
        <SectionHeading id={HEADING_ID}>
          <MarkedText text={copy['timeline.heading']} />
        </SectionHeading>
      </div>
      <div data-reveal className="flex max-w-[440px] flex-col gap-4">
        <p className="m-0 text-base leading-[1.55] text-muted">{copy['timeline.lede']}</p>
        {current ? (
          <p className="m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-line pt-4 text-[15px] leading-[1.35]">
            <NowBadge />
            <b className="font-semibold">{current.role}</b>
            <span className="font-semibold text-accent">{current.org}</span>
          </p>
        ) : null}
        {/* Only once a CV is uploaded in admin Settings */}
        {settings.cvUrl ? (
          <Button href={settings.cvUrl} variant="secondary" size="sm" className="self-start">
            {copy['timeline.cvLabel']}
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <Section id="timeline" tone="white" className="tl-v4 overflow-x-clip">
      <TimelineV4Track intro={intro} headingId={HEADING_ID} count={chronological.length}>
        {chronological.map((entry) => (
          <RoleItem key={entry.order} entry={entry} />
        ))}
      </TimelineV4Track>
    </Section>
  );
}
