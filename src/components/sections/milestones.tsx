import type {CSSProperties} from 'react';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {cn} from '@/lib/cn';
import {getMilestones, getPageCopy} from '@/server/content';
import type {Milestone} from '@/server/content-schema';
import {MilestoneFit} from './milestone-fit';
import {MilestoneStage} from './milestone-stage';

const SECTION_ID = 'milestones';

/**
 * Every milestone at once on the dot-grid stage: what shows without JS, under reduced motion or on a short window.
 * `pinnable` hides it where the pinned stage takes over.
 */
function StaticStage({milestones, pinnable}: {milestones: Milestone[]; pinnable: boolean}) {
  return (
    <div
      className={cn(pinnable && 'ms-static', 'dot-grid rounded-panel border border-line px-12 py-4 shadow-(--shadow-card) max-md:px-5 max-md:py-2')}
    >
      <ol className="m-0 list-none p-0">
        {milestones.map((m) => (
          <li
            key={m.order}
            className="grid grid-cols-[minmax(0,200px)_minmax(0,1fr)_auto] items-center gap-x-10 border-b border-line py-7 last:border-b-0 max-md:grid-cols-[88px_minmax(0,1fr)] max-md:items-start max-md:gap-x-4 max-md:py-5"
          >
            <div className="@container min-w-0">
              <p
                className="ms-value ms-list-value m-0 w-fit font-display leading-[0.9] font-extrabold tracking-[-0.05em] whitespace-nowrap text-ink"
                // Code points, so a curly apostrophe counts once; sizes the value to fit its column (globals.css)
                style={{'--ms-chars': Math.max(2, [...m.value].length)} as CSSProperties}
              >
                {m.value}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="m-0 font-display text-2xl leading-[1.15] font-bold tracking-[-0.02em] text-ink max-md:text-lg">{m.title}</h3>
              <p className="m-0 max-w-[560px] text-base leading-[1.55] text-muted max-md:text-[15px]">{m.description}</p>
            </div>
            <span className="font-mono text-xs leading-none font-medium tracking-[0.08em] text-muted uppercase max-md:hidden">{m.kind}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Milestones on a dot-grid stage. With JS and motion allowed, the stage pins while the section scrolls past and plays
 * one milestone at a time, with a progress rail of jump buttons; otherwise it shows them all as a static list. Both are
 * server-rendered and CSS picks one (globals.css), so the section's height never changes after hydration.
 */
export async function Milestones() {
  const [milestones, copy] = await Promise.all([getMilestones(), getPageCopy()]);
  // One milestone has nothing to step through, so it keeps the static list
  const pinnable = milestones.length > 1;
  return (
    <Section id={SECTION_ID} innerClassName="flex flex-col gap-14 max-md:gap-9">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['milestones.eyebrow']}</Eyebrow>
          <SectionHeading>
            <MarkedText text={copy['milestones.heading']} />
          </SectionHeading>
        </div>
        <p className="m-0 max-w-[380px] text-lg leading-[1.55] text-muted max-md:text-base">{copy['milestones.lede']}</p>
      </div>
      <StaticStage milestones={milestones} pinnable={pinnable} />
      {pinnable ? <MilestoneStage milestones={milestones} /> : null}
      {/* Keyed on the list, so an in-place refresh that changes the milestones remounts it and it observes the new values */}
      <MilestoneFit key={milestones.map((m) => `${m.order}:${m.value}`).join('|')} sectionId={SECTION_ID} />
    </Section>
  );
}
